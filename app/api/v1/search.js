const Router = require('koa-router')

const { SearchValidator } = require('@validator/search')

const ArticleDao = require('@dao/article')
const TagDao = require('@dao/tag')
const CategoryDao = require('@dao/category')
const Auth = require('@middleware/auth')
const { SuccessModel } = require('@lib/res')
const { UserType } = require('@lib/type')
const { generateToken } = require('@lib/util')

const prefix = '/api/v1/search'
const router = new Router({ prefix })

// 合并搜索
router.get('/merge-search', new Auth(UserType.USER).auth, async ctx => {
  const v = await new SearchValidator().validate(ctx)
  const queryText = v.get('query.text')
  const queryQueue = [
    ArticleDao.listIdByTitle({ title: queryText }),
    TagDao.list({ name: queryText }),
    CategoryDao.list({ name: queryText })
  ]
  const resLis = await Promise.all(queryQueue)
  const err = resLis.some(([err, _]) => !!err)
  if (!err) {
    const resDataLis = resLis.map(([_, list]) => list)
    const [articles, tags, categories] = resDataLis
    const data = [
      ...articles.map(({ dataValues: { id, title } }) => ({ type: 'article', id, value: title.trim() })),
      ...tags.rows.map(({ dataValues: { id, name } }) => ({ type: 'tag', id, value: name.trim() })),
      ...categories.rows.map(({ dataValues: { id, name } }) => ({ type: 'category', id, value: name.trim() }))
    ]
    ctx.body = new SuccessModel('查询成功', data)
    ctx.status = 200
  } else {
    throw err
  }
})

module.exports = router

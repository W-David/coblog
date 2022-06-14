const Router = require('koa-router')
const { ArticleValidator, QueryArticleValidator } = require('@validator/article')
const { PositiveIdValidator } = require('@validator/other')

const ArticleDao = require('@dao/article')
const Auth = require('@middleware/auth')
const { SuccessModel } = require('@lib/res')
const { UserType } = require('@lib/type')

const prefix = '/api/v1/article'
const router = new Router({ prefix })

router.post('/create', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new ArticleValidator().validate(ctx)
  const title = v.get('body.title')
  const description = v.get('body.description')
  const content = v.get('body.content')
  const adminId = v.get('body.adminId')
  const bannerId = v.get('body.bannerId')
  const categoryIds = v.get('body.categoryIds')
  const tagIds = v.get('body.tagIds')

  const articleData = {
    title,
    description,
    content,
    adminId,
    bannerId,
    categoryIds,
    tagIds
  }
  const [err, article] = await ArticleDao.create(articleData)
  if (!err) {
    ctx.body = new SuccessModel('创建成功', article)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/detail/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, article] = await ArticleDao.detail(id)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', article)
    ctx.status = 200
  } else {
    throw err
  }
})

router.put('/update/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new ArticleValidator().validate(ctx)
  const id = v.get('path.id')
  const title = v.get('body.title')
  const description = v.get('body.description')
  const content = v.get('body.content')
  const adminId = v.get('body.adminId')
  const bannerId = v.get('body.bannerId')
  const categoryIds = v.get('body.categoryIds')
  const tagIds = v.get('body.tagIds')

  const articleData = {
    id,
    title,
    description,
    content,
    adminId,
    bannerId,
    categoryIds,
    tagIds
  }
  const [err, article] = await ArticleDao.update(articleData)
  if (!err) {
    ctx.body = new SuccessModel('更新成功', article)
    ctx.status = 200
  } else {
    throw err
  }
})

router.post('/list', async ctx => {
  const v = await new QueryArticleValidator().validate(ctx)
  const body = v.get('body')
  const [err, articles] = await ArticleDao.list(body)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', articles)
  } else {
    throw err
  }
})

router.delete('/delete/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, res] = await ArticleDao.delete(id)
  if (!err) {
    ctx.body = new SuccessModel('删除成功', res)
    ctx.status = 200
  } else {
    throw err
  }
})

module.exports = router

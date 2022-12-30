const Router = require('koa-router')
const { ArticleValidator, QueryArticleValidator } = require('@validator/article')
const { LinValidator } = require('@core/lin-validator')
const { PositiveIdValidator } = require('@validator/other')

const ArticleDao = require('@dao/article')
const Auth = require('@middleware/auth')
const { SuccessModel } = require('@lib/res')
const { UserType } = require('@lib/type')

const prefix = '/api/v1/article'
const router = new Router({ prefix })

router.post('/create', new Auth(UserType.ADMIN).auth, async ctx => {
  const adminId = ctx.auth.uid
  const v = await new ArticleValidator().validate(ctx)
  const title = v.get('body.title')
  const description = v.get('body.description')
  const content = v.get('body.content')
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

router.get('/detail/:id', new Auth(UserType.DEFAULT).auth, async ctx => {
  const scope = +ctx.auth.scope
  const uid = +ctx.auth.uid
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')
  const data = {
    uid,
    scope,
    id
  }
  const [err, article] = await ArticleDao.detail(data)
  const resData = {
    ...article.dataValues,
    isFavorited: article.isFavorited,
    favoritedNum: article.favoritedNum
  }
  if (!err) {
    ctx.body = new SuccessModel('查询成功', resData)
    ctx.status = 200
  } else {
    throw err
  }
})

router.put('/update/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const adminId = ctx.auth.uid
  const v = await new ArticleValidator().validate(ctx)
  const id = v.get('path.id')
  const title = v.get('body.title')
  const description = v.get('body.description')
  const content = v.get('body.content')
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
    ctx.body = new SuccessModel('更新成功', { ...article.dataValues, isFavorited: article.isFavorited })
    ctx.status = 200
  } else {
    throw err
  }
})

router.put('/favorite/:id', new Auth(UserType.USER).auth, async ctx => {
  const scope = +ctx.auth.scope
  const uid = +ctx.auth.uid
  const v = await new LinValidator().validate(ctx)
  const articleId = v.get('path.id')
  const data = {
    uid,
    scope,
    articleId
  }
  const [err, favoritedNum] = await ArticleDao.favorite(data)
  if (!err) {
    ctx.body = new SuccessModel('操作成功', favoritedNum)
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

router.post('/listByTime', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new LinValidator().validate(ctx)
  const body = v.get('body')
  const adminId = ctx.auth.uid
  const [err, articles] = await ArticleDao.listByTime({ ...body, adminId })
  if (!err) {
    ctx.body = new SuccessModel('已生成时间线文章列表', articles)
  } else {
    throw err
  }
})

router.delete('/delete/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const scope = +ctx.auth.scope
  const uid = +ctx.auth.uid
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')
  const data = {
    uid,
    scope,
    id
  }

  const [err, res] = await ArticleDao.delete(data)
  if (!err) {
    ctx.body = new SuccessModel('删除成功', res)
    ctx.status = 200
  } else {
    throw err
  }
})

module.exports = router

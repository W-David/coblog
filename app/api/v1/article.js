const Router = require('koa-router')
const { ArticleValidator, QueryArticleValidator } = require('@validator/article')
const { LinValidator } = require('@core/lin-validator')
const { PositiveIdValidator } = require('@validator/other')

const ArticleDao = require('@dao/article')
const Auth = require('@middleware/auth')
const { SuccessModel } = require('@lib/res')
const { UserType } = require('@lib/type')
const { convToHTML, convToToc } = require('@lib/util')
const { route } = require('./admin')

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

router.get('/noAuthDetail/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')
  const data = { id }
  const [err, article] = await ArticleDao.detail(data)
  const tocArray = await convToToc(article.content)
  const htmlContent = convToHTML(article.content)
  const resData = {
    ...article.dataValues,
    tocArray,
    htmlContent,
    favoritedNum: article.favoritedNum
  }
  if (!err) {
    ctx.body = new SuccessModel('查询成功', resData)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/detail/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const scope = +ctx.auth.scope
  const uid = +ctx.auth.uid
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')
  const { noHtml = false } = v.get('query')
  const data = {
    uid,
    scope,
    id
  }
  const [err, article] = await ArticleDao.detail(data)
  const tocArray = await convToToc(article.content)
  const htmlContent = convToHTML(article.content)
  const resData = !noHtml
    ? {
        ...article.dataValues,
        tocArray,
        htmlContent,
        isFavorited: article.isFavorited,
        favoritedNum: article.favoritedNum
      }
    : {
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
  const resData = {
    ...article.dataValues,
    isFavorited: article.isFavorited
  }
  if (!err) {
    ctx.body = new SuccessModel('更新成功', resData)
    ctx.status = 200
  } else {
    throw err
  }
})

router.patch('/favorite/:id', new Auth(UserType.USER).auth, async ctx => {
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

router.get('/list', async ctx => {
  const v = await new QueryArticleValidator().validate(ctx)
  const query = v.get('query')
  const [err, articles] = await ArticleDao.list(query)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', articles)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/listByTime', async ctx => {
  const v = await new LinValidator().validate(ctx)
  const query = v.get('query')
  const [err, articles] = await ArticleDao.listByTime(query)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', articles)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/listByFavo', async ctx => {
  const v = await new LinValidator().validate(ctx)
  const query = v.get('query')
  const [err, articles] = await ArticleDao.listByFavo(query)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', articles)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/listArchive', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new LinValidator().validate(ctx)
  const query = v.get('query')
  const adminId = ctx.auth.uid
  const [err, articles] = await ArticleDao.listArchive({ ...query, adminId })
  if (!err) {
    ctx.body = new SuccessModel('已生成时间线文章列表', articles)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/listByTimeAll', async ctx => {
  const v = await new LinValidator().validate(ctx)
  const query = v.get('query')
  const [err, articles] = await ArticleDao.listByTime(query)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', articles)
    ctx.status = 200
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

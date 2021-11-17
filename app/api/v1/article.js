const Router = require('koa-router')
const { ArticleValidator } = require('@validator/article')
const { PositiveIdValidator } = require('@validator/other')

const ArticleDao = require('@dao/article')
const CategoryDao = require('@dao/category')
const TagDao = require('@dao/tag')
const FileDao = require('@dao/file')
const Auth = require('@middleware/auth')
const { SuccessModel } = require('@lib/res')
const { UserType } = require('@lib/type')
const { generateToken } = require('@lib/util')

const prefix = '/api/v1/article'
const router = new Router({ prefix })

router.post('/', new Auth(UserType.ADMIN).auth, async (ctx) => {
  const v = await new ArticleValidator().validate(ctx)
  const title = v.get('body.title')
  const description = v.get('body.description')
  const content = v.get('body.content')
  const adminId = v.get('body.adminId')
  const bannerId = v.get('body.bannerId')
  const categoryIds = v.get('body.categoryIds')
  const tagIds = v.get('body.tagIds')

  const articleData = { title, description, content, adminId }
  const [err, article] = await ArticleDao.create(articleData)
  if (!err) {
    try {
      const resLis = await Promise.all([
        ArticleDao.handleBanner(bannerId),
        ArticleDao.handleCategory(categoryIds),
        ArticleDao.handleTag(tagIds)
      ])
      resLis.forEach(([err, _]) => {
        if (err) throw err
      })
      const [banner, categoris, tags] = resLis.map(([_, res]) => res)
      await Promise.all([
        article.setBanner(banner),
        article.setCategories(categoris),
        article.setTags(tags)
      ])
      ctx.body = new SuccessModel('创建成功', article)
      ctx.status = 200
    } catch (err) {
      throw err
    }
  } else {
    throw err
  }
})

router.put('/:id', new Auth(UserType.ADMIN).auth, async (ctx) => {
  const v = await new ArticleValidator().validate(ctx)
  const id = v.get('path.id')
  const title = v.get('body.title')
  const description = v.get('body.description')
  const content = v.get('body.content')
  const adminId = v.get('body.adminId')
  const bannerId = v.get('body.bannerId')
  const categoryIds = v.get('body.categoryIds')
  const tagIds = v.get('body.tagIds')

  const articleData = { id, title, description, content, adminId }
  const [err, article] = await ArticleDao.update(articleData)
  if (!err) {
    try {
      const resLis = await Promise.all([
        ArticleDao.handleBanner(bannerId),
        ArticleDao.handleCategory(categoryIds),
        ArticleDao.handleTag(tagIds)
      ])
      resLis.forEach(([err, _]) => {
        if (err) throw err
      })
      const [banner, categoris, tags] = resLis.map(([_, res]) => res)
      await Promise.all([
        article.setBanner(banner),
        article.setCategories(categoris),
        article.setTags(tags)
      ])
      ctx.body = new SuccessModel('更新成功', article)
      ctx.status = 200
    } catch (err) {
      throw err
    }
  } else {
    throw err
  }
})

module.exports = router

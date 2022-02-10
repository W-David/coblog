const Router = require('koa-router')
const { CategoryValidator, CategoriesValidator, QueryCategoryValidator } = require('@validator/category')
const { PositiveIdValidator } = require('@validator/other')

const CategoryDao = require('@dao/category')
const Auth = require('@middleware/auth')
const { UserType } = require('@lib/type')
const { SuccessModel } = require('@lib/res')

const prefix = '/api/v1/category'
const router = new Router({ prefix })

router.post('/create', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new CategoryValidator().validate(ctx)
  const name = v.get('body.name')
  const [err, category] = await CategoryDao.create({ name })
  if (!err) {
    ctx.body = new SuccessModel('添加成功', category)
    ctx.status = 200
  } else {
    throw err
  }
})

router.post('/bulk', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new CategoriesValidator().validate(ctx)
  const dataLis = v.get('body.dataLis')
  const [err, categories] = await CategoryDao.bulkCreate(dataLis)
  if (!err) {
    ctx.body = new SuccessModel('批量添加成功', categories)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/detail/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')
  const [err, category] = await CategoryDao.detail(id)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', category)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/detail/articles/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')
  const [err, category] = await CategoryDao.queryDetailArticles(id)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', category)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/list', async ctx => {
  const v = await new QueryCategoryValidator().validate(ctx)
  const query = v.get('query')
  const [err, categories] = await CategoryDao.list(query)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', categories)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/list/articles', async ctx => {
  const v = await new QueryCategoryValidator().validate(ctx)
  const query = v.get('query')
  const [err, categories] = await CategoryDao.queryListArticles(query)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', categories)
    ctx.status = 200
  } else {
    throw err
  }
})

router.put('/update/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new CategoryValidator().validate(ctx)
  const id = v.get('path.id')
  const name = v.get('body.name')
  const data = { id, name }
  const [err, category] = await CategoryDao.update(data)
  if (!err) {
    ctx.body = new SuccessModel('更新成功', category)
    ctx.status = 200
  } else {
    throw err
  }
})

router.delete('/delete/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, res] = await CategoryDao.delete(id)
  if (!err) {
    ctx.body = new SuccessModel('删除成功', res)
    ctx.status = 200
  } else {
    throw err
  }
})

module.exports = router

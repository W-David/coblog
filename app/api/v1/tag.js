const Router = require('koa-router')
const { TagValidator, TagsValidator, QueryTagValidator } = require('@validator/tag')
const { PositiveIdValidator } = require('@validator/other')
const { admin } = require('@config/config')

const TagDao = require('@dao/tag')
const AdminDao = require('@dao/admin')
const Auth = require('@middleware/auth')
const { UserType } = require('@lib/type')
const { SuccessModel } = require('@lib/res')

const prefix = '/api/v1/tag'
const router = new Router({ prefix })

router.post('/create', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new TagValidator().validate(ctx)
  const name = v.get('body.name')
  const uid = ctx.auth.uid
  try {
    const [err, admin] = await AdminDao.detail(uid, 1)
    if (!err) {
      const [err, tag] = await TagDao.create({ name, createdBy: admin.dataValues.email })
      if (!err) {
        ctx.body = new SuccessModel('添加成功', tag)
        ctx.status = 200
      } else {
        throw err
      }
    } else {
      throw err
    }
  } catch (err) {
    throw err
  }
})

router.post('/bulk', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new TagsValidator().validate(ctx)
  const dataLis = v.get('body.dataLis')
  const [err, tags] = await TagDao.bulkCreate(dataLis)
  if (!err) {
    ctx.body = new SuccessModel('批量添加成功', tags)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/detail/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')
  const [err, tag] = await TagDao.detail(id)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', tag)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/detail/articles/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')
  const [err, tag] = await TagDao.queryDetailArticles(id)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', tag)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/list', async ctx => {
  const v = await new QueryTagValidator().validate(ctx)
  const query = v.get('query')
  const [err, tags] = await TagDao.list(query)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', tags)
    ctx.status = 200
  } else {
    throw err
  }
})

router.get('/list/articles', async ctx => {
  const v = await new QueryTagValidator().validate(ctx)
  const query = v.get('query')
  const [err, tags] = await TagDao.queryListArticles(query)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', tags)
    ctx.status = 200
  } else {
    throw err
  }
})

router.put('/update/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new TagValidator().validate(ctx)
  const id = v.get('path.id')
  const name = v.get('body.name')
  const data = { id, name }
  const [err, tag] = await TagDao.update(data)
  if (!err) {
    ctx.body = new SuccessModel('更新成功', tag)
    ctx.status = 200
  } else {
    throw err
  }
})

router.delete('/delete/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, res] = await TagDao.delete(id)
  if (!err) {
    ctx.body = new SuccessModel('删除成功', res)
    ctx.status = 200
  } else {
    throw err
  }
})

module.exports = router

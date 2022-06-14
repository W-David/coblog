const Router = require('koa-router')
const client = require('@core/oss')
const conf = require('@config/config').alioss

const { RegisterValidator, AdminValidator, QueryAdminValidator } = require('@validator/admin')

const { PositiveIdValidator } = require('@validator/other')
const { Ru } = require('@lib/db')

const AdminDao = require('@dao/admin')
const Auth = require('@middleware/auth')
const { SuccessModel } = require('@lib/res')
const { UserType } = require('@lib/type')
const { generateToken } = require('@lib/util')

const prefix = '/api/v1/alioss'
const router = new Router({ prefix })

router.get('/sts', new Auth(UserType.USER).auth, async ctx => {
  try {
    const result = await client.assumeRole(conf.RoleArn, null, conf.TokenExpireTime)
    ctx.set('Access-Control-Allow-Origin', '*')
    ctx.set('Access-Control-Allow-Method', 'GET')
    ctx.body = new SuccessModel('获取成功', {
      AccessKeyId: result.credentials.AccessKeyId,
      AccessKeySecret: result.credentials.AccessKeySecret,
      SecurityToken: result.credentials.SecurityToken,
      Expiration: result.credentials.Expiration
    })
    ctx.status = 200
  } catch (err) {
    throw err
  }
})

router.post('/upload', new Auth(UserType.ADMIN).auth, async ctx => {
  const files = ctx.request.files.file
  const upType = Object.prototype.toString.call(files)
  let arr = []
  if (upType === '[object Object]') {
    if (files.size) {
      const basename = path.basename(files.path)
      const [err, savedFile] = await FileDao.create({
        name: basename,
        path: null,
        size: files.size,
        extension: path.extname(basename)
      })
      if (err) {
        throw err
      }
      arr.push({
        ...savedFile
      })
    }
  } else if (upType === '[object Array]') {
    const dataLis = files.map(file => {
      const basename = path.basename(file.path)
      return {
        name: basename,
        path: null,
        size: file.size,
        extension: path.extname(basename)
      }
    })
    const [err, savedFiles] = await FileDao.bulkCreate(dataLis)
    if (err) {
      throw err
    }
    arr = [...savedFiles]
  } else {
    arr = []
  }
  if (arr.length) {
    ctx.body = new SuccessModel('上传成功', arr)
    ctx.status = 200
  } else {
    ctx.body = new ErrorModel('未选择图片', 200)
    ctx.status = 200
  }
})

router.get('/:id', async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, res] = await FileDao.detail(id)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', res)
    ctx.status = 200
  } else {
    throw err
  }
})

router.delete('/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, res] = await FileDao.delete(id)
  if (!err) {
    ctx.body = new SuccessModel('删除成功', res)
    ctx.status = 200
  } else {
    throw err
  }
})

module.exports = router

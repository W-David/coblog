const Router = require('koa-router')
const { PositiveIdValidator } = require('@validator/other')
const path = require('path')

const Auth = require('@middleware/auth')
const { UserType } = require('@lib/type')
const { SuccessModel, ErrorModel } = require('@lib/res')
const FileDao = require('@dao/file')

const prefix = '/api/v1/upload'
const router = new Router({ prefix })

router.post('/', async (ctx) => {
  const files = ctx.request.files.file
  const upType = Object.prototype.toString.call(files)
  // const v = await new PositiveIdValidator().validate(ctx)
  // const articleId = v.get('body.articleId')
  let arr = []
  if (upType === '[object Object]') {
    if (files.size) {
      const basename = path.basename(files.path)
      const [err, savedFile] = await FileDao.create({
        // articleId,
        name: basename,
        path: `${ctx.origin}/uploads/${basename}`,
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
    const dataLis = files.map((file) => {
      const basename = path.basename(file.path)
      return {
        // articleId,
        name: basename,
        path: `${ctx.origin}/uploads/${basename}`,
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

router.get('/:id', async (ctx) => {
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

router.delete('/:id', async (ctx) => {
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

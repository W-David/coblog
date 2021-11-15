const Router = require('koa-router')
const { PositiveIdValidator } = require('@validator/other')
const path = require('path')

const Auth = require('@middleware/auth')
const { SuccessModel, ErrorModel } = require('@lib/res')
const { UserType } = require('@lib/type')

const prefix = '/api/v1/upload'
const router = new Router({ prefix })

router.post('/', async (ctx) => {
  const files = ctx.request.files.file
  const upType = Object.prototype.toString.call(files)
  let arr = []
  if (upType === '[object Object]') {
    if (files.size) {
      const basename = path.basename(files.path)
      arr = [{ path: `${ctx.origin}/uploads/${basename}` }]
    }
  } else if (upType === '[object Array]') {
    arr = files.map((file) => {
      const basename = path.basename(file.path)
      return {
        path: `${ctx.origin}/uploads/${basename}`
      }
    })
  }
  if (arr.length) {
    ctx.body = new SuccessModel('上传成功', arr)
    ctx.status = 200
  } else {
    ctx.body = new ErrorModel('未选择图片', 200)
    ctx.status = 200
  }
})

module.exports = router

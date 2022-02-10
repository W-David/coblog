const { HttpException } = require('@core/http-exception')
const { ErrorModel } = require('@lib/res')

const catchError = () => {
  return async (ctx, next) => {
    try {
      await next()
    } catch (error) {
      const isHttpException = error instanceof HttpException
      const isDev = process.env.NODE_ENV === 'dev'
      //开发环境下未知错误直接抛出
      if (isDev && !isHttpException) {
        throw error
      }

      if (isHttpException) {
        // 可处理的错误返回错误信息
        ctx.body = new ErrorModel(error.msg, error.code)
        ctx.status = 200
      } else {
        //未知错误
        ctx.body = new ErrorModel(error.message, 500)
        ctx.status = 500
      }
    }
  }
}

module.exports = catchError

const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')
const { UserType } = require('@lib/type')

class Auth {
  constructor(level) {
    this.level = level
  }

  get auth() {
    return async (ctx, next) => {
      const token = basicAuth(ctx.req)
      let errMsg = '请先登录'
      if (!token || !token.name) {
        errMsg = '没有登录信息'
        throw new global.errs.Forbidden(errMsg)
      }

      try {
        const secretKey = global.config.security.secretKey
        var decode = jwt.verify(token.name, secretKey)
      } catch (e) {
        if (e.name === 'TokenExpiredError') {
          errMsg = '登录信息已过期'
        }
        throw new global.errs.Forbidden(errMsg)
      }

      if (decode.scope < this.level) {
        errMsg = '您的权限不足'
        throw new global.errs.Forbidden(errMsg)
      }
      //保存相关用户信息到auth中
      const { uid, scope } = decode
      ctx.auth = { uid, scope }
      await next()
    }
  }
}

module.exports = Auth

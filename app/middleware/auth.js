const basicAuth = require('basic-auth')
const jwt = require('jsonwebtoken')

class Auth {
  constructor(level) {
    this.level = level
  }

  get auth() {
    return async (ctx, next) => {
      const token = basicAuth(ctx.req)
      let errMsg = '无效的Token'
      if (!token || !token.name) {
        errMsg = '未携带Token'
        throw new global.errs.Forbidden(errMsg)
      }

      try {
        const secretKey = global.config.security.secretKey
        var decode = jwt.verify(token.name, secretKey)
      } catch (e) {
        if (e.name === 'TokenExpiredError') {
          errMsg = 'Token已过期'
        }
        throw new global.errs.Forbidden(errMsg)
      }

      if (decode.scope < this.level) {
        errMsg = '权限不足'
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

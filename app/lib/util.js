const jwt = require('jsonwebtoken')

//根据用户信息生成token
const generateToken = (uid, scope) => {
  const secretKey = global.config.security.secretKey
  const expiresIn = global.config.security.expiresIn
  const token = jwt.sign(
    {
      uid,
      scope
    },
    secretKey,
    {
      expiresIn
    }
  )
  return token
}

module.exports = {
  generateToken
}

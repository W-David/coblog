const { Rule, LinValidator } = require('@core/lin-validator')

class TokenValidator extends LinValidator {
  constructor() {
    super()
    this.token = [
      new Rule('isLength', 'Token不能为空', { min: 1 }),
      new Rule('isJWT', '非法的Token')
    ]
  }
}

module.exports = {
  TokenValidator
}

const { Rule, LinValidator } = require('@core/lin-validator')
const { PositiveIdValidator, QueryValidator } = require('./other')

class RegisterValidator extends LinValidator {
  constructor() {
    super()
    this.email = [new Rule('isEmail', '邮箱格式错误')]
    this.username = [
      new Rule('isLength', '用户名至少2个字符，之多18个字符', {
        min: 2,
        max: 18
      })
    ]
    this.password = [
      new Rule('isLength', '密码至少6个字符，至多22个字符', {
        min: 6,
        max: 22
      })
    ]
    this.rPassword = this.password
  }

  validatePassword(data) {
    const password = data.body.password
    const rPassword = data.body.rPassword
    const isSame = password === rPassword
    if (!isSame) {
      throw new Error('两次输入密码不一致')
    }
  }
}

class UserValidator extends PositiveIdValidator {
  constructor() {
    super()
    this.email = [new Rule('isLength', '邮箱不能为空字符', { min: 1 }), new Rule('isEmail', '请输入正确的邮箱格式')]
    this.password = [
      new Rule('isOptional'),
      new Rule('isLength', '密码至少6个字符，至多22个字符', {
        min: 6,
        max: 22
      })
    ]
  }
}

class QueryUserValidator extends QueryValidator {
  constructor() {
    super()
    this.email = [new Rule('isOptional', '', '')]
    this.username = [new Rule('isOptional', '', '')]
  }
}

module.exports = {
  RegisterValidator,
  UserValidator,
  QueryUserValidator
}

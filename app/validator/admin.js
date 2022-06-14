const { Rule, LinValidator } = require('@core/lin-validator')
const { PositiveIdValidator, QueryValidator } = require('./other')

class RegisterValidator extends LinValidator {
  constructor() {
    super()
    this.email = [new Rule('isEmail', '邮箱格式错误')]
    this.nickname = [
      new Rule('isLength', '昵称至少2个字符，至多18个字符', {
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
  }
}

class AdminValidator extends PositiveIdValidator {
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

class QueryAdminValidator extends QueryValidator {
  constructor() {
    super()
    this.email = [new Rule('isOptional', '', '')]
    this.nickname = [new Rule('isOptional', '', '')]
  }
}

module.exports = {
  RegisterValidator,
  AdminValidator,
  QueryAdminValidator
}

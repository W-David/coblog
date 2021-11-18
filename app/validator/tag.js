const { Rule, LinValidator } = require('@core/lin-validator')
const { PositiveIdValidator } = require('./other')

class TagValidator extends PositiveIdValidator {
  constructor() {
    super()
    this.name = [new Rule('isLength', '标签名称不能为空', { min: 1 })]
  }
}

class TagsValidator extends LinValidator {
  constructor() {
    super()
    this.dataLis = [new Rule('isOptional', '', [])]
  }
}

module.exports = {
  TagValidator,
  TagsValidator
}

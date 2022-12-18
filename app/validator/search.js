const { Rule, LinValidator } = require('@core/lin-validator')

class SearchValidator extends LinValidator {
  constructor() {
    super()
    this.text = [new Rule('isLength', '搜索字段不能为空', { min: 1 })]
  }
}

module.exports = {
  SearchValidator
}

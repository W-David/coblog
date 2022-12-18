const { Rule, LinValidator } = require('@core/lin-validator')

class SearchValidator extends LinValidator {
  constructor() {
    super()
    this.text = [new Rule('isLength', '字段长度为2-80个字符', { min: 2, max: 80 })]
  }
}

module.exports = {
  SearchValidator
}

const { Rule, LinValidator } = require('@core/lin-validator')

class PositiveIdValidator extends LinValidator {
  constructor() {
    super()
    this.id = [
      new Rule('isOptional', '', ''),
      new Rule('isInt', 'id必须为正整数', { min: 1 })
    ]
  }
}

module.exports = {
  PositiveIdValidator
}

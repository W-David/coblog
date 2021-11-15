const { Rule, LinValidator } = require('@core/lin-validator')

class PositiveIdValidator extends LinValidator {
  constructor() {
    super()
    this.id = [new Rule('isInt', 'id需要为正整数', { min: 1 })]
  }
}

module.exports = {
  PositiveIdValidator
}

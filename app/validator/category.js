const { Rule, LinValidator } = require('@core/lin-validator')
const { PositiveIdValidator } = require('./other')

class CategoryValidator extends PositiveIdValidator {
  constructor() {
    super()
    this.name = [new Rule('isLength', '分类名称不能为空', { min: 1 })]
  }
}

class CategoriesValidator extends LinValidator {
  constructor() {
    super()
    this.dataLis = [new Rule('isOptional', '', [])]
  }
}

module.exports = {
  CategoryValidator,
  CategoriesValidator
}

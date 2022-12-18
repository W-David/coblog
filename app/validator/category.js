const { Rule, LinValidator } = require('@core/lin-validator')
const { PositiveIdValidator, QueryValidator } = require('./other')

class CategoryValidator extends PositiveIdValidator {
  constructor() {
    super()
    this.name = [new Rule('isLength', '分类名称为2-40个字符长度', { min: 2, max: 40 })]
  }
}

class CategoriesValidator extends LinValidator {
  constructor() {
    super()
    this.dataLis = [new Rule('isOptional', '', [])]
  }
}

class QueryCategoryValidator extends QueryValidator {
  constructor() {
    super()
    this.ids = [new Rule('isOptional', '', [])]
    this.name = [new Rule('isOptional', '', '')]
  }
}

module.exports = {
  CategoryValidator,
  CategoriesValidator,
  QueryCategoryValidator
}

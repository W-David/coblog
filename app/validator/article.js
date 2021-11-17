const { Rule, LinValidator } = require('@core/lin-validator')
const { isArray } = require('@lib/util')
const { PositiveIdValidator } = require('./other')

class ArticleValidator extends PositiveIdValidator {
  constructor() {
    super()
    this.title = [new Rule('isLength', '标题不能为空', { min: 1 })]
    this.description = [new Rule('isLength', '描述不能为空', { min: 1 })]
    this.adminId = [new Rule('isLength', 'adminId不能为空', { min: 1 })]
    this.content = [new Rule('isLength', '文章内容不能为空', { min: 1 })]
    this.status = [
      new Rule('isOptional', '', 1),
      new Rule('isIn', 'status必须为0或1', [0, 1])
    ]
    this.bannerId = [
      new Rule('isOptional', '', ''),
      new Rule('isLength', 'bannerId不能为空', { min: 1 })
    ]
    this.categoryIds = [new Rule('isOptional', '', [])]
    this.tagIds = [new Rule('isOptional', '', [])]
  }
}

module.exports = {
  ArticleValidator
}

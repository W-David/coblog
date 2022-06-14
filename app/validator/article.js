const { isArray } = require('@lib/util')
const { Rule, LinValidator } = require('@core/lin-validator')
const { PositiveIdValidator, BodyQueryValidator } = require('./other')

class ArticleValidator extends PositiveIdValidator {
  constructor() {
    super()
    this.title = [new Rule('isLength', '标题不能为空', { min: 1 })]
    this.content = [new Rule('isLength', '文章内容不能为空', { min: 1 })]
    this.adminId = [new Rule('isLength', 'adminId不能为空', { min: 1 })]
    this.description = [new Rule('isLength', '描述不能为空', { min: 1 })]
    this.status = [
      new Rule('isOptional', '', 1),
      new Rule('isIn', 'status必须为0或1', [0, 1])
    ]
    this.bannerId = [new Rule('isOptional', '', '')]
    this.categoryIds = [new Rule('isOptional', '', [])]
    this.tagIds = [new Rule('isOptional', '', [])]
  }
}

class QueryArticleValidator extends BodyQueryValidator {
  constructor() {
    super()
    this.title = [new Rule('isOptional')]
    this.adminId = [new Rule('isOptional', '', '')]
    this.categoryIds = [new Rule('isOptional', '', [])]
    this.tagIds = [new Rule('isOptional', '', [])]
  }

  validateCategoryIds(vals) {
    const categoryIds = vals.body.categoryIds
    if (!categoryIds) return
    if (!isArray(categoryIds)) {
      throw new Error('categoryIds必须为数组')
    }
  }

  validateTagIds(vals) {
    const tagIds = vals.body.tagIds
    if (!tagIds) return
    if (!isArray(tagIds)) {
      throw new Error('tagIds必须为数组')
    }
  }
}

module.exports = {
  ArticleValidator,
  QueryArticleValidator
}

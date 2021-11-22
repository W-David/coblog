const { isNumber } = require('@lib/util')
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

class QueryValidator extends PositiveIdValidator {
  constructor() {
    super()
    this.pageNum = [new Rule('isOptional')]
    this.pageSize = [new Rule('isOptional')]
  }

  validatePage(vals) {
    const { pageNum, pageSize } = vals.query
    if (!pageNum || !pageSize) return
    if (!isNumber(pageNum) || !isNumber(pageSize)) {
      throw new Error('页数页码必须为数字')
    }
  }
}

class BodyQueryValidator extends PositiveIdValidator {
  constructor() {
    super()
    this.pageNum = [new Rule('isOptional')]
    this.pageSize = [new Rule('isOptional')]
  }

  validatePage(vals) {
    const { pageNum, pageSize } = vals.body
    if (!pageNum || !pageSize) return
    if (!isNumber(pageNum) || !isNumber(pageSize)) {
      throw new Error('页数页码必须为数字')
    }
  }
}

module.exports = {
  PositiveIdValidator,
  QueryValidator,
  BodyQueryValidator
}

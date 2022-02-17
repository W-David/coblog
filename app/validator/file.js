const { Rule, LinValidator } = require('@core/lin-validator')

class FileValidator extends LinValidator {
  constructor() {
    super()
    this.name = [new Rule('isLength', '文件名称不能为空', { min: 1 })]
    this.path = [new Rule('isLength', '文件路径不能为空', { min: 1 })]
    this.size = [new Rule('isLength', '文件大小不能为空', { min: 1 })]
    this.extension = [new Rule('isLength', '扩展名不能为空', { min: 1 })]
  }
}

module.exports = {
  FileValidator
}

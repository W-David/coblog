class BaseModel {
  constructor(msg) {
    if (msg) {
      this.msg = msg
    }
  }
}

class SuccessModel extends BaseModel {
  constructor(msg = '操作成功', data, code = 200) {
    super(msg)
    this.code = code
    if (data) {
      this.data = data
    }
  }
}

class ErrorModel extends BaseModel {
  constructor(msg = '操作失败', code = 500) {
    super(msg)
    this.code = code
  }
}

module.exports = {
  SuccessModel,
  ErrorModel
}

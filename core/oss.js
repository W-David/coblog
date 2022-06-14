const conf = require('@config/config').alioss
const { STS } = require('ali-oss')

const client = new STS({
  accessKeyId: conf.AccessKeyId,
  accessKeySecret: conf.AccessKeySecret
})

module.exports = client

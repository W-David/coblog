const conf = require('@config/config').alioss
const { STS } = require('ali-oss')

let client = null

function getClient() {
  if (client) return client
  if (!conf.AccessKeyId || !conf.AccessKeySecret) {
    throw new Error('Aliyun OSS is not configured (AccessKeyId/AccessKeySecret empty)')
  }
  client = new STS({
    accessKeyId: conf.AccessKeyId,
    accessKeySecret: conf.AccessKeySecret
  })
  return client
}

// Proxy so existing `client.assumeRole(...)` keeps working when configured
module.exports = new Proxy(
  {},
  {
    get(_t, prop) {
      const c = getClient()
      const v = c[prop]
      return typeof v === 'function' ? v.bind(c) : v
    }
  }
)

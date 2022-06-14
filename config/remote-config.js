const env = process.env.NODE_ENV

const defaultConfig = {
  database: {
    dbName: 'coblog',
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'codyroot'
  },
  security: {
    secretKey: 'Wang_#86^%q1',
    expiresIn: 60 * 60 * 10
  },
  alioss: {
    AccessKeyId: 'your AccesskeyId',
    AccessKeySecret: 'your AccesskeySecret',
    RoleArn: 'your RoleArn',
    TokenExpireTime: '3600'
  },
  admin: {
    email: 'example@email.com',
    password: '000000',
    created_at: Date.now()
  }
}

let config = defaultConfig

if (env === 'env') {
  config = defaultConfig
}

if (env === 'prod') {
  config = defaultConfig
}

module.exports = config

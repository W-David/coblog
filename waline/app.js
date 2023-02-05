const dotenv = require('dotenv')
const path = require('path')

// 环境变量配置
const envConfigPath = {
  dev: path.resolve(__dirname, './env/.env.dev'),
  production: path.resolve(__dirname, './env/.env.production')
}

//环境配置文件路径
const envPath = envConfigPath[process.env.ENV]

dotenv.config({
  path: envPath,
  encoding: 'utf8',
  debug: false
})

require('../waline_server/vanilla.js')
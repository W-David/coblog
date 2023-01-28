require('module-alias/register')

const path = require('path')
const fs = require('fs')
const koa = require('koa')
const parser = require('koa-bodyparser')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const compress = require('koa-compress')
const InitManager = require('./core/init')
const catchError = require('./app/middleware/exception')
const sslify = require('koa-sslify').default
const https = require('https')
const sequelizeTransaction = require('./app/middleware/transaction')
const { sequelize } = require('./app/lib/db')

const isProd = process.env.NODE_ENV === 'prod'
const options = {
  key: fs.readFileSync('ssl/coblog.fun.key'),
  cert: fs.readFileSync('ssl/coblog.fun.pem')
}

const app = new koa()

//简化路径
app.use(cors())
if (isProd) {
  app.use(sslify())
  app.use(compress())
}
app.use(catchError())
app.use(koaStatic(path.join(__dirname, 'static')))
app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, 'static/uploads'),
      keepExtensions: true
    }
  })
)
app.use(parser())
app.use(sequelizeTransaction({ sequelize }))

InitManager.init(app)

if (isProd) {
  https.createServer(options, app.callback()).listen(8990, err => {
    if (err) {
      console.error('server error: ', err)
    } else {
      console.log(`coblog is listening in https://localhost:8990`)
    }
  })
} else {
  app.listen(8990, () => {
    console.log(`coblog is listening in http://localhost:8990`)
  })
}

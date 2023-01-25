require('module-alias/register')

const path = require('path')
const koa = require('koa')
const parser = require('koa-bodyparser')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const compress = require('koa-compress')
const InitManager = require('./core/init')
const catchError = require('./app/middleware/exception')
// const sslify = require('koa-sslify').default
// const https = require('https')
const sequelizeTransaction = require('./app/middleware/transaction')
const { sequelize } = require('./app/lib/db')

const app = new koa()

const isProd = process.env.NODE_ENV === 'prod'

//简化路径
app.use(cors())
if (isProd) {
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

app.listen(8990, () => {
  console.log(`coblog is listening in http://localhost:8990`)
})

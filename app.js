require('module-alias/register')

const path = require('path')
const koa = require('koa')
const parser = require('koa-bodyparser')
const cors = require('@koa/cors')
const koaBody = require('koa-body')
const koaStatic = require('koa-static')
const InitManager = require('./core/init')
const catchError = require('./app/middleware/exception')
const app = new koa()

//简化路径

app.use(cors())
app.use(catchError())
app.use(parser())
app.use(koaStatic(path.join(__dirname, 'static')), { defer: true })
app.use(
  koaBody({
    multipart: true,
    formidable: {
      uploadDir: path.join(__dirname, 'static/uploads'),
      keepExtensions: true
    }
  })
)
InitManager.init(app)

app.listen(8990, () => {
  console.log(`coblog is listening in http://localhost:8990`)
})

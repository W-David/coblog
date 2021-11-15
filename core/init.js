const Router = require('koa-router')
const requireDirectory = require('require-directory')

class InitManager {
  static init(app) {
    InitManager.app = app
    InitManager.loadRouters()
    InitManager.loadConfig()
    InitManager.loadHttpException()
  }
  //使用require-directory统一加载路由
  static loadRouters(path = '') {
    const routeDirectory = path || `${process.cwd()}/app/api`
    requireDirectory(module, routeDirectory, {
      visit: (obj) => {
        if (obj instanceof Router) {
          InitManager.app.use(obj.routes())
        }
      }
    })
  }
  //注册配置文件到全局变量config上
  static loadConfig(path = '') {
    const configPath = path || `${process.cwd()}/config/config.js`
    const config = require(configPath)
    global.config = config
  }
  //加载全局异常类
  static loadHttpException(path = '') {
    const exceptionPath = path || `${process.cwd()}/core/http-exception.js`
    const errs = require(exceptionPath)
    global.errs = errs
  }
}

module.exports = InitManager

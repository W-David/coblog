const Router = require('koa-router')
const { ArticleValidator } = require('@validator/article')
const { PositiveIdValidator } = require('@validator/other')

const ArticleDao = require('@dao/article')
const Auth = require('@middleware/auth')
const { SuccessModel } = require('@lib/res')
const { UserType } = require('@lib/type')
const { generateToken } = require('@lib/util')

const prefix = '/api/v1/article'
const router = new Router({ prefix })

module.exports = router

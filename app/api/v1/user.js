const Router = require('koa-router')
const { RegisterValidator, UserLoginValidator } = require('@validator/user')
const { PositiveIdValidator } = require('@validator/other')

const UserDao = require('@dao/user')
const Auth = require('@middleware/auth')
const { SuccessModel, ErrorModel } = require('@lib/res')
const { UserType } = require('@lib/type')
const { generateToken } = require('@lib/util')

const prefix = '/api/v1/user'
const router = new Router({ prefix })

router.post('/register', async (ctx) => {
  const v = await new RegisterValidator().validate(ctx)
  const email = v.get('body.email')
  const password = v.get('body.password')
  const username = v.get('body.username')

  const data = { email, password, username }
  const [err, user] = await UserDao.create(data)
  if (!err) {
    const [vErr, vUser] = await UserDao.verify(email, password)
    const token = generateToken(vUser.id, UserType.USER)
    if (!vErr) {
      ctx.body = new SuccessModel('注册成功,已自动登录', { ...user, token })
      ctx.status = 200
    } else {
      ctx.body = new ErrorModel(vErr.msg, err.code)
      ctx.status = err.code
    }
  } else {
    ctx.body = new ErrorModel(err.msg, err.code)
    ctx.status = err.code
  }
})

router.post('/login', async (ctx) => {
  const v = await new UserLoginValidator().validate(ctx)
  const email = v.get('body.email')
  const password = v.get('body.password')

  const [err, user] = await UserDao.verify(email, password)
  if (!err) {
    //验证用户是否已存在
    const token = generateToken(user.id, UserType.USER)
    const [dErr, dUser] = await UserDao.detail(user.id, 1)
    if (!dErr) {
      ctx.body = new SuccessModel('登录成功', { dUser, token })
      ctx.status = 200
    } else {
      ctx.body = new ErrorModel(dErr.msg, dErr.code)
      ctx.status = dErr.code
    }
  } else {
    ctx.body = new ErrorModel(err.msg, err.code)
    ctx.status = err.code
  }
})

router.get('/auth', new Auth(UserType.USER).auth, async (ctx) => {
  const uid = ctx.auth.uid
  //解析token, 查询可用的用户信息
  const [err, user] = await UserDao.detail(uid, 1)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', user)
    ctx.status = 200
  } else {
    ctx.body = new ErrorModel(err.msg, err.code)
    ctx.status = err.code
  }
})

//获取用户详情，需要管理员权限
router.get('/detail/:id', new Auth(UserType.USER).auth, async (ctx) => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')

  //根据用户Id查询所有用户信息
  const [err, data] = await UserDao.detail(id)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', data)
    ctx.status = 200
  } else {
    ctx.body = new ErrorModel(err.msg, err.code)
    ctx.status = err.code
  }
})

//获取用户列表，需要管理员权限
router.get('/list', new Auth(UserType.USER).auth, async (ctx) => {
  const [err, data] = await UserDao.list(ctx.query)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', data)
    ctx.status = 200
  } else {
    ctx.body = new ErrorModel(err.msg, err.code)
    ctx.status = err.code
  }
})

//删除用户，需要管理员权限
router.delete('/delete/:id', new Auth(UserType.USER).auth, async (ctx) => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, res] = await UserDao.delete(id)
  if (!err) {
    ctx.body = new SuccessModel('删除成功', res)
    ctx.status = 200
  } else {
    ctx.body = new ErrorModel(err.msg, err.code)
    ctx.status = err.code
  }
})

//更新用户，需要管理员权限
router.put('/update/:id', new Auth(UserType.USER).auth, async (ctx) => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')
  const email = v.get('body.email')
  const username = v.get('body.username')
  const status = v.get('body.status')

  const [err, data] = await UserDao.update(id, { email, username, status })
  if (!err) {
    ctx.body = new SuccessModel('更新成功', data)
    ctx.status = 200
  } else {
    ctx.body = new ErrorModel(err.msg, err.code)
    ctx.status = err.code
  }
})

module.exports = router

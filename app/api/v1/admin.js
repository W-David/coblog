const Router = require('koa-router')
const { admin } = require('@config/config')

const { RegisterValidator, AdminValidator, QueryAdminValidator } = require('@validator/admin')
const { PositiveIdValidator } = require('@validator/other')
const bcrypt = require('bcryptjs')
const { Ru } = require('@lib/db')

const AdminDao = require('@dao/admin')
const Auth = require('@middleware/auth')
const { SuccessModel } = require('@lib/res')
const { UserType } = require('@lib/type')
const { generateToken } = require('@lib/util')

const prefix = '/api/v1/admin'
const router = new Router({ prefix })

router.post('/register', async ctx => {
  const v = await new RegisterValidator().validate(ctx)
  const email = v.get('body.email')
  const password = v.get('body.password')
  const nickname = v.get('body.nickname')

  const data = { email, password, nickname }
  const [err, admin] = await AdminDao.create(data)
  if (!err) {
    const [vErr, vAdmin] = await AdminDao.verify(email, password)
    if (!vErr) {
      const token = generateToken(vAdmin.id, UserType.ADMIN)
      ctx.body = new SuccessModel('注册成功,已自动登录', { ...admin.dataValues, token })
      ctx.status = 200
    } else {
      throw vErr
    }
  } else {
    throw err
  }
})

router.post('/login', async ctx => {
  const v = await new AdminValidator().validate(ctx)
  const email = v.get('body.email')
  const password = v.get('body.password')

  try {
    const scope = 'bh'
    const ru = await Ru.scope(scope).findOne({ where: { email, deleted_at: null } })
    if (ru) {
      const correct = bcrypt.compareSync(password, ru.password)
      if (!correct) {
        throw new global.errs.AuthFailed('密码错误')
      }
      const token = generateToken(ru.id, UserType.SUPER_ADMIN)
      ctx.body = new SuccessModel('超级管理员您好，您已登录成功', { ...ru.dataValues, token })
      ctx.status = 200
    } else {
      const [err, admin] = await AdminDao.verify(email, password)
      if (!err) {
        const token = generateToken(admin.id, UserType.ADMIN)
        const [dErr, dAdmin] = await AdminDao.detail(admin.id, 1)
        if (!dErr) {
          ctx.body = new SuccessModel('登录成功', { ...dAdmin.dataValues, token })
          ctx.status = 200
        } else {
          throw dErr
        }
      } else {
        throw err
      }
    }
  } catch (err) {
    throw err
  }
})

router.get('/auth', new Auth(UserType.ADMIN).auth, async ctx => {
  const uid = ctx.auth.uid
  const scope = +ctx.auth.scope
  const isSuperAdmin = scope >= +UserType.SUPER_ADMIN
  try {
    if (isSuperAdmin) {
      const ru = await Ru.scope('bh').findOne({ where: { email: admin.email, deleted_at: null } })
      ctx.body = new SuccessModel('验证成功', { ...ru.dataValues })
      ctx.status = 200
    } else {
      const [err, admin] = await AdminDao.detail(uid, 1)
      if (!err) {
        ctx.body = new SuccessModel('查询成功', { ...admin.dataValues })
        ctx.status = 200
      } else {
        throw err
      }
    }
  } catch (err) {
    throw err
  }
})

//获取管理员用户详情，需要超级管理员权限
router.get('/detail/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')
  const [err, admin] = await AdminDao.detail(id, 1)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', { ...admin.dataValues })
    ctx.status = 200
  } else {
    throw err
  }
})

//获取管理员用户列表，需要超级管理员权限
router.get('/list', new Auth(UserType.SUPER_ADMIN).auth, async ctx => {
  const v = await new QueryAdminValidator().validate(ctx)
  const query = v.get('query')
  const [err, data] = await AdminDao.list(query)
  if (!err) {
    ctx.body = new SuccessModel('查询成功', { ...data.dataValues })
    ctx.status = 200
  } else {
    throw err
  }
})

//删除用户，需要管理员权限
router.delete('/delete/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new PositiveIdValidator().validate(ctx)
  const id = v.get('path.id')

  const [err, res] = await AdminDao.delete(id)
  if (!err) {
    ctx.body = new SuccessModel('删除成功', res)
    ctx.status = 200
  } else {
    throw err
  }
})

//更新用户，需要管理员权限
router.put('/update/:id', new Auth(UserType.ADMIN).auth, async ctx => {
  const v = await new AdminValidator().validate(ctx)
  const id = v.get('path.id')
  const email = v.get('body.email')
  const nickname = v.get('body.nickname')
  const avatar = v.get('body.avatar')
  const status = v.get('body.status')

  const [err, data] = await AdminDao.update({ id, email, nickname, avatar, status })
  if (!err) {
    ctx.body = new SuccessModel('更新成功', { ...data.dataValues })
    ctx.status = 200
  } else {
    throw err
  }
})

module.exports = router

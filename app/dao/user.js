const { Op } = require('sequelize')
const { User } = require('@model/user')
const bcrypt = require('bcryptjs')

class UserDao {
  //创建用户
  static async create(data) {
    try {
      const { email, password, username } = data
      const hasUser = await User.findOne({
        where: {
          email,
          deleted_at: null
        }
      })
      if (hasUser) {
        throw new global.errs.Existing('用户已存在')
      }
      const user = await User.create({
        username,
        email,
        password
      })
      return [null, user]
    } catch (err) {
      return [err, null]
    }
  }

  //验证密码
  static async verify(email, rowPassword) {
    try {
      const user = await User.findOne({
        where: {
          email,
          status: 1
        }
      })

      if (!user) {
        throw new global.errs.AuthFailed('账号不存在或已被禁用')
      }
      const correct = bcrypt.compareSync(rowPassword, user.password)
      if (!correct) {
        throw new global.errs.AuthFailed('密码错误')
      }
      return [null, user]
    } catch (err) {
      return [err, null]
    }
  }

  //查询用户详情
  static async detail(id, status) {
    const scope = 'bh'
    const filter = {
      id
    }
    if (status) {
      filter.status = status
    }
    try {
      const user = await User.scope(scope).findOne({
        where: filter
      })
      if (!user) {
        throw new global.errs.AuthFailed('账号不存在或已被禁用')
      }
      return [null, user]
    } catch (err) {
      return [err, null]
    }
  }

  //删除用户信息
  static async delete(id) {
    try {
      const user = await User.findByPk(id)
      if (!user) {
        throw new global.errs.NotFound('未找到相关用户')
      }

      const res = await user.destroy()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }

  //更新用户信息
  static async update(id, data) {
    try {
      const user = await User.findByPk(id)
      if (!user) {
        throw new global.errs.NotFound('未找到相关用户')
      }
      const { email, username, status } = data
      if (email) {
        user.email = email
      }
      if (username) {
        user.username = username
      }
      if (status === 0 || status === 1) {
        user.status = status
      }

      const res = await user.save()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }

  //查询用户列表
  static async list(query = {}) {
    const { id, email, username, pageNum, pageSize } = query
    const scope = 'bh'
    const filter = {}
    if (id) {
      filter.id = id
    }
    if (email) {
      filter.email = email
    }
    if (username) {
      filter.username = {
        [Op.like]: `%${username}%`
      }
    }
    try {
      const condition = {
        where: filter,
        order: [['created_at', 'DESC']]
      }
      //若存在页码参数，添加分页条件
      if (pageNum && pageSize) {
        condition.limit = pageSize
        condition.offset = (pageNum - 1) * pageSize
      }
      const user = await User.scope(scope).findAndCountAll(condition)
      return [null, user]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = UserDao

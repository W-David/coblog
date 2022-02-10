const { Op } = require('sequelize')
const { Admin } = require('@lib/db')
const { isNumber } = require('@lib/util')
const bcrypt = require('bcryptjs')

class AdminDao {
  //创建管理用户
  static async create(data) {
    try {
      const scope = 'bh'
      const { email, password, nickname } = data
      const hasAdmin = await Admin.scope(scope).findOne({
        where: {
          email,
          deleted_at: null
        }
      })
      if (hasAdmin) {
        throw new global.errs.Existing('用户已存在')
      }
      const admin = await Admin.create({
        nickname,
        email,
        password
      })
      return [null, admin]
    } catch (err) {
      return [err, null]
    }
  }

  //验证密码
  static async verify(email, rowPassword) {
    try {
      const scope = 'bh'
      const admin = await Admin.scope(scope).findOne({
        where: {
          email,
          status: 1
        }
      })

      if (!admin) {
        throw new global.errs.AuthFailed('账号不存在或已被禁用')
      }
      const correct = bcrypt.compareSync(rowPassword, admin.password)
      if (!correct) {
        throw new global.errs.AuthFailed('密码错误')
      }
      return [null, admin]
    } catch (err) {
      return [err, null]
    }
  }

  //查询管理用户详情
  static async detail(id, status) {
    const scope = 'bh'
    const filter = {
      id,
      status
    }
    try {
      const admin = await Admin.scope(scope).findOne({
        where: filter
      })
      if (!admin) {
        throw new global.errs.AuthFailed('账号不存在或已被禁用')
      }
      return [null, admin]
    } catch (err) {
      return [err, null]
    }
  }

  //删除用户信息
  static async delete(id) {
    try {
      const scope = 'bh'
      const admin = await Admin.scope(scope).findByPk(id)
      if (!admin) {
        throw new global.errs.NotFound('未找到相关用户')
      }

      const res = await admin.destroy()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }

  //更新管理用户信息
  static async update(data) {
    try {
      const scope = 'bh'
      const { id, email, nickname, status, avatar } = data
      const admin = await Admin.scope(scope).findByPk(id)
      if (!admin) {
        throw new global.errs.NotFound('未找到相关用户')
      }
      if (email) {
        admin.email = email
      }
      if (nickname) {
        admin.nickname = nickname
      }
      if (status === 0 || status === 1) {
        admin.status = status
      }
      admin.avatar = avatar || ''
      const res = await admin.save()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }

  //查询管理员用户列表
  static async list(query = {}) {
    const { id, email, nickname, pageNum, pageSize } = query
    const scope = 'bh'
    const filter = {}
    if (id) {
      filter.id = id
    }
    if (email) {
      filter.email = email
    }
    if (nickname) {
      filter.nickname = {
        [Op.like]: `%${nickname}%`
      }
    }
    try {
      const condition = {
        where: filter,
        order: [['created_at', 'DESC']]
      }
      //若存在页码参数，添加分页条件
      if (pageNum && isNumber(pageNum) && pageSize && isNumber(pageSize)) {
        condition.limit = +pageSize
        condition.offset = +((pageNum - 1) * pageSize)
      }
      const admin = await Admin.scope(scope).findAndCountAll(condition)
      return [null, admin]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = AdminDao

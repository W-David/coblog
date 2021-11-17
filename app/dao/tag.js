const { Op } = require('sequelize')
const { Tag } = require('@/lib/db')

class TagDao {
  static async create(data) {
    try {
      const { name } = data
      const hasTag = await Tag.findOne({
        where: {
          name,
          deleted_at: null
        }
      })
      if (hasTag) {
        throw new global.errs.Existing('已存在同名标签')
      }
      const tag = await Tag.create({ name })
      return [null, tag]
    } catch (err) {
      return [err, null]
    }
  }

  static async bulkCreate(dataLis) {
    try {
      const categorys = await File.bulkCreate(dataLis)
      return [null, categorys]
    } catch (err) {
      return [err, null]
    }
  }

  static async detail(id) {
    try {
      const tag = await Tag.findByPk(id)
      if (!tag) {
        throw new global.errs.NotFound('类别不存在')
      }
      return [null, tag]
    } catch (err) {
      return [err, null]
    }
  }

  static async list(query = {}) {
    try {
      const { name, pageNum, pageSize } = query
      const filter = {}
      if (name) {
        filter.name = {
          [Op.like]: `%${name}%`
        }
      }
      const condition = {
        where: filter,
        order: [['created_at', 'DESC']]
      }
      if (pageNum && pageSize) {
        condition.limit = pageSize
        condition.offset = (pageNum - 1) * pageSize
      }
      const scope = 'tb'
      const tag = await Tag.scope(scope).findAndCountAll(condition)
      return [null, tag]
    } catch (err) {}
  }

  static async update(data) {
    try {
      const { id, name } = data
      const tag = await Tag.findByPk(id)
      if (!tag) {
        throw new global.errs.NotFound('类别不存在')
      }
      if (name) {
        tag.name = name
      }
      return [null, tag]
    } catch (err) {
      return [err, null]
    }
  }

  static async delete(id) {
    try {
      const tag = await Tag.findByPk(id)
      if (!tag) {
        throw new global.errs.NotFound('类别不存在')
      }
      const res = await tag.destroy()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = TagDao

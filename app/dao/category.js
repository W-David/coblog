const { Op } = require('sequelize')
const { Category } = require('@/lib/db')

class CategoryDao {
  static async create(data) {
    try {
      const { name } = data
      const hasCategory = await Category.findOne({
        where: {
          name,
          deleted_at: null
        }
      })
      if (hasCategory) {
        throw new global.errs.Existing('已存在同名类型')
      }
      const category = await Category.create({ name })
      return [null, category]
    } catch (err) {
      return [err, null]
    }
  }

  static async bulkCreate(dataLis) {
    try {
      const categorys = await Category.bulkCreate(dataLis)
      return [null, categorys]
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
      const category = await Category.scope(scope).findAndCountAll(condition)
      return [null, category]
    } catch (err) {}
  }

  static async detail(id) {
    try {
      const category = await Category.findByPk(id)
      if (!tag) {
        throw new global.errs.NotFound('类别不存在')
      }
      return [null, category]
    } catch (err) {
      return [err, null]
    }
  }

  static async update(data) {
    try {
      const { id, name } = data
      const category = await Category.findByPk(id)
      if (!category) {
        throw new global.errs.NotFound('类别不存在')
      }
      if (name) {
        category.name = name
      }
      return [null, category]
    } catch (err) {
      return [err, null]
    }
  }

  static async delete(id) {
    try {
      const category = await Category.findByPk(id)
      if (!category) {
        throw new global.errs.NotFound('类别不存在')
      }
      const res = await category.destroy()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = CategoryDao

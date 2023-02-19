const { Op } = require('sequelize')
const { isNumber, isArray } = require('@lib/util')
const { Category, Article } = require('@lib/db')

class CategoryDao {
  static async create(data) {
    try {
      const { name, createdBy } = data
      const hasCategory = await Category.findOne({
        where: {
          name,
          deleted_at: null
        }
      })
      if (hasCategory) {
        throw new global.errs.Existing('已存在同名类型')
      }
      const category = await Category.create({ name, createdBy })
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
      const scope = 'bh'
      const { name, pageNum, pageSize } = query
      const filter = {}
      if (name) {
        filter.name = {
          [Op.like]: `%${name}%`
        }
      }
      const condition = {
        where: filter,
        order: [['created_at', 'DESC']],
        distinct: true
      }
      if (pageNum && isNumber(pageNum) && pageSize && isNumber(pageSize)) {
        condition.limit = +pageSize
        condition.offset = +((pageNum - 1) * pageSize)
      }
      const categories = await Category.scope(scope).findAndCountAll(condition)
      return [null, categories]
    } catch (err) {
      return [err, null]
    }
  }

  //条件查询分类及其关联文章信息
  static async queryListArticles(body = {}) {
    try {
      const scope = 'bh'
      const { ids, pageNum, pageSize } = body
      const filter = {}
      if (ids && isArray(ids) && ids.length) {
        filter.id = {
          [Op.in]: ids
        }
      }
      const condition = {
        where: filter,
        include: [
          {
            model: Article,
            attributes: ['id', 'title', 'createdAt'],
            through: { attributes: [] }
          }
        ],
        order: [['createdAt', 'DESC']],
        distinct: true
      }
      if (pageNum && isNumber(pageNum) && pageSize && isNumber(pageSize)) {
        condition.limit = +pageSize
        condition.offset = +((pageNum - 1) * pageSize)
      }
      const categories = await Category.scope(scope).findAndCountAll(condition)
      return [null, categories]
    } catch (err) {
      return [err, null]
    }
  }

  static async detail(id) {
    try {
      const category = await Category.findByPk(id)
      if (!category) {
        throw new global.errs.NotFound('类别不存在')
      }
      return [null, category]
    } catch (err) {
      return [err, null]
    }
  }

  // 查询某个分类及其关联文章的信息
  static async queryDetailArticles(id) {
    try {
      const category = await Category.findByPk(id, {
        include: [
          {
            model: Article,
            through: { attributes: [] }
          }
        ]
      })
      if (!category) {
        throw new global.errs.NotFound('分类不存在')
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
      const res = await category.save()
      return [null, res]
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

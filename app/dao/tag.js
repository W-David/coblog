const { Op } = require('sequelize')
const { Tag, Article } = require('@lib/db')
const { isNumber, isArray } = require('@lib/util')

class TagDao {
  static async create(data) {
    try {
      const { name, createdBy } = data
      const hasTag = await Tag.findOne({
        where: {
          name,
          deleted_at: null
        }
      })
      if (hasTag) {
        throw new global.errs.Existing('已存在同名标签')
      }
      const tag = await Tag.create({ name, createdBy })
      return [null, tag]
    } catch (err) {
      return [err, null]
    }
  }

  static async bulkCreate(dataLis) {
    try {
      const tags = await Tag.bulkCreate(dataLis)
      return [null, tags]
    } catch (err) {
      return [err, null]
    }
  }

  static async detail(id) {
    try {
      const tag = await Tag.findByPk(id)
      if (!tag) {
        throw new global.errs.NotFound('标签不存在')
      }
      return [null, tag]
    } catch (err) {
      return [err, null]
    }
  }

  // 查询某个标签及其关联文章的信息
  static async queryDetailArticles(id) {
    try {
      const tag = await Tag.findByPk(id, {
        include: [
          {
            model: Article,
            attributes: ['id', 'title', 'createdAt'],
            through: { attributes: [] }
          }
        ]
      })
      if (!tag) {
        throw new global.errs.NotFound('标签不存在')
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
      if (pageNum && isNumber(pageNum) && pageSize && isNumber(pageSize)) {
        condition.limit = +pageSize
        condition.offset = +((pageNum - 1) * pageSize)
      }
      const scope = 'tb'
      const tags = await Tag.scope(scope).findAndCountAll(condition)
      return [null, tags]
    } catch (err) {
      return [err, null]
    }
  }

  //条件查询标签及其关联文章信息
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
            through: { attributes: [] }
          }
        ],
        order: [['created_at', 'DESC']]
      }
      if (pageNum && isNumber(pageNum) && pageSize && isNumber(pageSize)) {
        condition.limit = +pageSize
        condition.offset = +((pageNum - 1) * pageSize)
      }
      const tags = await Tag.scope(scope).findAndCountAll(condition)
      return [null, tags]
    } catch (err) {
      return [err, null]
    }
  }

  static async update(data) {
    try {
      const { id, name } = data
      const tag = await Tag.findByPk(id)
      if (!tag) {
        throw new global.errs.NotFound('标签不存在')
      }
      if (name) {
        tag.name = name
      }
      const res = await tag.save()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }

  static async delete(id) {
    try {
      const tag = await Tag.findByPk(id)
      if (!tag) {
        throw new global.errs.NotFound('标签不存在')
      }
      const res = await tag.destroy()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = TagDao

const { Op } = require('sequelize')
const { isArray } = require('@lib/util')
const { Article, Admin, Category, Banner, Tag } = require('@lib/db')

class ArticleDao {
  static async create(data) {
    try {
      const { title, description, content, adminId } = data
      const hasArticle = Article.findOne({
        where: {
          title,
          deleted_at: null
        }
      })
      if (hasArticle) {
        throw new global.errs.Existing('文章已存在')
      }
      //创建文章
      const article = await Article.create({
        title,
        description,
        content,
        adminId
      })
      return [null, article]
    } catch (err) {
      return [err, null]
    }
  }

  static async detail(id) {
    try {
      const article = await Article.findByPk(id)
      if (!article) {
        throw new global.errs.NotFound('文章不存在')
      }
      return [null, article]
    } catch (err) {
      return [err, null]
    }
  }

  static async handleAdmin(adminId) {
    try {
      if (!adminId) {
        throw new global.errs.ParameterException('缺少管理员信息')
      }
      const admin = await Admin.findByPk(adminId)
      if (!admin) {
        throw new global.errs.NotFound('管理员不存在')
      }
      return [null, admin]
    } catch (err) {
      return [err, null]
    }
  }

  static async handleBanner(bannerId) {
    try {
      if (!bannerId) {
        return new Promise.resolve([null, null])
      }
      const banner = await Banner.findByPk(bannerId)
      if (!banner) {
        throw new global.errs.NotFound('图片记录不存在')
      }
      return [null, banner]
    } catch (err) {
      return [err, null]
    }
  }

  static async handleCategory(categoryIds) {
    try {
      if (!categoryIds || !categoryIds.length) {
        return new Promise.resolve([null, null])
      }
      if (!isArray(categoryIds)) {
        throw new global.errs.ParameterException('categroyIds必须为数组')
      }
      const pmCategorys = categoryIds.map((categoryId) =>
        Category.findByPk(categoryId)
      )
      const categories = await Promise.all(pmCategorys)
      return [null, categories]
    } catch (err) {
      return [err, null]
    }
  }

  static async handleTag(tagIds) {
    try {
      if (!tagIds || !categoryIds.length) {
        return new Promise.resolve([null, null])
      }
      if (!isArray(tagIds)) {
        throw new global.errs.ParameterException('tagIds必须为数组')
      }
      const pmTags = tagIds.map((tagId) => Tag.findByPk(tagId))
      const tags = await Promise.all(pmTags)
      return [null, tags]
    } catch (err) {
      return [err, null]
    }
  }

  static async update(data) {
    try {
      const { id, title, description, content, adminId } = data
      const article = await Article.findByPk(id)
      if (!article) {
        throw new global.errs.NotFound('文章不存在')
      }

      e.adminId = adminId
      e.title = title
      article.description = description
      article.content = content

      return [null, article]
    } catch (err) {
      return [err, null]
    }
  }

  static async list(query = {}) {
    try {
      const { title, pageNum, pageSize } = query
      const filter = {}
      if (title) {
        filter.title = {
          [Op.like]: `%${title}%`
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
      const scope = 'iv'
      const articles = await Article.scope(scope).findAndCountAll(condition)
      return [null, articles]
    } catch (err) {
      return [err, null]
    }
  }

  static async delete(id) {
    try {
      const article = await Article.findByPk(id)
      if (!article) {
        throw new global.errs.NotFound('文章不存在')
      }
      const res = article.destroy()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = ArticleDao

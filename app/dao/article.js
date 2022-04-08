const { Op } = require('sequelize')
const { isArray, unique, isNumber } = require('@lib/util')
const { Article, Admin, Category, Banner, Tag } = require('@lib/db')

class ArticleDao {
  static async create(data) {
    try {
      const { title, description, content, adminId, bannerId, categoryIds, tagIds } = data
      const hasArticle = await Article.findOne({
        where: {
          title,
          deleted_at: null
        }
      })
      if (hasArticle) {
        throw new global.errs.Existing('文章已存在')
      }
      const [err, _] = await ArticleDao._handleAdmin(adminId)
      if (err) throw err
      //创建文章
      const article = await Article.create({
        title,
        description,
        content,
        adminId
      })
      const resLis = await Promise.all([
        ArticleDao._handleBanner(bannerId),
        ArticleDao._handleCategory(categoryIds),
        ArticleDao._handleTag(tagIds)
      ])
      resLis.forEach(([err, _]) => {
        if (err) throw err
      })
      const [banner, categoris, tags] = resLis.map(([_, res]) => res)
      await Promise.all([article.setBanner(banner), article.setCategories(categoris), article.setTags(tags)])
      return [null, article]
    } catch (err) {
      return [err, null]
    }
  }

  static async detail(id) {
    try {
      const article = await Article.findByPk(id, {
        include: [
          Banner,
          Admin,
          {
            model: Category,
            through: { attributes: [] }
          },
          {
            model: Tag,
            through: { attributes: [] }
          }
        ]
      })
      if (!article) {
        throw new global.errs.NotFound('文章不存在')
      }
      return [null, article]
    } catch (err) {
      return [err, null]
    }
  }

  static async _handleAdmin(adminId) {
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

  static async _handleBanner(bannerId) {
    try {
      if (!bannerId) {
        return Promise.resolve([null, null])
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

  static async _handleCategory(categoryIds) {
    try {
      if (!categoryIds || !categoryIds.length) {
        return Promise.resolve([null, null])
      }
      if (!isArray(categoryIds)) {
        throw new global.errs.ParameterException('categroyIds必须为数组')
      }
      const pmCategorys = categoryIds.map(categoryId => Category.findByPk(categoryId))
      const categories = await Promise.all(pmCategorys)
      return [null, categories.filter(category => !!category)]
    } catch (err) {
      return [err, null]
    }
  }

  static async _handleTag(tagIds) {
    try {
      if (!tagIds || !tagIds.length) {
        return Promise.resolve([null, null])
      }
      if (!isArray(tagIds)) {
        throw new global.errs.ParameterException('tagIds必须为数组')
      }
      const pmTags = tagIds.map(tagId => Tag.findByPk(tagId))
      const tags = await Promise.all(pmTags)
      return [null, tags.filter(tag => !!tag)]
    } catch (err) {
      return [err, null]
    }
  }

  static async update(data) {
    try {
      const { id, title, description, content, adminId, bannerId, categoryIds, tagIds } = data
      const article = await Article.findByPk(id)
      if (!article) {
        throw new global.errs.NotFound('文章不存在')
      }
      const [err, _] = await ArticleDao._handleAdmin(adminId)
      if (err) throw err

      article.adminId = adminId
      article.title = title
      article.description = description
      article.content = content

      const resLis = await Promise.all([
        ArticleDao._handleBanner(bannerId),
        ArticleDao._handleCategory(categoryIds),
        ArticleDao._handleTag(tagIds)
      ])
      resLis.forEach(([err, _]) => {
        if (err) throw err
      })
      const [banner, categoris, tags] = resLis.map(([_, res]) => res)
      await Promise.all([article.setBanner(banner), article.setCategories(categoris), article.setTags(tags)])
      const res = await article.save()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }

  static async list(body = {}) {
    try {
      const { id, title, pageNum, pageSize, adminId, categoryIds, tagIds } = body
      const hasCateCondition = categoryIds && isArray(categoryIds) && categoryIds.length
      const hasTagCondition = tagIds && isArray(tagIds) && tagIds.length
      const filter = {}
      const include = [
        Banner,
        Admin,
        {
          model: Category,
          through: { attributes: [] },
          where: hasCateCondition
            ? {
                id: {
                  [Op.in]: categoryIds
                }
              }
            : {}
        },
        {
          model: Tag,
          through: { attributes: [] },
          where: hasTagCondition
            ? {
                id: {
                  [Op.in]: tagIds
                }
              }
            : {}
        }
      ]
      if (id) {
        filter.id = id
      }
      if (title) {
        filter.title = {
          [Op.like]: `%${title}%`
        }
      }
      if (adminId) {
        filter.adminId = adminId
      }
      const condition = {
        where: filter,
        include,
        order: [['created_at', 'DESC']]
      }
      if (pageNum && isNumber(pageNum) && pageSize && isNumber(pageSize)) {
        condition.limit = +pageSize
        condition.offset = +((pageNum - 1) * pageSize)
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
      const res = await article.destroy()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = ArticleDao

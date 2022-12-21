const { Op } = require('sequelize')
const { UserType } = require('@lib/type')
const { isArray, unique, isNumber } = require('@lib/util')
const { Article, Admin, Category, Banner, Tag, User, ArticleFavoAdmin, ArticleFavoUser } = require('@lib/db')

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

      const [err, admin] = await ArticleDao._handleAdmin(adminId)
      if (err) throw err

      //创建文章
      const article = await Article.create({
        title,
        description,
        content
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
      await Promise.all([
        article.setAdmin(admin),
        article.setBanner(banner),
        article.setCategories(categoris),
        article.setTags(tags)
      ])
      return [null, article]
    } catch (err) {
      return [err, null]
    }
  }

  static async detail(data) {
    try {
      const { uid, scope, id } = data
      const article = await Article.findByPk(id, {
        attributes: {
          exclude: ['created_at', 'updated_at', 'deleted_at', 'adminId']
        },
        include: [
          {
            model: Banner,
            attributes: ['id', 'path']
          },
          {
            model: Admin,
            attributes: ['id', 'email', 'avatar', 'nickname']
          },
          {
            model: Category,
            through: { attributes: [] },
            attributes: ['id', 'name']
          },
          {
            model: Tag,
            through: { attributes: [] },
            attributes: ['id', 'name']
          }
        ]
      })
      if (!article) {
        throw new global.errs.NotFound('文章不存在')
      }
      let record = null
      if (scope >= UserType.DEFAULT && scope <= UserType.USER) {
        record = await ArticleFavoUser.findOne({
          where: {
            articleId: id,
            userId: uid
          }
        })
      } else {
        record = await ArticleFavoAdmin.findOne({
          where: {
            articleId: id,
            adminId: uid
          }
        })
      }
      article.isFavorited = !!record
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

  static async _handleUser(userId) {
    try {
      if (!userId) {
        throw new global.errs.ParameterException('缺少用户信息')
      }
      const user = await User.findByPk(userId)
      if (!user) {
        throw new global.errs.NotFound('用户不存在')
      }
      return [null, user]
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

      const [err, admin] = await ArticleDao._handleAdmin(adminId)
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
      await Promise.all([
        article.setAdmin(admin),
        article.setBanner(banner),
        article.setCategories(categoris),
        article.setTags(tags)
      ])
      const res = await article.save()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }

  static async favorite(data) {
    try {
      const { uid, scope, articleId } = data
      const article = await Article.findByPk(articleId)
      if (!article) {
        throw new global.errs.NotFound('文章不存在')
      }
      if (scope > UserType.DEFAULT && scope <= UserType.USER) {
        const userId = uid
        const [err, user] = await ArticleDao._handleUser(userId)
        if (err) throw err
        const isFavorited = await ArticleFavoUser.findOne({
          where: { articleId, userId }
        })
        !!isFavorited ? await article.removeFavoUser(user, { force: true }) : await article.addFavoUser(user)
      } else if (scope > UserType.USER) {
        const adminId = uid
        const [err, admin] = await ArticleDao._handleAdmin(adminId)
        if (err) throw err
        const isFavorited = await ArticleFavoAdmin.findOne({
          where: { articleId, adminId }
        })
        !!isFavorited ? await article.removeFavoAdmin(admin, { force: true }) : await article.addFavoAdmin(admin)
      } else {
        throw new global.errs.ParameterException('请先登录')
      }
      const countResLis = await Promise.all([
        ArticleFavoUser.count({ where: { articleId } }),
        ArticleFavoAdmin.count({ where: { articleId } })
      ])
      const favoriteNum = countResLis.reduce((sum, res) => sum + res, 0) || 0
      return [null, favoriteNum]
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
        {
          model: Banner,
          attributes: ['id', 'path']
        },
        {
          model: Admin,
          attributes: ['id', 'email', 'avatar', 'nickname']
        },
        {
          model: Category,
          through: {
            attributes: []
          },
          attributes: ['id', 'name'],
          where: hasCateCondition
            ? {
                id: {
                  [Op.in]: categoryIds
                }
              }
            : null
        },
        {
          model: Tag,
          through: {
            attributes: []
          },
          attributes: ['id', 'name'],
          where: hasTagCondition
            ? {
                id: {
                  [Op.in]: tagIds
                }
              }
            : null
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
        attributes: {
          exclude: ['content', 'deleted_at']
        },
        order: [['created_at', 'DESC']],
        distinct: true
      }
      if (pageNum && isNumber(pageNum) && pageSize && isNumber(pageSize)) {
        condition.limit = +pageSize
        condition.offset = +((pageNum - 1) * pageSize)
      }
      // debugger
      const articles = await Article.findAndCountAll(condition)
      return [null, articles]
    } catch (err) {
      return [err, null]
    }
  }

  static async listIdByTitle({ title }) {
    try {
      const filter = {}
      if (title) {
        filter.title = {
          [Op.like]: `%${title}%`
        }
      }
      const condition = {
        where: filter,
        attributes: ['id', 'title'],
        order: [['updated_at', 'DESC']],
        distinct: true
      }
      const articles = await Article.findAll(condition)
      return [null, articles]
    } catch (err) {
      return [err, null]
    }
  }

  static async listByTime(body = {}) {
    try {
      const { adminId, beginTime, endTime, pageNum, pageSize } = body
      const filter = {}
      const include = [
        {
          model: Category,
          through: {
            attributes: []
          },
          attributes: ['id', 'name']
        },
        {
          model: Tag,
          through: {
            attributes: []
          },
          attributes: ['id', 'name']
        }
      ]
      if (adminId) {
        filter.adminId = adminId
      }
      if (beginTime || endTime) {
        if (beginTime && !endTime) {
          filter.createdAt = {
            [Op.gte]: beginTime
          }
        } else if (!beginTime && endTime) {
          filter.createdAt = {
            [Op.lte]: endTime
          }
        } else {
          filter.createdAt = {
            [Op.between]: [beginTime, endTime]
          }
        }
      }
      const condition = {
        where: filter,
        include,
        attributes: {
          exclude: ['content', 'deleted_at', 'updated_at']
        },
        order: [['created_at', 'DESC']],
        distinct: true
      }
      if (pageNum && isNumber(pageNum) && pageSize && isNumber(pageSize)) {
        condition.limit = +pageSize
        condition.offset = +((pageNum - 1) * pageSize)
      }
      const articles = await Article.findAndCountAll(condition)
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

const { Op } = require('sequelize')
const sequelize = require('sequelize')
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
      const [favoAdminNum, article] = await Promise.all([
        ArticleFavoAdmin.count({ where: { articleId: id } }),
        Article.findByPk(id, {
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
      ])
      if (uid) {
        const record = await ArticleFavoAdmin.findOne({
          where: {
            articleId: id,
            adminId: uid
          }
        })
        article.isFavorited = !!record
      }
      if (!article) {
        throw new global.errs.NotFound('文章不存在')
      }
      article.favoritedNum = favoAdminNum || 0
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
      if (scope === UserType.ADMIN || scope === UserType.SUPER_ADMIN) {
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
      const favoritedNum = await ArticleFavoAdmin.count({ where: { articleId } })
      return [null, favoritedNum]
    } catch (err) {
      return [err, null]
    }
  }

  static async list(data = {}) {
    try {
      const { id, title, pageNum, pageSize, adminId, categoryIds, tagIds } = data
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
          exclude: ['content']
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

  static async listByTime(data = {}) {
    try {
      const { adminId, pageSize } = data
      const filter = {}
      const include = [
        {
          model: Banner,
          attributes: ['id', 'path']
        }
      ]
      if (adminId) {
        filter.adminId = adminId
      }
      const condition = {
        where: filter,
        include,
        attributes: {
          exclude: ['deleted_at', 'content']
        },
        order: [['created_at', 'DESC']],
        distinct: true
      }
      if (pageSize && isNumber(pageSize)) {
        condition.limit = +pageSize
      }
      const articles = await Article.findAll(condition)
      return [null, articles]
    } catch (err) {
      return [err, null]
    }
  }

  //此处不统计User的数据
  static async listByFavo(data = {}) {
    try {
      const { adminId, pageSize } = data
      const scope = 'bh'
      const favo = [sequelize.fn('COUNT', sequelize.col('FavoAdmins.id')), 'favoCount']
      const filter = {}
      const include = [
        {
          model: Banner,
          attributes: ['id', 'path']
        },
        {
          model: Admin,
          as: 'FavoAdmins',
          through: {
            attributes: []
          },
          attributes: [favo]
        }
      ]
      if (adminId) {
        filter.adminId = adminId
      }
      const condition = {
        where: filter,
        include,
        attributes: [
          'id',
          'title',
          'description',
          'updated_at',
          'created_at',
          'updatedAt',
          'createdAt',
          'status',
          favo
        ],
        group: ['id'],
        order: [[sequelize.literal('favoCount'), 'DESC']],
        distinct: true,
        subQuery: false
      }
      if (pageSize && isNumber(pageSize)) {
        condition.limit = +pageSize
      }
      const articles = await Article.scope(scope).findAll(condition)
      return [null, articles]
    } catch (err) {
      return [err, null]
    }
  }

  static async listArchive(data) {
    try {
      const { adminId, format, pageNum, pageSize } = data
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
      let dateFormat = []
      if (format === 'month') {
        dateFormat = [sequelize.fn('DATE_FORMAT', sequelize.col('article.created_at'), '%Y-%m'), 'month']
      } else if (format === 'week') {
        dateFormat = [sequelize.fn('DATE_FORMAT', sequelize.col('article.created_at'), '%Y-%u'), 'week']
      } else {
        dateFormat = [sequelize.fn('DATE_FORMAT', sequelize.col('article.created_at'), '%Y-%m-%d'), 'day']
      }
      const condition = {
        where: filter,
        include,
        attributes: ['id', 'title', 'description', 'browse', 'created_at', 'createdAt', dateFormat],
        order: [['createdAt', 'DESC']],
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

  static async delete(data) {
    try {
      const { uid: adminId, scope, id } = data
      const article = await Article.findOne({
        where: {
          id,
          adminId
        }
      })
      if (!article) {
        throw new global.errs.NotFound('只有用户本人可删除')
      }
      const res = await article.destroy()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = ArticleDao

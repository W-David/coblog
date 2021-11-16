const { Op } = require('sequelize')
const { unique, isArray } = require('@lib/util')
const { Article } = require('@model/article')
const { Admin } = require('@model/admin')
const { Category } = require('@model/category')
const { Banner } = require('@model/file')
const { Tag } = require('@model/tag')

class ArticleDao {
  static async create(data) {
    try {
      const {
        title,
        description,
        content,
        adminId,
        bannerId,
        categoryIds,
        tagIds
      } = data
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
        content
      })
      //新建关联项
      const checkLis = await Promise.all([
        ArticleDao._handleAdmin(adminId),
        ArticleDao._handleBanner(bannerId),
        ArticleDao._handleCategory(categoryIds),
        ArticleDao._handleTag(tagIds)
      ])
      checkLis.forEach(([err, _]) => {
        if (err) throw err
      })
      await Promise.all([
        article.createAdmin(resLis[0][1]),
        article.createBanner(resLis[1][1]),
        article.createCategorys(resLis[2][1]),
        article.createTags(resLis[3][1])
      ])
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

  static async _handleCategory(categoryIds) {
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
      const categorys = await Promise.all(pmCategorys)
      return [null, categorys]
    } catch (err) {
      return [err, null]
    }
  }

  static async _handleTag(tagIds) {
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
      const {
        id,
        title,
        description,
        content,
        adminId,
        bannerId,
        categoryIds,
        tagIds
      } = data
      const article = await Article.findByPk(id)
      if (!article) {
        throw new global.errs.NotFound('文章不存在')
      }
      article.title = title
      article.description = description
      article.content = content

      //更新关联项
      const checkLis = await Promise.all([
        ArticleDao._handleAdmin(adminId),
        ArticleDao._handleBanner(bannerId),
        ArticleDao._handleCategory(categoryIds),
        ArticleDao._handleTag(tagIds)
      ])
      checkLis.forEach(([err, _]) => {
        if (err) throw err
      })
      await Promise.all([
        article.setAdmin(resLis[0][1]),
        article.setBanner(resLis[1][1]),
        article.setCategorys(resLis[2][1]),
        article.setTags(resLis[3][1])
      ])
      return [null, article]
    } catch (err) {
      return [err, null]
    }
  }

  static async list(query = {}) {
    try {
      const { title, adminId, categoryIds, tagIds, pageNum, pageSize } = query
      const filter = {}
      let conditionId = []
      if (title) {
        filter.title = title
      }
      if (adminId) {
        const [err, admin] = await ArticleDao._handleAdmin(adminId)
        if (err) throw err
        if (admin) {
          const articles = await admin.getArticles()
          if (articles) {
            articles.forEach((article) => conditionId.push(article.id))
          }
        }
      }
      if (categoryIds) {
        const [err, categorys] = await ArticleDao._handleCategory(categoryIds)
        if (err) throw err
        if (categorys) {
          const mp = categorys.map((category) => category.getArticles())
          const articlesLis = await Promise.all(mp)
          //提取一层就可以
          const articles = articlesLis.flat()
          if (articles) {
            unique(articles).forEach((article) => conditionId.push(article.id))
          }
        }
      }
      if (tagIds) {
        const [err, tags] = await ArticleDao._handleTag(tagIds)
        if (err) throw err
        if (tags) {
          const mp = tags.map((tag) => tag.getArticles())
          //同category
          const articlesLis = await Promise.all(mp)
          const articles = articlesLis.flat()
          if (articles) {
            unique(articles).forEach((article) => conditionId.push(article.id))
          }
        }
      }
      if (conditionId.length) {
        const uniId = unique(conditionId)
        filter.id = {
          [Op.in]: uniId
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

      const res = article.destory()
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = {
  ArticleDao
}

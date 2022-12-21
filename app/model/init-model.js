const generateAdmin = require('./admin')
const generateArticle = require('./article')
const generateFile = require('./file')
const generateCategory = require('./category')
const generateTag = require('./tag')
const generateUser = require('./user')

const generateArticleCategory = require('./articleCategory')
const generateArticleTag = require('./articleTag')
const generateArticleFavoUser = require('./articleFavoUser')
const generateArticleFavoAdmin = require('./articleFavoAdmin')

module.exports = sequelize => {
  const Admin = generateAdmin(sequelize)
  const Article = generateArticle(sequelize)
  const Banner = generateFile('banner', sequelize)
  const Category = generateCategory(sequelize)
  const Tag = generateTag(sequelize)
  const User = generateUser(sequelize)
  const ArticleCategory = generateArticleCategory(sequelize, Article, Category)
  const ArticleTag = generateArticleTag(sequelize, Article, Tag)
  const ArticleFavoAdmin = generateArticleFavoAdmin(sequelize, Article, Admin)
  const ArticleFavoUser = generateArticleFavoUser(sequelize, Article, User)

  return {
    Admin,
    Article,
    Banner,
    Category,
    Tag,
    User,
    ArticleCategory,
    ArticleTag,
    ArticleFavoAdmin,
    ArticleFavoUser
  }
}

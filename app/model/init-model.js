const generateAdmin = require('./admin')
const generateArticle = require('./article')
const generateFile = require('./file')
const generateCategory = require('./category')
const generateTag = require('./tag')
const generateUser = require('./user')
const generateRu = require('./ru')

const generateArticleCategory = require('./articleCategory')
const generateArticleTag = require('./articleTag')

module.exports = (sequelize) => {
  const Admin = generateAdmin(sequelize)
  const Article = generateArticle(sequelize)
  const Banner = generateFile('banner', sequelize)
  const Category = generateCategory(sequelize)
  const Tag = generateTag(sequelize)
  const User = generateUser(sequelize)
  const ArticleCategory = generateArticleCategory(sequelize, Article, Category)
  const ArticleTag = generateArticleTag(sequelize, Article, Tag)
  const Ru = generateRu(sequelize)

  return {
    Admin,
    Article,
    Banner,
    Category,
    Tag,
    User,
    ArticleCategory,
    ArticleTag,
    Ru
  }
}

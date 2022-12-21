const { DataTypes } = require('sequelize')

const generateArticleFavoAdmin = (sequelize, Article, Admin) =>
  sequelize.define('article_favo_admin', {
    articleId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      references: {
        model: Article,
        key: 'id'
      }
    },
    adminId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      references: {
        model: Admin,
        key: 'id'
      }
    }
  })

module.exports = generateArticleFavoAdmin

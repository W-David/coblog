const { DataTypes } = require('sequelize')

const generateArticleFavoUser = (sequelize, Article, User) =>
  sequelize.define('article_favo_user', {
    articleId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      references: {
        model: Article,
        key: 'id'
      }
    },
    userId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      references: {
        model: User,
        key: 'id'
      }
    }
  })

module.exports = generateArticleFavoUser

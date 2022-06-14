const { DataTypes } = require('sequelize')

const generateArticleCategory = (sequelize, Article, Category) =>
  sequelize.define('articleCategory', {
    articleId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      references: {
        model: Article,
        key: 'id'
      }
    },
    categoryId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      references: {
        model: Category,
        key: 'id'
      }
    }
  })

module.exports = generateArticleCategory

const { DataTypes } = require('sequelize')

const generateArticleTag = (sequelize, Article, Tag) =>
  sequelize.define('articleTag', {
    articleId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      references: {
        model: Article,
        key: 'id'
      }
    },
    tagId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      references: {
        model: Tag,
        key: 'id'
      }
    }
  })

module.exports = generateArticleTag

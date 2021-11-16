const { Article } = require('@model/article')
const { Tag } = require('@model/tag')
const { sequelize } = require('@lib/db')
const { Model, DataTypes } = require('sequelize')

class ArticleTag extends Model {}

ArticleTag.init(
  {
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
  },
  {
    sequelize,
    modelName: 'articleTag'
  }
)

module.exports = {
  ArticleTag
}

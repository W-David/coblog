const { Article } = require('@model/article')
const { Category } = require('@model/category')
const { sequelize } = require('@lib/db')
const { Model, DataTypes } = require('sequelize')

class ArticleCategory extends Model {}

ArticleCategory.init(
  {
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
  },
  {
    sequelize,
    modelName: 'articleCategory'
  }
)

module.exports = {
  ArticleCategory
}

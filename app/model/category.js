const moment = require('moment')
const { sequelize } = require('@lib/db')
const { DataTypes, Model } = require('sequelize')
const { Article } = require('@model/article')
const { ArticleCategory } = require('@model/articleCategory')

class Category extends Model {}

Category.init(
  {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(
          this.getDataValue('created_at').format('YYYY-MM-DD HH:mm:ss')
        )
      }
    }
  },
  {
    sequelize,
    modelName: 'category'
  }
)

Category.belongsToMany(Article, { through: ArticleCategory })

module.exports = {
  Category
}

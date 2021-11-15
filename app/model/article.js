const moment = require('moment')
const { sequelize } = require('@lib/db')
const { DataTypes, Model } = require('sequelize')

class Article extends Model {}

Article.init(
  {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    title: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    browse: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    favoriteNum: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: true,
      defaultValue: 0
    },
    adminId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      allowNull: false
    },
    categoryId: {
      type: DataTypes.INTEGER(10).UNSIGNED,
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
    modelName: 'article'
  }
)

module.exports = {
  Article
}

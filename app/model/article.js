const moment = require('moment')
const { sequelize } = require('@lib/db')
const { DataTypes, Model } = require('sequelize')
const { Admin } = require('@model/admin')
const { Category } = require('@model/category')
const { Banner } = require('@model/file')
const { Tag } = require('@model/tag')
const { ArticleTag } = require('@model/articleTag')
const { ArticleCategory } = require('@model/articleCategory')

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

Article.belongsTo(Admin)
Article.hasOne(Banner, {
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
})
Article.belongsToMany(Category, {
  through: ArticleCategory,
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
})
Article.belongsToMany(Tag, {
  through: ArticleTag,
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
})

module.exports = {
  Article
}

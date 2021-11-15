const moment = require('moment')
const { sequelize } = require('@lib/db')
const { DataTypes, Model } = require('sequelize')

class Article extends Model {}

Article.init({
  id: {
    type: DataTypes.INTEGER(10).UNSIGNED,
    primaryKey: true,
    autoIncrement: true
  }
})

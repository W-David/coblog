const moment = require('moment')
const { DataTypes } = require('sequelize')

const generateTag = (sequelize) =>
  sequelize.define('tag', {
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
      get() {
        return moment(this.getDataValue('created_at')).format(
          'YYYY-MM-DD HH:mm:ss'
        )
      }
    }
  })

module.exports = generateTag

const moment = require('moment')
const { DataTypes } = require('sequelize')

const generateFile = (name, sequelize) =>
  sequelize.define(name, {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    path: {
      type: DataTypes.STRING(200),
      allowNull: false
    },
    extension: {
      type: DataTypes.STRING(50)
    },
    size: {
      type: DataTypes.INTEGER(16)
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

module.exports = generateFile

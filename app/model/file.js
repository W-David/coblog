const moment = require('moment')
const { sequelize } = require('@lib/db')
const { DataTypes, Model } = require('sequelize')

class File extends Model {}

File.init(
  {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    // articleId: {
    //   type: DataTypes.INTEGER(10).UNSIGNED,
    //   allowNull: false
    // },
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
      allowNull: false,
      get() {
        return moment(this.getDataValue('created_at')).format(
          'YYYY-MM-DD HH:mm:ss'
        )
      }
    }
  },
  {
    sequelize,
    modelName: 'file'
  }
)

module.exports = {
  File
}

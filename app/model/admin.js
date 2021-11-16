const moment = require('moment')
const bcrypt = require('bcryptjs')
const { sequelize } = require('@lib/db')
const { Model, DataTypes } = require('sequelize')
const { Article } = require('@model/article')

class Admin extends Model {}

Admin.init(
  {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(50),
      unique: 'admin_email_unique',
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        const salt = bcrypt.genSaltSync(10)
        const saltPassword = bcrypt.hashSync(val, salt)
        this.setDataValue('password', saltPassword)
      }
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    created_at: {
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
    modelName: 'admin'
  }
)

Admin.hasMany(Article, {
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
})

module.exports = {
  Admin
}

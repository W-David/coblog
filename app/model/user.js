const moment = require('moment')
const bcrypt = require('bcryptjs')
const { sequelize } = require('@lib/db')
const { DataTypes, Model } = require('sequelize')

class User extends Model {}

User.init(
  {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    email: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
      set(val) {
        const salt = bcrypt.genSaltSync(10)
        const hashPw = bcrypt.hashSync(val, salt)
        this.setDataValue('password', hashPw)
      }
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: true,
      defaultValue: 1
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  },
  {
    sequelize,
    modelName: 'user'
  }
)

module.exports = {
  User
}

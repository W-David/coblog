const moment = require('moment')
const bcrypt = require('bcryptjs')
const { DataTypes } = require('sequelize')

const generateUser = sequelize =>
  sequelize.define('user', {
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
    avatar: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
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
    createdAt: {
      type: DataTypes.DATE,
      get() {
        return moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  })

module.exports = generateUser

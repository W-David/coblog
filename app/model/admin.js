const moment = require('moment')
const bcrypt = require('bcryptjs')
const { DataTypes } = require('sequelize')

const generateAdmin = sequelize =>
  sequelize.define('admin', {
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
    avatar: {
      type: DataTypes.STRING(200),
      allowNull: true,
      defaultValue: ''
    },
    status: {
      type: DataTypes.TINYINT,
      allowNull: false,
      defaultValue: 1
    },
    nickname: {
      type: DataTypes.STRING(50),
      allowNull: false
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      get() {
        return moment(this.getDataValue('created_at')).format('YYYY-MM-DD HH:mm:ss')
      }
    }
  })

module.exports = generateAdmin

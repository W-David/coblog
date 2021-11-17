const moment = require('moment')
const bcrypt = require('bcryptjs')
const { DataTypes } = require('sequelize')

const generateRu = (sequelize) =>
  sequelize.define('ru', {
    id: {
      type: DataTypes.INTEGER(10).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
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
        const saltPassword = bcrypt.hashSync(val, salt)
        this.setDataValue('password', saltPassword)
      }
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
  })

module.exports = generateRu

const Sequelize = require('sequelize')
const { database } = require('@config/config')
const { dbName, host, port, user, password } = database

const sequelize = new Sequelize(dbName, user, password, {
  dialect: 'mysql',
  host,
  port,
  logging: false,
  timezone: '+08:00',
  define: {
    freezeTableName: true,
    timeStamps: true,
    paranoid: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    underscored: true,
    scopes: {
      bh: {
        attributes: {
          exclude: ['password', 'updated_at', 'created_at', 'deleted_at']
        }
      },
      iv: {
        attributes: {
          exclude: ['content', 'password', 'created_at', 'deleted_at']
        }
      }
    }
  }
})

sequelize.sync({ force: true })
sequelize
  .authenticate()
  .then((res) => {
    console.log('Connection has been established successfully.')
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err)
  })

module.exports = {
  sequelize
}

const Sequelize = require('sequelize')
const { database, admin } = require('@config/config')
const { dbName, host, port, user, password } = database
const initModel = require('@model/init-model')

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
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    scopes: {
      bh: {
        attributes: {
          exclude: ['updated_at', 'created_at', 'deleted_at']
        }
      },
      iv: {
        attributes: {
          exclude: ['content', 'created_at', 'deleted_at']
        }
      },
      tb: {
        attributes: {
          exclude: ['deleted_at', 'updated_at']
        }
      }
    }
  }
})

const { Admin, Article, Banner, Category, Tag, User, ArticleCategory, ArticleTag, Ru } = initModel(sequelize)

//管理员和文章关联
Admin.hasMany(Article, {
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
})
Article.belongsTo(Admin)

//文章和头图关联
Article.hasOne(Banner, {
  onUpdate: 'CASCADE',
  onDelete: 'SET NULL'
})
Banner.belongsTo(Article)

//文章和类型关联
Article.belongsToMany(Category, {
  through: ArticleCategory,
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
})
Category.belongsToMany(Article, { through: ArticleCategory })

//文章和标签关联
Article.belongsToMany(Tag, {
  through: ArticleTag,
  onUpdate: 'CASCADE',
  onDelete: 'CASCADE'
})
Tag.belongsToMany(Article, { through: ArticleTag })

sequelize.sync().then(() => Ru.create({ ...admin }))

sequelize
  .authenticate()
  .then(res => {
    console.log('Connection has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

module.exports = {
  Admin,
  Article,
  Banner,
  Category,
  Tag,
  User,
  ArticleCategory,
  ArticleTag,
  Ru
}

const Sequelize = require('sequelize')
const { database, admin } = require('@config/config')
const { dbName, host, port, user, password } = database
const initModel = require('@model/init-model')

const sequelize = new Sequelize(dbName, user, password, {
  dialect: 'mysql',
  dialectOptions: {
    charset: 'utf8mb4',
    supportBigNumbers: true,
    bigNumberStrings: true
  },
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
      np: {
        attributes: {
          exclude: ['updated_at', 'created_at', 'deleted_at', 'password', 'status']
        }
      },
      bh: {
        attributes: {
          exclude: ['updated_at', 'created_at', 'deleted_at']
        }
      },
      iv: {
        attributes: {
          exclude: ['content', 'deleted_at']
        }
      }
    }
  }
})

const { Admin, Article, Banner, Category, Tag, User, ArticleCategory, ArticleTag, ArticleFavoAdmin, ArticleFavoUser } =
  initModel(sequelize)

//管理员和文章关联
Admin.hasMany(Article)
Article.belongsTo(Admin)

//文章和头图关联
Article.hasOne(Banner)
Banner.belongsTo(Article)

//文章和类型关联
Article.belongsToMany(Category, {
  through: ArticleCategory
})
Category.belongsToMany(Article, {
  through: ArticleCategory
})

//文章和标签关联
Article.belongsToMany(Tag, {
  through: ArticleTag
})
Tag.belongsToMany(Article, {
  through: ArticleTag
})

//文章和喜欢文章的管理员关联
Article.belongsToMany(Admin, {
  through: ArticleFavoAdmin,
  as: 'FavoAdmins'
})
Admin.belongsToMany(Article, {
  through: ArticleFavoAdmin,
  as: 'LoveArticles'
})

//文章和喜欢文章的用户关联
Article.belongsToMany(User, {
  through: ArticleFavoUser,
  as: 'FavoUsers'
})
User.belongsToMany(Article, {
  through: ArticleFavoUser,
  as: 'LoveArticles'
})

const initMode = {}
// const initMode = { force: true }
// const initMode = { alter: true}
sequelize.sync(initMode).then(async () => {
  const hasAdmin = await Admin.findOne({ where: { email: admin.email, deleted_at: null } })
  if (hasAdmin) return
  await Admin.create(admin)
})

sequelize
  .authenticate()
  .then(res => {
    console.log('Connection has been established successfully.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

module.exports = {
  sequelize,
  Admin,
  Article,
  Banner,
  Category,
  Tag,
  User,
  ArticleCategory,
  ArticleTag,
  ArticleFavoAdmin,
  ArticleFavoUser
}

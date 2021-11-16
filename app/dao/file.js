const { Op } = require('sequelize')
const { File } = require('@model/file')
const { Article } = require('@model/article')
const { deleteFile } = require('@lib/util')

class FileDao {
  static async create(data) {
    try {
      const { name, path, extension, size } = data
      const file = await File.create({
        // articleId,
        name,
        path,
        extension,
        size
      })
      return [null, file]
    } catch (err) {
      return [err, null]
    }
  }

  static async bulkCreate(dataLis) {
    try {
      const files = await File.bulkCreate(dataLis)
      return [null, files]
    } catch (err) {
      return [err, null]
    }
  }

  static async detail(id) {
    try {
      const file = await File.findByPk(id)
      if (!file) {
        throw new global.errs.NotFound('未找到相关文件')
      }
      return [null, file]
    } catch (err) {
      return [err, null]
    }
  }

  static async delete(id) {
    try {
      const file = await File.findByPk(id)
      if (!file) {
        throw new global.errs.NotFound('未找到文件记录')
      }
      const res = await file.destroy()
      try {
        await deleteFile(`${process.cwd()}/static/uploads/${res.name}`)
      } catch (err) {
        throw err
      }
      return [null, res]
    } catch (err) {
      return [err, null]
    }
  }
}

module.exports = FileDao

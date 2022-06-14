const jwt = require('jsonwebtoken')
const { access, constants, unlink } = require('fs')
const path = require('path')

//根据用户信息生成token
const generateToken = (uid, scope) => {
  const secretKey = global.config.security.secretKey
  const expiresIn = global.config.security.expiresIn
  const token = jwt.sign(
    {
      uid,
      scope
    },
    secretKey,
    {
      expiresIn
    }
  )
  return token
}

const deleteFile = (url) => {
  return new Promise((res, rej) => {
    access(url, constants.F_OK, (err) => {
      if (err) {
        rej(err)
      } else {
        unlink(url, (err) => {
          if (err) {
            rej(err)
          } else {
            res()
          }
        })
      }
    })
  })
}

const unique = (arr) => [...new Set(arr)]

const isArray = (arr) =>
  Object.prototype.toString.call(arr) === '[object Array]'

const isNumber = (str) => !isNaN(Number(str))

module.exports = {
  generateToken,
  deleteFile,
  unique,
  isArray,
  isNumber
}

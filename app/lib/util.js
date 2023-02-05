const jwt = require('jsonwebtoken')
const { access, constants, unlink } = require('fs')
const path = require('path')
const MarkdownIt = require('markdown-it')
const MDHighLight = require('markdown-it-highlightjs')
const MDTocAndAnchor = require('markdown-it-toc-and-anchor').default

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

const deleteFile = url => {
  return new Promise((res, rej) => {
    access(url, constants.F_OK, err => {
      if (err) {
        rej(err)
      } else {
        unlink(url, err => {
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

const unique = arr => [...new Set(arr)]

const isArray = arr => Object.prototype.toString.call(arr) === '[object Array]'

const isNumber = str => !isNaN(Number(str))

const convToToc = md => {
  return new Promise((res, rej) => {
    new MarkdownIt({})
      .use(MDTocAndAnchor, {
        tocFirstLevel: 2,
        tocLastLevel: 5,
        tocCallback: (tocMarkdown, tocArray, tocHtml) => {
          res(tocArray)
        }
      })
      .render(md)
  })
}

const convToHTML = md => {
  return md
    ? new MarkdownIt({
        html: true,
        linkify: true,
        typographer: true
      })
        .use(MDHighLight, { code: false })
        .use(MDTocAndAnchor, {
          tocFirstLevel: 2,
          tocLastLevel: 5
        })
        .render(md)
    : ''
}

module.exports = {
  generateToken,
  deleteFile,
  unique,
  isArray,
  isNumber,
  convToHTML,
  convToToc
}

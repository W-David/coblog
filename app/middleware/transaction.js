const clsHooked = require('cls-hooked')

const sequelizeTransaction = ({ sequelize, namespace: namespaceName = 'koa2-sequelize-transaction' }) => {
  const namespace = clsHooked.createNamespace(namespaceName)
  sequelize.constructor.useCLS(namespace)

  const transactionMiddleware = (ctx, next) => {
    return new Promise((resolve, reject) => {
      namespace.run(() => {
        sequelize.transaction().then(transaction => {
          namespace.set('transaction', transaction)
          next().then(
            result => {
              transaction.commit()
              resolve(result)
            },
            e => {
              transaction.rollback()
              reject(e)
            }
          )
        }, reject)
      })
    })
  }

  return transactionMiddleware
}

module.exports = sequelizeTransaction

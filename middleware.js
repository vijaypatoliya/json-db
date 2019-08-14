const { STATUS_CODES } = require('http')
const fs = require('fs')

module.exports = {
  notFound,
  handleError,
  validateDB
}

function handleError (err, req, res, next) {
  if (res.headersSent) return next(err)

  if (!err.statusCode) console.error(err)
  const statusCode = err.statusCode || 500
  const errorMessage = STATUS_CODES[statusCode] || 'Internal Error'
  res.status(statusCode).json({ error: errorMessage, success: false })
}

function notFound (req, res) {
  res.status(404).json({ error: 'Not Found', success: false })
}

function validateDB (req, res, next) {
  const params = req.params
  const path = process.cwd() + '/data/' + params.studentId + '.json'
  if (!fs.existsSync(path)) {
    return res.status(404).json({ message: 'student not found!' })
  }
  next()
}

const express = require('express')
const router = express.Router()
const fs = require('fs')
const _ = require('lodash')
const middleware = require('./../middleware')

/* Get a student by id */
router.get('/:studentId/*', middleware.validateDB, async (req, res, next) => {
  const params = req.params
  const path = process.cwd() + '/data/' + params.studentId + '.json'
  fs.readFile(path, { encoding: 'utf-8' }, (err, data) => {
    if (err) return next(err)

    let urlKeyString = params['0'] || ''
    urlKeyString = urlKeyString.replace(/\//g, '.')
    const studentData = JSON.parse(data)
    const response = _.get(studentData, urlKeyString)

    if (response) return res.json({ data: response, success: true })
    next()
  })
})

/* Update a student */
router.put('/:studentId/*', async (req, res, next) => {
  const params = req.params
  const body = req.body
  const path = process.cwd() + '/data/' + params.studentId + '.json'

  if (!fs.existsSync(path)) {
    /* Create file */
    fs.writeFile(path, JSON.stringify({}), (err) => {
      if (err) return next(err)
    })
  }
  fs.readFile(path, { encoding: 'utf-8' }, (err, fileData) => {
    if (err) return next(err)

    let urlKeyString = params['0'] || ''
    urlKeyString = urlKeyString.replace(/\//g, '.')
    const studentData = JSON.parse(fileData)
    _.set(studentData, urlKeyString, body)

    const newStudentObj = JSON.stringify(studentData)
    fs.writeFileSync(path, newStudentObj)
    res.status(200).json({ message: 'successfully updated!', success: true })
  })
})

/* Delete a student */
router.delete('/:studentId/*', middleware.validateDB, async (req, res, next) => {
  const params = req.params
  const path = process.cwd() + '/data/' + params.studentId + '.json'
  fs.readFile(path, { encoding: 'utf-8' }, (err, fileData) => {
    if (err) return next(err)

    let urlKeyString = params['0'] || ''
    urlKeyString = urlKeyString.replace(/\//g, '.')
    const studentData = JSON.parse(fileData)
    const response = _.get(studentData, urlKeyString)
    if (!response) return next()

    _.unset(studentData, urlKeyString)
    const data = JSON.stringify(studentData)
    fs.writeFileSync(path, data)
    res.status(200).json({ message: 'successfully deleted!', success: true })
  })
})

module.exports = router

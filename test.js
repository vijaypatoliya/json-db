const tape = require('tape')
const jsonist = require('jsonist')

const port = (process.env.PORT = process.env.PORT || require('get-port-sync')())
const endpoint = `http://localhost:${port}`

const server = require('./server')

tape('health', async function (t) {
  const url = `${endpoint}/health`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'should have successful healthcheck')
    t.end()
  })
})

tape('get student data by valid id', async function (t) {
  const url = `${endpoint}/rn1abu8/courses/calculus`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    t.true(body.success, 'it should get student data')
    t.end()
  })
})

tape('get student data by invalid id', async function (t) {
  const url = `${endpoint}/rn1abu81/courses/calculus/quizzes/ye0ab61`
  jsonist.get(url, (err, body) => {
    if (err) t.error(err)
    if (!body.success) t.false(body.success, 'it should not get student data')
    t.end()
  })
})

tape('update student data by id', async function (t) {
  const url = `${endpoint}/rn1abu8/courses/calculus/quizzes/ye0ab61`
  const data = { score: 98 }
  jsonist.put(url, data, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'it should updated student data')
    t.end()
  })
})

tape('delete student data by valid id', async function (t) {
  const url = `${endpoint}/rn1abu8/courses/calculus/quizzes`
  jsonist.delete(url, (err, body) => {
    if (err) t.error(err)
    t.ok(body.success, 'it should deleted student data')
    t.end()
  })
})

tape('delete student data by invalid key', async function (t) {
  const url = `${endpoint}/rn1abu8/courses/gfhfghfgh`
  jsonist.delete(url, (err, body) => {
    if (err) t.error(err)
    t.false(body.success, 'it should not delete student data')
    t.end()
  })
})

tape('cleanup', function (t) {
  server.close()
  t.end()
})

const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const JsonStorage = require('./JsonStorage')
const cors = require('cors')

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json({ limit: '50mb' }))

// cors
app.use(cors())

const jsonStorage = new JsonStorage()

/**
 * Retorna todo o storage
 */
app.get('/', (req, res) => {
  const value = jsonStorage.get()
  res.json(value)
})

/**
 * Retorna uma chave específica, ou '' caso não exista.
 */
app.get('/:key', (req, res) => {
  const key = req.params.key
  const value = jsonStorage.get(key)
  res.json(value)
})

app.post('/:key', (req, res) => {
  const key = req.params.key
  const { data, expires } = req.body
  jsonStorage.set(key, data, expires)
  res.end()
})

app.delete('/:key', (req, res) => {
  const key = req.params.key
  jsonStorage.delete(key)
  res.end()
})

app.delete('/', (req, res) => {
  jsonStorage.delete()
  res.end()
})

module.exports = app

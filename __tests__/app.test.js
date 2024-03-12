const request = require('supertest')
const app = require('../app')
const fs = require('fs')

jest.setTimeout(120000)
jest.useFakeTimers()

beforeAll(() => {
  try {
    fs.unlinkSync('storage.json')
  } catch {}
})

afterAll(() => {
  try {
    fs.unlinkSync('storage.json')
  } catch {}
})

test('GET tests', async () => {
  // Storage vazio
  await expect((await request(app).get('/')).body).toEqual({})

  // Storage com dados
  await request(app)
    .post('/test1')
    .send({ data: 'test1', expires: 1 * 60 * 60 })
  await request(app)
    .post('/test2')
    .send({ data: 'test2', expires: 2 * 60 * 60 })
  await request(app).post('/test3').send({ data: 'test3' }) // expires = 48h
  await expect((await request(app).get('/test1')).body).toEqual('test1')
  await expect((await request(app).get('/test2')).body).toEqual('test2')
  await expect((await request(app).get('/test3')).body).toEqual('test3')
  await expect((await request(app).get('/test4')).body).toEqual('')
  let response = await request(app).get('/')
  expect(response.body).toEqual({
    test1: {
      value: 'test1',
      expires: expect.any(Number),
    },
    test2: {
      value: 'test2',
      expires: expect.any(Number),
    },
    test3: {
      value: 'test3',
      expires: expect.any(Number),
    },
  })

  jest.advanceTimersByTime(1 * 60 * 60 * 1000) // avança relógio
  response = await request(app).get('/')
  expect(response.body).toEqual({
    test2: {
      value: 'test2',
      expires: expect.any(Number),
    },
    test3: {
      value: 'test3',
      expires: expect.any(Number),
    },
  })

  jest.advanceTimersByTime(47 * 60 * 60 * 1000) // avança relógio
  response = await request(app).get('/')
  expect(response.body).toEqual({})
})

test('POST / should error 404', async () => {
  const response = await request(app).post('/')
  expect(response.status).toEqual(404)
})

test('POST /:key', async () => {
  await request(app).post('/test4').send({ data: 'test4' })
  const response = await request(app).get('/test4')
  expect(response.body).toEqual('test4')
})

test('DELETE /:key', async () => {
  await request(app).post('/test5').send({ data: 'test5' })
  await expect((await request(app).get('/test5')).body).toEqual('test5')
  await request(app).delete('/test5')
  await expect((await request(app).get('/test5')).body).toEqual('')
})

test('DELETE /', async () => {
  // Popula o storage
  await request(app).post('/test5').send({ data: 'test5' })
  await request(app).post('/test6').send({ data: 'test6' })
  await expect((await request(app).get('/test5')).body).toEqual('test5')
  await expect((await request(app).get('/test6')).body).toEqual('test6')

  // Deleta o storage completo
  await request(app).delete('/')
  await expect((await request(app).get('/')).body).toEqual({})
})

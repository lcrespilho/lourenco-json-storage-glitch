const JsonStorage = require('../JsonStorage')
const fs = require('fs')

/** @type {JsonStorage} */
let jsonStorage

jest.setTimeout(120000)
jest.useFakeTimers()

beforeEach(() => {
  try {
    fs.unlinkSync('storage.json')
  } catch {}
  jsonStorage = new JsonStorage('storage.json') // cria o storage.json
})

afterEach(() => {
  try {
    fs.unlinkSync('storage.json')
  } catch {}
})

test('Constructor should create storage.json', () => {
  try {
    fs.unlinkSync('storage.json')
  } catch {}
  expect(fs.existsSync('storage.json')).toEqual(false)
  jsonStorage = new JsonStorage('storage.json')
  expect(fs.existsSync('storage.json')).toEqual(true)
  expect(fs.readFileSync('storage.json', 'utf8')).toEqual('{}')
})

test('get("nonexistent") should return undefined', () => {
  expect(jsonStorage.get('nonexistent')).toEqual(undefined)
})

test('get() should return all storage', () => {
  expect(jsonStorage.get()).toEqual({})
  jsonStorage.set('test123', 'testA')
  jsonStorage.set('test456', 'testB')
  expect(jsonStorage.get()).toEqual({
    test123: { value: 'testA', expires: expect.any(Number) },
    test456: { value: 'testB', expires: expect.any(Number) },
  })
})

test('set("test123", "test") should create an entry on storage', () => {
  jsonStorage.set('test123', 'test')
  expect(jsonStorage.get('test123')).toEqual('test')
  expect(jsonStorage.storage).toEqual({ test123: { value: 'test', expires: expect.any(Number) } })
  expect(fs.readFileSync('storage.json', 'utf8')).toBe(JSON.stringify(jsonStorage.storage))
})

test('Should delete an expired entry on get()', () => {
  jsonStorage.set('test123', 'test48h') // expires = 48h
  expect(jsonStorage.get('test123')).toBe('test48h')
  jest.advanceTimersByTime(48 * 60 * 60 * 1000) // avança relógio em 48h
  expect(jsonStorage.get('test123')).toBe(undefined)
})

test('delete() should reset the storage', () => {
  jsonStorage.set('test123', 'testA')
  jsonStorage.set('test456', 'testB')
  expect(jsonStorage.get()).toEqual({
    test123: { value: 'testA', expires: expect.any(Number) },
    test456: { value: 'testB', expires: expect.any(Number) },
  })
  expect(fs.readFileSync('storage.json', 'utf8')).toMatch(/test123.*test456/)
  jsonStorage.delete('test123')
  expect(jsonStorage.get('test123')).toEqual(undefined)
  expect(jsonStorage.get('test456')).toEqual('testB')
  jsonStorage.delete()
  expect(jsonStorage.get()).toEqual({})
  expect(fs.readFileSync('storage.json', 'utf8')).toEqual('{}')
})

test('save() should delete expired entries before saving to disk', () => {
  jsonStorage.set('test1h', 'test', 1 * 60 * 60)
  jsonStorage.set('test48h', 'test') // expires = 48h
  jsonStorage.save()
  expect(fs.readFileSync('storage.json', 'utf8')).toMatch(/test1h.*test48h/)
  expect(jsonStorage.get('test1h')).toEqual('test')
  expect(jsonStorage.get('test48h')).toEqual('test')

  jest.advanceTimersByTime(1 * 60 * 60 * 1000) // avança relógio
  jsonStorage.save()

  expect(jsonStorage.get('test1h')).toEqual(undefined)
  expect(jsonStorage.get('test48h')).toEqual('test')
  expect(fs.readFileSync('storage.json', 'utf8')).not.toMatch(/test1h/)
  expect(fs.readFileSync('storage.json', 'utf8')).toMatch(/test48h/)
})

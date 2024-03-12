const fs = require('fs')

class JsonStorage {
  constructor() {
    if (!fs.existsSync('storage.json')) {
      fs.writeFileSync('storage.json', '{}', 'utf-8')
    }
    this.storage = JSON.parse(fs.readFileSync('storage.json', 'utf-8'))
  }
  get(key) {
    this.save()
    if (!key || key === '/') {
      return this.storage
    }
    return this.storage[key]?.value
  }
  set(key, value, expires = 48 * 60 * 60 /*default 48h*/) {
    this.storage[key] = {
      value,
      expires: Math.round(Date.now() / 1000 + expires),
    }
    this.save()
  }
  delete(key) {
    if (!key || key === '/') this.storage = {} // clean all entries
    else delete this.storage[key]
    this.save()
  }
  save() {
    // remove expired entries
    for (const key in this.storage) {
      if (this.storage[key].expires <= Math.round(Date.now() / 1000)) {
        delete this.storage[key]
      }
    }
    // save to disk
    fs.writeFileSync('storage.json', JSON.stringify(this.storage), 'utf-8')
  }
}

module.exports = JsonStorage

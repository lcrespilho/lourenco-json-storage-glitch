# Remote json storage

## Endpoint

`https://lourenco-json-storage.glitch.me`

## Rotas

### POST /:key

Request Body:

```
{
  data: <any json>,
  expires: <tempo de vida, em s> (opcional; default 48h)
}
```

Exemplo:

```javascript
await axios.post("https://lourenco-json-storage.glitch.me/person1", {
  data: {
    firstName: "Fred",
    lastName: "Flintstone",
  },
  expires: 10000,
});
```

### GET /:key

Response Body:

```
<any json>
```

Exemplo:

```javascript
console.log(
  (await axios.get("https://lourenco-json-storage.glitch.me/person1")).data
);
// { firstName: 'Fred', lastName: 'Flintstone' }
```

### GET /

Response Body: Storage completo.

### DELETE /:key

Deleta uma entrada específica.

### DELETE /

Deleta todo o Storage.

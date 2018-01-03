Key API
=======

#### `gen`

> Generate a new key

##### `Go` **WIP**

##### `JavaScript` - ipfs.key.gen(name, options, [callback])

Where:

- `name` is a local name for the key
- `options` is an object that contains following properties
  - 'type' - the key type, one of 'rsa'
  - 'size' - the key size in bits

`callback` must follow `function (err, key) {}` signature, where `err` is an Error if the operation was not successful. `key` is an object that describes the key; `name` and `id`.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.key.add(
  'my-key', 
  { type: 'rsa', size: 2048 }, 
  (err, key) => console.log(key))


{ 
  name: 'my-key',
  id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg'
}
```

#### `list`

> List all the keys

##### `Go` **WIP**

##### `JavaScript` - ipfs.key.list([callback])

`callback` must follow `function (err, keys) {}` signature, where `err` is an Error if the operation was not successful. `keys` is an array of:

```
{
  id: 'hash',   // string - the hash of the key
  name: 'self'  // string - the name of the key
}
```

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.key.list((err, keys) => console.log(keys))

// [
//   { id: 'QmTe4tuceM2sAmuZiFsJ9tmAopA8au71NabBDdpPYDjxAb',
//     name: 'self' },
//   { id: 'QmWETF5QvzGnP7jKq5sPDiRjSM2fzwzNsna4wSBEzRzK6W',
//     name: 'a-key' }
// ]
```

#### `rm`

> Remove a key

##### `Go` **WIP**

##### `JavaScript` - ipfs.key.rm(name, [callback])

Where:
- `name` is the local name for the key

`callback` must follow `function (err, key) {}` signature, where `err` is an Error if the operation was not successful. `key` is an object that describes the removed key.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.key.rm('my-key', (err, key) => console.log(key))

{ 
  Keys: [
    { Name: 'my-key',
      Id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg' } 
  ]
}
```

#### `rename`

> Rename a key

##### `Go` **WIP**

##### `JavaScript` - ipfs.key.rename(oldName, newName, [callback])

Where:
- `oldName` is the local name for the key
- `newName` a new name for key

`callback` must follow `function (err, key) {}` signature, where `err` is an Error if the operation was not successful. `key` is an object that describes the renamed key.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.key.rename(
  'my-key', 
  'my-new-key',
  (err, key) => console.log(key))
  
{ 
  Was: 'my-key',
  Now: 'my-new-key',
  Id: 'Qmd4xC46Um6s24MradViGLFtMitvrR4SVexKUgPgFjMNzg',
  Overwrite: false
}
```

#### `export`

> Export a key in a PEM encoded password protected PKCS #8

##### `Go` **NYI**

##### `JavaScript` - ipfs.key.export(name, password, [callback])

Where:
- `name` is the local name for the key
- `password` is the password to protect the key

`callback` must follow `function (err, pem) {}` signature, where `err` is an Error if the operation was not successful. `pem` is the string representation of the key

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.key.export('self', 'password', (err, pem) => console.log(pem))

-----BEGIN ENCRYPTED PRIVATE KEY-----
MIIFDTA/BgkqhkiG9w0BBQ0wMjAaBgkqhkiG9w0BBQwwDQQIpdO40RVyBwACAWQw
...
YA==
-----END ENCRYPTED PRIVATE KEY-----

```

#### `import`

> Import a PEM encoded password protected PKCS #8 key

##### `Go` **NYI**

##### `JavaScript` - ipfs.key.import(name, pem, password, [callback])

Where:
- `name` is a local name for the key
- `pem` is the PEM encoded key
- `password` is the password that protects the PEM key

`callback` must follow `function (err, key) {}` signature, where `err` is an Error if the operation was not successful. `key` is an object that describes the new key.

If no `callback` is passed, a promise is returned.

**Example:**

```JavaScript
ipfs.key.import('clone', 'password', (err, key) => console.log(key))

{ Name: 'clone',
  Id: 'QmQRiays958UM7norGRQUG3tmrLq8pJdmJarwYSk2eLthQ' 
}
```

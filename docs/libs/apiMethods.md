# apiMethods

You won't need to touch **apiMethods.js** but it's useful to understand
it becuase it's used a lot throughout the app.

Becuase we're using [Jseq](https://www.npmjs.com/package/jsequel) for
most of our endpoints we only need to define a handful of endpoint urls
which we can then be imported into an [Actions.js](../actions/ActionsAndQueries.md) file.

These urls are defined in **apiMethods.js**. There's a few things going
on in this file but the main thing it does is give us access to a few
functions that let us call our API. These are:

- getAdmin
- listAdmin
- createAdmin
- updateAdmin
- deleteAdmin

- getPublic
- listPublic
- createPublic
- updatePublic
- deletePublic

Both `public` and `admin` endpoints do the same thing as each other but
they have slighetly different access to the database.

Generally it's safest to just use the `public` endpoints if you're not
sure.

## Usage

You'll want to `import` **apiMethods.js** into your **Actions.js** file
in order to use these methods to query the database. Once it's imported
it'll need instantiating with an apiKey that allows it access to the API.

```js
// src/actions/booking-hub/Actions.js

import api from '../../libs/apiMethods'

export default class Actions {
  constructor(apiKey) {
    this.api = api(apiKey)
  }
  // ...
}
```

After that's done it's ready to use from `this.api`.

## Method Arguments

Each function has a different set of args it accepts, and a few useful
features available.

**Note**: these are the same for both `public` and `admin` so we'll just
use `public` in this example.

- `getPublic(query, errResult, config)`
- `listPublic(query, errResult, config)`
- `createPublic(query, data, primaryKey, errResult, keyResult, config)`
- `updatePublic(query, data, errResult, config)`
- `deletePublic(query, errResult, config)`

- `query` - A jseq formatted Object that defines the MYSQL query once it
  reaches the API.
- `data` - An Object. The data you wish to create or update with.
- `primaryKey` - A String. The key name of the primary key to be saved with the record.
  Give this argument an empty string and it'll be ommited. You can do
  this if you want to simply include the primary key in the `data`
  object.
- `errResult` - A Boolean. If `false` the function will return `null` if
  there's an error. If `true` it will return the error object that was
  thrown.
- `keyResult` - A Boolean. Returns the primary key of the created record.
- `config` - An Object. This is an `axios` config object, you can check
  out their docs to see how to use it. [Axios Config Docs](https://github.com/axios/axios#request-config)

## Endpoint Cancellation

Every **apiMethods.js** GET type endpoint automatically creates what's 
called a *cancel token* which creates a function we can use to cancel it
and adds that function to an Array called `_cancelTokens`. 

`_cancelTokens` holds cancel functions for the last 5 endpoints called.
You can use `cancelFetches` to call all of them.


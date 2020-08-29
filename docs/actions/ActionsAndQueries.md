# Actions and Queries

The folder `src/actions` should mirror `src/containers` to an extent. For
example, at the time of writing these docs, there's a
`src/containers/booking-hub` directory and a `src/actions/booking-hub` to
mirror it.

If we follow this example, `src/actions/booking-hub` contains (or should
contain!) all the api methods that are used in `src/containers/booking-hub`.

`src/containers/booking-hub` has three files inside it. **Actions.js**,
**Queries.js** and **Handlers.js**. We'll ignore **Handlers.js** for now
as it's not essential.

## Queries

Because all, or *most*, of our endpoints are managed by
[Jseq](https://npmjs.com/package/jseq) we can define all of our MYSQL
queries in the frontend using json objects.

These query objects are defined in **Queries.js**. If you have a look at
an already existing **Queries.js** file you'll see it's just a class of
functions that return Jseq query objects.

```js

export default class Queries {

  getFiveBookings() {
    return {
      name: 'bms_booking.bookings',
      columns: [
        {name: 'bookingName'},
        {name: 'bookingsKey'},
        {name: 'dueDate'},
      ],
      limit: [0, 5]
    }
  }

  // etc...

}
```

The **Actions.js** file will then have a matching function (with the same
name) that uses this query.

We could defined the query object inside **Actions.js** if we wanted.
**Queries.js** is just seperate place to define these queries so that we
can keep things tidy.

## Actions

To call the actual queries we have to use axios and format the query
object properly so that it'll work with our API.

In **Actions.js** we import our **apiMethods.js** file, which has all of
our `axios` api logic in it, we also import the queries from
**Queries.js** and we create functions that combine them both together.

```js

import api from '../../libs/apiMethods'
import Queries from './Queries'

export default class Actions {

  constructor(apiKey) {

    // The api methods always require the apiKey of the current user...
    this.api = api(apiKey)

    // The query class we defined above...
    this.queries = new Queries()

  }

  getFiveBookings() {

    return this.api.listPublic(this.queries.getFiveBookings())

  }

  // etc...
}
```

**Actions.js** is the file imported into our `src/containers/booking-hub` controller where
it eventually get's called in the app.

# API Methods

There are a few different functions available to you from
**apiMethods.js** which are basically just different CRUD methods
depending on whether you want to GET, UPDATE, CREATE or DELETE data.

These are:

- `listPublic` - is a GET endpoint which always returns an Array of
  Objects for when you want a list of records.
- `getPublic` - is a GET which always returns a single Object for when
  you want a single record.
- `updatePublic` - UPDATE/PUT endpoint to update a record.
- `deletePublic` - DELETE endpoint to delete a single or multiple
  records.
- `createPublic` - CREATE/POST endpoint to create a new record.

To read more about the **apiMethods.js** file and functions see
[apiMethods](../libs/apiMethods.md).

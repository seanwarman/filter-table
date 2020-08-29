# BookingView

The component found inside `src/components/Bookings/Views/Booking.js`.

This is one of the most complex components in BMS because it has a few
different conditions built in that allow users to edit parts of it
depending on not only their `accessLevel` (being Supplier, Provider etc)
but also the value of the `currentStatus` (Draft, Live, Complete etc) of
the booking.

I've tried to section each part of this component to make it easier to
understand, which you'll be able to see from the big text in-between each
part.

Most of these sections are pretty standard and you'll see them all across
BMS. The one's to pay attention to are **State Objects**, **Handlers**
and **Renders**.

### Handlers

The most bespoke functions used to decide on exactly how to *handle* data
before it's sent to the API. These functions are mainly used for checking
conditions on the `state` and mutating data before it's saved to the
booking.

For example if a booking is a part of a group of bookings we
might want to update all of them, a handler will check whether the booking
has a `groupKey` and if the `currentStatus` is in 'Draft' if both these
conditions are true it will update all the bookings with the same
`groupKey` otherwise it'll only update the current booking.

### State Objects

The most crucial part of this component, it decides on what State the
component is in depending on the `currentState` value of the booking.

This could do with a little explaining.

If you look at the main `render()` function of **BookingView.js** you'll
see a fairly weird looking render function.

```js
this[this[this.props.booking.currentStatus] ? this.props.booking.currentStatus : 'Other'].renderBooking()
```

All we really need to know is that it renders one of the State Objects
depending what `currentStatus` the booking is, if we don't have an
Object for the `currentStatus` of the booking (most bookings also have
custom status values) it renders the object named 'Other'.

This allows us to go the State Objects section of **BookingView.js** and
know exactly what status will be effected by our changes.

If I change the object called `Live` I know my changes will only effect
the booking view when the booking is in the 'Live' status.

If you go to the State Objects section you'll see there's a few objects
with `renderBooking` functions inside that all render the same things but
with minor differences.

### Renders

All functions that render something within this component scope. This
mainly just includes the coloured cards at the top of the page. 

The rest of the rendering is handled by child components inside the 
State Objects. This includes the Comments and Uploads sections, the
Booking Brief and the Proceed bar.

## Child Components

A few of the components found inside the **State Objects** you'll be able
to see in **BookingsTable.js**. This is hopefully how we'll move toward
porting much of the functionality of **BookingView.js** into the drawer
of the **BookingsTable.js** component.

There are a couple of challenges in doing this. One is that the
components in this view were built before I began to use
[Actions](../actions/ActionsAndQueries.md) and so much of it is built
around a now mainly defunct **Handlers.js** controller found in the
`src/actions/booking-hub` directory.

I've now imported **Handlers.js** into **BookingsTable.js** and so
the drawer implementation is kind of bastardised so that it'll fit. It
works well but it's quite confusing at first glance.

**Handlers.js** is mostly just like any other handlers but it's a set of
handlers that are useful for more than one component. It's also designed
to focus on a single booking so when you instantiate it you give it a
booking to mutate.

You'll find more information in
[BookingsTable](../components/BookingsTable.md).

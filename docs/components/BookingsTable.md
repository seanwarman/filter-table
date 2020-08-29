# BookingsTable

Many of the components and views in BMS are built to be as compact as
possible but the Bookings Table got complex very quickly in the earlier
days of it's production and so I've never gotten round to actually 
splitting it up properly.

Although this is unfashionable in certain dev circles it does mean the
code fairly easy to traverse and you won't need to jump from file-to-file
like you might do in the **BookingsView.js** component.

There's a few things to know about the Bookings Table which are key to
how it works. 

## jsonStateKeys

First off the react `setState` function has been modified
so that all `state` updates also send an update to the user's record.
This allows the view to remember some of the user's configurations, for
example if they have the 'Live' tab selected or which of the Custom
Filter options are selected.

Not all of the state changes will trigger this update, you can see which
`state` keys will effect the user's record in `jsonStateKeys`.

If you want to update the `state` without fear of updating the user's
record you can use `setStateWithoutUpdate`.

## jsonFilter

The `getFilterOptions` function fetches the options from the db, if given
an empty Array it will fetch all the possible options in the form of
the `jsonFilter` Array.

`jsonFilter` is used for a few things. We mutate it so that it's the
right format and its goes into the Custom Filter render to decide on
which options there are, what their count is and whether they're selected
or not.

It's also used again in `getFilterOptions` so that it narrows the count
and options again depending on what's selected.

Lastly it's used to fetch the correct bookings for the Filter tab.

## silentReload

This websockets allow us to update the Bookings Table without having to
reload the browser and `silentReload` is the function that is called when the
view receives a websocket message.

Whenever we need to reload the whole view without disrupting the user's 
experience we can call `silentReload` and it will load all of the
bookings in every tab and the `jsonFilter` Array effectively reloading
the Custom Filter.

## Handlers

The Comments and Uploads functionality has been ported directly from
**BookingView,js** and so `Handlers` has also been imported so that we
can have the same handlers in the Bookings Table.

The `Handlers` class is only instantiated when the Comments/Uploads
drawer is opened. This allows it to focus on a single booking at a time.
When a comment or paperclip icon is clicked on the table row it will open
the Comments/Docs drawer creating a new `Handler` along with it. 

The `Handler` class is created with the `bookingsKey` of the
selected booking and put onto `state.handlers`. This gives us access to
all of the functions inside **Handlers.js** for that booking only.

This is not to be confused with the Bulk Edit drawer.

It's worth remembering that whenever a handler function is used it's 
relating to a component also defined in **BookingView.js**.

# JsonFormFill 
## Component for jsonForm

The JsonFormFill component is used to display a jsonForm so that a user can fill it in and also save. It can also be adapted to contain extra fields not included in the jsonForm data. It'll allow the user to cancel changes and handles button behaviour (loading and disabled).

```js
<JsonFormFill
  jsonForm={this.state.bookingTemplate.jsonForm}
  customFields={[
    {
      value: this.state.bookingTemplate.bookingName,
      label: 'Booking Name',
      required: true,
      type: 'input',
      prettyType: 'Text'
    }
  ]}
  update={state => {
    return this.updateBooking(state)
  }}
  validation={false}
/>
```

### Attributes

- **jsonForm**: accepts a jsonForm type array only.
- **customFields**: accepts a jsonForm type array only. It's optional and any fields that you add will be placed at the top of the form above the jsonForm data. It will also be passed as state.customFields in the update parameter.
- **update**: a function that accepts the JsonFormFill's state as it's parameter and is called when the user clicks Save.
- **validation**: Boolean whether to ignore the required key in jsonForm and customFields.

## Update

JsonFormFill doesn't handle the actual form update logic. Instead it allows you to asynchronously handle the data from it's state and reloads itself when you're done.

The update function expects a promise that will allow it to be synchronised with your jsonForm data so that it knows when to reset it's buttons and allow the user to make further Saves or Cancels.

It will validate any items on jsonForm and customFields that have required set to true. If those fields haven't been filled in by the user the Save button will be disabled.

In the above example my updateBooking function looks like:

```js
updateBooking = async state => {
  const {apiKey} = this.props.user;
  const {bookingTemplatesKey} = this.props.match.params;
  const customFields = state.customFields;
  const bookingName = customFields.find(field => field.label === 'Booking Name').value;
  const bookingBody = {
    bookingName: sanitiseString(bookingName),
    jsonForm: jsonFormSanitiser(state.jsonForm)
  }
  let result;
  try {
    result = await API.put('biggly', `/seoadmin/key/${apiKey}/bookingtemplates/${bookingTemplatesKey}`, {
      body: bookingBody
    })
  } catch (err) {
    message.error('There was an error trying to save your updates please try again.');
    console.log('There was an error with the booking endpoint: ', bookingBody, err);
  }
  if (result) {
    message.success('Saved!');
  }
  await this.loadBooking();
}
```

Notice the loadBooking function is awaited at the end. This is so that updateBooking doesn't resolve too early and un-disable the Save and Cancel buttons.

Also notice we're sanitising the form fields separately, JsonFormFill just returns the raw data input by the user.

The state argument is the JsonFormFill's state object, it has all the needed items in the rendered form that we can then grab to update our record. It should look something like this:

```js
state = {
  jsonForm: [jsonForm],
  customFields: [jsonForm],
  saved: Bool,
  saving: Bool
}
```

**Note**: The saved and saving items might not be needed and will probably be removed in future.

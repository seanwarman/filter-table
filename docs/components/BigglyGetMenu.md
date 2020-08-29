# BigglyGetMenu

A menu component that allows the user to select any biggly category by it's associations.

For example the user wants to find a Customer by first finding that customer's Partner.

Partners / Customers

Or a Template by the Division it falls under.

Templates / Division

Each of these options requires an API call . The BigglyGetMenu allows the developer to load each set of records as the user clicks menu options rather than loading all possible options when the page loads.

### Example

It uses Ant Design's Cascader Component but further abstracts it so that all we have to do it import the component and give it two properties:

```js
<BigglyGetMenu
  apiKey={this.props.user.apiKey}
  menuOptions={[
    {
      typeDisplay: 'Partners',
      optionKey: 'partnerName',
      isLeaf: false,
      async get(userApiKey) {
        return await API.get('biggly', `/partners/key/${userApiKey}/partners`);
      }
    },
    {
      typeDisplay: 'Customers',
      optionKey: 'customerName',
      isLeaf: true,
      async get(userApiKey) {
        return await API.get('biggly', `/console/key/${userApiKey}/customers`);
      }
    }
  ]}
  menuSelectionFunction={this.inputChangeFunc}
/>
```

## Component Properties

#### apiKey

The API key needed for all biggly endpoints. This will become the first argument of the **get()** function, explained below.

#### menuOptions

An array of objects that configure each leaf of the menu.

Each object should have the following keys:

- **typeDisplay**: The heading for each menu leaf. In the above example the first object is set to 'Partners'.
- **optionKey**: The key name of the value we want to display to the user for each option in this leaf. In the above example this is set to the partnerName meaning it will render the partners name to the user. This can also accept an array of values which BigglyGetMenu will concatenate for you.
- **isLeaf**: a boolean to say, is this the last set of options in the menu?
- **get(userApiKey, ...)**: an async function that should return the api call you want to do for each selection.
  - The first argument will be the apiKey of the current user.
  - Any other arguments can be any extra keys needed for that API call. These are defined in the last prop **getKeys** and retrieved from the last selected record.
- **getKeys**: an array of key names for extra keys needed in your API call. Explained below.

#### menuSelectionFunction(option, selectedOptions)

The function called when the final menu option is chosen.In the above example the getKeys array in this 'Customers' object is grabbing the **apiKey** from  a record in 'Partners'.

Arguments:

1. **option**: The record for the chosen option.
2. **selectedOptions**: An array of records made up of all the previous menu selections (including the current one).

## getKeys

The above example uses the userApiKey for both API calls but if you need more keys for your API method for example if you were getting a list of sites by customerKey then you can add in any number of extra arguments to the get() function to use in that call.

```js
{
    typeDisplay: 'Sites',
    optionKey: 'siteName',
    isLeaf: true,
    getKeys: ['customerKey'],
    async get(userApiKey, customerKey) {
        return API.get('biggly', `/console/key/${userApiKey}/customers/${customerKey}/sites`);
    }
}
```

Just add getKeys and give it an array with an item for each extra argument with the type of field you want that argument to represent.

So in the above example the second argument of get() is customerKey which is the customerKey as defined in the getKeys array.

Usually the first object you pass into menuOptions won't include a getKeys array because all the items in the getKeys array must be fields from the last selected record but if you need to access an endpoint in the first item that requires more than one key you can.

Just pass the actual keys into the getKeys array and, same as before, those keys will be available in the same order in the get() arguments...

```js
menuOptions={[
 	  {
        optionKey: 'tmpName',
        typeDisplay: 'Templates',
        isLeaf: true,
        getKeys: [this.props.divKey],
        async get(apiKey, divKey) {
          return await API.get('biggly', `/booking/key/${apiKey}/divisions/${divKey}/templates`);
        }
    },
    // etc...
]}
```

## cascaderAttr

BigglyGetMenu is made using Ant Design's Cascader Menu and there may be times when you want to access the Cascader attributes. Just add cascaderAttr onto the BigglyGetMenu and pass in an object with keys and values that match the [Cascader](https://ant.design/components/cascader/) API.

### defaultValue

The ant implementation of defaultValue is pretty annoying because you have to use names from the dataIndex of the actual items in the menu which doesn't work if you don't already have all the menu items loaded. This attribute just let's you specify any string you want as the default value.

For example:

```js
<BigglyGetMenu
  defaultValue={String}
  cascaderAttr={{
    defaultValue: ['Addidas', 'Bob'],
    placeholder: "Choose an employee",
    allowClear: false
  }}
  // ...
/>
```

## Sorting

The menu sorts alphanumerically by default. If you want to switch that off add `sort={false}` as an attribute.

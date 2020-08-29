// this Stringifies any string and also
// replaces single quotes with double quotes.
// If you need to replace any other charactors
// just add them to the regex in this replace. 
export const sanitiseString = value => {
  if(typeof value === 'string') {
    value = value.replace(/'/g, '"');
    // This is to cheat the database, it's looking for this pattern to filter out test bookings...
    value = value.replace(/\[(test)\]/gi, '%5B$1%5D');
  }
  return JSON.stringify(value).slice(1,-1)
}


// This double sanitises the whole json overall
// so that it saves to the db. The extra
// escape sequences here get removed by mysql.
export const sanitiseJson = json => (
  JSON.stringify(
    [ ...json ].map( obj => {
      if(typeof obj.value === 'string' && 
         (
           obj.type === 'textarea' ||
           obj.type === 'input'
         )
      ) {
        obj.value = sanitiseString(obj.value);
      }
      return obj;
    })
  )
)

export const sanitiseMultiTypeChildValues = child => (
  {
    ...child,
    value: sanitiseString(child.value)
  }
)

export const sanitiseMultiChildren = jsonForm => (
  jsonForm.reduce((jsonArg, item) => {
    if(item.type === 'multi') {
      let children = [];
      item.children.forEach( child => children.push(child.map(sanitiseMultiTypeChildValues)));
      return jsonArg.concat({ ...item, children });
    } else {
      return jsonArg.concat({ ...item });
    }
  }, [])
)

export const jsonFormSanitiser = jsonForm => (
  sanitiseJson(sanitiseMultiChildren(jsonForm))
)

export default jsonFormSanitiser;
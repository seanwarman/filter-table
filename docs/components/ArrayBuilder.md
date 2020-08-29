# ArrayBuilder

Makes an object builder that can be added to, sorted and removed from.

```js
<ArrayBuilder
  itemMap={[object, ...]}
  items={[object, ...]}
  addButtonText="Add My Item"
  onSave={(items, setSaved, componentDidMount) => ({setSaved(true)})}
  render={(item, map, index, onChange, renderDefault, lastIndexBool) => (
    
    <div>
      <div style={{height: 27}}
      >Keyword:</div>
      {renderDefault()}
    </div>

  )}
></ArrayBuilder>
```

### props

|prop | Description | Type |
|-----|-------------|------|
| itemMap | Describes the overall structure | `object[]`
| items | Data to fill the builder row input items | `object[]`
| addButtonText | The text to go into the bottom add button | `string`
| onSave | The event triggered when the Save button is clicked | `Function(items, setSaved, componentDidMount)`


### itemMap object props

|prop | Description | Type |
|-----|-------------|------|
| dataIndex | Targets the property of the each Object in the items Array | `string`
| label | The input label | `string`
| type | \<input type="number"\> | `string`
| render | Renderer of the builder row. Return value should be a ReactNode | `Function(item, map, index, handleInput, renderDefault, lastIndex)`

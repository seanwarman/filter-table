# SelectObjects

A Selector to replace ant design's Selector component that 
allows us to firstly add a lot of options without it slowing to a halt
and returns an object by default rather than a string.

```js
<SelectObjects
  placeholder="What services do you provide?"
  style={{ height: 50, borderRadius: 0 }}
  onChange={selectedCats => this.setState({selectedCats})}

  tags={true}                                 // Whether to use tag
                                              // select mode

  dataSource={this.state.categories}          // Any array of objects to
                                              // select from

  data={this.state.selectedCats}              // An array or pre-selected
                                              // options

  dataIndex="catKey"                          // A unique key

  labelIndex="name"                           // The displayed option
                                              // text
>
</SelectObjects>
```

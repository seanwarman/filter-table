import React, { Component } from 'react'
import { InputNumber, Button, Form, Icon, Input, } from 'antd'

const { TextArea } = Input

const formStyles = {
  style: {
    // width: '600px',
    margin: '.5rem .5rem 0 0'
  }
}

export default class ArrayBuilder extends Component {

  state = {
    items: null,
    saved: true,
    itemTemplate: {}
  }

  componentDidMount = () => {
    let itemTemplate = this.newItemTemplate()
    let items
    if((this.props.items || []).length === 0) {
      items = [
        itemTemplate,
      ]
    } else {
      items = JSON.parse(JSON.stringify(this.props.items))
    }
    this.setState({
      saved: true,
      itemTemplate,
      items
    })
  }

  newItemTemplate() {
    let itemTemplate = {}
    this.props.itemMap.forEach(col => {
      itemTemplate[col.dataIndex] = 
        col.type === 'number' ?
        0
        :
        col.type === 'checkbox' ?
        false
        :
        null
    })

    return itemTemplate

  }

  setSaved = bool => {
    this.setState({saved: bool})
  }

  handleSave = async() => {
    await this.props.onSave(this.state.items, this.setSaved.bind(this), this.componentDidMount.bind(this))
  }

  handleAdd = () => {
    let { items } = this.state
    let itemTemplate = this.newItemTemplate()
    if(!items) {
      items = [itemTemplate]
    } else {
      items.push(itemTemplate)
    }
    this.setState({items, saved: false})
  }

  handleCancel = () => {
    this.componentDidMount()
  }

  moveField = (index, position) => {
    let {items} = this.state
    let item = items.splice(index, 1)
    items.splice(index+position, 0, item[0])
    this.setState({saved: false, items})
  }

  handleRemove = (index) => {
    let {items} = this.state
    items.splice(index, 1)
    this.setState({saved: false, items})
  }

  handleInput = (i, dataIndex, value) => {
    let {items} = this.state
    items[i][dataIndex] = value
    this.setState({items, saved: false})
  }

  handleSelection = (i, value) => {
    let {items} = this.state
    items[i].colorLabel = value
    this.setState({items, saved: false})
  }

  colorOrPlaceholder = colorLabel => {
    if((colorLabel || []).length > 0) {
      return (
        {value: colorLabel}
      )
    } else {
      return {}
    }
  }

  // ITEM TYPES
  renderDefault = (item, map, index, lastIndex = false) => () => {

    const typeChild = this.inputTypes({
      item, map, index, lastIndex
    })[map.type]

    if(!typeChild) throw Error(`
The following type is not supported in a default render: "${map.type}"
Try a custom render instead.
    `)

    return typeChild

  }

  inputTypes = ({
      item, map, index, lastIndex
  }) => {
    const props = map.props || {}
    return {
      input: <Input 
        onPressEnter={() => 
        lastIndex &&
            this.handleAdd()
        }
        placeholder={map.label}
        onChange={e => this.handleInput(index, map.dataIndex, e.target.value)}
        value={item[map.dataIndex] && item[map.dataIndex]}
        {...props}
      ></Input>,
      number: <InputNumber
        placeholder={map.label}
        onChange={e => this.handleInput(index, map.dataIndex, e.target.value)}
        value={item[map.dataIndex] && item[map.dataIndex]}
        onPressEnter={() => 
        lastIndex &&
            this.handleAdd()
        }
        {...props}
      >
      </InputNumber>,
      textarea: <TextArea
        placeholder={map.label}
        onChange={e => this.handleInput(index, map.dataIndex, e.target.value)}
        value={item[map.dataIndex] && item[map.dataIndex]}
        {...props}
      >
      </TextArea>
    }

  }

  renderInput = (item, index, lastIndex) => {
    const { itemMap } = this.props

    return (
      itemMap.map((map, i) => {

        const styles = map.style ? { style: {...formStyles.style, ...map.style} } : formStyles
        return (
          map.render ?
          <Form.Item {...styles}
            key={i}
          >
            {
              map.render(
                item, 
                map, 
                index, 
                this.handleInput.bind(this), 
                this.renderDefault(item, map, index, lastIndex).bind(this), 
                lastIndex
              ) 
            }
          </Form.Item>
          :
          <Form.Item {...styles}
            key={i}
          >
            { this.renderDefault(item, map, index, lastIndex)() }
          </Form.Item>
        )
      })
    )
  }

  render() {
    const statusItemWrapperStyles = {
      display: 'flex',
      alignItems: 'center'
    }
    const formStyles = {
      default: {
        style: {
          width: '600px',
          margin: '.5rem .5rem 0 0'
        }
      }
    }
    return (
      <div>

        {
          (this.state.items || []).map((item, index) => (
            <div 
              key={index}
              style={statusItemWrapperStyles}
            >

              {this.renderInput(item, index, (this.state.items || []).length -1 === index)}

              <div
                style={{
                  marginBottom: 12,
                  marginTop: 'auto'
                }}
              >
                <Icon
                  disabled={index === 0}
                  className="dynamic-button"
                  onClick={e => this.moveField(index, -1)}
                  type="up-circle"
                />
                <Icon
                  disabled={index === this.state.items.length-1}
                  className="dynamic-button"
                  onClick={e => this.moveField(index, 1)}
                  type="down-circle"
                />
                <Icon 
                  onClick={() => {
                    this.handleRemove(index)
                  }}
                  className="dynamic-button" type="minus-circle-o" 
                />
              </div>
            </div>
          ))
        }

      <div 
        // key={index}
      >
        <div
          style={statusItemWrapperStyles}
        >
          <div style={{ width: '167px' }} />
          <div {...formStyles}>
            <Button
              type="dashed"
              onClick={this.handleAdd}
              style={{
                margin: 0,
                marginTop: '.3rem',
                marginLeft: '.5rem',
                width: '100%',
              }}
            >
              <Icon type="plus" />{
                (this.props.addButtonText || '').length > 0 ?
                this.props.addButtonText
                :
                'Add'
              }
            </Button>
          </div>
        </div>

      </div>
      <div 
        style={{ display: 'flex', justifyContent: 'flex-end' }}
      >
        <Button
          disabled={this.state.saved}
          type="primary"
          onClick={this.handleSave}
        >Save</Button>
        <Button
          disabled={this.state.saved}
          type="primary"
          onClick={this.handleCancel}
        >Cancel</Button>
      </div>
    </div>
    )
  }
}

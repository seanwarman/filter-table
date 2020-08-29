import React, { Component } from 'react';
import { Button, Form, Icon, Input, Select, Tag, message} from 'antd';
import BigglyColors from '../mixins/BigglyColors';
const {Option} = Select;

let id = 0;

export default class Flags extends Component {

  state = {
    items: null,
    saved: true
  }

  componentDidMount = () => {
    let items;
    if((this.props.items || []).length === 0) {
      items = [
        {value: 'queried', colorLabel: 'green'},
        {value: 'archived', colorLabel: 'grey'},
        {value: 'paused', colorLabel: 'darkBlue'}
      ]
    } else {
      items = JSON.parse(JSON.stringify(this.props.items))
    }
    this.setState({
      saved: true,
      items
    });
  }

  handleSave = async() => {
    this.setState({saved: true});
    if((this.state.items || []).findIndex(item => (item.value || '').length === 0) !== -1) {
      message.error('Each flag must have a name to save');
      this.setState({saved: false});
      return;
    }
    await this.props.save(this.state.items);
    this.componentDidMount();
  }

  handleAdd = () => {
    let {items} = this.state;
    if(!items) {
      items = [{value: '', colorLabel: ''}];
    } else {
      items.push({value: '', colorLabel: ''});
    }
    this.setState({items, saved: false});
  }

  handleCancel = () => {
    this.setState({
      items: JSON.parse(JSON.stringify(this.props.items)),
      saved: true
    })
  }

  moveField = (index, position) => {
    let {items} = this.state;
    let item = items.splice(index, 1);
    console.log('item :', item);
    items.splice(index+position, 0, item[0]);
    this.setState({saved: false, items});
  }

  handleRemove = (index) => {
    let {items} = this.state;
    items.splice(index, 1);
    this.setState({saved: false, items});
  }

  handleInput = (i, value) => {
    let {items} = this.state;
    items[i].value = value;
    this.setState({items, saved: false});
  }

  handleSelection = (i, value) => {
    let {items} = this.state;
    items[i].colorLabel = value;
    this.setState({items, saved: false});
  }

  colorOrPlaceholder = colorLabel => {
    if((colorLabel || []).length > 0) {
      return (
        {value: colorLabel}
      )
    } else {
      return {};
    }
  }

  render() {
    const statusItemWrapperStyles = {
      display: 'flex',
      alignItems: 'center'
    }
    const formStyles = {
      style: {
        width: '600px',
        margin: '.5rem .5rem 0 0'
      }
    };
    return (
      <div>

        {
          (this.state.items || []).map((item, index) => (
            <div 
              key={index}
              style={statusItemWrapperStyles}
            >
              <Select
                disabled={
                  item.value === 'queried' ||
                  item.value === 'archived' ||
                  item.value === 'paused'
                }
                placeholder="Flag color"
                style={{ 
                  width: 167,
                  marginTop: '.5rem',
                  marginRight: '.5rem'
                }}
                value={
                  (item.colorLabel || '').length > 0 ?
                  item.colorLabel
                  :
                  undefined
                }
                onChange={colorLabel => this.handleSelection(index, colorLabel)}
              >
                {
                  BigglyColors.template.map(item => (
                    <Option key={id++} value={item.colorLabel}><Tag color={item.color}>{item.colorLabel}</Tag></Option>
                  ))
                }
              </Select>

              <Form.Item  {...formStyles} validateSuccess="success" hasFeedback>
                <Input
                  disabled={
                    item.value === 'queried' ||
                    item.value === 'archived' ||
                    item.value === 'paused'
                  }
                  placeholder="Flag name"
                  id="success"
                  onChange={e => this.handleInput(index, e.target.value)}
                  value={item.value}
                />
              </Form.Item>
              {
                item.value !== 'queried' &&
                item.value !== 'paused' &&
                item.value !== 'archived' &&
                <div>
                  <Icon
                    disabled={index === 2}
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
              }
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
            ><Icon type="plus" />Add Flag
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

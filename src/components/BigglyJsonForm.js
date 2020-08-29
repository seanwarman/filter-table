import React, { Component } from 'react';
import { Icon, Select, Col, Button, Form, Input, DatePicker, Row, InputNumber } from 'antd';
import TextArea from 'antd/lib/input/TextArea';
import moment from 'moment';
import '../containers/booking-hub/Booking.css';
const { Option } = Select;
export default class BigglyJsonForm extends Component {

  // █▀▀ █░░█ █▀▀ ▀▀█▀▀ █▀▀█ █▀▄▀█   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █░░ █░░█ ▀▀█ ░░█░░ █░░█ █░▀░█   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀▀▀ ░▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀▀ ▀░░░▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  validateForm = (jsonForm) => {
    // This function looks to see if a field is empty but also if a boolean is 'true' in case
    // you want to pass a boolean to say that the button is disabled.
    let result = jsonForm.findIndex( key => (
      (key.value === undefined || key.value === null || key.value === true || key.value.length === 0)
    ));
    if(result === -1) return false;
    return true;
  }

  momentValue = (value) => {
    if(!value) return null;
    return new moment(value);
  }

  sanitiseInput = value => {
    if(typeof value === 'string') {
      value = value.replace(/\\/g, '');
      value = value.replace(/\t/g, '  ');
      value = value.replace(/"/g, '\'');
    }
    return value;
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderField = (field, fieldIndex) => {
    let fieldType;
    let span = 24;
    const required = (
      field.required && !this.props.removeRequiredTags &&
      <span
        style={{
          position: 'absolute',
            top: '21px',
            right: '20px',
            color: '#40a9ff'
        }}
      >required</span>
    )
    switch (field.type) {
      case 'dropdown':
        let options = field.selections ? field.selections.split(',') : [];
        if(options.length) options = options.map(item => item.trim());
        fieldType = <Form.Item label={field.label}>
                      <Select 
                        defaultValue={field.value && field.value}
                        style={{
                          width: '180px'
                        }}
                        onSelect={value => this.props.changeField(field, 'value', value)}
                        label={field.label}
                        className={'bms-select'}
                      >
                        {
                          options &&
                          options.map( option => (
                            <Option value={option}>
                                {option}
                            </Option>
                          ))
                        }
                      </Select>
                    </Form.Item>;
        break;
      case 'textarea':
        fieldType = <Form.Item label={field.label}><TextArea 
                      onChange={e => this.props.changeField(field, 'value', e.target.value)}
                      value={field.value}
                      label={field.label}
                      className={'bms-textarea'}>
                    </TextArea></Form.Item>;
        break;
      case 'date':
        let date = null;
        fieldType = <Form.Item label={field.label}><DatePicker 
                      onChange={moment => {
                        if(moment) date = moment.toDate();
                        this.props.changeField(field, 'value', date);
                      }}
                      value={this.momentValue(field.value)}
                      label={field.label}
                      className={'bms-date'}>
                    </DatePicker></Form.Item>;
        break;
      case 'number':
        fieldType = <Form.Item label={field.label}><InputNumber
                      min={1}
                      onChange={number => this.props.changeField(field, 'value', number)}
                      value={field.value}
                      label={field.label} 
                      style={{
                        width: '60px'
                      }}>
                    </InputNumber></Form.Item>;
        break;
      case 'multi':
        // In future this multi type could be iterated over for any type
        // of linked input fields.
        fieldType = <div id="multi-wrapper">
                      {
                        field.children.map( (child, childIndex) => (
                         <div key={childIndex}>
                            <Form.Item label={child[0].label}>
                              <Input
                                onChange={e => {
                                  field.children[childIndex][0].value = this.sanitiseInput(e.target.value);
                                  this.props.changeMulti(field, fieldIndex);
                                }}
                                value={child[0].value}/>
                            </Form.Item>
                            <Form.Item label={child[1].label}>
                              <TextArea
                                onChange={e => {
                                  field.children[childIndex][1].value = this.sanitiseInput(e.target.value);
                                  this.props.changeMulti(field, fieldIndex);
                                }}
                                value={child[1].value} />
                            </Form.Item>
                            <div style={{ textAlign: 'center' }}>
                              { 
                                field.children.length === 1 ?
                                <Icon
                                  style={{
                                    fontSize: '1.5rem',
                                    background: 'white',
                                    borderRadius: '50%',
                                  }}
                                  type="plus-circle"
                                  onClick={() => { 
                                    let template = []; 
                                    field.template.forEach( (item, index) => {
                                      template[index] = { ...item };
                                    });
                                    field.children.push(template);
                                    this.props.changeMulti(field, fieldIndex);
                                  }}
                                /> 
                                :
                                childIndex === field.children.length - 1 ?
                                <div>
                                  <Icon
                                    style={{
                                      fontSize: '1.5rem',
                                      background: 'white',
                                      borderRadius: '50%',
                                      marginRight: '4px'
                                    }}
                                    type="plus-circle"
                                    onClick={() => { 
                                      let template = []; 
                                      field.template.forEach( (item, index) => {
                                        template[index] = { ...item };
                                      });
                                      field.children.push(template);
                                      this.props.changeMulti(field, fieldIndex);
                                    }}
                                  /> 
                                  <Icon
                                    style={{
                                      fontSize: '1.5rem',
                                      background: 'white',
                                      borderRadius: '50%',
                                      marginLeft: '4px'
                                    }}
                                    type="minus-circle"
                                    onClick={() => {
                                      field.children.splice(childIndex, 1);
                                      this.props.changeMulti(field, fieldIndex);
                                    }}
                                  /> 
                                </div>
                                :
                                <Icon
                                  style={{
                                    fontSize: '1.5rem',
                                    background: 'white',
                                    borderRadius: '50%',
                                  }}
                                  type="minus-circle"
                                  onClick={() => {
                                    field.children.splice(childIndex, 1);
                                    this.props.changeMulti(field, fieldIndex);
                                  }}
                                /> 
                              }
                            </div>
                          </div>
                        ))
                      }
                    </div>
        break;
      default:
        fieldType = <Form.Item label={field.label}><Input 
                      onChange={e => this.props.changeField(field, 'value', e.target.value)} 
                      value={field.value} 
                      label={field.label} 
                    /></Form.Item>
        break;
    }
    return (
      <Col key={fieldIndex} span={span}>
        {fieldType}
        {required}
      </Col>
    );
  };

  render() {
    const { jsonForm, submitForm, title, validateCondition, saveStatusButtons } = this.props;
    return (
      <div>
        <h1>{title && title}</h1>
        <Row gutter={16}>
            {jsonForm && jsonForm.map( (field, index) => (
              this.renderField(field, index)
            ))}
        </Row>
        <Row style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {
            (saveStatusButtons || []).length ?
            saveStatusButtons.map( (status, i) => (
              <Button
                key={i}
                onClick={e => submitForm(status)}
                disabled={(
                  validateCondition ?
                  this.validateForm(validateCondition)
                  :
                  this.validateForm(jsonForm)
                )}
                htmlType="button" 
                type="primary" 
              >Save to&nbsp;{status}</Button>
            ))
            :
            <Button
              onClick={e => submitForm()}
              disabled={(
                validateCondition ?
                this.validateForm(validateCondition)
                :
                this.validateForm(jsonForm)
              )}
              htmlType="button" 
              type="primary"
            >Save</Button>
          }
        </Row>
      </div>
    );
  }
}


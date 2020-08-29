import React, { Component } from 'react';
import '../../App.css';
import { Tooltip, Select, Layout, Form, Input, Icon, Button, Card, message, Row, Col, DatePicker } from 'antd';
import './JsonFormBuilder.css';
import TextArea from 'antd/lib/input/TextArea';
import jsonFormSanitiser from '../../libs/jsonFormSanitiser';

const { Content } = Layout;

let id = 0;

export default class JsonFormBuilder extends Component {

  // █▀▀ ▀▀█▀▀ █▀▀█ ▀▀█▀▀ █▀▀   █▀▀█ █▀▀ █▀▀ ░▀░ █▀▀▄ █▀▀▀ █▀▄▀█ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ ░░█░░ █▀▀   █▄▄█ ▀▀█ ▀▀█ ▀█▀ █░░█ █░▀█ █░▀░█ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀░░▀ ░░▀░░ ▀▀▀   ▀░░▀ ▀▀▀ ▀▀▀ ▀▀▀ ▀░░▀ ▀▀▀▀ ▀░░░▀ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

  state = {
    saved: true,
    loading: true,
    record: {},
    form: {},
  }

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  async componentDidMount() {
    this.loadDataAndSetState();
  }

  loadDataAndSetState = async() => {

    const record = await this.get()

    if(!record && this.props.errorMessage) {
      this.props.errorMessage('No record');
      return;
    } else if(!record) {
      console.log('There was an error in the JsonFormBuilder.');
    }

    const form = JSON.parse(JSON.stringify(record));

    this.setState({record, form, loading: false});
  }

  // █▀▀█ █▀▀█ ░▀░   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █▄▄█ █░░█ ▀█▀   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀░░▀ █▀▀▀ ▀▀▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  get = async() => {
    console.log('calling get...')
    try{
      return await this.props.getRecord();
    } catch (error) {
      console.log('There was an error getting the record. ', error);
    }
    return null;
  }

  update = async data => {
    try {
      return await this.props.updateRecord(data);
    } catch (error) {
      console.log('There was an error updating the record. ', error);
      return error;
    }
  }

  updateTemplate = async (labelsArr) => {
    this.setState({saved: true});
    let form = { ...this.state.form };

    // Each jsonForm item should have a value field.
    if(form[this.props.jsonFieldName]) {
      form[this.props.jsonFieldName].forEach(item => {
        if(!item.value) item.value = null;
      });
    }

    let data = {
      ...form,
      [this.props.jsonFieldName]: jsonFormSanitiser(form[this.props.jsonFieldName]),
    };

    const result = await this.update(data);

    if (result.affectedRows > 0) {
      message.success('Your form has been saved.');
      this.loadDataAndSetState();
    } else {
      message.error('Your form failed to save.');
      this.setState({saved: false})
      console.log('form PUT result: ', result);
    }

  }

  // █▀▀ █▀▀█ █▀▀█ █▀▄▀█
  // █▀▀ █░░█ █▄▄▀ █░▀░█
  // ▀░░ ▀▀▀▀ ▀░▀▀ ▀░░░▀

  cancelChanges = () => {
    let stateCopy = { ...this.state };
    stateCopy.form = JSON.parse(JSON.stringify(stateCopy.record));
    stateCopy.saved = true;
    this.setState(stateCopy);
  }

  changeField = (value, key) => {
    let stateCopy = { ...this.state };
    stateCopy.form[key] = value;
    stateCopy.saved = false;
    this.setState(stateCopy);
  }
  
  changeJson = (index, type, value) => {
    let stateCopy = { ...this.state };
    stateCopy.form[this.props.jsonFieldName][index][type] = value;
    stateCopy.saved = false;
    this.setState(stateCopy);
  }

  changeMulti = (index, item) => {
    let stateCopy = { ...this.state };
    stateCopy.form[this.props.jsonFieldName][index] = item;
    stateCopy.saved = false;
    this.setState(stateCopy);
  }

  remove = (index) => {
    let stateCopy = { ...this.state };
    stateCopy.form[this.props.jsonFieldName].splice(index, 1);
    stateCopy.saved = false;
    this.setState(stateCopy);
  }

  add = (type) => {
    let stateCopy = { ...this.state };
    let prettyName = '';
    let extraKeys = {};
    switch (type) {
      case 'multi':
        prettyName = 'Multi';
        const template = [
          { label: null, type: 'input', prettyType: 'Text', value: null },
          { label: null, type: 'textarea', prettyType: 'Text Area', value: null }
        ];
        extraKeys.template = template;
        extraKeys.children = [ template ]; 
        break;
      case 'dropdown':
        prettyName = 'Dropdown';
        extraKeys.selections = null;
        break;
      case 'textarea':
        prettyName = 'Long Text';
        break;
      case 'date':
        prettyName = 'Date';
        break;
      case 'number':
        prettyName = 'Number';
        break;
      // input
      default:
        prettyName = 'Text';
        break;
    }

    if(stateCopy.form[this.props.jsonFieldName] === null) stateCopy.form[this.props.jsonFieldName] = [];
    stateCopy.form[this.props.jsonFieldName].push({ type, label: '', prettyType: prettyName, ...extraKeys});
    stateCopy.saved = false;
    this.setState(stateCopy);
  };

  moveField = (index, position) => {
    if (index === 0 && position === -1) return;
    let stateCopy = { ...this.state };
    let jsonForm = JSON.parse(JSON.stringify(stateCopy.form[this.props.jsonFieldName]));
    let field = jsonForm[index];
    jsonForm.splice(index, 1);
    let newIndex = index + position;
    jsonForm.splice(newIndex, 0, field);
    stateCopy.form[this.props.jsonFieldName] = jsonForm;
    stateCopy.saved = false;
    this.setState(stateCopy);
  };

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderPreview = (field, index) => {
    let fieldType;
    let cssClasses;
    switch (field.type) {
      case 'multi':
        cssClasses = {className: 'bms-multi-preview'};
        fieldType = <div
                      key={id++}
                      style={{
                        background: '#f0f2f5',
                        padding: '8px',
                        borderRadius: '5px',
                        marginBottom: '8px',
                        position: 'relative'
                      }}
                    >
                      <Form.Item label={field.template[0].label}>
                        <Input value={field.template[0].value} size="small" {...cssClasses}></Input>
                      </Form.Item>
                      <Form.Item label={field.template[1].label}>
                        <TextArea {...cssClasses}></TextArea> 
                      </Form.Item>
                      <Icon type="plus-circle" style={{
                        position: 'absolute',
                        right: '8px',
                        bottom: '8px',
                        borderRadius: '50%',
                        background: 'white'
                      }}/>
                    </div>
        break;
      case 'dropdown':
        cssClasses = {className: 'bms-dropdown-preview'};
        fieldType = <Form.Item key={id++} label={field.label}>
                      <Select value={field.value} size="small" label={field.label} {...cssClasses}></Select>
                    </Form.Item>
        break;
      case 'textarea':
        cssClasses = {className: 'bms-textarea-preview'};
        fieldType = <Form.Item key={id++} label={field.label}>
                      <TextArea label={field.label} {...cssClasses}></TextArea>
                    </Form.Item>
        break;
      case 'date':
        cssClasses = {className: 'bms-date-preview'};
        fieldType = <Form.Item key={id++} label={field.label}>
                      <DatePicker size="small" label={field.label} {...cssClasses}></DatePicker>
                    </Form.Item>
        break;
      case 'number':
        cssClasses = {className: 'bms-number-preview'};
        fieldType = <Form.Item key={id++} label={field.label}>
                      <Input value={field.value} size="small" type="number" label={field.label} {...cssClasses}></Input>
                    </Form.Item>
        break;
      // input
      default:
        cssClasses = {className: 'bms-input-preview'};
        fieldType = <Form.Item key={id++} label={field.label}>
                      <Input value={field.value} size="small" label={field.label} {...cssClasses}></Input>
                    </Form.Item>
        break;
    }
    return fieldType;
  }

  render() {

    const {form} = this.state;
    const jsonForm = this.state.form[this.props.jsonFieldName];

    const formItemLayout = {
      labelCol: {
        xs: { span: 24 },
        sm: { span: 4 },
      },
      wrapperCol: {
        xs: { span: 24 },
        sm: { span: 20 },
      },
    };

    const checkboxStyles = {
      zIndex: '1',
      width: '22px',
      height: '22px',
      padding: 0,
      position: 'absolute',
      top: '5px',
      left: '-40px'
    }

    const inputWrapStyles = {
      display: 'inline',
      marginRight: '8px'
    }

    const transition = 'border .3s';

    const leftInputStyles = {
      transition: transition,
      borderRightWidth: '0',
      background: 'transparent',
      position: 'relative',
      left: '1px',
      zIndex: '1',
      width: '30%',
      borderRadius: '5px 0 0 5px'
    }

    const rightInputStyles = {
      transition: transition,
      width: '30%',
      borderRadius: '0px 5px 5px 0px'
    }

    return (
      <Content
        style={{
          margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card loading={this.state.loading} title="Editor">
              <Form onSubmit={this.handleSubmit}>
                {this.props.customFields && this.props.customFields.map((field, index) => (
                <Form.Item
                  {...formItemLayout}
                  label={field.label}
                  required={field.required}
                >
                  {
                    !field.type || field.type === 'input' ?
                    <Input
                      onChange={e => this.changeField(e.target.value, field.dataIndex)}
                      value={form[field.dataIndex]}
                      defaultValue={'Enter a label for this field.'}
                      style={{ width: '60%', marginRight: 8 }}
                    />
                    :
                    <div>
                      The only valid type is 'input' at the moment. 
                      If you need another one then you can add it here.
                    </div>
                  }
                </Form.Item>
                ))}
                {jsonForm && jsonForm.map((field, index) => (
                  <div key={index}>
                    <Form.Item
                      key={index}
                      {...formItemLayout}
                      label={field.prettyType && field.prettyType}
                      required={false}
                    >
                      {
                        field.type === 'multi' ?
                        <div style={inputWrapStyles}>
                          <Input
                            placeholder="Label"
                            value={field.template[0].label}
                            onChange={e => {
                              field.template[0].label = e.target.value;
                              this.changeMulti(index, field);
                            }}
                            style={leftInputStyles}
                          />
                          <Input
                            placeholder="Default Value"
                            onChange={e => {
                              field.template[0].value = e.target.value;
                              this.changeMulti(index, field);
                            }}
                            value={field.template[0].value}
                            style={rightInputStyles}
                          />
                        </div>
                        :
                        field.type === 'textarea' || field.type === 'date' ?
                        <div style={inputWrapStyles}>
                          <Input
                            placeholder="Label"
                            onChange={e => this.changeJson(index, 'label', e.target.value)}
                            value={field.label}
                            style={{ transition: 'border .3s', width: '60%' }}
                          />
                        </div>
                        :
                        field.type === 'number' ?
                        <div style={inputWrapStyles}>
                          <Input
                            placeholder="Label"
                            onChange={e => this.changeJson(index, 'label', e.target.value)}
                            value={field.label}
                            style={leftInputStyles}
                          />
                          <Input
                            type="number"
                            placeholder="Default Value"
                            onChange={e => this.changeJson(index, 'value', e.target.value)}
                            value={field.value}
                            style={rightInputStyles}
                          />
                        </div>
                        :
                        <div style={inputWrapStyles}>
                          <Input
                            placeholder="Label"
                            onChange={e => this.changeJson(index, 'label', e.target.value)}
                            value={field.label}
                            style={leftInputStyles}
                          />
                          <Input
                            placeholder="Default Value"
                            onChange={e => this.changeJson(index, 'value', e.target.value)}
                            value={field.value}
                            style={rightInputStyles}
                          />
                        </div>
                      }
                      <div style={{ position: 'absolute', display: 'inline-block' }}>
                        <Tooltip title="Required?">
                          {
                            field.required ?
                            <Button
                              style={checkboxStyles}
                              onClick={() => this.changeJson(index, 'required', false)}
                              size="small"
                              type="primary">
                              <Icon type="check" />
                            </Button>
                            :
                            <Button
                              style={checkboxStyles}
                              onClick={() => this.changeJson(index, 'required', true)}
                              size="small">
                            </Button>
                          }
                        </Tooltip>
                      </div>
                      <Icon disabled={(index === jsonForm.length - 1)} className="dynamic-button" onClick={e => this.moveField(index, 1)} type="down-circle" />
                      <Icon disabled={(index < 1)} className="dynamic-button" onClick={e => this.moveField(index, -1)} type="up-circle" />
                      <Icon
                        className="dynamic-button"
                        type="minus-circle-o"
                        onClick={() => this.remove(index)}
                      />
                      {
                        field.type === 'multi' &&
                        <div style={inputWrapStyles}>
                          <Input
                            placeholder="Label"
                            onChange={e => {
                              field.template[1].label = e.target.value;
                              this.changeMulti(index, field);
                            }}
                            value={field.template[1].label}
                            style={{ width: '60%', marginRight: 8 }}
                          />
                        </div>
                      }
                      {
                        field.type === 'dropdown' &&
                        <Input
                          placeholder="Add options seperated by commas"
                          onChange={e => this.changeJson(index, 'selections', e.target.value,)}
                          value={field.selections}
                          style={{ width: '60%', marginRight: 8 }}
                        />
                      }
                    </Form.Item>
                  </div>
                ))}
                <Form.Item style={{
                  width: '100%',
                  display: 'flex',
                  justifyContent: 'space-between'
                }}>
                  <Button type="dashed" onClick={() => this.add('input')} style={{ width: '100px' }}>
                    Text
                  </Button>
                  <Button type="dashed" onClick={() => this.add('textarea')} style={{ width: '100px' }}>
                    Long Text
                  </Button>
                  <Button type="dashed" onClick={() => this.add('date')} style={{ width: '100px' }}>
                    Date
                  </Button>
                  <Button type="dashed" onClick={() => this.add('dropdown')} style={{ width: '100px' }}>
                    Dropdown
                  </Button>
                  <Button type="dashed" onClick={() => this.add('multi')} style={{ width: '100px' }}>
                    Multi
                  </Button>
                  <Button type="dashed" onClick={() => this.add('number')} style={{ width: '100px' }}>
                    Number
                  </Button>
                </Form.Item>
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <Button disabled={this.state.saved} type="primary" onClick={this.updateTemplate}>Save</Button>
                  <Button disabled={this.state.saved} type="primary" onClick={this.cancelChanges}>Cancel</Button>
                </div>
              </Form>
            </Card>
          </Col>

          <Col span={12}>
            <Card loading={this.state.loading} title="Preview" id="form-preview">
              {
                this.props.customFields &&
                <Row style={{ display: 'flex', alignItems: 'center' }}>
                  {
                    this.props.customFields.map(field => (
                      <p>{this.state.form[field.dataIndex]}</p>
                    ))
                  }
                </Row>
              }
              {this.state.form[this.props.jsonFieldName] && this.state.form[this.props.jsonFieldName].map((field, index) => (
                this.renderPreview(field, index)
              ))}
            </Card>
          </Col>
        </Row>
      </Content>
    );
  }
}

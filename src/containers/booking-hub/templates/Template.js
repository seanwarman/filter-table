import React, { Component } from 'react';
import '../../../App.css';
import { Tooltip, Tag, Select, Layout, Form, Input, Icon, Button, Card, message, Row, Col, DatePicker } from 'antd';
import './Template.css';
import TextArea from 'antd/lib/input/TextArea';
import color from '../../../libs/bigglyStatusColorPicker';
import jsonFormSanitiser from '../../../libs/jsonFormSanitiser';
import BigglyColors from '../../../mixins/BigglyColors';

const { Content } = Layout;
const { Option } = Select;

let id = 0;

export default class Template extends Component {

  // █▀▀ ▀▀█▀▀ █▀▀█ ▀▀█▀▀ █▀▀   █▀▀█ █▀▀ █▀▀ ░▀░ █▀▀▄ █▀▀▀ █▀▄▀█ █▀▀ █▀▀▄ ▀▀█▀▀ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ ░░█░░ █▀▀   █▄▄█ ▀▀█ ▀▀█ ▀█▀ █░░█ █░▀█ █░▀░█ █▀▀ █░░█ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀░░▀ ░░▀░░ ▀▀▀   ▀░░▀ ▀▀▀ ▀▀▀ ▀▀▀ ▀░░▀ ▀▀▀▀ ▀░░░▀ ▀▀▀ ▀░░▀ ░░▀░░ ▀▀▀

  state = {
    template: {},
    form: {
      tmpName: null,
      colorLabel: null,
    },
    jsonForm: [],
    saved: true
  }

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  async componentDidMount() {
    // Note: changeHeader is defined in loadDataAndSetState because it needs the templateKey
    this.loadDataAndSetState();
  }

  loadDataAndSetState = async () => {
    let stateCopy = { ...this.state };
    stateCopy.saved = true;

    stateCopy.template = await this.props.api.getAdmin({
      name: 'bms_booking.divisionTemplates',
      columns: [
        {name: 'tmpName'},
        {name: 'tmpKey'},
        {name: 'jsonForm'},
        {name: 'colorLabel'},
        {name: 'bookingDivKey'},
      ],
      where: [
        `tmpKey = "${this.props.match.params.tmpKey}"`
      ]
    });

    if(stateCopy.template) {
      if (stateCopy.template.jsonForm) stateCopy.jsonForm = JSON.parse(JSON.stringify(stateCopy.template.jsonForm));
      stateCopy.form.colorLabel = JSON.parse(JSON.stringify(stateCopy.template.colorLabel));
      stateCopy.form.tmpName = JSON.parse(JSON.stringify(stateCopy.template.tmpName));

      this.props.changeHeader('hdd', 'BookingHub', [
        { name: 'Divisions', url: '/bookinghub/divisions' },
        { name: 'Templates', url: '/bookinghub/divisions/' + stateCopy.template.bookingDivKey },
        { name: 'Template Editor', url: '/bookinghub/divisions/template/' + stateCopy.template.tmpKey }
      ]);
    } else {
      alert('There doesn\'t appear to be a template here');
    }

    this.setState(stateCopy);
  }

  // █▀▀█ █▀▀█ ░▀░   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █▄▄█ █░░█ ▀█▀   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀░░▀ █▀▀▀ ▀▀▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  updateTemplate = async (labelsArr) => {
    let stateCopy = { ...this.state };

    // Each jsonForm item should have a value field.
    stateCopy.jsonForm.forEach(item => {
      if(!item.value) item.value = null;
    });

    let template = {
      jsonForm: jsonFormSanitiser(stateCopy.jsonForm),
      colorLabel: stateCopy.form.colorLabel,
      tmpName: stateCopy.form.tmpName
    };

    let result = await this.props.api.updateAdmin({
      name: 'bms_booking.divisionTemplates',
      where: [
        `tmpKey = "${this.props.match.params.tmpKey}"`
      ]
    }, template);

    if (result.affectedRows > 0) {
      message.success('Your Template has been saved.');
    } else {
      message.error('Your template failed to save.');
      console.log('Template PUT result: ', result);
    }

    this.loadDataAndSetState();
  }

  // █▀▀ █▀▀█ █▀▀█ █▀▄▀█
  // █▀▀ █░░█ █▄▄▀ █░▀░█
  // ▀░░ ▀▀▀▀ ▀░▀▀ ▀░░░▀

  clearChanges = () => {
    let stateCopy = { ...this.state };
    stateCopy.jsonForm = JSON.parse(JSON.stringify(stateCopy.template.jsonForm));
    stateCopy.form.colorLabel = JSON.parse(JSON.stringify(stateCopy.template.colorLabel));
    stateCopy.form.tmpName = JSON.parse(JSON.stringify(stateCopy.template.tmpName));
    stateCopy.saved = true;
    this.setState(stateCopy);
  }
  
  inputValue = (field) => {
    return field;
  }

  changeField = (e, stateObj, item) => {
    let stateCopy = { ...this.state };
    stateObj[item] = e;
    stateCopy.saved = false;
    this.setState(stateCopy);
  }

  changeMulti = (index, item) => {
    let stateCopy = { ...this.state };
    stateCopy.jsonForm[index] = item;
    stateCopy.jsonForm[index].children = [ JSON.parse(JSON.stringify(item.template)) ];
    stateCopy.saved = false;
    this.setState(stateCopy);
  }

  remove = (index) => {
    let stateCopy = { ...this.state };
    stateCopy.jsonForm.splice(index, 1);
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

    if(stateCopy.jsonForm === null) stateCopy.jsonForm = [];
    stateCopy.jsonForm.push({ type, label: '', prettyType: prettyName, ...extraKeys});
    stateCopy.saved = false;
    this.setState(stateCopy);
  };

  moveField = (index, position) => {
    if (index === 0 && position === -1) return;
    let stateCopy = { ...this.state };

    let field = stateCopy.jsonForm[index];
    stateCopy.jsonForm.splice(index, 1);
    let newIndex = index + position;
    stateCopy.jsonForm.splice(newIndex, 0, field);
    stateCopy.saved = false;
    this.setState(stateCopy);
  };

  handleTags = () => {
    console.log('handling...');
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderPreview = (field, index) => {
    let fieldType;
    let cssClasses;
    switch (field.type) {
      case 'multi':
        cssClasses = { className: 'bms-multi-preview' };
        fieldType = <div
                      key={index}
                      style={{
                        background: '#f0f2f5',
                        padding: '8px',
                        borderRadius: '5px',
                        marginBottom: '8px',
                        position: 'relative'
                      }}>
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
        cssClasses = { className: 'bms-dropdown-preview' };
        fieldType = <Form.Item key={id++} label={field.label}>
                      <Select value={field.value} size="small" label={field.label} {...cssClasses}></Select>
                    </Form.Item>
        break;
      case 'textarea':
        fieldType = <Form.Item key={id++} label={field.label}>
                      <TextArea label={field.label} {...cssClasses}></TextArea>
                    </Form.Item>
        cssClasses = { className: 'bms-textarea-preview' };
        break;
      case 'date':
        cssClasses = { className: 'bms-date-preview' };
        fieldType = <Form.Item key={id++} label={field.label}>
                      <DatePicker size="small" label={field.label} {...cssClasses}></DatePicker>
                    </Form.Item>
        break;
      case 'number':
        cssClasses = { className: 'bms-number-preview' };
        fieldType = <Form.Item key={id++} label={field.label}>
                      <Input value={field.value} size="small" type="number" label={field.label} {...cssClasses}></Input>
                    </Form.Item>
        break;
      // input
      default:
        cssClasses = { className: 'bms-input-preview' };
        fieldType = <Form.Item key={id++} label={field.label}>
                      <Input value={field.value} size="small" label={field.label} {...cssClasses}></Input>
                    </Form.Item>
        break;
    }
    return fieldType;
  }

  render() {

    const { jsonForm, form } = this.state

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
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
        <Row gutter={16}>
          <Col span={12}>
            <Card title="Edit Template">
              <Form onSubmit={this.handleSubmit}>
                <Form.Item
                  {...formItemLayout}
                  label="Title"
                  required={true}
                >
                  <Input
                    onChange={e => this.changeField(e.target.value, form, 'tmpName')}
                    value={this.inputValue(form.tmpName)}
                    defaultValue={'Enter a label for this field.'}
                    style={{ width: '60%', marginRight: 8 }}
                  />
                </Form.Item>
                <Form.Item
                  {...formItemLayout}
                  label="Color"
                  required={true}
                >
                  <Select style={{ width: '60%' }} value={form.colorLabel} onChange={colorLabel => this.changeField(colorLabel, form, 'colorLabel')}>
                    {
                      BigglyColors.template.map(item => (
                        <Option key={id++} value={item.colorLabel}><Tag color={item.color}>{item.colorLabel}</Tag></Option>
                      ))
                    }
                  </Select>
                </Form.Item>
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
                            onChange={e => this.changeField(e.target.value, field, 'label')}
                            value={this.inputValue(field.label)}
                            style={{ transition: 'border .3s', width: '60%' }}
                          />
                        </div>
                        :
                        field.type === 'number' ?
                        <div style={inputWrapStyles}>
                          <Input
                            placeholder="Label"
                            onChange={e => this.changeField(e.target.value, field, 'label')}
                            value={this.inputValue(field.label)}
                            style={leftInputStyles}
                          />
                          <Input
                            type="number"
                            placeholder="Default Value"
                            onChange={e => this.changeField(e.target.value, field, 'value')}
                            value={this.inputValue(field.value)}
                            style={rightInputStyles}
                          />
                        </div>
                        :
                        <div style={inputWrapStyles}>
                          <Input
                            placeholder="Label"
                            onChange={e => this.changeField(e.target.value, field, 'label')}
                            value={this.inputValue(field.label)}
                            style={leftInputStyles}
                          />
                          <Input
                            placeholder="Default Value"
                            onChange={e => this.changeField(e.target.value, field, 'value')}
                            value={this.inputValue(field.value)}
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
                              onClick={() => this.changeField(false, field, 'required')}
                              size="small"
                              type="primary">
                              <Icon type="check" />
                            </Button>
                            :
                            <Button
                              style={checkboxStyles}
                              onClick={() => this.changeField(true, field, 'required')}
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
                        
                       {/*<Checkbox
                          onChange={e =>  console.log('checked? ', e.target.checked)} 
                        style={{ position: 'absolute', right: 0 }}
                      /> */}
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
                          onChange={e => this.changeField(e.target.value, field, 'selections')}
                          value={this.inputValue(field.selections)}
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
                  <Button disabled={this.state.saved} type="primary" onClick={this.clearChanges}>Cancel</Button>
                </div>
              </Form>
            </Card>
          </Col>

          <Col span={12}>
            <Card title="Preview" id="form-preview">
              <Row style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{ 
                  width: '17px',
                  height: '17px',
                  borderRadius: '50%',
                  marginRight: '10px',
                  marginBottom: '1rem',
                  backgroundColor: form.colorLabel ? color('template', 'colorLabel', form.colorLabel).color : null,
                }}></div>
                <h3>{form.tmpName}</h3>
              </Row>
              {jsonForm && jsonForm.map((field, index) => (
                this.renderPreview(field, index)
              ))}
            </Card>
          </Col>
        </Row>
      </Content>
    );
  }
}

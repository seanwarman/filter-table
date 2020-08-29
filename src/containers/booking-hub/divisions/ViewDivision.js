import React, { Component } from 'react';
import '../../../App.css';
import { Table, Tag, Select, message, Radio, Layout, Row, Col, Card, Form, Input, Button, Tabs, Drawer, Popconfirm} from 'antd';
import Icon from 'antd/lib/icon';
import { Skeleton } from 'antd';
import BigglyColors from '../../../mixins/BigglyColors';
import color from '../../../libs/bigglyStatusColorPicker';
import jsonFormSanitiser from '../../../libs/jsonFormSanitiser';
import Flags from '../../../components/Flags';

const { Option } = Select;
const { Content } = Layout;
const TabPane = Tabs.TabPane;

const success = (message_details) => {
  message.success(message_details);
};

let id = 0;

export default class ViewDivision extends Component {

  state = {
    show: false,
    isLoading: true,
    isLoadingNotes: null,
    isDeleting: null,

    division: null,
    bookingDivKey: null,
    bookingDivName: '',
    jsonStatus: null,
    saved: true,
    jsonFlags: null,

    templateList: [],

    editDiv: false,

    tmpKey: '',
    tmpName: '',
    colorLabel: null,
    deleteOptionVisible: false,
    infoModelVis: false
  };

  componentDidMount() {

    this.props.changeHeader('hdd', 'BookingHub', [
      { name: 'Divisions', url: '/bookinghub/divisions' },
      { name: 'Templates', url: '/bookinghub/divisions/' + this.props.match.params.bookingDivKey }
    ]);

    this.loadDataAndSetState();
  }

  loadDataAndSetState = async (stateCopy) => {

    if (!stateCopy) stateCopy = { ...this.state };

    try {
      stateCopy.division = await this.getDivision();
    } catch (err) {
      alert(err);
    }

    stateCopy.bookingDivKey = JSON.parse(JSON.stringify(stateCopy.division.bookingDivKey));
    stateCopy.bookingDivName = JSON.parse(JSON.stringify(stateCopy.division.bookingDivName));
    stateCopy.jsonStatus = JSON.parse(JSON.stringify(stateCopy.division.jsonStatus));
    stateCopy.jsonFlags = JSON.parse(JSON.stringify(stateCopy.division.jsonFlags));
    if(!stateCopy.jsonFlags) stateCopy.jsonFlags = [];

    try {
      stateCopy.templateList = await this.getTemplates();
    } catch (err) {
      alert(err);
    }

    stateCopy.editDiv = false;
    stateCopy.editTmp = false;
    // stateCopy.newTmp = false;
    stateCopy.isLoading = false;

    this.setState(stateCopy);
  }

  getDivision() {
    return this.props.api.getAdmin({
      name: 'bms_booking.bookingDivisions',
      columns: [
        {name: 'bookingDivName'},
        {name: 'jsonStatus'},
        {name: 'bookingDivKey'},
        {name: 'jsonFlags'},
        {name: 'icon'},
        {name: 'accessLevels'}
      ],
      where: [
        `bookingDivKey = "${this.props.match.params.bookingDivKey}"`
      ]
    });
  }

  async getTemplates() {
    let result;
    result = await this.props.api.listAdmin({
      name: 'bms_booking.divisionTemplates',
      columns: [
        {name: 'tmpDivKey'},
        {name: 'tmpName'},
        {name: 'tmpKey'},
        {name: 'colorLabel'},
        {name: 'jsonForm'},
        {name: 'bookingDivKey'},
        {
          name: 'bms_booking.bookingDivisions',
          columns: [{name: 'jsonStatus'}],
          where: ['bookingDivisions.bookingDivKey = divisionTemplates.bookingDivKey']
        }
      ],
      where: [
        `bookingDivKey = "${this.props.match.params.bookingDivKey}"`
      ]
    });
    return result;
  }

  viewTemplate = (record) => {
    this.props.history.push('/bookinghub/divisions/template/' + record.tmpKey);
  }

  inputChange = e => {
    
    this.setState({
      [e.target.id.toString()]: e.target.value
    });

  }

  handleColor = colorLabel => {
    this.setState({ colorLabel });
  }
  
  validateForm() {
    return this.state.bookingDivName.length > 0;
  }

  toggleEditDiv = () => {
    this.setState({ editDiv: !this.state.editDiv });
  };

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ isLoading: true, editDiv: false });

    try {
      await this.saveDivision({
        bookingDivName: this.state.bookingDivName,
      });
    } catch (e) {
      alert(e);
    }

    this.loadDataAndSetState();
    success('Division updated');
  };

  saveDivision(division) {
    return this.props.api.updateAdmin({
      name: 'bms_booking.bookingDivisions',
      where: [
        `bookingDivKey = "${this.props.match.params.bookingDivKey}"`
      ]
    }, division);
  }

  validateFormTemplate() {
    return this.state.tmpName.length > 0 && this.state.colorLabel;
  }

  newTemplate = () => {
    this.setState({ newTmp: true, tmpName: '', colorLabel: null });
  };

  toggleEditTemplate = () => {
    this.setState({ editTmp: !this.state.editTmp });
  };

  handleKeyUp = (e, enter) => {
    if (e.keyCode === 13 || e.which === 13) {
      this.handleSubmitTemplate(e);
    } else if (e.keyCode === 27 || e.which === 27) {
      this.setState({ editTmp: false, editDiv: false, newTmp: false });
    }
  };

  handleSubmitTemplate = async event => {
    event.preventDefault();

    let result;

    try {
      result = await this.saveTemplate({
        tmpName: this.state.tmpName,
        colorLabel: this.state.colorLabel,
        bookingDivKey: this.props.match.params.bookingDivKey
      });

    } catch (e) {
      alert(e);
    }

    message.loading('Redirecting you to the Template Editor...', 2);
    setTimeout(() => this.props.history.push(`/bookinghub/divisions/template/${result.key}`), 2000);
  };

  handleEditTemplate = async event => {
    if (event) event.preventDefault();

    try {

      await this.editTemplate({
        tmpName: this.state.tmpName
      });

    } catch (e) {
      alert(e);
    }
    this.loadDataAndSetState();
    success("Template details updated");
  };

  saveTemplate(template) {
    return this.props.api.createAdmin({
      name: 'bms_booking.divisionTemplates',
    }, template, 'tmpKey', false, true)
  }

  editTemplate(template) {
    return this.props.api.updateAdmin({
      name: 'bms_booking.divisionTemplates',
      where: [
        `tmpKey = "${this.state.tmpKey}"`
      ]
    }, template);
  }

  // █▀▀ ▀▀█▀▀ █▀▀█ ▀▀█▀▀ █░░█ █▀▀ █▀▀ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ ░░█░░ █░░█ ▀▀█ █▀▀ ▀▀█
  // ▀▀▀ ░░▀░░ ▀░░▀ ░░▀░░ ░▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀

  checkDuplicateStatuses = jsonStatus => {
    let items = [];
    let condition = false;
    for(let i in jsonStatus) {
      if(items.indexOf(jsonStatus[i].value) !== -1) {
        condition = true;
        break;
      }
      items.push(jsonStatus[i].value);
    }
    return condition;
  }

  clearChanges = () => {
    let stateCopy = { ...this.state };
    stateCopy.jsonStatus = JSON.parse(JSON.stringify(stateCopy.division.jsonStatus));
    stateCopy.saved = true;
    this.setState(stateCopy);
  };

  saveJsonStatus = async () => {
    let stateCopy = { ...this.state };

    if(this.checkDuplicateStatuses(stateCopy.jsonStatus)) {
      message.error('All custom statuses must be unique.');
      return;
    }

    let result = await this.props.api.updateAdmin({
      name: 'bms_booking.bookingDivisions',
      where: [
        `bookingDivKey = "${this.props.match.params.bookingDivKey}"`
      ]
    }, {jsonStatus: jsonFormSanitiser(this.state.jsonStatus)});

    if ((result || {}).affectedRows > 0) {
      message.success('Saved!');
      stateCopy.saved = true;
    } else {
      message.error('There was an error saving your statuses! Try reloading the page.');
      stateCopy.saved = false;
    }

    this.setState(stateCopy);
  };

  addStatus = (index) => {
    let stateCopy = { ...this.state };
    stateCopy.jsonStatus.splice(index, 0, {
      value: '',
      role: 'Assignee'
    });

    stateCopy.saved = false;
    this.setState(stateCopy);
  };

  remove = (index) => {
    let stateCopy = { ...this.state };
    stateCopy.jsonStatus.splice(index, 1);

    stateCopy.saved = false;
    this.setState(stateCopy);
  };

  cancel = () => {
    return;
  }

  moveField = (index, position, condition) => {
    if (condition) return;
    let stateCopy = { ...this.state };

    let field = stateCopy.jsonStatus[index];
    stateCopy.jsonStatus.splice(index, 1);
    let newIndex = index + position;
    stateCopy.jsonStatus.splice(newIndex, 0, field);

    stateCopy.saved = false;
    this.setState(stateCopy);
  };

  // █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
  // █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
  // ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

  deleteOptionVisibleChange = () => {
    this.setState({ deleteOptionVisible: false });
  }

  handleRole = (e, index) => {
    let stateCopy = { ...this.state };
    stateCopy.jsonStatus[index].role = e.target.value;
    stateCopy.saved = false;
    this.setState(stateCopy);
  }
  
  handleStatusInput = async (index, value) => {
    // if(value.indexOf('\\') !== -1) return;
    let stateCopy = { ...this.state };
    stateCopy.jsonStatus[index].value = value;
    stateCopy.saved = false;
    this.setState(stateCopy);
  };

  handleAccessLevels = async accessLevels => {
    let result = await this.props.api.updateAdmin({
      name: 'bms_booking.bookingDivisions',
      where: [
        `bookingDivKey = "${this.state.bookingDivKey}"`
      ]
    }, {
      accessLevels: JSON.stringify(accessLevels)
    });
    await this.loadDataAndSetState();
    if(result.affectedRows === 0) {
      message.error('Failed to save please notify a member of the dev team.'); 
    }
  }

  handleSaveFlags = async jsonFlags => {
    jsonFlags = jsonFlags.filter(flag => flag.value.length > 0);
    let result = await this.props.api.updateAdmin({
      name: 'bms_booking.bookingDivisions',
      where: [
        `bookingDivKey = "${this.state.bookingDivKey}"`
      ]
    }, {
      jsonFlags: JSON.stringify(jsonFlags)
    });
    await this.loadDataAndSetState();
    if(result.affectedRows > 0) {
      message.success('Saved!'); 
    } else {
      message.error('Failed'); 
    }
    // return;
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderDivision() {
    return (

      <div>
        <Row gutter={16}>
          <Col xs={12}>
            <Skeleton loading={this.state.isLoading} active={true} title={{ width: 150 }} paragraph={{ rows: 1 }}>
              <h5>{this.state.bookingDivName}</h5>
              {this.state.bookingDivKey}
            </Skeleton>
          </Col>
          <Col xs={12}>
            <Skeleton loading={this.state.isLoading} active={true} title={{ width: 150 }} paragraph={{ rows: 1 }}>
              <p>Access Levels:</p>
              <Select
                style={{
                  minWidth: 180,
                  maxWidth: '100%'
                }}
                mode="tags"
                placeholder="Choose Access Levels"
                defaultValue={(this.state.division || {}).accessLevels || []}
                onChange={this.handleAccessLevels}
              >
                {[
                  <Select.Option key="Admin">Admin</Select.Option>, 
                  <Select.Option key="Supplier">Supplier</Select.Option>, 
                  <Select.Option key="Supplier Admin">Supplier Admin</Select.Option>, 
                  <Select.Option key="Provider">Provider</Select.Option>,
                  <Select.Option key="Provider Admin">Provider Admin</Select.Option>
                ]}
              </Select>
            </Skeleton>
          </Col>
        </Row>

        <Icon onClick={this.toggleEditDiv} type={"edit"} style={{ color: 'grey', fontSize: '1.6em', position: 'absolute', top: '10px', right: '15px' }} />

        {this.renderEditDiv()}
      </div>

    );
  }
  renderEditDiv() {
    return (
      <Drawer
        title="Edit Division"
        width={620}
        onClose={this.toggleEditDiv}
        visible={this.state.editDiv}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>

          <Form.Item label={'Name'}>
            <Input required id="bookingDivName" type={'text'} onChange={this.inputChange}
              value={this.state.bookingDivName} />
          </Form.Item>

        </Form>

        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            padding: '10px 16px',
            background: '#fff',
            textAlign: 'right',
          }}
        >

          <Row>
            <Col span={8} style={{ textAlign: 'left' }}>
            </Col>
            <Col span={16}>
              <Button disabled={!this.validateForm()} onClick={this.handleSubmit} type={'primary'}>Update</Button>
            </Col>
          </Row>


        </div>
      </Drawer>

    );
  }

  renderTabs() {

    const { jsonStatus } = this.state;

    const statusItemWrapperStyles = {
      display: 'flex',
      alignItems: 'center'
    }

    const templateColumns = [{
      title: 'Name',
      dataIndex: 'tmpName',
      key: 'tmpName',
      sorter: (a, b) => a.tmpName.length - b.tmpName.length,
      sortDirections: ['descend', 'ascend'],
      render: (text, record) => {
        let bookingColor = record.colorLabel ? color('template', 'colorLabel', record.colorLabel).color : null;
        return (
          <div style={statusItemWrapperStyles}>
            <div style={{ 
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              marginRight: '5px',
              backgroundColor: bookingColor 
            }}></div>
            <div style={{ height: '20px', lineHeight: '24px' }}>
              {text}
            </div>
          </div>
        )
      }
    }];

    const formStyles = {
      style: {
        width: '600px',
        margin: '.5rem 0 0 0'
      }
    };

    const radioStyles = {
      margin: '.5rem .5rem 0 .5rem'
    };

    return (
      <Tabs defaultActiveKey="0">
        <TabPane tab="Templates" key="0">
          <div>
            <Row>
              <Col span={24} style={{ 'textAlign': 'right' }}>
                <Icon style={{ margin: '15px 0', fontSize: '1.6em' }} type={'plus-circle'} onClick={this.newTemplate} />
              </Col>
            </Row>
            <Table size="small" 
              onRow={(record, rowIndex) => { return { onClick: (event) => { this.viewTemplate(record); } } }}
              rowClassName={'bms_clickable'}
              rowKey="tmpKey"
              dataSource={this.state.templateList}
              columns={templateColumns}
            >
            </Table>
          </div>
          {this.renderNewTemplate()}
        </TabPane>
        <TabPane tab="Statuses" key="1">
          {jsonStatus && jsonStatus.map((item, index) => (
            // Draft
            index === 0 ?
            <div key={index} style={statusItemWrapperStyles}>
              <Radio.Group disabled style={radioStyles} buttonStyle="solid" value={item.role}>
                <div style={{ width: '167px' }} />
                <Radio.Button value="Creator">Creator</Radio.Button>
                <Radio.Button value="Assignee">Assignee</Radio.Button>
              </Radio.Group>
              <Form.Item {...formStyles}>
                <Input
                  disabled={true}
                  value={item.value}
                />
              </Form.Item>
            </div>
            :
            // Live
            index === 1 ?
            <div key={index} style={statusItemWrapperStyles}>
              <Radio.Group disabled style={radioStyles} buttonStyle="solid" value={item.role}>
                <div style={{ width: '167px' }} />
              </Radio.Group>
              <Form.Item {...formStyles}>
                <Input
                  disabled={true}
                  value={item.value}
                />
              </Form.Item>
            </div>
            :
            // In Progress
            index === 2 ?
            <div key={index} style={statusItemWrapperStyles}>
              <Radio.Group style={radioStyles} buttonStyle="solid" value={item.role} onChange={e => this.handleRole(e, index)}>
                <div style={{ width: '167px' }} />
                <Radio.Button value="Creator">Creator</Radio.Button>
                <Radio.Button value="Assignee">Assignee</Radio.Button>
              </Radio.Group>
              <Form.Item {...formStyles}>
                <Input
                  disabled={true}
                  value={item.value}
                />
              </Form.Item>
            </div>
            :
            // Custom statuses
            index !== jsonStatus.length - 1 ?
            <div key={index} style={statusItemWrapperStyles}>
              <Radio.Group style={radioStyles} buttonStyle="solid" value={item.role} onChange={e => this.handleRole(e, index)}>
                <div style={{ width: '167px' }} />
                <Radio.Button value="Creator">Creator</Radio.Button>
                <Radio.Button value="Assignee">Assignee</Radio.Button>
              </Radio.Group>
              <Form.Item  {...formStyles} validateSuccess="success" hasFeedback>
                <Input
                  id="success"
                  onChange={e => this.handleStatusInput(index, e.target.value)}
                  value={item.value}
                />
              </Form.Item>
              <Icon
                disabled={(index === 3)}
                className="dynamic-button"
                onClick={e => this.moveField(index, -1, (index === 3))}
                type="up-circle"
                style={{ marginLeft: '5px' }}
              />
              <Icon
                disabled={(index === jsonStatus.length - 2)}
                className="dynamic-button"
                onClick={e => this.moveField(index, 1, (index === jsonStatus.length - 2))}
                type="down-circle"
              />
              <Popconfirm
                title={'Deleting this status will hide any Bookings that are in this status. Are you sure?'}
                onConfirm={() => {
                  this.remove(index)
                }}
                okText="Yes"
              ><Icon className="dynamic-button" type="minus-circle-o" /></Popconfirm>
            </div>
            :
            // Complete
            index === jsonStatus.length - 1 &&
            <div key={index}>
              <div style={statusItemWrapperStyles}>
                <Radio.Group disabled style={radioStyles} buttonStyle="solid" value={item.role}>
                  <div style={{ width: '167px' }} />
                </Radio.Group>
                <div {...formStyles}>
                  <Button type="dashed" onClick={() => this.addStatus(index)} style={{
                    margin: '0',
                    width: '100%'
                  }}>
                    <Icon type="plus" />Add Status
                  </Button>
                </div>
              </div>
              <div style={statusItemWrapperStyles}>
                <Radio.Group disabled style={radioStyles} buttonStyle="solid" value={item.role}>
                  <div style={{ width: '167px' }} />
                </Radio.Group>
                <Form.Item {...formStyles}>
                  <Input disabled={true} value={item.value} />
                </Form.Item>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Button disabled={this.state.saved} type="primary" onClick={this.saveJsonStatus}>Save</Button>
            <Button disabled={this.state.saved} type="primary" onClick={this.clearChanges}>Cancel</Button>
          </div>
        </TabPane>
        <TabPane tab="Flags" key="2">
          <div>
            {
              this.state.jsonFlags &&
              <Flags
                items={this.state.jsonFlags}
                save={this.handleSaveFlags}
              />
            }
          </div>
        </TabPane>
      </Tabs>
    );
  }

  renderNewTemplate() {
    return (
      <Drawer
        title="Name your new template"
        width={620}
        onClose={() => {
          let stateCopy = { ...this.state };
          stateCopy.newTmp = false;
          this.setState(stateCopy);
        }}
        onKeyUp={this.handleKeyUp}
        visible={this.state.newTmp}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="Template name">
            <Input id="tmpName" onChange={this.inputChange} value={this.state.tmpName} />
          </Form.Item>
          <Form.Item
            // {...formItemLayout}
            label="Color"
          >
          {
            this.state.newTmp ?
            <Select style={{ width: '100%' }} value={this.state.colorLabel} onChange={this.handleColor}>
              {
                BigglyColors.template.map(item => (
                  <Option key={id++} value={item.colorLabel}><Tag color={item.color}>{item.colorLabel}</Tag></Option>
                ))
              }
            </Select>
            :
            <Select style={{ width: '100%' }} value={this.state.colorLabel}>
            {/* Empty menu so it doesn't dissapear on close animation */}
            </Select>
          }
          </Form.Item>
        </Form>

        <div
          style={{
            position: 'absolute',
            left: 0,
            bottom: 0,
            width: '100%',
            borderTop: '1px solid #e9e9e9',
            paddiStatusng: '10px 16px',
            background: '#fff',
            textAlign: 'right',
          }}
        >

          <Row>
            <Col span={24}>
              <Button 
                disabled={!this.validateFormTemplate()} 
                onClick={this.handleSubmitTemplate} 
                type={'primary'}>Add template...
            </Button>
            </Col>
          </Row>


        </div>
      </Drawer>
    );
  }

  render() {

    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
    }}>
        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false} style={{ 'width': '100%' }}>
              {this.renderDivision()}
            </Card>
          </Col>

          <Col span={24}>
            <Card bordered={false} style={{ 'width': '100%', marginTop: 15 }}>
              {this.renderTabs()}
            </Card>
          </Col>
        </Row>
      </Content>
    );
  }
}

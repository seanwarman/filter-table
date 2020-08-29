import React, { Component } from 'react';
import '../../../App.css';
import { API } from '../../../libs/apiMethods';
import { Layout, Card, Table, Col, Row, Icon, Tabs, Input, Button, Select, Form } from 'antd';
import Highlighter from 'react-highlight-words';
import moment from 'moment';

const { Content } = Layout;
const TabPane = Tabs.TabPane;

class Emails extends Component {
  constructor(props) {
    super(props);

    this.state = {

      // QUEUE DETAILS
      queueSent: [],
      queuePending: [],

      //NEW EMAIL STATE DETAILS
      templates: [],
      template: [],
      templateCode: "",
      newTemplateCode: "",
      templateKey: "",
      fromEmail: "",
      fromName: "",
      toEmail: "",
      toName: "",
      emailTitle: "",
      emailSubject: "",
      pars: [],
      disabledCreateButton: false,

      // TABS

      activeKey: "1",
    };



    this.runQueue = this.runQueue.bind(this);

    this.inputChange = this.inputChange.bind(this);
    this.changeTemplate = this.changeTemplate.bind(this);
    this.handleCreate = this.handleCreate.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.resetNewEmail = this.resetNewEmail.bind(this);

    this.callback = this.callback.bind(this);
  }

  async resetNewEmail() {

    this.setState({
      template: [],
      templateCode: "",
      newTemplateCode: "",
      templateKey: "",
      fromEmail: "",
      fromName: "",
      toEmail: "",
      toName: "",
      emailTitle: "",
      emailSubject: "",
      pars: [],
      activeKey: "1"

    });

    const queueSent = await this.queueSent();
    const queuePending = await this.queuePending();
    this.setState({ queueSent, queuePending });

    let templates = await this.getTemplates();
    this.setState({ templates });
  }

  async componentDidMount() {

    try {
      const queueSent = await this.queueSent();
      const queuePending = await this.queuePending();
      this.setState({ queueSent, queuePending });
      // this.props.changeHeader("Emails");
      this.props.changeHeader('mail', 'Notify', [{ name: 'Emails', url: '/notify/emails' }]);

      let templates = await this.getTemplates();

      this.setState({ templates });


    } catch (e) {
      alert(e);
      alert(e.message);
    }

  }

  changeTemplate = async (templateKey) => {


    let template = await this.props.api.getAdmin({
      name: 'bms_notify.templates',
      where: [
        `templateKey = "${templateKey}"`
      ],
      columns: [
        {name: 'templateName'},
        {name: 'templateKey'},
        {name: 'templateCode'},
      ]
    });

    let templateCode = template.templateCode;

    this.setState({ templateKey: template.templateKey });

    var pars = [];

    for (var i = 0; i < templateCode.length; i++) {


      if (templateCode[i] === '[') {

        var e = templateCode.indexOf(']', i);

        if (e > i) {

          pars.push(templateCode.substring(i + 1, e));
        }

      }

    }

    this.setState({ pars, templateCode, newTemplateCode: templateCode });


  }

  // █▀▀ █▀▀ █▀▀█ █▀▀█ █▀▀ █░░█   █▀▀ █░░█ █▀▀▄ █▀▀ ▀▀█▀▀ ░▀░ █▀▀█ █▀▀▄ █▀▀
  // ▀▀█ █▀▀ █▄▄█ █▄▄▀ █░░ █▀▀█   █▀▀ █░░█ █░░█ █░░ ░░█░░ ▀█▀ █░░█ █░░█ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░▀ ▀░▀▀ ▀▀▀ ▀░░▀   ▀░░ ░▀▀▀ ▀░░▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀▀ ▀░░▀ ▀▀▀

  /**
   *
   * --------------------------------------------------------------------------
   * Added search to the columns for the table
   * @param { dataIndex, columnName }
   * The latter has been added and seems to work - if it presents any issues,
   * we can delete this - prettifys the placeholder on the dropdown input
   *
   * @author KR
   * --------------------------------------------------------------------------
   * @version 1.0.0
   * @since 1.0.0
   * --------------------------------------------------------------------------
   *
   */

  searchHandle = (selectedKeys, confirm) => {
    confirm();
    this.setState({ searchText: selectedKeys[0] });
  }

  searchHandleReset = (clearFilters) => {
    clearFilters();
    this.setState({ searchText: '' });
  }

  searchGetColumnProps = (dataIndex, columnName) => ({
    filterDropdown: ({
      setSelectedKeys, selectedKeys, confirm, clearFilters,
    }) => (
        <div style={{ padding: 8 }}>
          <Input
            ref={node => { this.searchInput = node; }}
            placeholder={`Search ${columnName}`}
            value={selectedKeys[0]}
            onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
            onPressEnter={() => this.searchHandle(selectedKeys, confirm)}
            style={{ width: 188, marginBottom: 8, display: 'block' }}
          />
          <Button
            type="primary"
            onClick={() => this.searchHandle(selectedKeys, confirm)}
            icon="search"
            size="small"
            style={{ width: 90, marginRight: 8 }}
          >
            Search
                    </Button>
          <Button
            onClick={() => this.searchHandleReset(clearFilters)}
            size="small"
            style={{ width: 90 }}
          >
            Reset
                    </Button>
        </div>
      ),
    filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) => {
      if (record[dataIndex]) {
        return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
      }
    },
    onFilterDropdownVisibleChange: (visible) => {
      if (visible) {
        setTimeout(() => this.searchInput.select());
      }
    },
    render: (text) => (
      <Highlighter
        highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
        searchWords={[this.state.searchText]}
        autoEscape
        textToHighlight={text ? text : 'unknown'}
      />
    ),
  });

  /**
   *
   * End of Search Function
   *
   */

  async handleCreate() {

    let newpars = {};

    this.setState({ disabledCreateButton: true });

    this.state.pars.map((item) => {

      var inputfield = document.getElementById(item);
      newpars[item] = inputfield.value;
      return null;

    });


    console.log(newpars);

    let email = {
      templateKey: this.state.templateKey,
      fromEmail: this.state.fromEmail,
      fromName: this.state.fromName,
      toEmail: this.state.toEmail,
      toName: this.state.toName,
      emailTitle: this.state.emailTitle,
      emailSubject: this.state.emailSubject,
      parameters: JSON.stringify(newpars)
    };

    console.log(email);

    await this.props.api.createAdmin({
      name: 'bms_notify.email_queue',
    }, email, 'queueKey');

    this.resetNewEmail();


  }
  async getTemplates() {

    return this.props.api.listAdmin({
      name: 'bms_notify.templates',
      columns: [
        {name: 'templateName'},
        {name: 'templateKey'}
      ]
    });
  }
  handleChange(e) {

    this.setState({ [e.target.id]: e.target.value });
  }
  inputChange(e) {

    var templateCode = this.state.templateCode;

    this.state.pars.map((item) => {

      var inputfield = document.getElementById(item);

      if (inputfield.value.length > 0) {

        templateCode = templateCode.replace('[' + item + ']', inputfield.value);
      }

      return null;

    })

    this.setState({ newTemplateCode: templateCode });


    //console.log(document.getElementById('header').value);
  }

  queueSent() {
    return this.props.api.listAdmin({
      name: 'bms_notify.email_queue',
      columns: [
        {name: 'queueKey'},
        {name: 'fromEmail'},
        {name: 'toEmail'},
        {name: 'emailSubject'},
        {name: 'status'},
        {name: 'created'},
      ],
      where: [
        'status = "SENT"'
      ]
    })
  }
  queuePending() {
    return this.props.api.listAdmin({
      name: 'bms_notify.email_queue',
      columns: [
        {name: 'queueKey'},
        {name: 'fromEmail'},
        {name: 'toEmail'},
        {name: 'emailSubject'},
        {name: 'status'},
        {name: 'created'},
      ],
      where: [
        'status = "PENDING"'
      ]
    })
  }
  async runQueue() {

    // KEEP: this will need a custom function
    var res = await API.get('biggly', `/notify/key/${this.props.user.apiKey}/runemails`);

    console.log(res);

    try {

      const queueSent = await this.queueSent();
      const queuePending = await this.queuePending();
      this.setState({ queueSent, queuePending });

      let templates = await this.getTemplates();
      this.setState({ templates });


    } catch (e) {
      alert(e);
      alert(e.message);
    }

  }

  emailContent() {



    return (

      <div>

        <Row gutter={0}>
          <Col span={24}>
            <Select placeholder={"Choose a template"} style={{ width: '100%' }} onChange={this.changeTemplate}>
              {
                this.state.templates.map((item, i) => {

                  return (
                    <Select.Option key={i} value={item.templateKey}>{item.templateName}</Select.Option>
                  );
                })
              }

            </Select>
            <hr />
          </Col>
        </Row>

        {this.state.templateKey ?

          <Row gutter={0}>


            <Col span={10}>
              <Card bordered={false} style={{ 'width': '100%' }}>

                <Form layout={"vertical"} labelCol={{ span: 9 }} wrapperCol={{ span: 15 }}>

                  <br /><br />
                  <Form.Item label={"To email"}>
                    <Input required id="toEmail" type={"text"} onChange={this.handleChange} />
                  </Form.Item>
                  <Form.Item label={"To name"}>
                    <Input required id="toName" type={"text"} onChange={this.handleChange} />
                  </Form.Item>
                  <Form.Item label={"From email"}>
                    <Input required id="fromEmail" type={"text"} onChange={this.handleChange} />
                  </Form.Item>
                  <Form.Item label={"From name"}>
                    <Input required id="fromName" type={"text"} onChange={this.handleChange} />
                  </Form.Item>
                  <Form.Item label={"Email title"}>
                    <Input required id="emailTitle" type={"text"} onChange={this.handleChange} />
                  </Form.Item>
                  <Form.Item label={"Email subject"}>
                    <Input required id="emailSubject" type={"text"} onChange={this.handleChange} />
                  </Form.Item>

                  {
                    this.state.pars.map((item, i) => {

                      return (
                        <Form.Item key={i} label={item}>
                          <Input onChange={this.inputChange} required id={item} type={"text"} />
                        </Form.Item>
                      );

                    })
                  }

                  <Button loading={this.state.disabledCreateButton} onClick={this.handleCreate} type={"primary"}>Create email</Button>

                </Form>
              </Card>




            </Col>



            <Col span={14}>

              <Card title="Preview" bordered={false} style={{ 'width': '100%' }}>

                <div className={"templateHolder"} style={{ backgroundColor: this.state.templateBg }}>

                  <div className={"templateBody"} style={{ backgroundColor: this.state.contentBg }}>

                    <div dangerouslySetInnerHTML={{ __html: this.state.newTemplateCode }} />

                  </div>
                </div>
              </Card>
            </Col>


          </Row>


          : null}
      </div>
    );

  }

  callback(key) {
    this.setState({ activeKey: key, disabledCreateButton: false })
  }

  render() {

    const columns = [{
      title: 'Key',
      dataIndex: 'queueKey',
      key: 'queueKey',
      sorter: (a, b) => {
        if (a.queueKey < b.queueKey) { return -1 };
        if (a.queueKey > b.queueKey) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('queueKey', 'keys')
    }, {
      title: 'From',
      dataIndex: 'fromEmail',
      key: 'fromEmail',
      sorter: (a, b) => {
        if (a.fromEmail < b.fromEmail) { return -1 };
        if (a.fromEmail > b.fromEmail) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('fromEmail', 'keys')
    }, {
      title: 'To',
      dataIndex: 'toEmail',
      key: 'toEmail',
      sorter: (a, b) => {
        if (a.toEmail < b.toEmail) { return -1 };
        if (a.toEmail > b.toEmail) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('toEmail', 'keys')
    }, {
      title: 'Subject',
      dataIndex: 'emailSubject',
      key: 'emailSubject',
      sorter: (a, b) => {
        if (a.emailSubject < b.emailSubject) { return -1 };
        if (a.emailSubject > b.emailSubject) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('emailSubject', 'keys')
    }, {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      sorter: (a, b) => {
        if (a.status < b.status) { return -1 };
        if (a.status > b.status) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('status', 'keys')
    }, {
      title: 'Created',
      dataIndex: 'created',
      key: 'created',
      sorter: (a, b) => {
        if (a.created < b.created) { return -1 };
        if (a.created > b.created) { return 1 };
        return 0;
      },
      render: created => <div>{moment(created).format('YYYY-MM-DD')}</div>,
    }];

    function onChange(pagination, filters, sorter) {
      console.log('params', pagination, filters, sorter);
    }


    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}
      >
        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false} style={{ 'width': '100%' }}>
              <Tabs onChange={this.callback} defaultActiveKey={this.state.activeKey} activeKey={this.state.activeKey}>
                <TabPane tab="Pending" key="1">
                  <Row>
                    <Col span={12} style={{ 'textAlign': 'left' }}>

                    </Col>
                    <Col span={12} style={{ 'textAlign': 'right' }}>
                      <Icon style={{ margin: '15px 15px', fontSize: '1.6em' }} type={"play-circle"} onClick={this.runQueue} />
                    </Col>
                  </Row>
                  <Row>
                    <Col span={24}>
                      <Table size="small"  onChange={onChange} rowClassName={'clickable'} rowKey="queueKey" dataSource={this.state.queuePending} columns={columns}>
                      </Table>
                    </Col>
                  </Row>
                </TabPane>
                <TabPane tab="Sent" key="2">
                  <Table size="small"  onChange={onChange} rowClassName={'clickable'} rowKey="queueKey" dataSource={this.state.queueSent} columns={columns}>
                  </Table>
                </TabPane>
                <TabPane tab="New email" key="3">
                  {this.state.templates.length > 0 ?
                    (this.emailContent())
                    : null
                  }
                </TabPane>
              </Tabs>,


                        </Card>
          </Col>
        </Row>


      </Content>


    );
  }
}

export default Emails;

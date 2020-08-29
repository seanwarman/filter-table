import React, { Component } from 'react';
import './Customers.css';
import '../../../App.css';
import { 
  Layout, 
  Button, 
  Table, 
  Drawer, 
  Form, 
  Col, 
  Row, 
  Input, 
  Icon, 
  message, 
  Card, 
  Select 
} from 'antd';
import Highlighter from 'react-highlight-words';

const { Content } = Layout;
const Option = Select.Option;
const success = (message_details) => {
  message.success(message_details);
};

class Customers extends Component {
  constructor(props) {
    super(props);

    this.state = {
      searchText: '',
      customers: [],
      newCustomerForm: false,
      partnerKey: null,
      content: "",
      customerName: "",
      telephone: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      townName: "",
      postCode: "",
      emailAddress: "xxx",
      partnersList: [],
      disabledSubmitButton: false
    };
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

  showDrawer = () => {
    this.setState({
      newCustomerForm: true,
      customerName: "",
      telephone: "",
      addressLine1: "",
      addressLine2: "",
      addressLine3: "",
      townName: "",
      postCode: "",
      emailAddress: "xxx",
      disabledSubmitButton: false
    });
  };

  onClose = () => {
    this.setState({
      newCustomerForm: false,
      partnerKey: null
    });
  };

  handleChange = event => {
    this.setState({
      [event.target.id]: event.target.value
    });
  }

  handleSubmit = async event => {
    event.preventDefault();

    this.setState({ newCustomerForm: false, disabledSubmitButton: true });

    try {

      var customerEntry = {
        userKey: this.props.user.userKey,
        customerName: this.state.customerName,
        partnerKey: this.props.user.accessLevel === 'Provider' ? this.props.user.partnerKey : this.state.partnerKey,
        telephone: this.state.telephone,
        addressLine1: this.state.addressLine1,
        addressLine2: this.state.addressLine2,
        addressLine3: this.state.addressLine3,
        townName: this.state.townName,
        postCode: this.state.postCode,
        emailAddress: this.state.emailAddress,
      };

      console.log(customerEntry);

      var customerKey = await this.createCustomer(customerEntry);

      console.log(customerKey);

      await this.createNotify({
        BRN: "CSL:-" + customerKey,
        fromEmail: "support@biggly.co.uk",
        fromName: "biggly support",
        toEmail: this.props.user.emailAddress,
        toName: this.props.user.firstName + " " + this.props.user.lastName,
        emailTitle: "New customer added",
        emailSubject: "New customer added",
        templateKey: "3f61c490-57e5-11e9-9d88-3d880bcc3ce5",
        parameters: JSON.stringify({
          recipient_name: this.props.user.firstName,
          customer_name: this.state.customerName,
          customer_key: customerKey,
        })
      })
      const customers = await this.customers();
      this.setState({ customers });

      success("Customer added");
    } catch (e) {
      alert(e);
    }
    this.loadDataAndSetState();
  }

  validateForm() {
    return this.state.customerName.length > 0 && (this.state.partnerKey || '').length > 0;
  }

  createCustomer(customer) {
    return this.props.api.createPublic({
      name: 'Biggly.customers',
    }, customer, 'customerKey')
  }

  createNotify(notifyObject) {
    return this.props.api.createPublic({
      name: 'bms_notify.email_queue',
    }, notifyObject, 'queueKey')
  }

  async componentDidMount() {
    this.props.changeHeader('appstore', 'Console', [{ name: 'Customers', url: '/console/customers' }]);
    this.loadDataAndSetState();
  }
  loadDataAndSetState = async() => {
    let stateCopy = { ...this.state };

    if(this.props.user.accessLevel === 'Provider') stateCopy.partnerKey = this.props.user.partnerKey;

    try {
      stateCopy.partnersList = await this.partnersList();
    } catch (err) {
      console.log('There was an error getting the partners list: ', err);
    }

    try {
      stateCopy.customers = await this.customers();
    } catch (err) {
      console.log('There was an error getting the customers list: ', err);
    }

    this.setState(stateCopy);
  }
  async partnersList() {
    const result = await this.props.api.listPublic({
      name: 'Biggly.partners',
      columns: [
        {name: 'partnerKey'},
        {name: 'partnerName'},
        {name: 'apiKey'},
      ]
    });
    return result;
  }
  selectChange = (value) => {
    this.setState({ partnerKey: value });
  }

  async customers() {

    const result = await this.props.api.listPublic({
      name: 'Biggly.customers',
      columns: [
        {name: 'partnerKey'},
        {name: 'customerName'},
        {name: 'telephone'},
        {name: 'emailAddress'},
        {name: 'customerKey'},
        {
          name: 'Biggly.partners',
          columns: [
            {name: 'partnerName'},
            {name: 'apiKey'},
          ],
          where: [
            'partners.partnerKey = customers.partnerKey'
          ]
        }
      ]
    })

    return result;
      
  }

  render() {

    var that = this;

    const columns = [{
      title: 'Partner',
      dataIndex: 'partnerName',
      key: 'partnerName',
      sorter: (a, b) => {
        if (a.partnerName < b.partnerName) { return -1 };
        if (a.partnerName > b.partnerName) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('partnerName', 'partner name')
    }, {
      title: 'Name',
      dataIndex: 'customerName',
      key: 'customerName',
      sorter: (a, b) => {
        if (a.customerName < b.customerName) { return -1 };
        if (a.customerName > b.customerName) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('customerName', 'customer name')
    }, {
      title: 'Phone',
      dataIndex: 'telephone',
      key: 'telephone',
      sorter: (a, b) => a.telephone - b.telephone,
      ...this.searchGetColumnProps('telephone', 'phone number')
    }, {
      title: 'Email',
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      sorter: (a, b) => {
        if (a.emailAddress < b.emailAddress) { return -1 };
        if (a.emailAddress > b.emailAddress) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('emailAddress', 'email addresses')
    }];

    function viewCustomer(record) {
      that.props.history.push(`/console/customers/` + record.customerKey);
    }

    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
    }}>

        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false} style={{ 'width': '100%' }}>
              <Row>
                <Col span={24} style={{ 'textAlign': 'right' }}>
                  <Icon style={{ margin: '15px 0', fontSize: '1.6em' }} type={"plus-circle"} onClick={this.showDrawer} />
                </Col>
              </Row>
              <Row>
                <Col span={24}>
                  <Table size="small"  onRow={(record, rowIndex) => { return { onClick: (event) => { viewCustomer(record); } } }} rowClassName={'bms_clickable'} rowKey="customerKey" dataSource={this.state.customers} columns={columns}>
                  </Table>
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>



        <Drawer
          title="Create a new customer"
          width={620}
          onClose={this.onClose}
          visible={this.state.newCustomerForm}
        >
          <Form layout="horizontal" onSubmit={this.handleSubmit} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
            {
              this.props.user.accessLevel === 'Admin' ||
              this.props.user.accessLevel === 'Provider Admin' ?
              <Form.Item label={"Partner"}>
                <Select defaultValue={this.state.partnerKey} onChange={this.selectChange}>
                  {this.state.partnersList.map((item, i) => {
                    return (
                      <Option key={item.partnerKey}>{item.partnerName}</Option>
                    );
                  })}

                </Select>
              </Form.Item>
              : null}
            <Form.Item label={"Name"}>
              <Input required id="customerName" type={"text"} onChange={this.handleChange} value={this.state.customerName} />
            </Form.Item>
            <Form.Item label={"Address"}>
              <Input id="addressLine1" type={"text"} onChange={this.handleChange} value={this.state.addressLine1} />
              <Input id="addressLine2" type={"text"} onChange={this.handleChange} value={this.state.addressLine2} />
              <Input id="addressLine3" type={"text"} onChange={this.handleChange} value={this.state.addressLine3} />
            </Form.Item>
            <Form.Item label="Town">
              <Input id="townName" onChange={this.handleChange} value={this.state.townName} />
            </Form.Item>
            <Form.Item label="Post code">
              <Input id="postCode" onChange={this.handleChange} value={this.state.postCode} />
            </Form.Item>
            <Form.Item label="Phone number">
              <Input id="telephone" onChange={this.handleChange} value={this.state.telephone} />
            </Form.Item>
            <Form.Item label="Email address">
              <Input id="emailAddress" onChange={this.handleChange} value={this.state.emailAddress} />
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
            <Button type="dashed" style={{ marginRight: 8 }} onClick={this.onClose}>Cancel</Button>
            <Button disabled={!this.validateForm()} loading={this.state.disabledSubmitButton} onClick={this.handleSubmit} type={"primary"}>Create</Button>
          </div>
        </Drawer>


      </Content >


    );
  }
}


export default Customers;

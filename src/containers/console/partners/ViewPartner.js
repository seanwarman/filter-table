import React, { Component } from "react";
import "../../../App.css";
import { Table, message, Layout, Row, Col, Card, Form, Input, Button, Tabs, Drawer, Modal } from "antd";
import Icon from "antd/lib/icon";
import { Skeleton } from 'antd';
import Highlighter from 'react-highlight-words';

const { Content } = Layout;
const TabPane = Tabs.TabPane;

const success = (message_details) => {
  message.success(message_details);
};

export default class ViewPartner extends Component {

  constructor(props) {
    super(props);

    this.file = null;

    this.state = {
      isLoading: true,
      show: false,
      partner: null,
      partnerKey: null,
      partnerName: "",
      partnerTelephone: "",
      partnerAd1: "",
      partnerAd2: "",
      partnerAd3: "",
      partnerTown: "",
      partnerPostCode: "",
      editPartner: false,
      users: [],
      editUser: false,
      firstName: "",
      lastName: "",
      telephone: "",
      emailAddress: "",
      cognitoUserName: "",
    };

  }

  async componentDidMount() {

    try {

      const partner = await this.getPartner();

      const { partnerName, partnerTelephone, partnerAd1, partnerAd2, partnerAd3, partnerTown, partnerPostCode, partnerKey, apiKey } = partner;

      const users = await this.getUsers();

      this.setState({
        partnerKey,
        partner,
        partnerName,
        partnerTelephone,
        partnerAd1,
        partnerAd2,
        partnerAd3,
        partnerTown,
        partnerPostCode,
        apiKey,
        users
      });
      this.props.changeHeader('appstore', 'Console', [{ name: 'Partners', url: '/console/partners/' }, { name: partnerName, url: '/console/partners/' + partnerName }]);
      this.setState({ isLoading: false });

    } catch (e) {
      alert(e);
    }
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

  inputChange = e => {

    this.setState({
      [e.target.id.toString()]: e.target.value
    });

  }

  // Update the state with a value from form input

  // --------------------------------------------------------

  // ------------------ CUSTOMER SECTION --------------------

  // Renders

  PartnerRender() {

    var partAdr1 = this.state.partnerAd1;
    var partAdr2 = this.state.partnerAd2;
    var partAdr3 = this.state.partnerAd3;
    var partTown = this.state.partnerTown;
    var partPost = this.state.partnerPostCode;
    var partTele = this.state.partnerTelephone;

    return (

      <div>
        <Row gutter={16}>
          <Col xs={24}>
            <Skeleton loading={this.state.isLoading} active={true} title={{ width: 150 }} paragraph={{ rows: 1 }}>
              <h5>{this.state.partnerName}</h5>
              {partAdr1 ? partAdr1 : ''}
              {((partAdr1 && partAdr2) || (partAdr1 && partAdr3) || (partAdr1 && partTown) || (partAdr1 && partPost) || (partAdr1 && partTele)) ? ', ' : ''}

              {partAdr2 ? partAdr2 : ''}
              {((partAdr2 && partAdr3) || (partAdr2 && partTown) || (partAdr2 && partPost) || (partAdr2 && partTele)) ? ', ' : ''}

              {partAdr3 ? partAdr3 : ''}
              {((partAdr3 && partTown) || (partAdr3 && partPost) || (partAdr3 && partTele)) ? ', ' : ''}

              {partTown ? partTown : ''}
              {((partTown && partPost) || (partTown && partTele)) ? ', ' : ''}

              {partPost ? partPost : ''}
              {partPost && partTele ? ', ' : ''}

              {partTele ? 'Telephone: ' + partTele : ''}

            </Skeleton>
          </Col>
        </Row>

        <Icon onClick={this.showEditPartner} type={"edit"} style={{ color: 'grey', fontSize: '1.6em', position: 'absolute', top: '10px', right: '15px' }} />

        {this.EditPartnerRender()}
      </div>

    );
  }                                        // Render the customer information

  handleDelete = async event => {

    try {
      await this.deleteCustomer;
      this.props.history.push("/console/partners");
    } catch (e) {
      alert(e);
      this.setState({ isDeleting: false });
    }
  }

  EditPartnerRender() {

    function showConfirmDelete(partnerKey, props) {

      Modal.confirm({
        title: 'Do you Want to delete this partner?',
        content: 'This cannot be reversed',
        async onOk() {

          await props.api.deleteAdmin({
            name: 'Biggly.partners',
            where: [
              `partnerKey = "${partnerKey}"`
            ]
          })
          props.history.push("/console/partners");

        },
        onCancel() {

        },
      });
    }

    return (

      <Drawer
        title="Edit partner"
        width={620}
        onClose={this.hideEditPartner}
        visible={this.state.editPartner}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label={"Name"}>
            <Input required id="partnerName" type={"text"} onChange={this.inputChange}
              value={this.state.partnerName} />
          </Form.Item>
          <Form.Item label={"Address"}>
            <Input id="partnerAd1" type={"text"} onChange={this.inputChange}
              value={this.state.partnerAd1} style={{ marginBottom: 5 }} />
            <Input id="partnerAd2" type={"text"} onChange={this.inputChange}
              value={this.state.partnerAd2} style={{ marginBottom: 5 }} />
            <Input id="partnerAd3" type={"text"} onChange={this.inputChange}
              value={this.state.partnerAd3} style={{ marginBottom: 5 }} />
          </Form.Item>
          <Form.Item label="Town">
            <Input id="partnerTown" onChange={this.inputChange} value={this.state.partnerTown} />
          </Form.Item>
          <Form.Item label="Post code">
            <Input id="partnerPostCode" onChange={this.inputChange} value={this.state.partnerPostCode} />
          </Form.Item>
          <Form.Item label="Phone number">
            <Input id="partnerTelephone" onChange={this.inputChange} value={this.state.partnerTelephone} />
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
              {this.state.users.length === 0 ?
                <Button onClick={() => { showConfirmDelete(this.state.partnerKey, this.props) }}>Delete partner</Button>
                : null}
            </Col>
            <Col span={16}>
              <Button disabled={!this.validateForm()} onClick={this.handleSubmit} type={"primary"}>Update</Button>
            </Col>
          </Row>


        </div>
      </Drawer>

    );
  }                                    // Drawer to edit the customer information

  // Actions
  showEditPartner = () => {
    this.setState({ editPartner: true });
  }                                      // Toggle show the customer drawer
  hideEditPartner = () => {
    this.setState({ editPartner: false });
  }                                      // Toggle hide the customer drawer
  validateForm = () => {
    return this.state.partnerName.length > 0;
  }                                          // Validate the customer edit form
  handleSubmit = async event => {

    event.preventDefault();

    this.setState({ isLoading: true, editPartner: false });

    try {

      await this.savePartner({
        partnerName: this.state.partnerName,
        partnerTelephone: this.state.partnerTelephone,
        partnerAd1: this.state.partnerAd1,
        partnerAd2: this.state.partnerAd2,
        partnerAd3: this.state.partnerAd3,
        partnerTown: this.state.partnerTown,
        partnerPostCode: this.state.partnerPostCode,

      });

      const partner = await this.getPartner();

      const { partnerName, partnerTelephone, partnerAd1, partnerAd2, partnerAd3, partnerTown, partnerPostCode, partnerKey, apiKey } = partner;

      const users = await this.getUsers();

      this.setState({
        partnerKey,
        partner,
        partnerName,
        partnerTelephone,
        partnerAd1,
        partnerAd2,
        partnerAd3,
        partnerTown,
        partnerPostCode,
        apiKey,
        users
      });


      this.props.changeHeader(this.state.partnerName);

      this.setState({ isLoading: false });


      success("Partner record updated");

    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }                           
  // Test change - can DELETE

  async getPartner() {
    const result = await this.props.api.getAdmin({
      name: 'Biggly.partners',
      columns: [
        { name: 'partnerKey' },
        { name: 'partnerName' },
        { name: 'partnerAd1' },
        { name: 'partnerAd2' },
        { name: 'partnerAd3' },
        { name: 'partnerTown' },
        { name: 'partnerPostCode' },
        { name: 'partnerTelephone' },
        { name: 'apiKey' },
        { name: 'created' },
        { name: 'updated' },
      ],
      where: [
        `partnerKey = "${this.props.match.params.partnerKey}" `
      ]
    });
    return result;
  }                                           
  savePartner(partner) {
    return this.props.api.updateAdmin({
      name: 'Biggly.partners',
      where: [
        `partnerKey = "${this.props.match.params.partnerKey}" `
      ]
    }, partner);
  }                                 

  EditUserRender() {

    return (

      <Drawer
        title="Edit user"
        width={620}
        onClose={this.hideEditUser}
        visible={this.state.editUser}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="First name">
            <Input id="firstName" onChange={this.inputChange} value={this.state.firstName} />
          </Form.Item>
          <Form.Item label="Last name">
            <Input id="lastName" onChange={this.inputChange} value={this.state.lastName} />
          </Form.Item>
          <Form.Item label="Email">
            <Input id="emailAddress" onChange={this.inputChange} value={this.state.emailAddress} />
          </Form.Item>
          <Form.Item label="Telephone">
            <Input id="telephone" onChange={this.inputChange} value={this.state.telephone} />
          </Form.Item>
          <Form.Item label="Cognito User Name">
            <Input id="" disabled onChange={this.inputChange} value={this.state.cognitoUserName} />
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
            <Col span={24}>
              <Button disabled={!this.validateFormUser()} onClick={this.handleEditUser} type={"primary"}>Update user</Button>
            </Col>
          </Row>


        </div>
      </Drawer>

    );
  }
  // Drawer to add a site
  UsersRender() {

    var that = this;

    const columns = [{
      title: 'First name',
      dataIndex: 'firstName',
      key: 'firstName',
      sorter: (a, b) => {
        if (a.firstName < b.firstName) { return -1 };
        if (a.firstName > b.firstName) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('firstName', 'first name')
    }, {
      title: 'Last name',
      dataIndex: 'lastName',
      key: 'lastName',
      sorter: (a, b) => {
        if (a.lastName < b.lastName) { return -1 };
        if (a.lastName > b.lastName) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('lastName', 'first name')
    }, {
      title: 'Telephone',
      dataIndex: 'telephone',
      key: 'telephone',
      sorter: (a, b) => {
        if (a.telephone < b.telephone) { return -1 };
        if (a.telephone > b.telephone) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('telephone', 'first name')
    }, {
      title: 'Email',
      dataIndex: 'emailAddress',
      key: 'emailAddress',
      sorter: (a, b) => {
        if (a.emailAddress < b.emailAddress) { return -1 };
        if (a.emailAddress > b.emailAddress) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('emailAddress', 'first name')
    }];

    function onChange(pagination, filters, sorter) {
      //console.log('params', pagination, filters, sorter);
    }

    function viewUser(record) {

      var userKey = record.userKey;
      var firstName = record.firstName;
      var lastName = record.lastName;
      var telephone = record.telephone;
      var emailAddress = record.emailAddress;
      var cognitoUserName = record.cognitoUserName;

      that.setState({ editUser: true, userKey, firstName, lastName, emailAddress, telephone, cognitoUserName });
    }

    return (
      <TabPane tab="Users" key="1">
        <div>
          <Table size="small" onChange={onChange} onRow={(record, rowIndex) => { return { onClick: (event) => { viewUser(record); } } }} rowClassName={'bms_clickable'} rowKey="userKey" dataSource={this.state.users} columns={columns}>
          </Table>
          <div className={"text-right"}>

          </div>
        </div>
      </TabPane>
    );

  }                                           // Render the customer sites


  handleEditUser = async event => {

    event.preventDefault();
    this.hideEditUser();

    try {

      await this.editUser({
        firstName: this.state.firstName,
        lastName: this.state.lastName,
        emailAddress: this.state.emailAddress,
        telephone: this.state.telephone,
      });

      const users = await this.getUsers();
      this.setState({ users });


      success("User details updated");

    } catch (e) {
      alert(e);
    }
  }
  editUser(user) {

    return this.props.api.updateAdmin({
      name: 'Biggly.users',
      where: [
        `cognitoUserName = "${this.state.cognitoUserName}"`
      ]
    }, user)

  }
  validateFormUser = () => {
    return this.state.firstName.length > 0;
  }                                      // Validate th form for adding a site
  showEditUser = () => {
    this.setState({ editUser: true });
  }                                           // Toggle show the site drawer
  hideEditUser = () => {
    this.setState({ editUser: false });
  }



  getUsers = async () => {

    let users = await this.props.api.listAdmin({
      name: 'Biggly.users',
      columns: [
        {name: 'userKey'},
        {name: 'cognitoUserName'},
        {name: 'firstName'},
        {name: 'lastName'},
        {name: 'telephone'},
        {name: 'emailAddress'},
        {name: 'partnerKey'},
      ],
      where: [
        `partnerKey = "${this.props.match.params.partnerKey}"`
      ]
    })
    return users;
  }

  render() {

    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>

        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false} style={{ 'width': '100%' }}>
              {this.PartnerRender()}
            </Card>
          </Col>

          <Col span={24}>

            <Card bordered={false} style={{ 'width': '100%', marginTop: 15 }}>
              <Tabs defaultActiveKey="1">
                {this.UsersRender()}
              </Tabs>
            </Card>

          </Col>

        </Row>

        {this.EditUserRender()}
      </Content>

    );
  }                                                // Render the whole page
}

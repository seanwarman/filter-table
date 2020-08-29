import React, { Component } from 'react';
import './Customers.css';
import '../../../App.css';
import { Table, message, Layout, Row, Col, Card, Form, Input, Button, Tabs, Drawer, Select, Modal } from 'antd';
import Icon from 'antd/lib/icon';
import { Skeleton } from 'antd';
import Highlighter from 'react-highlight-words';
import color from '../../../libs/bigglyStatusColorPicker';

import Moment from 'react-moment';
import moment from 'moment';

const { Content } = Layout;
const TabPane = Tabs.TabPane;
const { TextArea } = Input;
const Option = Select.Option;

const success = (message_details) => {
  message.success(message_details);
};

export default class ViewCustomer extends Component {

  state = {
    show: false,
    isLoading: true,
    isLoadingNotes: null,
    isDeleting: null,
    customer: null,
    customerKey: null,
    partnerKey: null,
    customerName: ' ',
    telephone: '',
    emailAddress: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    townName: '',
    postCode: '',

    customerNotes: [],
    noteDetails: '',
    createdOn: '',
    customerNoteKey: '',
    editNote: false,
    newNote: false,

    editCustomer: false,
    customerSites: [],
    siteKey: '',
    siteName: '',
    siteUrl: '',
    isNewSite: false,
    newSite: false,
    editSite: false,

    partnersList: [],
    disableSubmitButton: false,

    uploads: []
  };

  async componentDidMount() {

    const customer = await this.getCustomer();

    const { partnerKey, customerName, emailAddress, telephone, addressLine1, addressLine2, addressLine3, townName, postCode, customerKey } = customer;

    const customerNotes = await this.customer_notes();
    const customerSites = await this.customer_sites();

    const partnersList = await this.partnersList();

    const uploads = await this.getCustomerUploads();

    this.setState({
      customerKey,
      partnerKey,
      customer,
      customerName,
      emailAddress,
      telephone,
      customerNotes,
      addressLine1,
      addressLine2,
      addressLine3,
      townName,
      postCode,
      customerSites,

      partnersList,
      uploads,
      
      isLoading: false
    });

    this.props.changeHeader('appstore', 'Console', [{ name: 'Customers', url: '/console/customers/' }, { name: customerName, url: '/console/customers/' + customerName }]);
  }

  partnersList() {
    return this.props.api.listPublic({
      name: 'Biggly.partners',
      columns: [
        {name: 'partnerKey'},
        {name: 'partnerName'},
        {name: 'partnerAd1'},
        {name: 'partnerAd2'},
        {name: 'partnerAd3'},
        {name: 'partnerTown'},
        {name: 'partnerPostCode'},
        {name: 'partnerTelephone'},
        {name: 'apiKey'},
        {name: 'created'},
        {name: 'updated'},
      ]
    });
  }

  inputChange = e => {
    this.setState({
      [e.target.id.toString()]: e.target.value
    });
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

  CustomerRender() {
    var adr1 = this.state.addressLine1;
    var adr2 = this.state.addressLine2;
    var adr3 = this.state.addressLine3;
    var town = this.state.townName;
    var post = this.state.postCode;
    var phone = this.state.telephone;
    var email = this.state.emailAddress;

    return (

      <div>
        <Row gutter={16}>
          <Col xs={24}>
            <Skeleton loading={this.state.isLoading} active={true} title={{ width: 150 }} paragraph={{ rows: 1 }}>
              <h5>{this.state.customerName}</h5>
              {adr1 ? adr1 : ''}
              {((adr1 && adr2) || (adr1 && adr3) || (adr1 && town) || (adr1 && post) || (adr1 && phone) || (adr1 && email)) ? ', ' : ''}

              {adr2 ? adr2 : ''}
              {((adr2 && adr3) || (adr2 && town) || (adr2 && post) || (adr2 && phone) || (adr2 && email)) ? ', ' : ''}

              {adr3 ? adr3 : ''}
              {((adr3 && town) || (adr3 && post) || (adr3 && phone) || (adr3 && email)) ? ', ' : ''}

              {town ? town : ''}
              {((town && post) || (town && phone) || (town && email)) ? ', ' : ''}

              {post ? post : ''}
              {((post && phone) || (post && email)) ? ', ' : ''}

              {phone ? 'Telephone: ' + phone : ''}
              {phone && email ? ', ' : ''}

              {email ? 'Email: ' + email : ''}
            </Skeleton>
          </Col>
        </Row>

        <Icon onClick={this.showEditCustomer} type={"edit"} style={{ color: 'grey', fontSize: '1.6em', position: 'absolute', top: '10px', right: '15px' }} />

        {this.EditCustomerRender()}
      </div>

    );
  }

  // Render the customer information

  handleDelete = async event => {

    try {
      await this.deleteCustomer;
      this.props.history.push("/customers");
    } catch (e) {
      alert(e);
      this.setState({ isDeleting: false });
    }
  }

  selectChange = (value) => {
    this.setState({ partnerKey: value });
  }

  EditCustomerRender() {

    function showConfirmDelete(userKey, customerKey, props) {

      console.log(userKey);
      Modal.confirm({
        title: 'Do you Want to delete this customer?',
        content: 'This cannot be reversed',
        async onOk() {

          await props.api.deleteAdmin({
            name: 'Biggly.customers',
            where: [
              `customerKey = "${customerKey}"`
            ]
          });

          props.history.push('/console/customers');

        },
        onCancel() {
          console.log('Cancel');
        },
      });
    }

    return (

      <Drawer
        title="Edit customer"
        width={620}
        onClose={this.hideEditCustomer}
        visible={this.state.editCustomer}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          {this.props.user.accessLevel === 'Admin' ?
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
            <Input
              required
              id="customerName"
              type={"text"}
              onChange={this.inputChange}
              value={this.state.customerName} />
          </Form.Item>
          <Form.Item label={"Address"}>
            <Input
              id="addressLine1"
              type={"text"}
              onChange={this.inputChange}
              value={this.state.addressLine1}
              style={{ marginBottom: 5 }} />
            <Input
              id="addressLine2"
              type={"text"}
              onChange={this.inputChange}
              value={this.state.addressLine2}
              style={{ marginBottom: 5 }} />
            <Input
              id="addressLine3"
              type={"text"}
              onChange={this.inputChange}
              value={this.state.addressLine3}
              style={{ marginBottom: 5 }} />
          </Form.Item>
          <Form.Item label="Town">
            <Input id="townName"
              onChange={this.inputChange}
              value={this.state.townName} />
          </Form.Item>
          <Form.Item label="Post code">
            <Input
              id="postCode"
              onChange={this.inputChange}
              value={this.state.postCode} />
          </Form.Item>
          <Form.Item label="Phone number">
            <Input
              id="telephone"
              onChange={this.inputChange}
              value={this.state.telephone} />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              id="emailAddress"
              onChange={this.inputChange}
              value={this.state.emailAddress} />
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
              <Button onClick={() => { showConfirmDelete(this.props.user.userKey, this.state.customerKey, this.props) }}>Delete customer</Button>
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
  showEditCustomer = () => {
    this.setState({ editCustomer: true });
  }                                      // Toggle show the customer drawer
  hideEditCustomer = () => {
    this.setState({ editCustomer: false });
  }                                      // Toggle hide the customer drawer
  validateForm = () => {
    return this.state.customerName.length > 0;
  }                                          // Validate the customer edit form
  handleSubmit = async event => {

    event.preventDefault();

    this.setState({ isLoading: true, editCustomer: false });

    try {

      await this.saveCustomer({
        customerName: this.state.customerName,
        partnerKey: this.state.partnerKey,
        emailAddress: this.state.emailAddress,
        telephone: this.state.telephone,
        addressLine1: this.state.addressLine1,
        addressLine2: this.state.addressLine2,
        addressLine3: this.state.addressLine3,
        townName: this.state.townName,
        postCode: this.state.postCode,

      });

      const customer = await this.getCustomer();

      const { partnerKey, customerName, emailAddress, telephone, addressLine1, addressLine2, addressLine3, townName, postCode, customerKey } = customer;

      const customerNotes = await this.customer_notes();
      const customerSites = await this.customer_sites();

      this.setState({
        customerKey,
        partnerKey,
        customer,
        customerName,
        emailAddress,
        telephone,
        customerNotes,
        addressLine1,
        addressLine2,
        addressLine3,
        townName,
        postCode,
        customerSites
      });


      this.props.changeHeader(this.state.customerName);

      this.setState({ isLoading: false });

      success("Customer record updated");

    } catch (e) {
      alert(e);
      this.setState({ isLoading: false });
    }
  }

  // Test change - can DELETE

  async getCustomerUploads() {
    return await this.props.api.listPublic({
      name: 'Biggly.uploads',
      columns: [
        {name: 'uploadsKey'},
        {name: 'created'},
        {name: 'uploadedUserKey'},
        {name: 'fileName'},
        {name: 'bookingsKey'},
        {name: 'urlName'},
        {name: 'updated'},
        {name: 'campaignKey'},
        {name: 'customerKey'},
        {
          name: 'Biggly.users',
          columns: [
            {name: 'firstName'},
            {name: 'lastName'},
          ],
          where: ['uploads.uploadedUserKey = users.userKey']
        }
      ],
      where: [
        `customerKey = "${this.props.match.params.customerKey}"`
      ]
    });
  }

  async getCustomer() {
    return this.props.api.getPublic({
      name: 'Biggly.customers',
      columns: [
        {name: 'partnerKey'},
        {name: 'customerName'},
        {name: 'telephone'},
        {name: 'emailAddress'},
        {name: 'customerKey'},
        // {
        //   join: {
        //     db: 'Biggly',
        //     table: 'partners',
        //     columns: [
        //       {name: 'partnerName'},
        //       {name: 'apiKey'}
        //     ],
        //     where: [{
        //       name: 'partnerKey', is: 'partnerKey'
        //     }]
        //   }
        // }
      ],
      where: [
        `customerKey = "${this.props.match.params.customerKey}"`
      ]
    });
  }

  async saveCustomer(customer) {
    return await this.props.api.updatePublic({
      name: 'Biggly.customers',
      where: [
        `customerKey = "${this.props.match.params.customerKey}"`
      ]
    }, customer)
  }

  async deleteCustomer() {
    return await this.props.api.updateAdmin({
      name: 'Biggly.customers',
      where: [
        `customerKey = "${this.state.customerKey}"`
      ]
    });
  }

  // --------------------------------------------------------

  // -------------------- SITES SECTION ---------------------

  // Renders

  NewSiteRender() {

    return (

      <Drawer
        title="Add a site"
        width={620}
        onClose={this.hideNewSite}
        visible={this.state.newSite}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="Site name">
            <Input id="siteName" onChange={this.inputChange} value={this.state.siteName} />
          </Form.Item>
          <Form.Item label="Site URL">
            <Input id="siteUrl" onChange={this.inputChange} value={this.state.siteUrl} />
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
              <Button disabled={!this.validateFormSite()} loading={this.state.disableSubmitButton} onClick={this.handleSubmitSite} type={"primary"}>Add site</Button>
            </Col>
          </Row>


        </div>
      </Drawer>

    );
  }                                    // Drawer to add a site
  EditSiteRender() {


    return (

      <Drawer
        title="Edit site"
        width={620}
        onClose={this.hideEditSite}
        visible={this.state.editSite}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="Site name">
            <Input id="siteName" onChange={this.inputChange} value={this.state.siteName} />
          </Form.Item>
          <Form.Item label="Site URL">
            <Input disabled id="siteUrl" onChange={this.inputChange} value={this.state.siteUrl} />
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
              <Button disabled={!this.validateFormSite()} onClick={this.handleEditSite} type={"primary"}>Update site</Button>
            </Col>
          </Row>


        </div>
      </Drawer>

    );
  }                                    // Drawer to add a site
  SitesRender() {

    var that = this;

    const columns = [{
      title: 'Name',
      dataIndex: 'siteName',
      key: 'siteName',
      sorter: (a, b) => {
        if (a.siteName < b.siteName) { return -1 };
        if (a.siteName > b.siteName) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('siteName', 'site name')
    }, {
      title: 'URL',
      dataIndex: 'siteUrl',
      key: 'siteUrl',
      sorter: (a, b) => {
        if (a.siteUrl < b.siteUrl) { return -1 };
        if (a.siteUrl > b.siteUrl) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('siteUrl', 'site name')
    }, {
      title: '',
      dataIndex: 'customerSiteKey',
      key: 'customerSiteKey',

      render: text => { " " },

    }];

    function onChange(pagination, filters, sorter) {
      //console.log('params', pagination, filters, sorter);
    }

    function viewSite(record) {

      var siteKey = record.customerSiteKey;
      var siteName = record.siteName;
      var siteUrl = record.siteUrl;

      that.setState({ editSite: true, siteKey, siteName, siteUrl });
    }

    return (
      <TabPane tab="Websites" key="1">
        <div>
          <Row>
            <Col span={24} style={{ 'textAlign': 'right' }}>
              <Icon style={{ margin: '15px 0', fontSize: '1.6em' }} type={"plus-circle"} onClick={this.showNewSite} />
            </Col>
          </Row>

          <Table size="small"  onChange={onChange} onRow={(record, rowIndex) => { return { onClick: (event) => { viewSite(record); } } }} rowClassName={'bms_clickable'} rowKey="customerSiteKey" dataSource={this.state.customerSites} columns={columns}>
          </Table>
          <div className={"text-right"}>

          </div>
        </div>
        {this.NewSiteRender()}
        {this.EditSiteRender()}
      </TabPane>
    );

  }                                           // Render the customer sites

  // Actions

  handleSubmitSite = async event => {

    event.preventDefault();

    this.setState({ disableSubmitButton: true })

    this.hideNewSite();

    try {

      await this.saveCustomerSite({
        siteName: this.state.siteName,
        siteUrl: this.state.siteUrl,
      });


      const customerSites = await this.customer_sites();
      this.setState({ customerSites });


      success("New site added");

    } catch (e) {
      alert(e);
    }
  }
  handleEditSite = async event => {

    event.preventDefault();
    this.hideEditSite();

    try {

      await this.editCustomerSite({
        siteName: this.state.siteName,
        siteUrl: this.state.siteUrl
      });


      const customerSites = await this.customer_sites();
      this.setState({ customerSites });


      success("Site details updated");

    } catch (e) {
      alert(e);
    }
  } 
  validateFormSite() {
    return this.state.siteName.length > 0;
  }                                      // Validate th form for adding a site
  showNewSite = () => {
    this.setState({ newSite: true, disableSubmitButton: false, siteName: '', siteUrl: '' });
  }                                           // Toggle show the site drawer
  hideNewSite = () => {
    this.setState({ newSite: false });
  }                                           // Toggle hide the site drawer
  showEditSite = () => {
    this.setState({ editSite: true });
  }                                           // Toggle show the site drawer
  hideEditSite = () => {
    this.setState({ editSite: false });
  }                                           // Toggle hide the site drawer


  customer_sites = () => {


    let sites = this.props.api.listAdmin({
      name: 'Biggly.customerSites',
      columns: [
        {name: 'siteName'},
        {name: 'siteUrl'}
      ],
      where: [
        `customerKey = "${this.props.match.params.customerKey}"`
      ]
    })

    return sites;
  }                                        // API call to get the customer sites
  saveCustomerSite = async (customerSite) => {

    customerSite.customerKey = this.props.match.params.customerKey;

    let result = await this.props.api.createPublic({
      name: 'Biggly.customer_sites',
    }, customerSite, 'customerSiteKey')
    return result;

  }                          // API call to save a customer site
  editCustomerSite = async(customerSite) => {

    let result = await this.props.api.updatePublic({
      name: 'Biggly.customer_sites',
      where: [
        `customerSiteKey = "${this.state.siteKey}"`
      ]
    }, customerSite);

    return result;
  }                          // API call to save a customer site


  // --------------------------------------------------------


  // -------------------- NOTES SECTION ---------------------

  // Renders
  EditNotesRender() {

    return (

      <Drawer
        title="Edit note"
        width={620}
        onClose={this.hideEditNote}
        visible={this.state.editNote}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="Details">
            <Input.TextArea id="noteDetails" onChange={this.inputChange} value={this.state.noteDetails} />
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
              <Button disabled={!this.validateFormNote()} onClick={this.handleEditNote} type={"primary"}>Update note</Button>
            </Col>
          </Row>


        </div>
      </Drawer>

    );
  }                                    // Drawer to add a site
  NewNoteRender() {

    return (

      <Drawer
        title="New note"
        width={620}
        onClose={this.hideNewNote}
        visible={this.state.newNote}
      >
        <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
          <Form.Item label="Note details">
            <TextArea autosize={{ minRows: 15 }} id="noteDetails" onChange={this.inputChange} value={this.state.noteDetails} />
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
              <Button disabled={!this.validateFormNote()} onClick={this.handleSubmitNote} type={"primary"}>Add note</Button>
            </Col>
          </Row>


        </div>
      </Drawer>

    );
  }                                    // Drawer to add a site
  NotesRender() {

    var that = this;

    const columns = [{
      title: 'Created',
      dataIndex: 'createdOn',
      key: 'createdOn',
      render: item =>
        <Moment format="Do MMM YYYY">
          {item}
        </Moment>,
      sorter: (a, b) => {
        if (a.createdOn < b.createdOn) { return -1 };
        if (a.createdOn > b.createdOn) { return 1 };
        return 0;
      },
    }, {
      title: 'Details',
      dataIndex: 'noteDetails',
      key: 'noteDetails',
      sorter: (a, b) => {
        if (a.noteDetails < b.noteDetails) { return -1 };
        if (a.noteDetails > b.noteDetails) { return 1 };
        return 0;
      },
      ...this.searchGetColumnProps('noteDetails', 'note details')
    }, {
      title: '',
      dataIndex: 'customerNoteKeu',
      key: 'customerNoteKey',

      render: text => { " " },

    }];

    function onChange(pagination, filters, sorter) {
      console.log('params', pagination, filters, sorter);
    }

    function viewNote(record) {

      var customerNoteKey = record.customerNoteKey;
      var noteDetails = record.noteDetails;
      var createdOn = record.createdOn;

      that.setState({ editNote: true, customerNoteKey, noteDetails, createdOn });

    }

    return (
      <TabPane tab="Notes" key="3">
        <div>
          <Row>
            <Col span={24} style={{ 'textAlign': 'right' }}>
              <Icon style={{ margin: '15px 0', fontSize: '1.6em' }} onClick={this.showNewNote} type={"plus-circle"} />
            </Col>
          </Row>

          <Table size="small"  onChange={onChange} rowClassName={'bms_clickable'} onRow={(record, rowIndex) => { return { onClick: (event) => { viewNote(record); } } }} rowKey="customerNoteKey" dataSource={this.state.customerNotes} columns={columns}>
          </Table>


        </div>

        {this.EditNotesRender()}
        {this.NewNoteRender()}
      </TabPane>
    );
  }                                           // Render the notes section


  // Actions

  showEditNote() {
    this.setState({ editNote: true });
  }                                      // Toggle show the customer drawer
  hideEditNote() {
    this.setState({ editNote: false });
  }                                      // Toggle hide the customer drawer
  showNewNote() {
    console.log("showing new note form");
    this.setState({ newNote: true });
  }                                      // Toggle show the customer drawer
  hideNewNote() {
    this.setState({ newNote: false });
  }                                      // Toggle hide the customer drawer
  handleSubmitNote = async event => {

    event.preventDefault();
    this.setState({ newNote: false });

    this.setState({ isLoadingNotes: true });

    try {

      await this.saveCustomerNote({
        noteDetails: this.state.noteDetails,
      });

      const customerNotes = await this.customer_notes();
      this.setState({ customerNotes });


      success("New note added");

    } catch (e) {
      alert(e);
    }
  }                       // Call the API to add a new note
  handleEditNote = async event => {

    event.preventDefault();
    this.hideEditNote();

    try {

      await this.editCustomerNote({
        noteDetails: this.state.noteDetails
      });


      const customerNotes = await this.customer_notes();
      this.setState({ customerNotes });


      success("Customer note updated");

    } catch (e) {
      alert(e);
    }
  }                       // Call the API to add a new site
  toggleNewNote() {

    this.setState({ isNewNote: !this.state.isNewNote });
  }                                         // Show or hide the new note form
  validateFormNote() {
    return this.state.noteDetails.length > 0;
  }                                      // Validate the form in a new note


  // API calls

  customer_notes = async() => {

    let notes = await this.props.api.listPublic({
      name: 'Biggly.customer_notes',
      columns: [
        {name: 'noteDetails'}
      ],
      where: [
         `customerKey = "${this.props.match.params.customerKey}"`
      ]
    })

    return notes;
  }                                        // API call to get customer notes
  saveCustomerNote = async(customerNote) => {

    customerNote.customerKey = this.props.match.params.customerKey;
    return await this.props.api.createPublic({
      name: 'Biggly.customer_notes'
    }, customerNote, 'customerNoteKey')

  }                          // API call to save a new customer note
  editCustomerNote = async(customerNote) => {

    return await this.props.api.updatePublic({
      name: 'Biggly.customer_notes',
      where: [
        `customerNoteKey = "${this.state.customerNoteKey}"`
      ]
    }, customerNote) 

  }                          // API call to save a new customer note

  // --------------------------------------------------------


  render() {

    const columns = [
      {
        title: 'File Name',
        dataIndex: 'fileName',
        key: 'fileName',
        render: (fileName, record) => (
          <a href={unescape(record.urlName)}>{fileName}</a>
        )
      },
      {
        title: 'Booking',
        dataIndex: 'bookingsKey',
        key: 'bookingsKey',
        render: (bookingsKey, record) => 
          bookingsKey ?
          <Icon type="check" style={{color: color('template', 'colorLabel', 'green').color}} />
          :
          ''
      },
      {
        title: 'Campaign',
        dataIndex: 'campaignKey',
        key: 'campaignKey',
        render: (campaignKey, record) => 
          campaignKey ?
          <Icon type="check" style={{color: color('template', 'colorLabel', 'green').color}} />
          :
          ''
      },
      {
        title: 'Uploaded By',
        dataIndex: 'uploadedUserName',
        key: 'uploadedUserName',
      },
      {
        title: 'Created',
        dataIndex: 'created',
        key: 'created',
        defaultSortOrder: 'descend',
        sorter: (a,b) => moment(a).format() - moment(b).format(),
        render: created => moment(created).format('l')
      },
      
    ]

    return (

      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>

        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false} style={{ 'width': '100%' }}>
              {this.CustomerRender()}
            </Card>
          </Col>

          <Col span={24}>

            <Card bordered={false} style={{ 'width': '100%', marginTop: 15 }}>
              <Tabs defaultActiveKey="4">
                {this.SitesRender()}
                <TabPane tab="Products" key="2">
                  List of products
                </TabPane>
                {this.NotesRender()}

                <TabPane tab="Uploads" key="4">
                  {
                    this.state.customer &&
                    <Table size="small" 
                      rowKey={record => record.uploadsKey}
                      columns={columns}
                      dataSource={this.state.uploads}
                    />
                  }
                </TabPane>

              </Tabs>
            </Card>

          </Col>

        </Row>

      </Content>

    );
  }                                                // Render the whole page
}

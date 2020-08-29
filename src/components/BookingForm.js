import React, { Component } from 'react';
import BigglyJsonForm from './BigglyJsonForm';
import { API } from '../libs/apiMethods';
import Actions from '../actions/booking-hub/Actions'
import SocketLibrary from '../libs/SocketLibrary'
import color from '../libs/bigglyStatusColorPicker';
import jsonFormSanitiser from '../libs/jsonFormSanitiser';
import { 
  InputNumber,
  Skeleton,
  message,
  Layout,
  Card,
  Input,
  Col,
  Form,
  DatePicker,
  Row,
  Select,
  Drawer,
  Button
} from 'antd';
import moment from 'moment';
import BigglyGetMenu from './BigglyGetMenu';
import './BookingForm.css';

const { Option } = Select;
const { Content } = Layout;

export default class BookingForm extends Component {
  actions = new Actions(this.props.user.apiKey, this.props.user.userKey)
  state = {
    template: {},
    jsonForm: [],
    jsonFlags: [],
    formFields: {
      bookingName: '',
      dueDate: null,
      customerKey: null,
      partnerKey: null,
      createdPartnerKey: null,
      assignedPartnerKey: null,
      flags: null,
    },
    templateSelection: [],
    quantity: 1,
    buttonDisabled: false,
    customers: [],

    // New customer...
    showDrawer: false,
    confirmLoading: false,

    customerName: '',
    partnerKey: '',
    addressLine1: '',
    addressLine2: '',
    addressLine3: '',
    emailAddress: '',
    postCode: '',
    telephone: '',
    townName: '',
    partnerAccMan: '',

    newCustomerKey: ''

  };

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  componentDidMount = async () => {
    this.props.changeHeader(...this.props.changeHeaderProps);
    this.loadDataAndSetState();
  }

  loadDataAndSetState = async(stateCopy) => {
    if(!stateCopy) stateCopy = { ...this.state };
    //TODO the items in templates needs to be formatted for the
    //cascader...
    stateCopy.showDrawer = false;
    stateCopy.confirmLoading = false;
    stateCopy.customers = await this.getCustomers();
    if(!(this.props.removeFields || []).includes('flags')) stateCopy.jsonFlags = await this.getFlags();
    if(stateCopy.customers) this.setState(stateCopy);
  } 

  // █▀▀█ █▀▀█ ░▀░   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █▄▄█ █░░█ ▀█▀   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀░░▀ █▀▀▀ ▀▀▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  getFlags = async () =>{
    let bookingDivision = await this.actions.getBookingFormBookingDiv(this.props.bookingDivKey)
    if(!bookingDivision) {
      message.error('There was an error getting the flags for this form');
      return null;
    }
    return bookingDivision.jsonFlags;
  }

  getCustomers = async () => {
    let customers = await this.actions.getCustomers(this.props.user.partnerKey)
    if(!customers) return {};
    return customers.map(customer => {
      return { value: customer.customerName, label: customer.customerName, ...customer }
    });

  }

  saveBookingAndAudit = async (initialStatus) => {
    let stateCopy = { ...this.state };
    stateCopy.buttonDisabled = true;
    let jsonForm = jsonFormSanitiser(stateCopy.jsonForm);
    let bookingResult;
    let auditResult;
    let bookingBody = {
      customerKey: stateCopy.formFields.customerKey,
      createdUserKey: this.props.user.userKey,
      bookingName: escape(stateCopy.formFields.bookingName),
      dueDate: stateCopy.formFields.dueDate,
      bookingDivKey: stateCopy.template.bookingDivKey,
      jsonStatus: jsonFormSanitiser(this.initialiseJsonStatus(stateCopy.template.jsonStatus, initialStatus)),
      currentStatus: initialStatus,
      tmpKey: stateCopy.template.tmpKey,
      partnerKey: stateCopy.formFields.partnerKey,
      assignedPartnerKey: stateCopy.formFields.assignedPartnerKey,
      createdPartnerKey: stateCopy.formFields.createdPartnerKey,
      flags: JSON.stringify(stateCopy.formFields.flags),
      jsonForm: jsonForm,
      colorLabel: stateCopy.template.colorLabel
    };

    // KEEP: This legacy api endpoint creates more than one booking by the 'quantity' param. We can do it
    // but the results are different and so the audit doesn't get made. Also we'd need to do some logic for
    // the group names eg '1 of 4'.
    try {
      bookingResult = await API.post(this.props.stage, `/bookingpublic/key/${this.props.user.apiKey}/bookings/quantity/${stateCopy.quantity}`, {
        ...bookingBody
      });
    } catch (err) {
      console.log('There was an error posting the booking: ', err);
      message.error('There was an error saving your booking. Please try again.');
      stateCopy.buttonDisabled = false;
      this.setState(stateCopy)
      return;
    }

    let auditBody = [];

    bookingResult.forEach(result => {
      auditBody.push({
        createdUserKey: this.props.user.userKey,
        bookingsKey: result.key,
        status: initialStatus,
        description: `This booking was created and set to ${initialStatus} status by ${this.props.user.firstName} ${this.props.user.lastName}.`
      });
    });

    // KEEP: this endpoint creates more than one audit.
    try {
      auditResult = await API.post(this.props.stage, `/bookingpublic/key/${this.props.user.apiKey}/audit`, auditBody);
    } catch (err) {
      console.log('There was an error updating the audit: ', err);
      message.error('There was an error saving an audit for your booking.');
      stateCopy.buttonDisabled = false;
      this.setState(stateCopy)
      // We don't want to cancel the rest of the action if the audit doesn't get created.
      // return;
    }

    if (stateCopy.quantity === 1) {
      this.redirectToBooking(stateCopy, bookingResult, auditResult);
    } else if (stateCopy.quantity > 1) {
      this.redirectToBookingsTable(stateCopy, bookingResult, auditResult);
    }

    // TODO remove this when the legacy api endpoint has been changed to jseq,
    // it manually sends a socket event to the 'Booking' channel.
    let socketLib = new SocketLibrary()
    await socketLib.transmit(this.props.bookingDivKey)



  }


  // █▀▀ █░░█ █▀▀ ▀▀█▀▀ █▀▀█ █▀▄▀█   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █░░ █░░█ ▀▀█ ░░█░░ █░░█ █░▀░█   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀▀▀ ░▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀▀ ▀░░░▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  replacer = (key, value) => {
    if (typeof value === 'string') {
      value = value.replace(/\\/g, '');
      value = value.replace(/\t/g, '  ');
      return value.replace(/"/g, '\'');
    }
    return value;
  }

  redirectToBookingsTable = (stateCopy, bookingResult, auditResult) => {
    let errors = [];
    for (let result of bookingResult) {
      if (result.error) errors.push(result);
    }
    if (errors.length === 0) {
      message.success('Saved!', 2);
      message.loading('Redirecting you to the Bookings Table...', 2);
      // find the current path and replace the end with booking and the
      // bookingsKey
      const path = this.props.location.pathname.slice(0, this.props.location.pathname.lastIndexOf('/'));
      setTimeout(() => this.props.history.push(path), 2000);
    } else {
      message.error('There was an error saving some of your bookings.');
      stateCopy.buttonDisabled = false;
      this.setState(stateCopy)
    }
  }

  redirectToBooking = (stateCopy, bookingResult, auditResult) => {
    if (bookingResult[0].affectedRows === 1 && auditResult[0].affectedRows === 1) {
      message.success('Saved!', 2);
      message.loading('Redirecting you to the booking...', 2);
      // find the current path and replace the end with booking and the
      // bookingsKey
      const path = this.props.location.pathname.slice(0, this.props.location.pathname.lastIndexOf('/')) + '/booking/' + bookingResult[0].key;
      setTimeout(() => this.props.history.push(path), 2000);
    } else {
      message.error('There was an error saving the form, please try again', 3);
      console.log('Form error bookingResult[0]: ', bookingResult[0]);
      console.log('bookingBody: ', stateCopy.bookingBody);
      console.log('Form error auditResult[0]: ', auditResult[0]);
      console.log('auditBody: ', stateCopy.auditBody);
      stateCopy.buttonDisabled = false;
      this.setState(stateCopy)
    }
  }

  initialiseJsonStatus = (jsonStatus, initialStatus) => {
    if (initialStatus === 'Live') {

      return jsonStatus.map(item => (
        item.value === initialStatus ?
          { value: 'Live', role: 'Anyone' }
          :
          item
      ));

    } else {

      return jsonStatus.map(item => (
        item.value === initialStatus ?
          { value: 'Draft', role: 'Creator' }
          :
          item
      ));
    }
  }
  handleNum = (key, value) => {
    let stateCopy = { ...this.state };
    stateCopy.formFields[key] = value;
    this.setState(stateCopy);
  }
  handleDivChoice = (option, selectedOptions) => {
    let stateCopy = { ...this.state };
    stateCopy.formFields.bookingDivKey = option.bookingDivKey;
    this.setState(stateCopy);
  }

  handleChooseCustomerAndCreatedPartner = (option, selectedOptions) => {
    let stateCopy = { ...this.state };
    // TODO in future this part where the partnerKey is set can be deleted...
    stateCopy.formFields.partnerKey = selectedOptions[0].partnerKey;
    // ...instead we'll only need this createdPartnerKey
    stateCopy.formFields.createdPartnerKey = selectedOptions[0].partnerKey;
    stateCopy.formFields.customerKey = option.customerKey;
    this.setState(stateCopy);
  }

  handleChooseAssignedPartner = option => {
    let stateCopy = { ...this.state };
    if(option) {
      stateCopy.formFields.assignedPartnerKey = option.partnerKey;
    } else {
      stateCopy.formFields.assignedPartnerKey = null;
    }
    this.setState(stateCopy);
  }

  momentValue = (value) => {
    if (value === null) return null;
    return new moment(value);
  };

  handleQuantity = number => {
    this.setState({ quantity: number });
  }

  handleTemplateSelection = (option, optionArray) => {
    let stateCopy = { ...this.state };
    stateCopy.templateSelection = optionArray;
    stateCopy.template = option;
    stateCopy.jsonForm = option.jsonForm;
    this.setState(stateCopy);
  }

  handleSearchableTemplateSelection = customer => {
    let stateCopy = { ...this.state };
    stateCopy.formFields.customerKey = customer.customerKey;
    stateCopy.formFields.partnerKey = customer.partnerKey;
    stateCopy.formFields.createdPartnerKey = customer.partnerKey;
    this.setState(stateCopy);
  }

  addCustomer = async () => {
    let result = await this.actions.createCustomer({
      userKey: this.props.user.userKey,
      customerName: this.state.customerName,
      partnerKey: this.props.user.partnerKey,
      addressLine1: this.state.addressLine1,
      addressLine2: this.state.addressLine2,
      addressLine3: this.state.addressLine3,
      emailAddress: this.state.emailAddress,
      postCode: this.state.postCode,
      telephone: this.state.telephone,
      partnerAccMan: this.state.partnerAccMan,
      townName: this.state.townName
    })
    return result.key;
  }

  validateCustomerForm = () => {
    let valid = true;
    if(
      this.state.customerName.length === 0
    ) valid = false;
    return valid;
  }

  handleCustomerFormInput = (field, value) => {
    this.setState({[field]: value});
  }

  handleSubmitCustomerForm = async() => {
    if(!this.validateCustomerForm()) {
      message.error('Please fill in all required fields before saving.');
      return;
    }
    this.setState({confirmLoading: true});
    let result = await this.addCustomer();
    if(!result) {
      message.error('There was an error trying to save this customer.');
      return;
    }

    let stateCopy = {...this.state};

    stateCopy.formFields.customerKey = result;
    stateCopy.formFields.partnerKey = this.props.user.partnerKey;

    await this.loadDataAndSetState(stateCopy);
    message.success('Customer saved')
  }

  handleOpenAddCustomerDrawer = () => {
    this.setState({
      showDrawer: true,
      customerName: '',
      partnerKey: '',
      addressLine1: '',
      addressLine2: '',
      addressLine3: '',
      emailAddress: '',
      postCode: '',
      telephone: '',
      townName: '',
      partnerAccMan: '',
    });
  }

  // ░░▀ █▀▀ █▀▀█ █▀▀▄ █▀▀ █▀▀█ █▀▀█ █▀▄▀█
  // ░░█ ▀▀█ █░░█ █░░█ █▀▀ █░░█ █▄▄▀ █░▀░█
  // █▄█ ▀▀▀ ▀▀▀▀ ▀░░▀ ▀░░ ▀▀▀▀ ▀░▀▀ ▀░░░▀

  changeField = (formObj, key, value) => {
    value = this.replacer(key, value);
    formObj[key] = value;
    this.setState(this.state);
  };

  submitForm = async (initialStatus) => {
    if (!initialStatus) initialStatus = 'Draft';
    let stateCopy = { ...this.state };
    stateCopy.buttonDisabled = true;
    this.setState(stateCopy);
    if (!this.props.update) {
      console.log('update from here')
      this.saveBookingAndAudit(initialStatus);
    } else {
      console.log('update from props')
      let resultingState = await this.props.update(this.state, initialStatus);
      this.loadDataAndSetState(resultingState);
    }
  };

  changeMulti = (field, fieldIndex) => {
    let stateCopy = { ...this.state };
    stateCopy.jsonForm[fieldIndex] = field;
    this.setState(stateCopy);
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderAddCustomerDrawer = () => {
    return (
      <div>
        <Drawer
          width={620}
          title="Add a new Customer"
          visible={this.state.showDrawer}
          confirmLoading={this.state.confirmLoading}
          onClose={() => this.setState({showDrawer: false})}
        >
          <Form.Item required label="Customer Name">
            <Input
              onChange={e => this.handleCustomerFormInput('customerName', e.target.value)}
              value={this.state.customerName}
            />
          </Form.Item>
          <Form.Item label="Partner Account Manager">
            <Input
              onChange={e => this.handleCustomerFormInput('partnerAccMan', e.target.value)}
              value={this.state.partnerAccMan}
            />
          </Form.Item>
          <Form.Item label="Address">
            <Input
              onChange={e => this.handleCustomerFormInput('addressLine1', e.target.value)}
              value={this.state.addressLine1}
            />
          </Form.Item>
          <Form.Item>
            <Input
              onChange={e => this.handleCustomerFormInput('addressLine2', e.target.value)}
              value={this.state.addressLine2}
            />
          </Form.Item>
          <Form.Item>
            <Input
              onChange={e => this.handleCustomerFormInput('addressLine3', e.target.value)}
              value={this.state.addressLine3}
            />
          </Form.Item>
          <Form.Item label="Town">
            <Input
              onChange={e => this.handleCustomerFormInput('townName', e.target.value)}
              value={this.state.townName}
            />
          </Form.Item>
          <Form.Item label="Post Code">
            <Input
              onChange={e => this.handleCustomerFormInput('postCode', e.target.value)}
              value={this.state.postCode}
            />
          </Form.Item>
          <Form.Item label="Telephone">
            <Input
              onChange={e => this.handleCustomerFormInput('telephone', e.target.value)}
              value={this.state.telephone}
            />
          </Form.Item>
          <Form.Item label="Email">
            <Input
              onChange={e => this.handleCustomerFormInput('emailAddress', e.target.value)}
              value={this.state.emailAddress}
            />
          </Form.Item>
          <div 
            style={{textAlign: 'right'}}
          >
            <Button
              onClick={() => this.setState({showDrawer: false})}
            >Cancel</Button>
            <Button
              type="primary"
              disabled={!this.validateCustomerForm()}
              onClick={this.handleSubmitCustomerForm}
            >Save</Button>
          </div>
        </Drawer>
      </div>
    )
  }

  addDatePickerID = () => {

    // Wait till the dropdown has appeared then add 'modified-datepicker' to the element
    // so we can target it with our own styles. See the styles under #modified-datepicker
    // in BookingForm.css
    setTimeout(() => {
      let dropdown = document.getElementsByClassName('ant-calendar-picker-container')[0]

      if(dropdown.id === 'modified-datepicker') return

      dropdown.id = 'modified-datepicker'
    },1)


  }

  render() {
    let date = null;
    const { template } = this.state;
    const templateColor = template.colorLabel ? color('template', 'colorLabel', template.colorLabel).color : null;
    const api = this.props.api;
    const user = this.props.user;
    return (
      <div>
        {this.renderAddCustomerDrawer()}
        <Content style={{
          margin: '94px 16px 24px', padding: 24, minHeight: 280,
        }}>
          <Row>
            <Col span={24}>
              <Card style={{ marginBottom: '16px' }}>
                <Row>
                  <Col span={12}>
                    {
                      this.state.template.tmpName ?
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '17px',
                            height: '17px',
                            borderRadius: '50%',
                            marginRight: '10px',
                            backgroundColor: templateColor,
                          }}></div>
                          <h1 style={{ marginBottom: 0 }}>{this.state.template.tmpName}</h1>
                        </div>
                        :
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{
                            width: '17px',
                            height: '17px',
                            borderRadius: '50%',
                            marginRight: '10px',
                            backgroundColor: '#d9d9d9',
                          }}></div>
                          <h1 style={{ marginBottom: 0, color: '#d9d9d9' }}>Template Name</h1>
                        </div>
                    }
                  </Col>

                </Row>
              </Card>
            </Col>
          </Row>
          <Row>
            <Col span={24}>
              <Card style={{ marginBottom: '16px' }}>
                <Row gutter={16}>
                  <Col span={24}>
                    <Form.Item label="Booking Name">
                      <Input
                        onChange={e => {
                          this.changeField(this.state.formFields, 'bookingName', e.target.value);
                        }}
                        value={this.state.formFields.bookingName}
                      />
                    </Form.Item>
                  </Col>
                  <Col span={6}>
                    <Form.Item label="Template">
                      {
                        !this.props.bookingDivKey ?
                        <BigglyGetMenu
                          cascaderAttr={{
                            placeholder: 'Choose a Template',
                            style: { textAlign: 'left' },
                            allowClear: false,
                            value: (
                              this.state.templateSelection &&
                              this.state.templateSelection.map(item => item.value)
                            )
                          }}
                          apiKey={this.props.user.apiKey}
                          menuSelectionFunction={this.handleTemplateSelection}
                          menuOptions={[
                            {
                              optionKey: 'bookingDivName',
                              typeDisplay: 'Booking Divisions',
                              isLeaf: false,
                              async get(apiKey) {
                                return await api.listAdmin({
                                  name: 'bms_booking.bookingDivisions',
                                  columns: [
                                    {name: 'bookingDivKey'},
                                    {name: 'bookingDivName'},
                                  ]
                                });
                              }
                            },
                            {
                              optionKey: 'tmpName',
                              typeDisplay: 'Booking Division Templates',
                              isLeaf: true,
                              getKeys: ['bookingDivKey'],
                              async get(apiKey, getKey) {
                                return await api.listAdmin({
                                  name: 'bms_booking.divisionTemplates',
                                  columns: [
                                    {name: 'tmpKey'},
                                    {name: 'tmpName'},
                                    {name: 'jsonForm'},
                                    {name: 'bms_booking.bookingDivisions', columns: [
                                      {name: 'jsonStatus'}
                                    ], where: [
                                      'bookingDivisions.bookingDivKey = divisionTemplates.bookingDivKey'
                                    ]},
                                    {name: 'colorLabel'},
                                    {name: 'bookingDivKey'},
                                  ],
                                  where: [
                                    `bookingDivKey = "${getKey}"`
                                  ]
                                })
                              }
                            }
                          ]}
                        />
                        :
                        <BigglyGetMenu
                          cascaderAttr={{
                            placeholder: 'Choose a Template',
                            style: { textAlign: 'left' },
                            allowClear: false,
                            value: (
                              this.state.templateSelection &&
                              this.state.templateSelection.map(item => item.value)
                            )
                          }}
                          apiKey={this.props.user.apiKey}
                          menuSelectionFunction={this.handleTemplateSelection}
                          menuOptions={[
                            {
                              optionKey: 'tmpName',
                              typeDisplay: 'Booking Division Templates',
                              isLeaf: true,
                              getKeys: [this.props.bookingDivKey],
                              async get(apiKey, getKey) {
                                let result = await api.listPublic({
                                  name: 'bms_booking.divisionTemplates',
                                  columns: [
                                    {name: 'tmpKey'},
                                    {name: 'tmpName'},
                                    {name: 'jsonForm'},
                                    {name: 'bms_booking.bookingDivisions', columns: [
                                      {name: 'jsonStatus'}
                                    ], where: [
                                      'bookingDivisions.bookingDivKey = divisionTemplates.bookingDivKey'
                                    ]},
                                    {name: 'colorLabel'},
                                    {name: 'bookingDivKey'},
                                  ],
                                  where: [
                                    `bookingDivKey = "${getKey}"`
                                  ]
                                });
                                return result;
                              }
                            }
                          ]}
                        />
                      }
                    </Form.Item>
                  </Col>
                  {
                    !((this.props.removeFields || []).length > 0 && (this.props.removeFields || []).includes('quantity')) &&
                    <Col span={6}>
                      <Form.Item label="Quantity">
                        <InputNumber min={1} max={50} onChange={this.handleQuantity} value={this.state.quantity} />
                      </Form.Item>
                    </Col>
                  }
                  {
                    !((this.props.removeFields || []).length > 0 && (this.props.removeFields || []).includes('customerKey')) &&
                    <Col span={6}>
                        {
                          this.props.user.accessLevel === 'Provider' ?
                          <Form.Item label="Customer">
                            {
                              <BigglyGetMenu
                                apiKey={this.props.user.apiKey}
                                menuOptions={[
                                  {
                                    typeDisplay: 'Customers',
                                    optionKey: 'customerName',
                                    isLeaf: true,
                                    async get(apiKey) {
                                      return await api.listPublic({
                                        name: 'Biggly.customers',
                                        columns: [
                                          {name: 'customerKey'},
                                          {name: 'customerName'},
                                          {name: 'partnerKey'},
                                        ],
                                        where: [
                                          `customers.partnerKey = "${user.partnerKey}"`
                                        ]
                                      })
                                    }
                                  }
                                ]}
                                menuSelectionFunction={this.handlePackageSelection}
                              />
                            }
                          </Form.Item>
                          :
                          <Form.Item label="Customer">
                            <BigglyGetMenu
                              apiKey={this.props.user.apiKey}
                              menuSelectionFunction={this.handleChooseCustomerAndCreatedPartner}
                              menuOptions={[
                                {
                                  typeDisplay: 'Partners',
                                  optionKey: 'partnerName',
                                  isLeaf: false,
                                  async get(userApiKey) {
                                    return await api.listPublic({
                                      name: 'Biggly.partners',
                                      columns: [
                                        {name: 'partnerKey'},
                                        {name: 'partnerName'},
                                        {name: 'apiKey'},
                                      ]
                                    });
                                  }
                                },
                                {
                                  typeDisplay: 'Customers',
                                  optionKey: 'customerName',
                                  isLeaf: true,
                                  getKeys: ['partnerKey'],
                                  async get(userApiKey, partnerKey) {
                                    return await api.listPublic({
                                      name: 'Biggly.customers',
                                      columns: [
                                        {name: 'customerName'},
                                        {name: 'customerKey'},
                                        {name: 'partnerKey'},
                                      ],
                                      where: [
                                        `partnerKey = "${partnerKey}"`
                                      ]
                                    });
                                  }
                                }
                              ]}
                            />
                          </Form.Item>
                        }
                    </Col>
                  }
                  {
                    !((this.props.removeFields || []).length > 0 && (this.props.removeFields || []).includes('partnerKey')) &&
                    <Col span={6}>
                      <Form.Item label="Assigned Partner (optional)">
                        <BigglyGetMenu
                          apiKey={this.props.user.apiKey}
                          menuSelectionFunction={this.handleChooseAssignedPartner}
                          menuOptions={[
                            {
                              typeDisplay: 'Partners',
                              optionKey: 'partnerName',
                              isLeaf: true,
                              async get(userApiKey) {
                                return await api.listPublic({
                                  name: 'Biggly.partners',
                                  columns: [
                                    {name: 'partnerKey'},
                                    {name: 'partnerName'},
                                    {name: 'apiKey'},
                                  ]
                                });
                              }
                            }
                          ]}
                        />
                      </Form.Item>
                    </Col>
                  }
                  {
                    !((this.props.removeFields || []).length > 0 && (this.props.removeFields || []).includes('dueDate')) &&
                    <Col span={6}>
                      <Form.Item label="Due Date">
                        <DatePicker
                          onOpenChange={() => this.addDatePickerID()}
                          disabledDate={current => (
                            current < moment().subtract(1, 'days')
                          )}
                          onChange={moment => {
                            if (moment) date = moment.toDate()
                            this.changeField(this.state.formFields, 'dueDate', date);
                          }}
                          value={this.momentValue(this.state.formFields.dueDate)}
                        ></DatePicker>
                      </Form.Item>
                    </Col>
                  }
                  {
                    !((this.props.removeFields || []).length > 0 && (this.props.removeFields || []).includes('flags')) &&
                    <Col span={6}>
                      <Form.Item label="Flags (optional)">
                        {/*
                          <Select
                            allowClear
                            style={{width: '100%', maxWidth: 215}}
                            placeholder="Please Select"
                            onChange={val => this.changeField(this.state.formFields, 'flagged', val)}
                          >
                            {
                              (this.state.jsonFlags || []).map((flagObj,i) => (
                                <Option
                                  key={i}
                                  value={flagObj.value}
                                >{flagObj.value}</Option>
                              ))
                            }
                          </Select>
                          */}

                        <Select
                          allowClear
                          style={{width: '100%', maxWidth: 215}}
                          mode="tags"
                          placeholder="Please Select"
                          defaultValue={(this.state.division || {}).accessLevels || []}
                          onChange={vals => this.changeField(this.state.formFields, 'flags', vals)}
                          // onChange={this.handleAccessLevels}
                        >
                          {
                            (this.state.jsonFlags || []).map((flagObj,i) => (
                              <Option
                                key={i}
                                value={flagObj.value}
                              >{flagObj.value}</Option>
                            ))
                          }
                        </Select>
                      </Form.Item>
                    </Col>
                  }
                </Row>
              </Card>
            </Col>
            <Col span={24}>
              <Card>
                {
                  // The form validation looks for objects with a 'value' key.
                  // To add extra fields to validate just add them as extra objects
                  // with the field's value as the input field.
                  this.state.template.tmpKey ?
                    <BigglyJsonForm
                      skipValidation={this.props.skipValidation}
                      jsonForm={this.state.jsonForm}
                      changeMulti={this.changeMulti}
                      submitForm={this.submitForm}
                      changeField={this.changeField}
                      validateCondition={this.props.validation(this.state)}
                      removeRequiredTags={this.props.removeRequiredTags}
                      saveStatusButtons={this.props.saveStatusButtons}
                    ></BigglyJsonForm>
                    :
                    <Skeleton />
                }
              </Card>
            </Col>
          </Row>
        </Content>
      </div>
    )
  }
}

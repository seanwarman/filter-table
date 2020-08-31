import React, { Fragment } from 'react'
import { connect  } from 'react-redux'
import api from '../../libs/apiMethods';
import moment from 'moment'
import { 
  Checkbox,
  DatePicker, 
  Row, 
  Col, 
  Button, 
  InputNumber, 
  Form, 
  Select, 
} from 'antd'

import {
  convertJsonKeys,
} from './BookingsTable.utils'

import {
  saveBulkFields
} from './BookingsTable.actions'

import BigglyGetMenu from '../../components/BigglyGetMenu.js'

const bulkStyles = {
  marginBottom: 4
}

const intialState = {
  biggSpend: null,
  currentTab: null,
  division: null,
  dueDate: null,
  onClick: null,
  units: null,

  clearFlags: null,
  fields: {},

  renderInputs: true,
}

class BulkEdit extends React.Component {

  state = intialState

  onSave = () => {

    const { fields } = this.state

    this.props.saveBulkFields(convertJsonKeys(fields))

  }

  handleChangeFields = (value, key) => {

    this.setState((state) => ({
      fields: {
        ...state.fields,
        [key]: value
      }
    }))
  }

  clear = () => {
    this.setState({
      ...intialState,
      renderInputs: false,
    })

    setTimeout(() => {
      this.setState({ renderInputs: true })
    }, 500)
  }

  setClearFlags = () => {
    this.setState(state => ({
      fields: {
        ...state.fields,
        flags: []
      }
    }))

  }

  setIgnoreFlags = () => {
    this.setState(state => {

      const { flags, ...fields } = this.state.fields

      return { fields }

    })

  }

  onChangeFlags = flags => {

    const { clearFlags } = this.state

    if(clearFlags) return this.setClearFlags()

    // Remove flags completely if the length is 0, this prevents
    // the flags from updating the selected bookings.
    if(flags.length === 0) return this.setIgnoreFlags()

    this.handleChangeFields(flags, 'flags')
  }

  onChangeClearFlags = e => {
    if(e.target.checked) {
      this.setClearFlags()
    } else {
      this.setIgnoreFlags()
    }

    this.setState({
      clearFlags: e.target.checked
    })
  }

  render() {

    const {
      // currentTab={currentTab}
      api,
      selectedRowKeys,
      apiKey,
      statuses = [],
      flags = [],
      savingBulkFields,
      // userAccessLevel={this.props.user.accessLevel}
      // statuses={division?.jsonStatus?.map(jsonS => jsonS.value)}
      // flags={division?.jsonFlags?.map(jsonF => jsonF.value)}
    } = this.props

    return (
      <Fragment>
        <div>
          <h2>Edit Selected Bookings</h2>
        </div>
        <Row style={{
          marginTop: 40
        }}>
          <Col span={12}>
            <Form.Item
              style={bulkStyles}
              label="Bigg Spend"
            >
              <InputNumber
                // disabled={!accessLevel(3, this.props.currentTab, this.props.userAccessLevel)}
                onChange={value => this.handleChangeFields(value, 'biggSpend')}
                min={0}
                value={this.state.fields.biggSpend}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              style={bulkStyles}
              label="Units"
            >
              <InputNumber
                // disabled={!accessLevel(5, this.props.currentTab, this.props.userAccessLevel)}
                onChange={value => this.handleChangeFields(value, 'units')}
                min={0}
                value={this.state.fields.units}
              />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              style={bulkStyles}
              label="Strategy"
            >
              {
                (selectedRowKeys || []).length > 0 && this.state.renderInputs ?
                  <Select
                    // disabled={!accessLevel(3, this.props.currentTab, this.props.userAccessLevel)}
                    allowClear
                    onSelect={val => this.handleChangeFields(val, 'strategy')}
                    placeholder="Please select"
                    style={{
                      minWidth: 202
                    }}
                  >
                    <Select.Option value="Yell - Professional">Yell - Professional</Select.Option>
                    <Select.Option value="Yell - Premium">Yell - Premium</Select.Option>
                    <Select.Option value="Yell - Premium Plus">Yell - Premium Plus</Select.Option>
                    <Select.Option value="Yell - Elite">Yell - Elite</Select.Option>
                    <Select.Option value="Yell - eCommerce">Yell - eCommerce</Select.Option>
                    <Select.Option value="Yell - Mini A">Yell - Mini A</Select.Option>
                    <Select.Option value="Yell - Mini B">Yell - Mini B</Select.Option>
                    <Select.Option value="Yell - Maintenance">Yell - Maintenance</Select.Option>
                    <Select.Option value="General - Starter">General - Starter</Select.Option>
                    <Select.Option value="General - Premium">General - Premium</Select.Option>
                    <Select.Option value="General - Advanced">General - Advanced</Select.Option>
                    <Select.Option value="Custom">Custom</Select.Option>
                  </Select>
                  :
                  <Select 
                    style={{ minWidth: 202 }}
                    placeholder="Please select"
                    allowClear
                    value={[]} 
                  />
              }
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              style={bulkStyles}
              label="Booking Month"
            >
              {
                (selectedRowKeys || []).length > 0 && this.state.renderInputs ?
                  <Select
                    // disabled={!accessLevel(3, this.props.currentTab, this.props.userAccessLevel)}
                    allowClear
                    onSelect={val => this.handleChangeFields(val, 'bookingMonth')}
                    placeholder="Please select"
                    style={{ minWidth: 202 }}
                  >
                    <Select.Option value="January">January</Select.Option>
                    <Select.Option value="February">February</Select.Option>
                    <Select.Option value="March">March</Select.Option>
                    <Select.Option value="April">April</Select.Option>
                    <Select.Option value="May">May</Select.Option>
                    <Select.Option value="June">June</Select.Option>
                    <Select.Option value="July">July</Select.Option>
                    <Select.Option value="August">August</Select.Option>
                    <Select.Option value="September">September</Select.Option>
                    <Select.Option value="October">October</Select.Option>
                    <Select.Option value="November">November</Select.Option>
                    <Select.Option value="December">December</Select.Option>
                    <Select.Option value="Custom"></Select.Option>
                  </Select>
                  :
                  <Select 
                    style={{ minWidth: 202 }}
                    placeholder="Please select"
                    allowClear
                    value={[]} 
                  />
              }
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              style={bulkStyles}
              label="Customer Name"
            >
              {
                (selectedRowKeys || []).length > 0 && this.state.renderInputs ?
                  <BigglyGetMenu
                    cascaderAttr={{
                      // disabled: !accessLevel(3, this.props.currentTab, this.props.userAccessLevel)
                    }}
                    menuOptions={[
                      {
                        typeDisplay: 'Partners',
                          optionKey: 'partnerName',
                          isLeaf: false,
                          async get(apiKey) {
                            return api.listPublic({
                              name: 't96wz179m4ly7hn9.partners',
                              columns: [
                                { name: 'partnerKey' },
                                { name: 'partnerName' },
                              ]
                            })
                          }
                      },
                      {
                        typeDisplay: 'Customers',
                        optionKey: 'customerName',
                        getKeys: ['partnerKey'],
                        async get(apiKey, partnerKey) {
                          return api.listPublic({
                            name: 't96wz179m4ly7hn9.customers',
                            columns: [
                              { name: 'customerKey' },
                              { name: 'partnerKey' },
                              { name: 'customerName' },
                            ], where: [
                              `partnerKey = "${partnerKey}"`
                            ]
                          })
                        }
                      }
                    ]}
                    menuSelectionFunction={customer => this.handleChangeFields(customer?.customerKey, 'customerKey')}
                  />
                  :
                  <Select 
                    style={{ minWidth: 177 }}
                    placeholder="Please select"
                    allowClear
                    value={[]} 
                  />
              }
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              style={bulkStyles}
              label="Due Date"
            >
              {
                selectedRowKeys.length > 0 && this.state.renderInputs ?
                <DatePicker
                  // disabled={!accessLevel(2, this.props.currentTab, this.props.userAccessLevel)}
                  onChange={momentVal => {
                    this.handleChangeFields(momentVal, 'dueDate')
                  }}
                  // value={this.state.dueDate ? moment(this.state.dueDate) : null}
                />
                :
                <DatePicker value={null} />
              }
            </Form.Item>
          </Col>
          <Col span={12} style={{position: 'relative'}}>
            <div style={{
              position: 'absolute',
              left: 112,
              top: 21
            }}>
              <small>Clear all flags: </small>
              {
                selectedRowKeys.length > 0 && this.state.renderInputs ?
                  <Checkbox
                    defaultValue={this.state.clearFlags}
                    onChange={this.onChangeClearFlags}
                  ></Checkbox>
                  :
                  <Checkbox
                    checked={false}
                  ></Checkbox>
              }
            </div>
            <Form.Item
              style={bulkStyles}
              label="Flags"
            >

              {
                (selectedRowKeys || []).length > 0 && this.state.renderInputs ?
                  <Select
                    defaultValue={[]}
                    mode="tags"
                    // disabled={!accessLevel(5, this.props.currentTab, this.props.userAccessLevel) || clearFlags}
                    allowClear
                    onChange={this.onChangeFlags}
                    placeholder="Please select"
                    style={{ minWidth: 202 }}
                  >
                    {
                      flags?.map((flag,i) => (
                        <Select.Option key={i} value={flag.value}
                        >{flag.value}</Select.Option>
                      ))
                    }
                  </Select>
                  :
                  <Select 
                    style={{ minWidth: 202 }}
                    placeholder="Please select"
                    mode="tags"
                    allowClear
                    value={[]} 
                  />
              }

            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              style={bulkStyles}
              label="Assigned User (does not proceed status)*"
            >
              {
                (selectedRowKeys || []).length > 0 && this.state.renderInputs ?
                  <BigglyGetMenu
                    cascaderAttr={{
                      // disabled: !accessLevel(2, this.props.currentTab, this.props.userAccessLevel)
                    }}
                    apiKey={apiKey}
                    menuSelectionFunction={user => this.handleChangeFields(((user || {}).userKey || ''), 'assignedUserKey')}
                    menuOptions={[
                      {
                        typeDisplay: 'Users',
                          optionKey: 'userName',
                          async get(apiKey) {
                            let records = await api.listPublic({
                              name: 't96wz179m4ly7hn9.users',
                              columns: [
                                { name: 'userKey' },
                                {
                                  name: 'concat=>(firstName " " lastName)',
                                  as: 'userName'
                                }
                              ],
                            })
                            return records.filter(record => (record.userName || '').length > 0)
                          }
                      }
                    ]}
                  />
                  :
                  <Select 
                    style={{ minWidth: 177 }}
                    placeholder="Please select"
                    allowClear
                    value={[]} 
                  />
              }
            </Form.Item>
          </Col>
          {
            statuses &&
              <Col span={12}>
                <Form.Item
                  label="Status"
                  style={bulkStyles}
                >
                  {
                    (selectedRowKeys || []).length > 0 && this.state.renderInputs ?
                      <Select
                        placeholder="Please select"
                        onChange={vals => this.handleChangeFields(vals, 'currentStatus')}
                        style={{ minWidth: 202 }}
                      >
                        <Select.Option
                          value="Draft"
                        >Draft</Select.Option>
                        <Select.Option
                          value="Live"
                        >Live</Select.Option>
                        <Select.Option
                          value="In Progress"
                        >In Progress</Select.Option>
                        <Select.Option
                          value="Complete"
                        >Complete</Select.Option>

                      </Select>
                      :
                  <Select 
                    style={{ minWidth: 202 }}
                    placeholder="Please select"
                    allowClear
                    value={[]} 
                  />
                  }

                </Form.Item>
              </Col>
          }

        </Row>
        <Row
          style={{
            marginTop: 40,
          }}
        >
          <Col
            span={12}
          >
            <Button
              loading={savingBulkFields}
              disabled={Object.keys(this.state.fields).length === 0}
              onClick={this.onSave}
              type="primary"
            >
              Update {selectedRowKeys.length} Selected Bookings
            </Button>
          </Col>
          <Col span={12}>
              <div
                style={{
                  marginTop: 16,
                  textAlign: 'right',
                }}
              >
                <span
                  style={{
                    cursor: 'pointer',
                    color: '#488eff',
                    textDecoration: 'underline',
                    right: 0,
                    zIndex: 1
                  }}
                  onClick={this.clear}
                >Clear</span>
              </div>
          </Col>
        </Row>

      </Fragment>

    )
  }
}

export default connect(
  ({ bookingsTable, app }) => ({
    apiKey: app.user.apiKey,
    api: api(app.user.apiKey),
    selectedRowKeys: bookingsTable.selectedRowKeys,
    savingBulkFields: bookingsTable.savingBulkFields,
    flags: app.flags,
  }),
  {
    saveBulkFields
  }
)(BulkEdit)

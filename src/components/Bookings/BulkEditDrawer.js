import React from 'react'
import moment from 'moment'
import { 
  Checkbox,
  DatePicker, 
  Tabs, 
  Row, 
  Col, 
  Button, 
  InputNumber, 
  Form, 
  Select, 
  Drawer,
} from 'antd'

import BigglyGetMenu from '../BigglyGetMenu.js'
import Comment from '../Comment.js'

function RenderEmptySelect() {
  return <Select
    value={null}
    style={{ minWidth: 202 }}
    placeholder="Please select"
  />
}

function accessLevel(num, currentTab, userAccessLevel) {
  if((num === 3 || num === 4) && currentTab !== 'Draft') num = 1
  if(currentTab === 'Complete') num = 0
  const levels = { 
    0: ['None'],
    1: ['Admin'],
    2: ['Admin','Supplier Admin'],
    3: ['Admin','Provider','Provider Admin'],
    4: ['Admin','Provider','Supplier Admin','Provider Admin'],
    5: ['Admin','Provider','Supplier Admin','Provider Admin'],
    6: ['Admin','Provider Admin'],
  }
  // var result = levels[num].includes(this.props.user.accessLevel)
  // console.log(result)
  return levels[num].includes(userAccessLevel)

}
function saveBulkDisabled(bulkFields) {
  if(
    bulkFields.biggSpend ===  null &&
    bulkFields.units ===  null &&
    bulkFields.strategy ===  '' &&
    bulkFields.dueDate ===  null &&
    bulkFields.createdPartnerKey ===  '' &&
    bulkFields.customerKey ===  '' &&
    bulkFields.bookingMonth ===  '' &&
    bulkFields.assignedUserKey ===  '' &&
    (bulkFields.flags || []).length === 0 &&
    bulkFields.clearFlags === false &&
    bulkFields.currentStatus === ''
  ) {
    return true
  }
  return false
}


export default class BulkEditDrawer extends React.PureComponent {

  //   props: 
  //     selectedRowKeys={this.state.selectedRowKeys}
  //     api={this.props.api}
  //     apiKey={this.props.user.apiKey}
  //     flags={this.state.division?.jsonFlags?.map(jsonF => jsonF.value)}
  //     statuses={this.state.division?.jsonStatus?.map(jsonS => jsonS.value)}
  //     save={this.handleSavebulk}
  //     createComment={this.handleSaveBulkComment}
  //     userAccessLevel={this.props.user.accessLevel}
  //     currentTab={this.state.currentTab}
  //     onClose={() => this.setState({selectedRowKeys: []})}
  //     visible={(this.state.selectedRowKeys || []).length > 0}

  state = {
    biggSpend: null,
    units: null,
    strategy: '',
    dueDate: null,
    createdPartnerKey: '',
    customerKey: '',
    bookingMonth: '',
    assignedUserKey: '',
    flags: [],
    clearFlags: false,
    currentStatus: '',
  }

  handleChangeBulk = (value, fieldName) => {
    this.setState({[fieldName]:  value})
  }

  onSave = async () => {
    await this.props.save(this.state)
    this.setState({
      biggSpend: null,
      units: null,
      strategy: '',
      dueDate: null,
      createdPartnerKey: '',
      customerKey: '',
      bookingMonth: '',
      assignedUserKey: '',
      flags: [],
      clearFlags: false,
      currentStatus: '',
    })
  }

  onClose = () => {
    this.props.onClose()
    this.setState({
      biggSpend: null,
      units: null,
      strategy: '',
      dueDate: null,
      createdPartnerKey: '',
      customerKey: '',
      bookingMonth: '',
      assignedUserKey: '',
      flags: [],
      clearFlags: false,
      currentStatus: '',
    })
  }


  render() {

    const { api } = this.props

    const bulkStyles = {
      marginBottom: 4
    }

    return <Drawer
      onClose={this.onClose}
      mask={false}
      visible={this.props.visible}
      width="610"
    >
      <Tabs>
        <Tabs.TabPane 
          key="Edits"
          tab="Edits"
        >
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
                  disabled={!accessLevel(3, this.props.currentTab, this.props.userAccessLevel)}
                  onChange={value => this.handleChangeBulk(value, 'biggSpend')}
                  min={0}
                  value={this.state.biggSpend}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                style={bulkStyles}
                label="Units"
              >
                <InputNumber
                  disabled={!accessLevel(5, this.props.currentTab, this.props.userAccessLevel)}
                  onChange={value => this.handleChangeBulk(value, 'units')}
                  min={0}
                  value={this.state.units}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                style={bulkStyles}
                label="Strategy"
              >
                {
                  (this.props.selectedRowKeys || []).length > 0 ?
                  <Select
                    disabled={!accessLevel(3, this.props.currentTab, this.props.userAccessLevel)}
                    allowClear
                    onSelect={val => this.handleChangeBulk(val, 'strategy')}
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
                    <RenderEmptySelect />
                }
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                style={bulkStyles}
                label="Booking Month"
              >
                {
                  (this.props.selectedRowKeys || []).length > 0 ?
                  <Select
                    disabled={!accessLevel(3, this.props.currentTab, this.props.userAccessLevel)}
                    allowClear
                    onSelect={val => this.handleChangeBulk(val, 'bookingMonth')}
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
                    <RenderEmptySelect />
                }
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                style={bulkStyles}
                label="Customer Name"
              >
                {
                  (this.props.selectedRowKeys || []).length > 0 ?
                  <BigglyGetMenu
                    cascaderAttr={{
                      disabled: !accessLevel(3, this.props.currentTab, this.props.userAccessLevel)
                    }}
                    apiKey={this.props.apiKey}
                    menuSelectionFunction={customer => this.handleChangeBulk(((customer || {}).customerKey || ''), 'customerKey')}
                    menuOptions={[
                      {
                        typeDisplay: 'Partners',
                          optionKey: 'partnerName',
                          isLeaf: false,
                          async get(apiKey) {
                            return api.listPublic({
                              name: 'Biggly.partners',
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
                            name: 'Biggly.customers',
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
                  />
                    :
                    <RenderEmptySelect />
                }
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                style={bulkStyles}
                label="Due Date"
              >
                <DatePicker
                  disabled={!accessLevel(2, this.props.currentTab, this.props.userAccessLevel)}
                  onChange={momentVal => {
                    this.handleChangeBulk(momentVal, 'dueDate')
                  }}
                  value={this.state.dueDate ? moment(this.state.dueDate) : null}
                />
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
                  this.props.selectedRowKeys.length > 0 ?
                  <Checkbox
                    defaultValue={this.state.clearFlags}
                    onChange={e => this.handleChangeBulk(e.target.checked, 'clearFlags')}
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
                  (this.props.selectedRowKeys || []).length > 0 ?
                  <Select
                    defaultValue={[]}
                    mode="tags"
                    disabled={!accessLevel(5, this.props.currentTab, this.props.userAccessLevel) || this.state.clearFlags}
                    allowClear
                    onChange={vals => this.handleChangeBulk(vals, 'flags')}
                    placeholder="Please select"
                    style={{ minWidth: 202 }}
                  >
                    {
                      this.props.flags?.map((flag,i) => (
                        <Select.Option key={i} value={flag}>{flag}</Select.Option>
                      ))
                    }
                  </Select>
                    :
                    <RenderEmptySelect />

                }
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                style={bulkStyles}
                label="Assigned User (does not proceed status)*"
              >
                {
                  (this.props.selectedRowKeys || []).length > 0 ?
                  <BigglyGetMenu
                    cascaderAttr={{
                      disabled: !accessLevel(2, this.props.currentTab, this.props.userAccessLevel)
                    }}
                    apiKey={this.props.apiKey}
                    menuSelectionFunction={user => this.handleChangeBulk(((user || {}).userKey || ''), 'assignedUserKey')}
                    menuOptions={[
                      {
                        typeDisplay: 'Users',
                          optionKey: 'userName',
                          async get(apiKey) {
                            let records = await api.listPublic({
                              name: 'Biggly.users',
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
                    <RenderEmptySelect />
                }
              </Form.Item>
            </Col>
            {
              this.props.statuses &&
              <Col span={12}>
                <Form.Item
                  label="Status"
                  style={bulkStyles}
                >

                {
                  (this.props.selectedRowKeys || []).length > 0 ?
                  <Select
                    disabled={!accessLevel(6, this.props.currentTab, this.props.userAccessLevel)}
                    placeholder="Please select"
                    style={{ minWidth: 202 }}
                    onChange={vals => this.handleChangeBulk(vals, 'currentStatus')}
                  >
                    {
                      this.props.statuses.map((status, i) => (
                        <Select.Option
                          key={i}
                          value={status}
                        >
                          {status}
                        </Select.Option>
                      ))
                    }
                  </Select>
                  :
                  <RenderEmptySelect />
                }
              </Form.Item>
            </Col>
            }
            <Col
              style={{
                marginTop: 40,
                textAlign: 'right'
              }}
              span={24}
            >
              <Button
                disabled={saveBulkDisabled(this.state)}
                onClick={this.onSave}
                type="primary"
              >
                Save
              </Button>
            </Col>
          </Row>
        </Tabs.TabPane>

        <Tabs.TabPane 
          key="Add Comment"
          tab="Add Comment"
        >
          <div>
            <h2>Add Comment to Selected Bookings</h2>
          </div>
          <Row style={{
            marginTop: 40
          }}>
            <Col span={24}>
              <Comment
                notify={false}
                queryMode={false}
                create={this.props.createComment}
              />
            </Col>
          </Row>
        </Tabs.TabPane>
      </Tabs>
    </Drawer>
            }
            }


import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import '../../../App.css'
import {
  Checkbox,
  Typography, 
  Radio, 
  Modal, 
  DatePicker, 
  Select, 
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
  Card
} from 'antd'
// import EasyEditTable from '../../../components/Tables/EasyEditTable'
// import uuid from 'uuid'
import moment from 'moment'
import BigglyGetMenu from '../../../components/BigglyGetMenu'
import Actions from '../../../actions/campaign-hub/Actions'
import Helper from '../../../actions/campaign-hub/Helper'
import filterBySearchTerm from '../../../libs/filterBySearchTerm'
import { sortByAlpha } from '../Campaign.Handlers.js'

const { Search } = Input
const { Content } = Layout
const { Text } = Typography

let typingTimer

export default class Campaigns extends Component {
  constructor(props) {
    super(props)
    this.helper = new Helper(props.user.apiKey)
    this.actions = new Actions(props.user.apiKey, props.user.userKey, props.socketLib)
    this.state = {
      searchTerm: '',

      campaignName: '',
      campaignUrl: '',
      customerKey: '',
      customers: [],
      campaignDivKey: '',
      autoRenew: '',

      products: null,
      showDrawer: false,
      campaigns: null,

      modalOpen: false,
      packageKey: '',
      currentPeriod: null,
      campaignIndex: null,
      // campaignDivKey: '',
      periods: [],
      pack: {},
    }
  }
  async componentDidMount() {
    this.props.changeHeader('sound','CampaignHub',[{name: 'Campaigns', url: '/campaign-hub/campaigns'}])
    const products = await this.actions.getProducts()
    const campaigns = await this.actions.getCampaigns();
    const customers = await this.actions.getCustomers();
    await this.setState({
      customers,
      products,
      campaigns,
      showDrawer: false,
    })
  }
  handleChange(key, value) {
    console.log('key: ', key)
    console.log('value: ', value)
    this.setState({[key]: value})
  }

  handleUpdate = (dataIndex, value, i) => {
    let stateCopy = {...this.state}

    stateCopy.campaigns[i][dataIndex] = value

    this.setState(stateCopy)

    let campaignKey = stateCopy.campaigns[i].campaignKey

    this.actions.updateCampaign(campaignKey, {[dataIndex]: value})
  }

  onChange = (dataIndex, value, i) => {
    if(!value) return
    clearTimeout(typingTimer)
    typingTimer = setTimeout(() => {
      this.handleUpdate(dataIndex, value, i)
    }, 200)
  }

  handleChooseCustomer (customer) {
    this.setState({
      customerKey: customer.customerKey,
      partnerKey: customer.partnerKey
    })
  }
  productValue = (templates, productKey, keyName) => (
    templates.find(template => template.productKey === productKey)[keyName]
  )
  validateForm() {
    const {
      campaignName,
      campaignUrl,
      customerKey,
      partnerKey,
      campaignDivKey,
    } = this.state
    if(
      (campaignName || '').length > 0 &&
      (campaignUrl || '').length > 0 &&
      (customerKey || '').length > 0 &&
      (partnerKey || '').length > 0 &&
      (campaignDivKey || '').length > 0
    ) return true
    return false
  }
  handleSubmit = (e) => {
    e.preventDefault()
    this.setState({modalOpen: true})
  }
  handleNewCampaign = async() => {

    const {
      campaignName,
      campaignUrl,
      customerKey,
      campaignDivKey,
      partnerKey,
      autoRenew
    } = this.state

    let result = await this.actions.createCampaign({
      campaignName,
      campaignUrl,
      customerKey,
      campaignDivKey,
      partnerKey,
      autoRenew,
      campaignStatus: 'Preactive',
      createdBy: this.props.user.userKey,
      relativeDueDate: [1, 'months'],
    })

    if(!result) message.error('There was a problem saving your campaign please let the dev team know.')
    else message.success('Campaign saved!')

    await this.componentDidMount()
  }

  parsePackagePeriods = (tabs, periods) => {
    return tabs.map(num => ({
      periodKey: num,
      products: periods.filter(per => per.period === num)
    }))
  }


  handlePackage = (pack, i) => {
    this.setState({
      modalOpen: true,
      packageKey: pack.packageKey,
      campaignDivKey: pack.campaignDivKey,
      periods: this.helper.parsePeriods(pack.periods, {}, this.parsePackagePeriods),
      pack,
      campaignIndex: i,
    })
  }

  handleChoosePackage = async() => {
    // const hideMessage = message.loading('Building bookings...')
    this.setState({
      modalOpen: false,
    })

    // const { campaignKey } = this.state.campaign

    const {
      campaigns,
      pack,
      currentPeriod,
      campaignIndex,
    } = this.state

    let campaignKey = campaigns[campaignIndex].campaignKey

    campaigns[campaignIndex].currentPeriod = currentPeriod
    campaigns[campaignIndex].packageKey = pack.packageKey

    this.actions.updateCampaign(campaignKey, {
      currentPeriod,
      packageKey: pack.packageKey
    })

    message.success('Package selected')

    this.setState({
      campaigns,
      pack: {},
      currentPeriod: null,
      campaignIndex: null,
      periods: [],
    })
  }

  handlePeriodSelection(value) {

    this.setState({currentPeriod: value})

  }

  renderSelection = (text, periodKey, jsonPeriods, index) => (
    <Text>
      <Radio value={periodKey} />
      {text}
    </Text>
  )

  momentValue = value => {
    if(value === null) return null
    return moment(value)
  }

  render() {
    const actions = this.actions
    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
        <Col xs={24}>
          <Card 
            bordered={false}
            style={{ 'width': '100%' }}
          >
            <Row>
              <Col span={24} style={{ 'textAlign': 'right' }}>
                <Icon style={{ margin: '15px 0', fontSize: '1.6em' }} type={'plus-circle'} onClick={() => this.setState({showDrawer: true})} />
              </Col>
            </Row>
            <Row>
              <Col span={24}>

                {/* TODO: I'm gonna leave this for now because the customer selection also chooses a partnerKey for the campaign
                    and I've realised we don't actually ever need to set the partnerKey, we can get it from the customer 
                    changing that is a bigger job than this warrents right now but you should be able to just comment this
                    back in and complete it once that's done.
                */}
                {/*
                  <EasyEditTable
                    primaryKey="campaignKey"
                    createPrimaryKey={() => uuid.v1()}
                    dataSource={() => 
                      this.actions.getCampaigns()
                    }
                    create={record => 
                      this.props.actions.createPublic({
                        name: 'bms_campaigns.campaigns'
                      }, record)
                    }
                    update={record => 
                      this.props.actions.updatePublic({
                        name: 'bms_campaigns.campaigns',
                        where: [
                          `campaignKey = "${record.campaignKey}"`
                        ]
                      }, record)
                    }
                    delete={key => 
                      this.props.actions.deletePublic({
                        name: 'bms_campaigns.campaigns',
                        where: [
                          `campaignKey = "${key}"`
                        ]
                      })
                    }
                    columns={[
                      {
                        title: 'Campaign Name',
                        dataIndex: 'campaignName',
                        key: 'campaignName',
                        type: 'string'
                      },
                      {
                        title: 'Customer Name',
                        dataIndex: 'customerName',
                        key: 'customerName',
                        render: (dataIndex, value, record, i, onChange) => (
                          <BigglyGetMenu
                            cascaderAttr={{
                              allowClear: false
                            }}
                            defaultValue={
                              (record.customerKey || '').length > 0 &&
                              (this.state.customers.find(cust => cust.customerKey === record.customerKey) || {}).customerName
                            }
                            apiKey={this.props.user.apiKey}
                            menuOptions={[
                              {
                                typeDisplay: 'Partners',
                                  optionKey: 'partnerName',
                                  isLeaf: false,
                                  async get() {
                                    return await actions.getPartnersNameAndKey()
                                  }
                              },
                              {
                                typeDisplay: 'Customers',
                                optionKey: 'customerName',
                                isLeaf: true,
                                getKeys: ['partnerKey'],
                                async get(apiKey, partnerKey) {
                                  return await actions.getCustomersByPartnerKey(partnerKey)
                                }
                              }
                            ]}
                            menuSelectionFunction={option => 
                              onChange(dataIndex, option.customerKey, i)
                            }
                          />
                        )
                      },
                      {
                        title: 'Package Name',
                        dataIndex: 'packageName',
                        key: 'packageName',
                        render: (dataIndex, value, record, i, onChange) => (
                          <div>{value}</div>
                        )
                      },
                      {
                        render: (dataIndx, value, record) => 
                        <Button 
                          onClick={() => this.props.history.push(`/campaign-hub/campaigns/${record.campaignKey}`)}
                          type="link">Edit</Button>
                      }
                    ]}
                  >
                  </EasyEditTable>
                */}

















                <Search 
                  onChange={e => this.setState({ searchTerm: e.target.value })}
                  placeholder="Search"
                  style={{ marginBottom: '24px' }}
                />

                {
                  this.state.campaigns &&
                  <Table
                    size="small"
                    style={{marginTop: 25}}
                    pagination={false}
                    rowKey="campaignKey"
                    dataSource={filterBySearchTerm(this.state.searchTerm, this.state.campaigns)}
                    columns={[
                      {
                        title: 'Campaign',
                        dataIndex: 'campaignName',
                        sorter: (a,b) => sortByAlpha(a,b,'campaignName'),
                      },
                      {
                        title: 'Partner Name',
                        sorter: (a,b) => sortByAlpha(a,b,'partnerName'),
                        dataIndex: 'partnerName'
                      },
                      {
                        title: 'Customer Name',
                        sorter: (a,b) => sortByAlpha(a,b,'customerName'),
                        dataIndex: 'customerName'
                      },
                      {
                        title: 'Package Name',
                        sorter: (a,b) => sortByAlpha(a,b,'packageName'),
                        dataIndex: 'packageName',
                        render: (text, record, i) => ( 

                          <div style={{width: '100%'}}>
                            Package:
                            <BigglyGetMenu
                              defaultValue={(record || {}).packageName}
                              cascaderAttr={{
                                allowClear: false
                              }}
                              apiKey={this.props.user.apiKey}
                              menuOptions={[
                                {
                                  typeDisplay: 'Campaign Divisions',
                                    optionKey: 'campaignDivName',
                                    isLeaf: false,
                                    async get() {
                                      return await actions.getCampaignsNameAndKey()
                                    }
                                },
                                {
                                  typeDisplay: 'Packages',
                                  optionKey: 'packageName',
                                  isLeaf: true,
                                  getKeys: ['campaignDivKey'],
                                  async get(apiKey, campaignDivKey) {
                                    return await actions.getPackagesByCampDiv(campaignDivKey)
                                  }
                                }
                              ]}
                              menuSelectionFunction={pack => this.handlePackage(pack, i)}
                            />
                          </div>
                        )
                      },
                      {
                        title: 'Campaign Division',
                        sorter: (a,b) => sortByAlpha(a,b,'campaignDivName'),
                        dataIndex: 'campaignDivName'
                      },
                      {
                        title: 'Status',
                        sorter: (a,b) => sortByAlpha(a,b,'campaignStatus'),
                        dataIndex: 'campaignStatus',
                        render: (text, record, i) => (
                          <Select
                            disabled={!record.packageKey}
                            defaultValue={record.campaignStatus}
                            onChange={value => this.onChange('campaignStatus', value, i)}
                          >
                            <Select.Option value="Paused">
                              Paused
                            </Select.Option>
                            <Select.Option value="Cancelled">
                              Cancelled
                            </Select.Option>
                            <Select.Option value="Active">
                              Active
                            </Select.Option>
                          </Select>
                        )
                      },
                      {
                        title: 'Next Activation Date',
                        sorter: (a,b) => moment(a.nextPeriodDate) - moment(b.nextPeriodDate),
                        dataIndex: 'nextPeriodDate',
                        render: (value, record, i) => ( 
                          <DatePicker 
                            disabled={!record.packageKey}
                            defaultValue={this.momentValue(record.nextPeriodDate)}
                            onChange={moment => this.onChange('nextPeriodDate', moment.format('YYYY-MM-DD'), i)}
                          ></DatePicker>
                        )
                      },
                      {
                        title: '',
                        render: (text, record, i) => ( 
                          <Link
                            to={`/campaign-hub/campaigns/${record.campaignKey}`}
                          >Edit</Link>
                        )
                      }
                    ]}
                  ></Table>
                }
              </Col>
            </Row>
          </Card>
        </Col>

        <Drawer 
          title="Create a new campaign"
          visible={this.state.showDrawer}
          onClose={() => this.setState({showDrawer: false})}
          width={620}
        >
          <Form
            layout="horizontal"
            onSubmit={this.handleSubmit}
            labelCol={{ span: 6 }}
            wrapperCol={{ span: 18 }}
          >
            <Form.Item 
              label="Campaign Name"
            >
              <Input
                required={true}
                type="input"
                onChange={e => this.handleChange('campaignName', e.target.value)}
                value={this.state.campaignName}
              />

            </Form.Item>
            <Form.Item 
              label="Campaign URL"
            >
              <Input
                required={true}
                type="input"
                onChange={e => this.handleChange('campaignUrl', e.target.value)}
                value={this.state.campaignUrl}
              />

            </Form.Item>
            <Form.Item 
              label="Campaign Division"
            >
              <BigglyGetMenu
                cascaderAttr={{
                  allowClear: false
                }}
                apiKey={this.props.user.apiKey}
                menuOptions={[
                  {
                    typeDisplay: 'Divisions',
                    optionKey: 'campaignDivName',
                    isLeaf: true,
                    async get() {
                      return await actions.getCampaignDivisions()
                    }
                  }
                ]}
                menuSelectionFunction={campDiv => this.handleChange('campaignDivKey', campDiv.campaignDivKey)}
              />

          </Form.Item>
            <Form.Item 
              label="Customer"
            >
              <BigglyGetMenu
                cascaderAttr={{
                  allowClear: false
                }}
                apiKey={this.props.user.apiKey}
                menuOptions={[
                  {
                    typeDisplay: 'Partners',
                    optionKey: 'partnerName',
                    isLeaf: false,
                    async get() {
                      return await actions.getPartnersNameAndKey()
                    }
                  },
                  {
                    typeDisplay: 'Customers',
                    optionKey: 'customerName',
                    isLeaf: true,
                    getKeys: ['partnerKey'],
                    async get(apiKey, partnerKey) {
                      return await actions.getCustomersByPartnerKey(partnerKey)
                    }
                  }
                ]}
                menuSelectionFunction={customer => this.handleChooseCustomer(customer)}
              />

          </Form.Item>
            <Form.Item 
              label="Auto Renew"
            >
              <Checkbox
                onChange={e => this.handleChange('autoRenew', e.target.checked ? 'always' : 'NULL')}
              >
              </Checkbox>
            </Form.Item>
        </Form> 
          <Button
            disabled={!this.validateForm()}
            // loading={this.state.loadSubmit}
            onClick={() => this.handleNewCampaign()}
            type={"primary"}
          >Create</Button>
        </Drawer>

        <Modal
          destroyOnClose
          visible={this.state.modalOpen}
          onCancel={() => this.setState({modalOpen: false})}
          onOk={() => this.handleChoosePackage()}
          title="Choose the package period you want to start this campaign from"
        >

          <Row>
            {
              (this.state.periods || [])
                .map((period, index) => {
                  const column = [
                    {
                      title: this.renderSelection(
                        'Period ' + period.periodKey, 
                        period.periodKey
                      ),
                      dataIndex: 'productName',
                      key: 'productName',
                    }
                  ]
                  return <Radio.Group
                    value={this.state.currentPeriod}
                    style={{display: 'block'}}
                    key={index}
                    disabled={false}
                  >
                    <Col 
                      span={12}
                      style={{height: 100}}
                      className="bms--overlap-cards"
                      onClick={() => this.handlePeriodSelection(index+1)}
                    >
                      <Table
                        className="bms--mini-table"
                        bordered={false}
                        pagination={false}
                        size="small"
                        style={{
                          backgroundColor: 'white',
                          borderRadius: 4
                        }}
                        rowClassName="bms--mini-table-row"
                        columns={column}
                        dataSource={
                          period.products.map( (period, i) => {
                            return {
                              productName: period.product[0].productName,
                              key: period.periodKey
                            }
                          })
                        }
                      />
                    </Col>
                  </Radio.Group>
                })
            } 
          </Row>
        </Modal>
      </Content>


    )
  }
}

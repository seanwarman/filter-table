import React, { Component } from 'react'
import Actions from '../../../actions/campaign-hub/Actions'
import Helper from '../../../actions/campaign-hub/Helper'
import colorPicker from '../../../libs/bigglyStatusColorPicker'
import '../../../App.css'
import {
  Checkbox,
  Popconfirm,
  Empty,
  message,
  Layout,
  Row,
  Col,
  Card,
  Form,
  Input,
  Button,
  Tabs,
  Drawer,
  Select,
  Switch,
  Radio,
  Typography,
  DatePicker,
  Modal,
  InputNumber,
  Table,
} from 'antd'
import Icon from 'antd/lib/icon'
import {Skeleton} from 'antd'

import moment from 'moment'
import Tag from 'antd/lib/tag'
import JsonFormFill from '../../../components/Json/JsonFormFill'
import BigglyGetMenu from '../../../components/BigglyGetMenu'
import ArrayBuilder from '../../../components/Json/ArrayBuilder'
import SocketLibrary from '../../../libs/SocketLibrary'

const {Text} = Typography
const {Content} = Layout
const TabPane = Tabs.TabPane

const success = (message_details) => {
  message.success(message_details)
}

const HotLinkSelector = ({
    item,
    handleInput,
    options,
    defaultValue
}) => (

  <Select
    defaultValue={defaultValue}
    onChange={value => {
      handleInput(value)
    }}
    style={{width:'200px'}}
  >
    {
      options.map((option, i) => (
        <Select.Option key={i} value={option}>
          {option}
        </Select.Option> 
      ))
    }
  </Select>
)

export default class ViewCampaign extends Component {

  constructor(props) {
    super(props)

    this.helper = new Helper(props.user.apiKey)
    this.actions = new Actions(props.user.apiKey, props.user.userKey, new SocketLibrary())
    this.socketLib = new SocketLibrary()

    this.state = {
      campaign: null,
      periods: [],
      pendingBookings: [],
      editBooking: false,
      updatingStatus: false,
      saving: false,
      isLoading: true,
      activateDrawer: false,
      periodSelectAllow: false,
      currentPeriod: 1,
      activatedBookings: [],

      relativeDueDate: [1, 'months'],
      dueDate: null,

    }

  }

  async componentDidMount() {
    this.props.changeHeader('sound', 'CampaignHub', [
      { name: 'Campaigns', url: '/campaign-hub/campaigns' },
      { name: 'Campaign', url: '/campaign-hub/campaigns/' + this.props.match.params.campaignKey }
    ])

    this.socketLib.addSocketEvent('All', this.populateActivatedBookings)

    const campaign = await this.actions.getCampaign(this.props.match.params.campaignKey)

    if(!campaign) {
      message.error('Campaign failed to load!')
      setTimeout(() => {
        this.props.history.push('/campaign-hub/campaigns')
      }, 1000)
    }

    let pendingBookings = []

    if(campaign.packageKey && campaign.currentPeriod) {
      pendingBookings = this.helper.parsePeriods(
        await this.actions.getPeriodsAndProductNamesFromCurrentPeriod(campaign.packageKey, campaign.currentPeriod),
        {},
        this.parsePackagePeriods
      )
    }


    const relativeDueDate = campaign.relativeDueDate ? campaign.relativeDueDate : this.state.relativeDueDate

    this.setState({
      campaign,
      relativeDueDate,
      pendingBookings
    })
  }
  
  componentWillUnmount() {
    this.socketLib.forceClose()
  }

  populateActivatedBookings = async() => {
    const activatedBookings = await this.actions.getActivatedBookings(this.state.campaign.campaignKey)
    this.setState({activatedBookings})
  }

  dateChange = async moment => {
    await this.actions.updateCampaign(this.state.campaign.campaignKey, {
      campaignDay: moment ? Number(moment.format('D')) : null,
      nextPeriodDate: moment ? moment.format('YYYY-MM-DD') : null
    })
    this.componentDidMount()
  }

  momentValue = (value) => {
    if (value === null) return null
    return new moment(value)
  }

  inputChange = e => {
    this.setState({
      [e.target.id.toString()]: e.target.value
    })
  }

  selectChange = (customerKey) => {
    this.setState({customerKey})
  }

  handleChange = async (key, value) => {

    await this.actions.updateCampaign(this.state.campaign.campaignKey, {
      [key]: value
    })
    this.componentDidMount()
  }

  selectPackageChange = async (packageKey) => {
    await this.setState({packageKey})
  }

  checkAutoRenew = async e => {
    const { campaign } = this.state

    await this.actions.updateCampaign(campaign.campaignKey, {
      autoRenew: e.target.checked ? 'always' : 'NULL'
    })

    this.componentDidMount()
  }

  selectStatusChange = async (campaignStatus) => {
    const { campaign } = this.state
    // await this.setState({campaignStatus})
    await this.actions.updateCampaign(campaign.campaignKey, {
      campaignStatus,
    })
    this.componentDidMount()
  }

  validateForm = () => {
    return (
      this.state.campaign.campaignName.length > 0 &&
      this.state.campaign.campaignUrl.length > 0
    )
  }

  handleChoosePackage = async() => {
    // const hideMessage = message.loading('Building bookings...')
    this.setState({
      modalOpen: false,
    })

    const { campaignKey } = this.state.campaign

    const {
      pack,
      currentPeriod,
    } = this.state

    await this.actions.updateCampaign(campaignKey, {
      currentPeriod,
      packageKey: pack.packageKey
    })

    message.success('Package selected')

    this.componentDidMount()
  }

  handlePeriodSelection(value) {
    this.setState({currentPeriod: value})
  }

  handleActivateCampaign = async () => {

    const hideMessage = message.loading('Activating campaign...')

    const { campaign } = this.state

    // Set the campaign to run monthly by default
    let nextPeriodDate = moment().add(1, 'months').format('YYYY-MM-DD hh:mm:ss')

    if(campaign.frequency === 'Weekly') {
      nextPeriodDate = moment().add(1, 'weeks').format('YYYY-MM-DD hh:mm:ss')
    }

    let result = await this.actions.updateCampaign(campaign.campaignKey, {
      campaignStatus: 'Active',
      campaignStart: moment().format('YYYY-MM-DD hh:mm:ss'),
      campaignDay: moment().format('D'),
      nextPeriodDate,
    })

    hideMessage()
    if(!result) message.error('There was an error activating this campaign. Please notify the dev team.')
    else message.success('Campaign activated.')

    this.componentDidMount()
 
  }

  handleSubmit = async event => {

    event.preventDefault()

    this.setState({ isLoading: true, editCampaign: false})

    message.info('Updating Campaign...')

    let result = await this.actions.updateCampaign(this.props.match.params.campaignKey, {
      campaignName: this.state.campaignName,
      campaignUrl: this.state.campaignUrl,
      citationText: this.state.citationText,
      campaignStatus: this.state.campaignStatus,
      nextPeriodDate: moment(this.state.nextPeriodDate).format('YYYY-MM-DD'),
      campaignDay: this.state.campaignDay,
      campaignStart: moment(this.state.campaignStart).format('YYYY-MM-DD'),
      customerKey: this.state.customerKey,
      packageKey: this.state.packageKey,
    })

    if(result.affectedRows > 0) {
      await this.componentDidMount()
      success('Campaign updated')
      return
    } else {
      console.log(result)
      this.setState({ isLoading: false })
      return
    }
  }

  toggleEditCampaign = () => {
    this.setState({editCampaign: !this.state.editCampaign})
  }

  openEditCampaign = () => {
    let campaign = { ...this.state.campaign }
    this.setState({
      editCampaign: true,
      partnerName: campaign.partnerName,
      customerName: campaign.customerName,
      packageName: campaign.packageName,
      campaignName: campaign.campaignName,
      customerKey: campaign.customerKey,
      packageKey: campaign.packageKey,
      campaignStart: campaign.campaignStart,
      campaignUrl: campaign.campaignUrl,
      campaignStatus: campaign.campaignStatus,
    })
  }

  confirmDelete = () => {
    const { history } = this.props
    const actions = this.actions
    const { campaignKey } = this.props.match.params
    Modal.confirm({
      title: 'Do you want to delete this campaign?',
      content: 'This cannot be reversed',
      async onOk() {
        message.info('Deleting campaign and all associated records...')
        await actions.deleteNotes(campaignKey)
        await actions.deleteCampaign(campaignKey)

        message.success('Done!')
        history.push('/campaign-hub/campaigns')
      }
    })
  }

  activateBookingsAndChooseDueDate = (campaign, index) => {
    this.setState({dueDate: null})
    const handleConfirm = this.handleConfirm.bind(this)
    const componentDidMount = this.componentDidMount.bind(this)
    Modal.confirm({
      title: 'What due date would you like these bookings to have?',
      content: 
      <div>
        <small>Leave this blank to set from the relative due date.</small>
        <DatePicker 
          onChange={moment => this.setState({dueDate: moment})}
        />
      </div>,
      async onOk() {
        // Activate like normal
        handleConfirm(campaign, index)
        componentDidMount()
      }
    })
  }

  toggleActivateDrawer = () => {
    if(!this.state.activateDrawer) {
      this.setState({activateDrawer: true})
    }
    if(this.state.activateDrawer) {
      this.setState({activateDrawer: false})
    }
  }

  onChangeAllRelativeDueDates = relativeDueDate => {
    this.setState({relativeDueDate})
  }

  handleChangeRelativeDueDatePeriod = async(relativeDueDate, index) => {

    let { campaign } = this.state

    campaign.jsonBookings[index].relativeDueDate = relativeDueDate

    let result = await this.actions.updateCampaign(campaign.campaignKey, {jsonBookings: campaign.jsonBookings})

    if(result.affectedRows < 1) message.error('There was an error updating this period')

    this.componentDidMount()

  }

  handleSetAllRelativeDueDates = async relativeDueDate => {
    await this.setState({setAllEnabled: false})

    let { campaign } = this.state

    let result = await this.actions.updateCampaign(campaign.campaignKey, { relativeDueDate })
    if(result.affectedRows > 0) message.success('Campaign updated!')
    else message.error('There was an error updating the campaign')

    this.componentDidMount()
    
  }

  handleEnablePeriodChoice = (arg) => {
    const {periodSelectAllow} = this.state
    if(periodSelectAllow) {
      this.setState({periodSelectAllow: false, currentPeriod: 1})
    } else {
      this.setState({periodSelectAllow: true})
    }
  }

  handleConfirm = async(camp, index) => {
    const { pendingBookings, dueDate } = this.state

    const hideMessage = message.loading('Activating selected bookings...', 0)

    const { bookings, campaign } = await this.helper.activateBookingsAndUpdateCampaign(
      camp,
      pendingBookings,
      index,
      'Draft',
      dueDate
    )

    if(!bookings) {
      hideMessage()
      message.error('There was an error creating these bookings. Please notify a member of the dev team.')
      return this.componentDidMount()
    }

    const results = await this.actions.createBookings(bookings.map(booking => ({
      ...booking,

      // TODO: remove this if not testing
      // Testing division key...
      // bookingDivKey: 'd9c9c160-98ed-11e9-b81f-69e4b0c6cf5e'
    })))

    if((results || []).length === 0) {
      hideMessage()
      message.error('There was an error creating these bookings. Please notify a member of the dev team.')
      return this.componentDidMount()
    }

    const result = await this.actions.updateCampaign(camp.campaignKey, {
      targetKeywords: campaign.targetKeywords,
      currentPeriod: this.setCurrentPeriod(camp)
    }) 

    if(result.affectedRows === 0) {
      hideMessage()
      message.error('The bookings where created but there was an error updating the campaign. Please notify a member of the dev team.')
      return this.componentDidMount()
    }



    hideMessage()
    message.success('Bookings created!')
    this.componentDidMount()
  }

  setCurrentPeriod(camp) {

    const { currentPeriod, maxPeriod, autoRenew } = camp

    if(autoRenew !== 'always') return currentPeriod + 1
    
    if(currentPeriod >= maxPeriod) return 1

    return currentPeriod + 1

  }

  handleSelectPeriod = e => {
    this.setState({currentPeriod: e.target.value})
  }

  handleUpdateJsonBookings = async(jsonI, bookI, state) => {
    let { campaign } = this.state
    let jsonBookings = campaign.jsonBookings
    jsonBookings[jsonI].bookings[bookI].jsonForm = state.jsonForm
    jsonBookings[jsonI].bookings[bookI].flagged = state.customFields[0].value
    await this.actions.updateCampaign(campaign.campaignKey, {
      jsonBookings
    })
    await this.componentDidMount()
    message.success('Booking updated!')
    return
  }

  parsePackagePeriods = (tabs, periods) => {
    return tabs.map(num => ({
      periodKey: num,
      products: periods.filter(per => per.period === num)
    }))
  }

  handlePackage = pack => {
    this.setState({
      modalOpen: true,
      packageKey: pack.packageKey,
      campaignDivKey: pack.campaignDivKey,
      periods: this.helper.parsePeriods(pack.periods, {}, this.parsePackagePeriods),
      pack,
    })
  }

  renderSelection = (text, periodKey, jsonPeriods, index) => (
    <Text>
      <Radio value={periodKey} />
      {text}
    </Text>
  )

  renderSetRelativeDueDatePeriod = (onChange, relativeDueDate, index) => (
    <>
      <Input.Group
        style={{display: 'flex', justifyContent: 'flex-end'}}
        compact
      >
        <div style={{
          textAlign: 'right',
          marginRight: 10,
        }}>Set bookings to be due</div>
        <InputNumber
          min={1}
          size="small"
          value={relativeDueDate[0]}
          onChange={value => onChange([value, relativeDueDate[1]], index)}
          placeholder="Amount"
        />
        <Select 
          size="small"
          value={relativeDueDate[1]}
          onChange={value => onChange([relativeDueDate[0], value], index)}
          style={{width: 120}}
          placeholder="Period"
        >
          <Select.Option value={'months'}>Months</Select.Option>
          <Select.Option value={'weeks'}>Weeks</Select.Option>
          <Select.Option value={'days'}>Days</Select.Option>
          <Select.Option value={'hours'}>Hours</Select.Option>
        </Select>
        <div style={{
          textAlign: 'right',
          marginLeft: 10,
        }}>after they are booked.</div>
      </Input.Group>
    </>
  )

  renderSetRelativeDueDateGroup = (submit, onChange, enabled) => (
    <Input.Group
      style={{display: 'flex'}}
      compact
    >
      <InputNumber
        value={this.state.relativeDueDate[0]}
        onChange={value => onChange([value, this.state.relativeDueDate[1]])}
        placeholder="Amount"
      />
      <Select 
        value={this.state.relativeDueDate[1]}
        onChange={value => onChange([this.state.relativeDueDate[0], value])}
        style={{width: 200}}
        placeholder="Period"
      >
        <Select.Option value={'months'}>Months</Select.Option>
        <Select.Option value={'weeks'}>Weeks</Select.Option>
        <Select.Option value={'days'}>Days</Select.Option>
        <Select.Option value={'hours'}>Hours</Select.Option>
      </Select>
      <Button
        style={{margin: 0}}
        type="primary"
        disabled={!enabled}
        onClick={() => submit(this.state.relativeDueDate)}
      >Set</Button>
    </Input.Group>
  )

  renderCampaignHeader() {

    const menuStyles = {
      marginBottom: 16
    }

    const actions = this.actions
    let statusColor = 'green'
    if ((this.state.campaign || {}).campaignStatus === 'Paused') { statusColor = 'orange' }
    if ((this.state.campaign || {}).campaignStatus === 'Cancelled') { statusColor = 'red' }
    if ((this.state.campaign || {}).campaignStatus === 'Preactive') { statusColor = 'grey' }

    return (
        this.state.campaign ?
        <div>
          <Row gutter={16}>
            <Col xs={24}>
              <Tag color={statusColor} style={{marginBottom: 10}}>{this.state.campaign.campaignStatus}</Tag>
              <h5>{this.state.campaign.campaignName}</h5>

              <Row>
                <Col span={6}>
                  Partner: {this.state.campaign.partnerName}<br/>
                  Customer: {this.state.campaign.customerName}<br/>
                  Url: {this.state.campaign.campaignUrl}<br/>
                  Frequency: <b>{this.state.campaign.frequency}</b><br/>
                </Col>

                <Col
                  span={18}
                >

                  <Row
                    style={{
                      // display: 'flex',
                      // justifyContent: 'flex-end',
                    }}
                  >
                    <Col
                      style={menuStyles}
                      span={8}
                    >
                      <div style={{width: '100%'}}>

                        Campaign Division:
                        <BigglyGetMenu
                          defaultValue={(this.state.campaign || {}).campaignDivName}
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

                      </div>
                    </Col>
                    <Col 
                      style={menuStyles}
                      span={8}>
                      <div style={{width: '100%'}}>
                        Package:
                        <BigglyGetMenu
                          defaultValue={(this.state.campaign || {}).packageName}
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
                          menuSelectionFunction={pack => this.handlePackage(pack)}
                        />
                      </div>
                    </Col>
                    <Col
                      style={menuStyles}
                      span={8}
                    >
                      Next Activation Date:
                      <div style={{width: '100%'}}>
                        <DatePicker 
                          onChange={this.dateChange}
                          value={this.momentValue(this.state.campaign.nextPeriodDate)} 
                        />
                      </div>
                    </Col>
                    <Col 
                      style={menuStyles}
                      span={8}>
                      <div style={{width: '87%'}}>
                        Set all relative due dates: <Switch 
                          size="small" onChange={checked => this.setState({setAllEnabled: checked})} 
                          checked={this.state.setAllEnabled}
                        />
                        {this.renderSetRelativeDueDateGroup(
                          this.handleSetAllRelativeDueDates,
                          this.onChangeAllRelativeDueDates,
                          this.state.setAllEnabled,
                        )}
                      </div>
                    </Col>
                    <Col span={8}
                      style={menuStyles}
                    >
                      <div style={{width: '100%'}}>
                        Campaign Status:
                        <Select
                          showSearch
                          defaultValue={this.state.campaign.campaignStatus}
                          style={{ width: '80%' }}
                          placeholder="Select a Status"
                          optionFilterProp="children"
                          onChange={this.selectStatusChange}
                          filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                        >
                          <Select.Option key={'Active'} value={'Active'}>Active</Select.Option>
                          <Select.Option key={'Paused'} value={'Paused'}>Paused</Select.Option>
                          <Select.Option key={'Cancelled'} value={'Cancelled'}>Cancelled</Select.Option>
                        </Select>
                      </div>
                      {/** <Button
                    style={{margin: 0, marginLeft: '10%'}}
                    disabled={this.state.campaign.campaignStatus === 'Active'}
                    onClick={this.handleActivateCampaign}
                  >
                    Activate Campaign
                </Button> **/}
                    </Col>

                    <Col 
                      span={8}
                      style={menuStyles}
                    >
                      <Checkbox
                        onChange={this.checkAutoRenew}
                        defaultChecked={this.state.campaign.autoRenew === 'always'}
                      >
                        Auto Renew
                      </Checkbox>
                    </Col>

                  </Row>
                </Col>
              </Row>

            </Col>
          </Row>
          <Icon onClick={this.openEditCampaign} type={"edit"} style={{color: 'grey', fontSize: '1.6em', position: 'absolute', top: '10px', right: '15px'}}/>
          {this.renderEditCampaignDrawer()}
        </div>
        :
        <Skeleton active={true} paragraph={{ rows: 4 }} />
    )
  }

  renderEditCampaignDrawer() {
    return(

    <Drawer
      title="Edit campaign"
      width={620}
      onClose={this.toggleEditCampaign}
      visible={this.state.editCampaign}
    >
      <Form layout="horizontal" labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>

        <Form.Item label={"Name"}>
          <Input required id="campaignName" type={"text"} onChange={this.inputChange}
            value={this.state.campaignName}/>
        </Form.Item>

        <Form.Item label={"Url"}>
          <Input
            required id="campaignUrl" type={"text"}
            onChange={this.inputChange}
            value={this.state.campaignUrl}
          />
        </Form.Item>

        <Form.Item label="Citation">
          <Input.TextArea id="citationText" onChange={this.inputChange} value={this.state.citationText}/>
        </Form.Item>

      </Form>

      <Row
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
        <Col 
          style={{textAlign: 'left'}}
          span={12}
        >
          <Popconfirm
            onConfirm={this.confirmDelete}
            title={`This action will delete the entire campaign`}
          >
            <Button 
              style={{color: '#ff4d4f'}}
              type="link">Delete</Button>
          </Popconfirm>
        </Col>
        <Col 
          style={{textAlign: 'right'}}
          span={12}
        >
          <Button disabled={!this.validateForm()} onClick={this.handleSubmit} type="primary">Update</Button>
        </Col>
      </Row>

    </Drawer>

    )
  }

  renderNestedTable = (jsonI, booking, bookI) => {
    // const { bookingDivisions } = this.state
    return <div>thing</div>
    // return <div
    //   key={booking.bookingsKey}
    //   style={{
    //     maxWidth: 600,
    //   }}
    // >
    //   <JsonFormFill
    //     cols={12}
    //     size="small"
    //     customFields={[
    //       {
    //         label: 'flagged',
    //         value: booking.flagged,
    //         type: 'dropdown',
    //         selections: (((bookingDivisions || []).find(div => (div || {}).bookingDivKey === booking.bookingDivKey).jsonFlags || []).map(json => json.value) || []).join(),
    //         prettyType: 'Dropdown'
    //       }
    //     ]}
    //     jsonForm={booking.jsonForm}
    //     validation={false}
    //     update={state => {
    //       return this.handleUpdateJsonBookings(jsonI, bookI, state)
    //     }}
    //   />
    // </div>
  }

  renderPendingBookings() {
    const columns = [
      {
        title: 'Product Name',
        dataIndex: 'productName',
        key: 'productName',
        ellipsis: true,
      },
      {
        title: 'Booking Name',
        dataIndex: 'bookingName',
        key: 'bookingName',
        ellipsis: true,
      },
      {
        title: 'Quantity',
        dataIndex: 'quantity',
        key: 'quantity',
        ellipsis: true,
      },
      {
        title: 'Cost',
        dataIndex: 'costPrice',
        key: 'costPrice',
        ellipsis: true,
      },
      {
        title: 'Auto Fill Labels',
        dataIndex: 'autoFillLabels',
        key: 'autoFillLabels',
        render: (autoFillLabels) => ( 
          autoFillLabels &&
          autoFillLabels.map((label, i) =>
            <Tag key={i}>
              {label}
            </Tag>
          )
        )
      }
      // {
      //   title: 'Booking Division',
      //   dataIndex: 'bookingDivKey',
      //   key: 'bookingDivKey',
      //   ellipsis: true,
      //   render: bookingDivKey => { 
      //     let { bookingDivisions } = this.state
      //     return <span>{
      //       bookingDivisions.find(div => div.bookingDivKey === bookingDivKey).bookingDivName
      //     }</span>
      //   } 
      // }
    ]

    const { campaign, pendingBookings } = this.state


    return (
      (pendingBookings || []).length > 0 &&
      pendingBookings.map((period, index) => 
        <Col
          style={{
            paddingTop: 16,
            paddingBottom: 8,
            marginBottom: 46,
            borderRadius: 5
          }}
          key={index}
          span={24}
          className={
            campaign.campaignStatus === 'Active' ? 
            'bms--collapse-color-active' : ''
          }
        >
          <Col span={12}>
            <h3 style={{marginBottom: 0}}>Period: {period.periodKey}</h3><br/>
            {
              campaign.campaignStatus === 'Active' &&
              <h4 style={{marginBottom: 0}}>
                Activation Date:&nbsp;
                {this.state.campaign.nextPeriodDate && moment(this.state.campaign.nextPeriodDate).add(
                  index, 
                  campaign.frequency === 'Monthly' ?
                  'months'
                  :
                  campaign.frequency === 'Weekly' ?
                  'weeks'
                  :
                  // Default
                  'months'
                ).format('Do MMM YYYY')}
              </h4>
            }
          </Col>
          <Col
            style={{textAlign: 'right'}}
            span={12}
          >
            {
              index === 0 &&
              <Button
                style={{margin: 0}}
                size="small"
                type="secondary"
                onClick={() => this.activateBookingsAndChooseDueDate(campaign, index)}
              >
                Activate this period now
              </Button>
            }
          </Col>
          <div style={{ 
            marginBottom: 24,
            marginTop: 24
          }}>
            {/* this.renderSetRelativeDueDatePeriod(this.handleChangeRelativeDueDatePeriod, json.relativeDueDate, jsonI) */}
          </div>
           <Table
            pagination={false}
            size="small"
            dataSource={period.products}
            rowKey={'periodKey'}
            // expandedRowRender={(product, prodI) => (
            //   this.renderNestedTable(index, product, prodI)
            // )}
            columns={columns}
          >
          </Table>
        </Col>
      )
    )
  }

  renderAutoFill = () => {

    return (
      <Row>
        <Col span={12}>
          <h3>Hot Link</h3>
          {this.renderHotLinkBuilder()}
        </Col>
        <Col span={12}>
          <h3>Target Keywords</h3>
          {this.renderKeywordsBuilder()}
        </Col>
      </Row>
    )

  }

  renderHotLinkBuilder = () => {

    return (
      this.state.campaign &&
      <ArrayBuilder
        itemMap={[ 
          {
            dataIndex: 'from',
            label: 'From',
            type: 'input',
            render: (item, map, index, handleInput, renderDefault, lastIndex) => (
              <div>
                <div style={{height: 27}}
                >From: </div>
                <HotLinkSelector
                  item={item}
                  handleInput={value => handleInput(index, 'from', value)}
                  defaultValue={item.from}
                  options={[
                    'campaignDay',
                    'campaignDivName',
                    'campaignName',
                    'campaignStatus',
                    'campaignUrl',
                    'citationText',
                    'currentPeriod',
                    'customerName',
                    'frequency',
                    'nextPeriodDate',
                    'packageName',
                    'partnerName',
                    'startDate',
                  ]}
                >
                </HotLinkSelector>
              </div>
            )
          },
          {
            dataIndex: 'to',
            label: 'To',
            type: 'input',
            render: (item, map, index, handleInput, renderDefault, lastIndex) => (
              <div>
                <div style={{height: 27}}
                >To: </div>
                <HotLinkSelector
                  item={item}
                  handleInput={value => handleInput(index, 'to', value)}
                  defaultValue={item.to}
                  options={[
                    'bookingName',
                    'colorLabel',
                    'dueDate',
                  ]}
                >
                </HotLinkSelector>
              </div>
            )
          }
        ]}
        items={this.state.campaign.hotLinks}
        addButtonText="Add Hot Link"
        onSave={async(items, setSaved) => {

          setSaved(true)

          await this.actions.updateCampaign(this.state.campaign.campaignKey, {
            hotLinks: items
          })

          this.componentDidMount()
        }}
      ></ArrayBuilder>
    )

  }

  renderKeywordsBuilder = () => {
    return (
      this.state.campaign &&
      <ArrayBuilder
        itemMap={[ 
          {
            dataIndex: 'keyword',
              label: 'Target Keyword',
              type: 'input',
              render: (item, map, index, handleInput, renderDefault, lastIndex) => (
                <div>
                  <div style={{height: 27}}
                  >Keyword:</div>
                {renderDefault()}
              </div>
              )
          },
          {
            dataIndex: 'targetUrl',
            label: 'Target URL',
            type: 'input',
            render: (item, map, index, handleInput, renderDefault, lastIndex) => (
              <div>
                <div style={{height: 27}}
                >Target URL:</div>
              {renderDefault()}
            </div>
            )
          },
          {
            dataIndex: 'priority',
            label: 'Priority',
            type: 'checkbox',
            render: (item, map, index, handleInput, renderDefault, lastIndex) => (
              <div>
                <div style={{
                  height: 27,
                  marginRight: 40,
                  marginLeft: 18
                }}
              >Priority:</div>
            <Checkbox 
              style={{
                marginLeft: 20
              }}
              checked={item[map.dataIndex] ? true : false}
              onChange={e => handleInput(index, map.dataIndex, e.target.checked)} 
            />
          </div>
            )
          }
        ]}
        items={(this.state.campaign || {}).targetKeywords ? (this.state.campaign || {}).targetKeywords : []}
        addButtonText="Add Keyword"
        onSave={async(items, saved) => {

          saved(true)

          await this.actions.updateCampaign(this.state.campaign.campaignKey, {
            targetKeywords: items
          })

          this.componentDidMount()

        }}
      ></ArrayBuilder>
    )
  }

  renderFlag = (flag, jsonFlags, i) => (
    <div
      key={i}
      style={{
        backgroundColor: this.flagColor(flag, jsonFlags),
        color: 'white',
        padding: '0 4px',
        borderRadius: 5,
        fontSize: 10,
        minWidth: 44,
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textAlign: 'center',
        marginLeft: 2,
        boxShadow: 'rgba(0, 0, 0, 0.19) 1px 1px 3px 0px',
      }}
    >{flag}</div>
  )

  flagColor = (flag, jsonFlags) => {
    if(!flag) return

    let color = (colorPicker('template', 'colorLabel', (jsonFlags.find(
      flagObj => flagObj.value === flag
    ) || {}).colorLabel) || {}).color

    if(!color || color.length === 0) {
      return '#969696'
    }

    return color
  }

  renderActivatedBookings = () => {
    const columns = [
      {
        title: 'Booking Name',
        dataIndex: 'bookingName',
      },
      {
        title: 'Period',
        dataIndex: 'periodKey',
      },
      {
        title: 'Status',
        dataIndex: 'currentStatus',
      },
      {
        title: 'Created',
        dataIndex: 'created',
        render: date => moment(date).format('YYYY-MM-DD')
      },
      {
        title: 'Flags',
        dataIndex: 'flags',
        render: (flags, booking) => (
          <div style={{position: 'relative'}}>
            <div style={{
              position: 'absolute',
              left: 0,
              top: -8,
              height: 16,
              // width: 100,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
            }}>
              {
                (flags || []).map((flag, i) => (
                  this.renderFlag(flag, booking.jsonFlags, i)
                ))
              }
            </div>
          </div>
        )
      },
      {
        title: 'Booking Division',
        dataIndex: 'bookingDivName',
      },
      {
        title: 'Due Date',
        dataIndex: 'dueDate',
        render: date => moment(date).format('YYYY-MM-DD')
      }
    ]
    return (
      <Col
        style={{
          paddingTop: 16,
          paddingBottom: 8,
          marginBottom: 46,
          borderRadius: 5
        }}
        span={24}
      >
        <Table
          pagination={{position: 'top'}}
          size="small"
          rowKey="bookingsKey"
          dataSource={this.state.activatedBookings}
          columns={columns}
          onRow={record => {
            return {
              onClick: () => this.props.history.push(`/${record.bookingDivName.toLowerCase()}/bookings/booking/${record.bookingsKey}`)
            }
          }}
        />
      </Col>
    )
  }

  divTabsRender = () => (
    this.state.divTabs ?
    this.state.divTabs.map((divTab,i) => (
      <TabPane key={i} tab={divTab.divTabsName}>
        <JsonFormFill
          jsonForm={divTab.jsonForm}
          update={state => {
            return this.handleSubmitJsonForm(state, divTab.divTabsKey)
          }}
        />
      </TabPane>
    ))
    :
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
  )

  onTabChange = key => {
    if(key === 'Activated Bookings') this.populateActivatedBookings()
  }

  render() {
    return (
      <Content 
        style={{
          margin: '94px 16px 24px', padding: 24, minHeight: 280,
        }}
      >
        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false} style={{'width': '100%'}}>
              {this.renderCampaignHeader()}
            </Card>
          </Col>

          <Col span={24}>
            <Card bordered={false} 
              style={{
                width: '100%', 
                minHeight: 652,
                marginTop: 15
              }}>
              <Tabs
                onChange={this.onTabChange}
                defaultActiveKey="Pending Bookings"
              >

                <TabPane tab="Pending Bookings" key="Pending Bookings">
                  {this.renderPendingBookings()}
                </TabPane>
                <TabPane tab="Activated Bookings" key="Activated Bookings">
                  {this.renderActivatedBookings()}
                </TabPane>
                <TabPane tab="Auto Fill" key="Auto Fill">
                  {this.renderAutoFill()}
                </TabPane>

              </Tabs>
            </Card>
          </Col>
        </Row>

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

import React, { Component } from 'react'
import '../../../App.css'
import { Modal, Tag, Popconfirm, message, Layout, Row, Col, Card, Input, Button, Tabs, Drawer, Table } from 'antd'
import Icon from 'antd/lib/icon'
import { Skeleton } from 'antd'
import API from '../../../actions/campaign-hub/Actions'
import Helper from '../../../actions/campaign-hub/Helper'
import uuid from 'uuid'
import AddProductsPanel from './AddProductsPanel.js'

const { Content } = Layout
const TabPane = Tabs.TabPane

export default class ViewPackage extends Component {
  constructor(props) {
    super(props)

    this.actions = new API(props.user.apiKey)
    this.helper = new Helper(props.user.apiKey)

    this.state = {
      campaignPackage: null,
      selectedProducts: [],
      period: 1,
      addProduct: false,
      products: [],
      isLoading: true,
      searchTerm: '',
      tabs: [],
      maxPeriod: null,
    }
  }

  async componentDidMount() {

    this.props.changeHeader('sound', 'CampaignHub', [
      { name: 'Packages', url: '/campaign-hub/packages' },
      { name: 'Package', url: '/campaign-hub/packages/' + this.props.match.params.packageKey }
    ])

    const campaignPackage = await this.actions.getPackageWithPeriodsAndProductNames(this.props.match.params.packageKey)

    const { periods } = campaignPackage

    const products = await this.actions.getProducts()

    const {
      tabs, maxPeriod
    } = this.helper.parseTabs(periods, products, this.makeTabsAndGetMaxPeriod)

    await this.setState({
      // TODO: This parseTabs logic needs cleaning up, I'm passing products as an arg to get
      // the bookingDivName from it (which comes from a join) and I'm getting all the other 
      // product properties from the periods object!
      //
      // It's really weird and needs amending, I'm also not even using products until the
      // very last render function and it gets passed to about three different funcs before then.
      // :)
      //
      // Just change it so that all the products info is in products (as well as bookingsDivName)
      // and all the periods params are in periods. You'll have to change this in the 
      // Queries.js file first then go to the Table. It's not a big deal, I just don't have
      // time right now.
      tabs,
      maxPeriod,
      products,
      periods,
      campaignPackage,
      isLoading: false
    })
  }

  toggleAddProduct = () => {
    this.setState({addProduct: !this.state.addProduct})
  }

  handleAddProduct = async selectedProductKeys => {

    const { 
      period
    } = this.state

    const { packageKey } = this.state.campaignPackage

    const periods = selectedProductKeys.map(productKey => (
      {
        periodKey: uuid.v1(),
        productKey,
        packageKey,
        period
      }
    ))

    let result = await this.actions.createPeriods(periods)

    if(!result) message.error('There was an error saving the Products to this Package.')
    else message.success('Products saved.')

    this.componentDidMount()
  }

  tabChange = async (periodKey) => {
    await this.setState({period: Number(periodKey)})
  }
  
  handleDelPeriod = async periodKey => {
    await this.actions.deletePeriod(periodKey)
    this.componentDidMount()
  }

  renderTotalValue = (dataIndex, periods) => {
    if(!periods || periods.length === 0) return 0

    return periods.reduce((num, period) => {

      if(period.products[0][dataIndex]) {
        return num + Number(period.products[0][dataIndex])
      }
      return num
    }, 0).toFixed(2)

  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderProductsTable = (periods, products) => ( 
    <Table
      size="small"  
      rowClassName={'bms_clickable'}
      rowKey="periodKey"
      columns={[
        {
          title: 'Product Name',
          dataIndex: 'productName',
          key: 'productName',
        },
        {
          title: 'Booking Division',
          dataIndex: 'bookingDivName'
        },
        {
          title: 
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {
                this.renderTotalValue('costPrice', periods) > 0 &&
                <span
                  style={{
                    width: 240,
                    position: 'absolute',
                    textAlign: 'center',
                    top: -20,
                    zIndex: 1,
                  }}
                >
                  <Tag
                    color="#0000008c"
                    style={{
                      fontSize: 11,
                    }}
                  >
                    Total Cost {this.renderTotalValue('costPrice', periods)}
                  </Tag>
                </span>
              }
              Cost Price
            </div>,
          dataIndex: 'costPrice'
        },
        {
          title: 
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {
                this.renderTotalValue('retailPrice', periods) > 0 &&
                <span
                  style={{
                    width: 240,
                    position: 'absolute',
                    textAlign: 'center',
                    top: -20,
                    zIndex: 1,
                  }}
                >
                  <Tag
                    color="#0000008c"
                    style={{
                      fontSize: 11,
                    }}
                  >
                    Total Retail {this.renderTotalValue('retailPrice', periods)}
                  </Tag>
                </span>
              }
              Retail Price
            </div>,
          dataIndex: 'retailPrice'
        },
        {
          title: 
            <div
              style={{
                display: 'flex',
                justifyContent: 'center',
              }}
            >
              {
                this.renderTotalValue('quantity', periods) > 0 &&
                <span
                  style={{
                    width: 240,
                    position: 'absolute',
                    textAlign: 'center',
                    top: -20,
                    zIndex: 1,
                  }}
                >
                  <Tag
                    color="#0000008c"
                    style={{
                      fontSize: 11,
                    }}
                  >
                    Total Quantity {this.renderTotalValue('quantity', periods)}
                  </Tag>
                </span>
              }
              Booking Quantity
            </div>,
          dataIndex: 'quantity'
        },
        {
          title: '',
          dataIndex: 'deleteCol',
          key: 'deleteCol',
          render: (value, record, i) => (
            <Popconfirm
              title="Are you sure you want to remove this product?"
              okText="Yes"
              cancelText="No"
              placement="topRight"
              onConfirm={() => this.handleDelPeriod(record.periodKey)}
            >
              <Icon 
                style={{fontSize: 18}}
                type="minus-circle" 
              />
            </Popconfirm>
          )
        }, 
      ]}
      dataSource={
        (periods || []).length > 0 ?
        periods.map(period => {
          return { 
          ...period, 
            productName: ((period.products || [])[0] || {}).productName,
            costPrice: ((period.products || [])[0] || {}).costPrice,
            retailPrice: ((period.products || [])[0] || {}).retailPrice,
            quantity: ((period.products || [])[0] || {}).quantity,
            bookingDivName: products.find(prod => prod.productKey === period.productKey).bookingDivName
          } 
        })
        :
        []
      }
    >
    </Table>
  )

  makeTabsAndGetMaxPeriod = (tabs, periods, products, maxPeriod) => {
    return {
      tabs: tabs.map(num => this.renderTab(num, periods, products)),
      maxPeriod
    }
  }

  renderTab = (num, periods, products) => (
    {
      title: 'Period ' + num,
      period: num,
      key: num,
      content: this.renderProductsTable(( periods  || []).filter(per => per.period === num), products)
    }
  )

  showConfirmModal = (packageKey, tabs, maxPeriod) => {

      const setState = this.setState.bind(this)
      const actions = this.actions

      Modal.confirm({
        title: 'Do you want to delete this Period?',
        content: 'It has products assigned to it.',
        async onOk() {

          if(maxPeriod) maxPeriod--

          let tab = tabs.pop()

          if(tab) actions.deletePeriodsByPackageKeyAndPeriod(packageKey, tab.period)

          setState({ tabs, maxPeriod })
        }
      })
  }

  onEdit = (type) => {
    let { tabs, maxPeriod } = this.state

    if(type === 'add') {

      // Add one to the last item in the tabs array (which is just an array of numbers)
      // Keep track of it in maxPeriod so the ui knows how many tabs to render.
      maxPeriod = (tabs[tabs.length -1] || { key: 0 }).key + 1

      tabs.push(this.renderTab(maxPeriod))

      this.setState({ tabs, maxPeriod })

    } else if(type === 'remove') {

      const { periods } = this.state

      const packageKey = this.state.campaignPackage.packageKey

      if((periods || []).find(per => Number(per.period) === Number(maxPeriod))) {

        this.showConfirmModal(packageKey, tabs, maxPeriod)

        return

      }

      if(maxPeriod) maxPeriod--

      tabs.pop()

      this.setState({ tabs, maxPeriod })

    }


  }

  render() {


    return (
      this.state.campaignPackage && (this.state.products || []).length > 0 &&
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>

        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false} style={{'width': '100%'}}>
              <Row>
                <Col>
                  <Skeleton loading={this.state.isLoading} active={true} title={{width: 150}} paragraph={{rows: 0}}>

                    <h5>{this.state.campaignPackage.packageName}</h5>

                    <AddProductsPanel
                      products={this.state.products}
                      onAdd={this.handleAddProduct}
                    />

                  </Skeleton>
                </Col>
              </Row>
            </Card>
          </Col>

          <Col span={24}>
            <Card bordered={false} style={{
              width: '100%',
              marginTop: 15,
              minHeight: 600
            }}>
              <Row>
                <Col span={24}>

                  <Tabs
                    type="editable-card"
                    onEdit={(key, action) => {
                      this.onEdit(action)
                    }}
                    onChange={key => this.setState({period: key})}
                  >
                    {
                      this.state.tabs.map((tab, i) => ( 
                        <TabPane
                          key={tab.key}
                          closable={i === this.state.tabs.length - 1}
                          tab={tab.title}
                        >
                          {tab.content}
                        </TabPane>
                      ))
                    }
                  </Tabs>

                </Col>
              </Row>

            </Card>

          </Col>

        </Row>


      </Content>

    )
  }
}

import React, { Component } from 'react'
import Actions from '../../actions/reports/Actions.js'
import BenchmarkDrawer from './BenchmarkDrawer.js'
import ExpandedRowRender from './ExpandedRowRender.js'
import TargetsDrawer from './TargetsDrawer.js'
import BenchmarkTableColumns from './BenchmarkTableColumns.js'
import {
  fail,
  getCustomerSites,
  getBenchmark,
  onChangePage,
  basePath
} from './Benchmarks.handlers.js'
import {
  Table,
  message,
  Layout,
  Button,
  Card,
  Row,
  Col
} from 'antd'

import {
  PuppeteerTargets,
  CheerioTargets
} from '../../mixins/Targets.js'

import './Benchmarks.css'

const { Content } = Layout;

export default class Benchmarks extends Component {

  actions = new Actions(this.props.user.apiKey)

  state = {
    customerSites: [],
    benchmarks: [],
    loading: false,

    expandedRowKeys: [],
    benchmark: undefined,

    drawerOpen: false,

    cheerioTargets: CheerioTargets(),
    puppeteerTargets: PuppeteerTargets()
  }

  componentDidMount = async() => {

    this.props.changeHeader('line-chart', 'Reports', [
      { name: 'Benchmarks', url: basePath },
    ])

    const { customerSiteKey, benchmarksKey } = this.props.match.params
    const expandedRowKeys = customerSiteKey ? [customerSiteKey] : []

    this.setState({
      expandedRowKeys,
      benchmark: await getBenchmark(benchmarksKey, this.actions, this.state.benchmark),
      customerSites: await getCustomerSites(this.actions)
    })

  }

  onClickRunBenchmark = async selectedCustomerSite => {

    const hide = message.loading('Creating benchmark record, please wait...', 0)

    this.setState({ loading: true })

    const { customerSiteKey } = selectedCustomerSite

    const result = await this.actions.createBenchmarkForSite(customerSiteKey, {
      puppeteerTargets: PuppeteerTargets(),
      cheerioTargets: this.state.cheerioTargets
    })

    hide()

    if(!result) {

      fail(
        'There was a problem creating a benchmark for this website',
        this.state.benchmarks
      ) 

    } else {
      message.success('Benchmark created!')
    }


    const customerSites = await getCustomerSites(this.actions)

    if(!customerSites) fail(
      'Sorry there was a problem getting the customer sites.'
    )

    this.setState({
      customerSites,
      loading: false
    })

  }


  onExpand = (expanded, { customerSiteKey }) => {

    const { history } = this.props
    const { page = 1 } = this.props.match.params

    if(!expanded) {

      history.push(`${basePath}/${page}`)
      return this.setState({expandedRowKeys: []})

    }
      
    history.push(`${basePath}/${page}/${customerSiteKey}`)
    this.setState({expandedRowKeys: [customerSiteKey]})

  }

  setBenchmarkToProps = async benchmarksKey => {
    this.setState({
      benchmark: await getBenchmark(benchmarksKey, this.actions, this.state.benchmark)
    })
  }

  handleChangeTargets = (cheerioTargets) => {
    this.setState({ cheerioTargets })
  }


  render = () => {

    return (

    <Content style={{
      margin: '94px 16px 24px', padding: 24, minHeight: 280,
    }}>
      <Card bordered={false} style={{ 'width': '100%' }}>

        <Row>
          <Col span={12}>
            <h2>Customer Sites</h2>
          </Col>
          <Col span={12} style={{ textAlign: 'right' }}>
            <Button
              type="link"
              onClick={() => this.setState({ drawerOpen: true })}
            >Change defaults</Button>
          </Col>
        </Row>

        <Table
          size="small"
          pagination={{
            current: Number(this.props.match.params.page) || 1,
            onChange: page => onChangePage(page, this.props.match, this.props.history)
          }}
          rowKey="customerSiteKey"
          dataSource={this.state.customerSites}
          columns={BenchmarkTableColumns({
            onClick: record => this.onClickRunBenchmark(record),
            disabled: this.state.loading
          })}
          expandedRowKeys={this.state.expandedRowKeys}
          onExpand={this.onExpand}
          expandedRowRender={record => <ExpandedRowRender setBenchmarkToProps={this.setBenchmarkToProps} record={record} />}
        >
        </Table>

      </Card>

      <BenchmarkDrawer
        onClose={() => this.setState({benchmark: undefined})}
        benchmark={this.state.benchmark}
      >
      </BenchmarkDrawer>

      <TargetsDrawer
        cheerioTargets={this.state.cheerioTargets}
        onChange={this.handleChangeTargets}
        visible={this.state.drawerOpen}
        onClose={() => this.setState({ drawerOpen: false })}
      >
      </TargetsDrawer>

    </Content>

    )
  }
}

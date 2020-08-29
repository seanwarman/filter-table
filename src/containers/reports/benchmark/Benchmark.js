import React from 'react'
import Actions from '../../../actions/reports/Actions.js'
import {
  Layout,
  Card,
} from 'antd'
import Report from './Report.js'

const { Content } = Layout;

class Benchmark extends React.Component {
  actions = new Actions(this.props.apiKey)

  state = {
    benchmark: undefined
  }

  async componentDidMount() {

    this.props.changeHeader('line-chart', 'Reports', [
      { name: 'Benchmarks', url: `/reports/benchmarks/1` },
      { name: 'Benchmark', url: this.props.location.pathname },
    ])

    const { benchmarksKey } = this.props.match.params

    const benchmark = await this.actions.getBenchmark(benchmarksKey)

    this.setState({benchmark})

  }

  render() {

    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
        <Card bordered={false} style={{
          width: '100%',
          padding: '80px 20%'
        }}>

          <Report
            benchmark={this.state.benchmark}
          >
          </Report>

        </Card>

      </Content>
    )
  }
}

export default Benchmark

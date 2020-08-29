import React, { Component } from 'react';
import { Layout, Tabs, DatePicker, Form } from 'antd';
import { Chart } from 'react-google-charts';
import Actions from '../../actions/reports/Actions'
import moment from 'moment'


const { Content } = Layout;
const TabPane = Tabs.TabPane;
const { RangePicker } = DatePicker;
export default class UnitTracker extends Component {
  constructor(props) {
    super(props);

    this.actions = new Actions(props.user.apiKey, props.user.userKey)
    this.state = {
      startDate: moment().startOf('isoWeek').format('YYYY-MM-DD'),
      endDate: moment().format('YYYY-MM-DD'),
      unitsPerDay: 25, // the number of units per day erxpected from the content team
    }
  }

  async componentDidMount() {
    // const intervalID = setInterval(() => {
    this.loadData(this.state.startDate, this.state.endDate);
    // }, 6000)
  }
  getRange = (startDate, endDate) => {
    startDate = moment(startDate, 'YYYY-MM-DD');
    endDate = moment(endDate, 'YYYY-MM-DD');
    let range = 0;
    while (startDate <= endDate) {
      if (startDate.format('ddd') !== 'Sat' && startDate.format('ddd') !== 'Sun') {
        range++; //add 1 to your counter if its not a weekend day
      }
      startDate = moment(startDate, 'YYYY-MM-DD').add(1, 'days'); //increment by one day
    }
    return range * this.state.unitsPerDay;
  }
  getTotalUnits = async (startDate, endDate) => {
    console.log('dates: ', startDate, endDate);
    let data = await this.actions.getPersonalTotalUnits(startDate, endDate);
    let result = [['Name', 'Value']];
    if (data.length > 0) {
      data.forEach(function (item) {
        result.push([item.name, item.units])
      });
    }
    else {
      console.log('error data: ', data);
    }
    console.log('total data: ', result);
    return result;
  }
  getBreakdownUnits = async (startDate, endDate) => { // the purpose of this function is to convert the linear array from sql into a pivot table that google chart can use
    let data = await this.actions.getPersonalBreakdownUnits(startDate, endDate);
    let result = [['Name']];
    let names = [];
    if (data.length > 0) {
      data.forEach(function (item) {
        let currentName = item.name;
        let currentValue = item.units;
        let currentType = item.type;
        let newType = result[0].includes(currentType);
        if (!newType) {
          result[0].push(currentType); // populate title row
        }
        let currentTypeIndex = result[0].indexOf(currentType);
        let isNewUser = names.includes(currentName);
        if (!isNewUser) {
          names.push(currentName);
          result.push([currentName]);
        };
        let currentUserIndex = names.indexOf(currentName) + 1;
        if (result[currentUserIndex][currentTypeIndex] === undefined) {
          result[currentUserIndex][currentTypeIndex] = currentValue;
        }
        else {
          result[currentUserIndex][currentTypeIndex] = currentValue + result[currentUserIndex][currentTypeIndex];
        }
      });
    }
    else {
      console.log('error data: ', data);
    }
    for (let i = 1; i < result.length; i++) // populate all the unfilled values
    {
      for (let j = 1; j < result[0].length; j++) {
        if (result[i][j] === undefined) {
          result[i][j] = 0;
        }
      }
    }
    // console.log('breakdown data: ',result);
    return result;
  }
  updateDates = (moments) => {
    let startDate = moment(moments[0]).format('YYYY-MM-DD');
    let endDate = moment(moments[1]).format('YYYY-MM-DD');
    this.loadData(startDate, endDate);
  };
  loadData = async (startDate, endDate) => {
    const totalStats = await this.getTotalUnits(startDate, endDate);
    const breakdownStats = await this.getBreakdownUnits(startDate, endDate);
    const range = this.getRange(startDate, endDate);
    this.setState({
      totalStats,
      breakdownStats,
      range,
      startDate,
      endDate
    });
  }
  componentWillUnmount() {
    if (this.state.intervalID !== null) {
      clearInterval(this.state.intervalID)
    }
  }
  render() {
    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
        <Form.Item label="Date Range">
          <RangePicker
            placeholder={[this.state.startDate, this.state.endDate]}
            size="small"
            onChange={moments => { this.updateDates(moments) }}
          ></RangePicker>
          <span>&nbsp;{this.state.range / this.state.unitsPerDay} Working Days</span>
        </Form.Item>
        <Tabs
          onChange={this.onTabChange}
          defaultActiveKey="Pending Bookings"
        // defaultActiveKey="Target Keywords"
        >
          <TabPane tab="Total Units" key="Total Units">
            <Chart
              width={window.width}
              height={window.innerHeight / 2}
              chartType="Gauge"
              loader={<div>Loading Chart</div>}
              data={this.state.totalStats}
              options={{
                redFrom: 0, redTo: this.state.range / 2,
                yellowFrom: this.state.range / 2,
                yellowTo: this.state.range,
                greenFrom: this.state.range,
                greenTo: this.state.range * 2,
                max: this.state.range * 2,
                minorTicks: 10,
                greenColor: '#2CAAE0'
              }}
              rootProps={{ 'data-testid': '1' }}
            />
          </TabPane>
          <TabPane
            tab="Unit Breakdown" key="Unit Breakdown">
            <Chart
              width={window.width}
              height={window.innerHeight / 2}
              chartType="ColumnChart"
              loader={<div>Loading Chart</div>}
              data={this.state.breakdownStats}
              options={{
                isStacked: true,
                width: window.width,
                height: window.height / 2,
                legend: { position: 'right', maxLines: 3 },
                hAxis: {
                  title: 'Content Executive'
                },
                vAxis: {
                  title: 'Units Completed'
                },
              }}
              // For tests
              rootProps={{ 'data-testid': '2' }}
            />
          </TabPane>
        </Tabs>
      </Content>);

  }
}

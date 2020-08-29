import React, { Fragment, Component } from 'react';
import '../../../App.css';
import {
  Layout,
  Button,
  Statistic,
  Icon,
  Col,
  Row,
  Card,
  DatePicker,
  message,
  Skeleton,
  Form,
  Drawer,
  Input
} from 'antd';
import { Chart } from 'react-google-charts';
import color from './../../../libs/bigglyStatusColorPicker';
import ChartError from '../../../components/Error/ChartError';

const { Content } = Layout;
const Countdown = Statistic.Countdown;

var moment = require('moment');
const dateFormat = 'YYYY-MM-DD';

var dS = new Date();
dS.setDate(dS.getDate() - 7);

const options = {
  colors: ['#7AC663','red'],
  isStacked: true,

  title: '',
  hAxis: {
    title: 'Date',
    showTextEvery: 40,
    titleTextStyle: { color: '#333' },
    textStyle: {
      color: '#333',
      // fontName: 'Product Sans',
      fontSize: '12'
    }
  },
  vAxis: {gridlines: {color: 'transparent'},
          0:{title: 'Time (ms)', minValue: 0},
          1:{title: 'Error Code', minValue: 200, maxValue: 600}}, // not rendering min max
  series:{
    0:{areaOpacity: 0.8,
      pointSize: 3,
      interpolateNulls: true,
      targetAxisIndex: 0},
    1:{areaOpacity: 0,
      pointSize: 1,
      interpolateNulls: false,
      targetAxisIndex: 1}
    },
  
  theme: 'material',
  legend: { position: 'none' },
  chartArea: {
    width: '90%',
    height: '70%',
    textStyle: {
      color: '#333',
      // fontName: 'Product Sans',
      fontSize: '12',
      fontStyle: 'none'
    }
  },
  animation: {
    duration: 1000,
    easing: 'out',
    startup: true
  }
};

class Stats extends Component {
  state = {
    sitepingInfo: {},
    pings: [],
    pingDates: [],
    url: [],
    chartArray: [],
    drStart: moment(dS).format('YYYY-MM-DD'),
    drEnd: moment(new Date()).format('YYYY-MM-DD'),
    loading: true,
    showDrawer: false
  };

  async componentDidMount() {
    const { sitepingKey } = this.props.match.params;

    this.props.changeHeader('alert', 'SitePing', [
      { name: 'Sites', url: '/siteping/sites' },
      {
        name: 'Stats',
        url: '/siteping/stats/' + this.props.match.params.sitepingKey
      }
    ]);

    let stateCopy = { ...this.state };

    let sitepingInfo = await this.props.api.getPublic({
      name: 'bms_siteping.siteping',
      columns: [
        {name: 'sitepingKey'},
        {name: 'partnerKey'},
        {name: 'customerKey'},
        {name: 'customerSiteKey'},
        {name: 'created'},
        {name: 'pingFrequency'},
        {name: 'pingLabel'},
        {name: 'active'},
        {name: 'nextPing'},
        {name: 'siteUrl'},
        {name: 'statusCode'},
        {name: 'status'},
      ],
      where: [
        `sitepingKey = "${sitepingKey}"`
      ]
    })

    stateCopy.sitepingInfo = sitepingInfo;

    // Make Call to API and return data, currently hardcoded
    let pings = await this.props.api.listPublic({
      name: 'bms_siteping.pings',
      columns: [
        {name: 'created'},
        {name: 'sitepingKey'},
      ],
      where: [
        `sitepingKey = "${sitepingKey}"`,
        `created BETWEEN "${this.state.drStart}" AND "${this.state.drEnd}"`
      ]
    })

    if (!pings || pings.length < 1) {
      // Redirect to siteping/sites page
      message.error('No ping data available at this time');
    } else {
      message.success('Ping information collected');
    }

    stateCopy.pings = pings;

    stateCopy.chartArray = pings.map((pingObject, i) => {
      if(pingObject.statusCode === 200)
      {
        return [
          moment(pingObject.created).format('Do MMM YY hh:mm'),
          pingObject.totalTime,
          null // if statusCode = 200 render null instead
        ];
      }
      else
      {
        return [
          moment(pingObject.created).format('Do MMM YY hh:mm'),
          pingObject.totalTime,
          pingObject.statusCode
        ];
      }
    });
    // console.log(stateCopy.chartArray );
    // Get all dates and format per each ping
    let pingDates;

    stateCopy.pingDates = pingDates;

    stateCopy.pingDates = pings.map((ping, i) => {
      return moment(ping.created).format('DD-MM-YYYY');
    });

    /**
     * Src: https://codereview.stackexchange.com/questions/184248/sorting-dates-in-this-format-dd-mm-yyyy#answer-184254
     * @param {} date
     * -----------------------
     * Breaks apart the dates inside of the array and orders as number - need to be in - - format
     */
    const reverseDateRepresentation = date => {
      let parts = date.split('-');
      return `${parts[2]}-${parts[1]}-${parts[0]}`;
    };

    const dateArray = stateCopy.pingDates
      .map(reverseDateRepresentation)
      .sort()
      .map(reverseDateRepresentation);

    console.log(dateArray);

    this.loadDataAndSetState(sitepingInfo);

    // Default boolean
    stateCopy.loading = false;

    this.setState(stateCopy);
  }

  /**
   *
   * function for disabling future dates in the date picker
   *
   */

  disabledDate = current => {
    let customDate = moment(); // today's date
    return current && current > moment(customDate, 'YYYY-MM-DD');
  };

  /**
   *
   * Maths functions for the statistic containers
   *
   */

  averageUpTime = () => {
    // Ping stuff
    let totalPings = this.state.pings;
    let totalPingsOriginal = this.state.pings;

    totalPings.filter(
      ping => ping.statusCode === 200 && ping.statusMessage === 'OK'
    );

    let totalPingCount = (totalPings.length / totalPingsOriginal.length) * 100;

    return totalPingCount;
  };

  AveragePingTime = () => {
    let sitePings = this.state.pings;
    let totalTimeArr = [];

    sitePings.forEach(sp => {
      totalTimeArr.push(sp.totalTime);
    });

    const sum = totalTimeArr.reduce((previous, current) => (current += previous), 0);
    const avg = sum / totalTimeArr.length;

    return avg;
  };

  // nextAvailablePing = () => {
  //   // SEAN W - next ping times aren't correct
  //   let nextSitePing = this.state.sitepingInfo.nextPing;
  //   console.log('next site ping', nextSitePing);
  //   // console.log('type of', typeof(nextSitePing));
  //   let momentFormat = moment(JSON.parse(nextSitePing)).format(
  //     'DD-MM-YYYY HH:MM:SS'
  //   );
  //   console.log(momentFormat);
  //   // let formatNextPing = moment(timestamp).format('YYYY-MM-DDTHH:mm:ss:SSS');

  //   // NEXT PING SUPPORT
  //   const currentTime = moment().format('HH:MM:SS');
  //   console.log(currentTime);
  // };

  /**
   *
   * Site Ping Data Drawer
   *
   */

  showPingDataDrawer = pingKey => {
    this.setState({
      showDrawer: true
    });
  };

  close = () => {
    this.setState({
      showDrawer: false
    });
  };

  /**
   *
   * Form input changes
   *
   */

  handleChange = e => {
    this.setState({ value: e.target.value });
  };

  loadDataAndSetState = async stateCopy => {
    let sitepingInfo;

    sitepingInfo = await this.props.api.getPublic({
      name: 'bms_siteping.site_ping',
      columns: [
        {name: 'sitepingKey'},
        {name: 'partnerKey'},
        {name: 'customerKey'},
        {name: 'customerSiteKey'},
        {name: 'created'},
        {name: 'pingFrequency'},
        {name: 'pingLabel'},
        {name: 'active'},
        {name: 'nextPing'},
        {name: 'siteUrl'},
        {name: 'statusCode'},
        {name: 'status'},
      ],
      where: [
        `sitepingKey = "${stateCopy.sitepingKey}"`
      ]
    })

    stateCopy.sitepingInfo = sitepingInfo;
  };

  updatePing = async site => {
    const result = await this.props.api.updatePublic({
      name: 'bms_siteping.site_ping',
      where: [
        `sitepingKey = "${site.sitepingKey}"`
      ]
    }, {
      pingLabel: site.pingLabel,
      pingFrequency: site.pingFrequency
    })
    if(!result) {
      message.error('Something seems to have gone wrong, please try again.');
    } else {
      message.success('Success! Siteping data has been updated.');
    }

    this.setState({ showDrawer: false });
  };

  onDateChange = async dates => {
    await this.setState({
      drStart: moment(dates[0]).format('YYYY-MM-DD'),
      drEnd: moment(dates[1]).format('YYYY-MM-DD')
    });

    this.componentDidMount();
  };

  render() {
    const { sitepingInfo, pings, loading } = this.state;
    return (
      <div>
        <Content
          style={{
            margin: '94px 16px 24px', 
            padding: 24,
            minHeight: 280
          }}
        >
          <Card
            className="bms--parent-card-container-no-bg bms--card-no-padding bms--top-card-mb-20 bms-white-bg"
            title={
              !loading ? (
                <Fragment>
                  <h3 style={{ marginBottom: '0' }}>
                    Hello{' '}
                    <span
                      style={{
                        color: color('template', 'colorLabel', 'blue').color
                      }}
                    >
                      {sitepingInfo.customerName}
                    </span>
                  </h3>
                  <p style={{ marginBottom: '0' }}>{sitepingInfo.siteUrl}</p>
                </Fragment>
              ) : null
            }
            headStyle={{ marginBottom: '0' }}
            bodyStyle={{ paddingTop: '0', paddingLeft: '0', paddingRight: '0' }}
            extra={
              <Fragment>
                <Button
                  onClick={() =>
                    this.showPingDataDrawer(sitepingInfo.sitepingKey)
                  }
                >
                  Settings
                  <Icon type="setting" />
                </Button>
                <Button
                  type="primary"
                  target="_blank"
                  href={`http://${sitepingInfo.siteUrl}`}
                >
                  Visit site
                  <Icon type="select" />
                </Button>
              </Fragment>
            }
            bordered={false}
            style={{ width: '100%' }}
          >
            {!loading ? (
              <div style={{ margin: '20px 0' }}>
                <span
                  style={{
                    padding: '5px 10px',
                    color: '#ffffff',
                    background: color('template', 'colorLabel', 'green').color
                  }}
                >
                  {sitepingInfo.pingLabel}
                </span>
              </div>
            ) : null}
            <Row id="bms--grid-parent" className="bms--grid-layout" gutter={16}>
              <Col span={8}>
                <Card
                  className="bms-blue-bg bms--inner-card-content-padding bms--vertical-height-100"
                  id="bms-card-title-blue"
                  title={<div><Icon type="arrow-up" /> Average Uptime</div>}
                  bordered={false}
                  style={{
                    backgroundColor: color('template', 'colorLabel', 'purple')
                      .color
                  }}
                  loading={loading}
                >
                  {pings.length > 0 ? (
                    <Statistic
                      value={this.averageUpTime()}
                      valueStyle={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '4rem'
                      }}
                      precision={2}
                      suffix="%"
                    />
                  ) : (
                    <Skeleton active paragraph={{ rows: 4 }} />
                  )}
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  className="bms-blue-bg bms--inner-card-content-padding bms--vertical-height-100"
                  id="bms-card-title-blue"
                  title={<div><Icon type="clock-circle" /> Average Ping Time</div>}
                  bordered={false}
                  style={{
                    backgroundColor: color('template', 'colorLabel', 'blue')
                      .color
                  }}
                  loading={loading}
                >
                  {pings.length > 0 ? (
                    <Statistic
                      valueStyle={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '4rem'
                      }}
                      value={this.AveragePingTime()}
                      precision={2}
                      suffix="ms"
                    />
                  ) : (
                    <Skeleton active paragraph={{ rows: 4 }} />
                  )}
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  className="bms-blue-bg bms--inner-card-content-padding bms--vertical-height-100"
                  id="bms-card-title-blue"
                  title={<div><Icon type="arrow-right" /> Next Ping in...</div>}
                  bordered={false}
                  style={{
                    color: '#ffffff',
                    backgroundColor: color('template', 'colorLabel', 'green')
                      .color
                  }}
                  loading={loading}
                >
                  {pings.length > 0 ? (
                    <Countdown
                      valueStyle={{
                        color: 'white',
                        textAlign: 'center',
                        fontSize: '4rem'
                      }}
                      //   title="Countdown"
                      //   value={}
                      //   onFinish={}
                    />
                  ) : (
                    /* {this.nextAvailablePing()} */
                    <Skeleton active paragraph={{ rows: 4 }} />
                  )}
                </Card>
              </Col>
            </Row>
            <Row>
              <Col span={24} style={{ textAlign: 'left' }}>
                <Card
                  className="bms--card-table-control-card"
                  title="Ping Information"
                  bodyStyle={{
                    backgroundColor: 'none',
                    paddingLeft: '0',
                    paddingRight: '0'
                  }}
                  headStyle={{ marginBottom: '0' }}
                  extra={
                    <div className={'datePickerDiv'}>
                      <DatePicker.RangePicker
                        disabledDate={this.disabledDate}
                        ranges={{
                          Today: [moment(), moment()],
                          'This Month': [
                            moment().startOf('month'),
                            moment().endOf('month')
                          ],
                          'Last Month': [
                            moment()
                              .subtract(1, 'months')
                              .startOf('month'),
                            moment()
                              .subtract(1, 'months')
                              .endOf('month')
                          ]
                        }}
                        onChange={this.onDateChange}
                        defaultValue={[
                          moment(this.state.drStart, dateFormat),
                          moment(this.state.drEnd, dateFormat)
                        ]}
                        format={dateFormat}
                      />
                    </div>
                  }
                  bordered={false}
                  style={{ width: '100%', marginTop: 30, background: 'none' }}
                >
                  <Row>
                    <Col span={24}>
                      {pings.length < 1 && loading ? (
                        <Skeleton active />
                      ) : pings.length < 1 && !loading ? (
                        <Fragment>
                          <ChartError
                            title="No site pings were found"
                            message={
                              sitepingInfo.active === 'inactive'
                                ? "This site's status is not set to 'Live'. Please change this to 'live' to see ping data in the future for this site."
                                : "The site is active but there currently isn't any data available. This may be due to the site being paused or you may have to alter the date range using the date picker above."
                            }
                            headerIcon="warning"
                            hbgc={color('template', 'colorLabel', 'red').color}
                            buttonText="Return to the Siteping's listing page"
                            buttonLink="/siteping/sites"
                          />
                        </Fragment>
                      ) : (
                        <div className="App">
                          <Chart
                            chartType="ColumnChart"
                            width="100%"
                            // onError={e => console.log('error message')}
                            options={options}
                            height="500px"
                            legendToggle
                            data={[
                              ['Date', 'Total Ping','HTML'],
                              ...this.state.chartArray.sort()
                              
                            ]}
                            
                          />
                        </div>
                      )}
                    </Col>
                  </Row>
                </Card>
              </Col>
            </Row>
          </Card>
        </Content>
        <Drawer visible={this.state.showDrawer} onClose={this.close}>
          <Form layout="vertical">
            <Form.Item label="Ping Label">
              <Input
                type="text"
                value={sitepingInfo.pingLabel}
                onChange={e => {
                  let stateCopy = { ...this.state };
                  stateCopy.sitepingInfo.pingLabel = e.target.value;
                  this.setState(stateCopy);
                }}
                // onChange={e => this.inputChangeFunc({ pingLabel: e.target.value })}
              />
            </Form.Item>
            <Form.Item label="Ping Frequency">
              <Input
                value={sitepingInfo.pingFrequency}
                onChange={e => {
                  let stateCopy = { ...this.state };
                  stateCopy.sitepingInfo.pingFrequency = e.target.value;
                  this.setState(stateCopy);
                }}
                // onChange={e => this.inputChangeFunc({ pingLabel: e.target.value })}
              />
            </Form.Item>
            <Button
              onClick={() => this.updatePing(sitepingInfo)}
              type="primary"
            >
              Update SitePing
            </Button>
          </Form>
        </Drawer>
      </div>
    );
  }
}

export default Stats;

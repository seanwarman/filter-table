import React, { Component } from 'react';
import '../../App.css';
import { API } from '../../libs/apiMethods';
import {Layout, Button, List, Col, Row, Card, DatePicker} from 'antd';
import { Chart } from 'react-google-charts';

var moment = require('moment');

const dateFormat = 'YYYY-MM-DD';

const { Content } = Layout;


export default class Analytics extends Component {
    constructor(props) {
        super(props);

        var dS = new Date();
        dS.setDate(dS.getDate() - 10);

        this.state = {

            quoteName: "",
            graphA: [],
            graphB: [],
            desktop: [],
            tablet: [],
            mobile: [],
            referals: [],
            landingPages: [],
            labelCount: 0,
            showDatePicker: false,
            drStart: moment(dS).format('YYYY-MM-DD'),
            drEnd: moment(new Date()).format('YYYY-MM-DD'),
        };

    }

    handleChange = event => {

        this.setState({
            [event.target.id]: event.target.value
        });


    }

    async componentDidMount() {

        try {

            await this.loadPage();




        } catch (e) {
            alert(e.message);
        }

    }


    loadAnalytics() {

        return API.get('biggly', `/traki/key/${this.props.user.apiKey}/analytics/${localStorage.traki_website_key}/start/${this.state.drStart}/end/${this.state.drEnd}`);

    }

    loadPage = async () => {

        // this.props.changeHeader("Traki Analytics");
        this.props.changeHeader('sound','Traki',[{name: 'Websites', url: '/traki/websites'},{name: 'Analytics', url: '/traki/analytics'}]);

        var data = await this.loadAnalytics();

        data.Referals.sort( function ( a, b ) { return b.pages - a.pages; } );

        this.setState({graphA: data.GraphA, graphB: data.GraphB, desktop: data.Desktop, mobile: data.Mobile, tablet: data.Tablet, referals: data.Referals, landingPages: data.LandingPages});

        var days = data.GraphA.length;
        var labelCount = 1;
        if (days > 10) { labelCount = 4; }
        if (days > 40) { labelCount = 8; }

        this.setState({labelCount})

    }

    changeWebsite = () => {

        this.props.history.push('/traki/websites');

    }


    onDateChange = async (dates, dateStrings) => {

        await this.setState({
            drStart:    moment(dates[0]).format('YYYY-MM-DD'),
            drEnd:      moment(dates[1]).format('YYYY-MM-DD')
        });

        this.loadPage();
        this.forceUpdate();

    }

    render() {


        let totalDevices = (this.state.desktop + this.state.tablet + this.state.mobile);

        return (
            <Content style={{
                margin: '94px 16px 24px', padding: 24, minHeight: 280,
            }}
            >
                <Row gutter={16}>
                    <Col xs={12} style={{marginBottom: 15}}>
                        <div className={"sitePickerDiv"}>

                            <Button type="primary" onClick={this.changeWebsite}>
                                {localStorage.traki_website_name}
                            </Button>
                        </div>
                    </Col>
                    <Col xs={12} style={{marginBottom: 15}}>
                        <div className={"datePickerDiv"}>
                            <DatePicker.RangePicker
                                ranges={{
                                    Today: [moment(), moment()],
                                    'This Month': [moment().startOf('month'), moment().endOf('month')],
                                    'Last Month': [moment().subtract(1, 'months').startOf('month'), moment().subtract(1, 'months').endOf('month')]
                                }}
                                onChange={this.onDateChange}
                                defaultValue={[moment(this.state.drStart, dateFormat), moment(this.state.drEnd, dateFormat)]}
                                format={dateFormat}
                            />
                        </div>
                    </Col>
                    <Col xs={18}>
                        <Card title="People" bordered={false} style={{'width': '100%'}}>
                            <Row>
                                <Col span={24} style={{'textAlign': 'right'}}>

                                    <Chart
                                        chartType="AreaChart"
                                        data={this.state.graphA}
                                        width="100%"
                                        height="400px"
                                        options={{
                                            hAxis: {showTextEvery: this.state.labelCount, title: '',  textStyle: {color: '#333', fontName: 'Product Sans', fontSize: '12'}},
                                            vAxis: {minValue: 0, format: 0, viewWindow : { min: 0 }, textStyle: {color: '#333', fontName: 'Product Sans', fontSize: '12'}},
                                            title: '',
                                            colors: ['#6491E6'],
                                            areaOpacity: 0.8,
                                            pointSize: 10,
                                            lineWidth: 7,
                                            theme: 'material',
                                            legend: {position : 'none' },
                                            width: '100%',
                                            chartArea: {'width': '90%', 'height': '70%'},
                                        }}
                                        legendToggle
                                    />
                                </Col>
                            </Row>
                        </Card>
                        <Card title="Page views" bordered={false} style={{'width': '100%', marginTop: 30}}>
                            <Row>
                                <Col span={24} style={{'textAlign': 'right'}}>
                                    <Chart
                                        chartType="AreaChart"
                                        data={this.state.graphB}
                                        width="100%"
                                        height="400px"
                                        options={{
                                            hAxis: {showTextEvery: this.state.labelCount, title: '',  textStyle: {color: '#333', fontName: 'Product Sans', fontSize: '12'}},
                                            vAxis: {minValue: 0, format: 0, viewWindow : { min: 0 }, textStyle: {color: '#333', fontName: 'Product Sans', fontSize: '12'}},
                                            title: '',
                                            colors: ['#7AC663'],
                                            areaOpacity: 0.8,
                                            pointSize: 10,
                                            lineWidth: 7,
                                            theme: 'material',
                                            legend: {position : 'none' },
                                            width: '100%',
                                            chartArea: {'width': '90%', 'height': '70%'},
                                        }}
                                        legendToggle
                                    />
                                </Col>
                            </Row>
                        </Card>


                        <Card title="Traffic sources" bordered={false} style={{'width': '100%', marginTop: 30}}>
                            <Row>
                                <Col span={24}>

                                    <List>

                                        <List.Item>
                                            <Col span={16}>
                                                <strong></strong>
                                            </Col>
                                            <Col span={4} style={{textAlign: 'right', fontWeight: 600}}>
                                                <strong>People</strong>
                                            </Col>
                                            <Col span={4} style={{textAlign: 'right', fontWeight: 600}}>
                                                <strong>Pages</strong>
                                            </Col>

                                        </List.Item>

                                        {
                                            this.state.referals.map((item, i) => {

                                                return (

                                                    <List.Item key={i}>
                                                        <Col span={16}>
                                                            <span style={{fontSize: '16px'}}>{ item.name }</span><br/>
                                                        </Col>
                                                        <Col span={4} style={{textAlign: 'right', fontWeight: 600}}>
                                                            { item.people }
                                                        </Col>
                                                        <Col span={4} style={{textAlign: 'right', fontWeight: 600}}>
                                                            { item.pages }
                                                        </Col>

                                                    </List.Item>

                                                )

                                            })
                                        }

                                    </List>

                                </Col>
                            </Row>
                        </Card>


                        <Card title="Top landing pages" bordered={false} style={{'width': '100%', marginTop: 30}}>
                            <Row>
                                <Col span={24}>

                                    <List>

                                        <List.Item>
                                            <Col span={20}>
                                                <strong>Page</strong>
                                            </Col>
                                            <Col span={4} style={{textAlign: 'right', fontWeight: 600}}>
                                                <strong>People</strong>
                                            </Col>

                                        </List.Item>

                                    {
                                        this.state.landingPages.map((item, i) => {

                                            return (

                                                <List.Item key={i}>
                                                    <Col span={20}>
                                                        <span style={{fontSize: '16px'}}>{ item.tr_page }</span><br/>
                                                        { item.tr_url }
                                                    </Col>
                                                    <Col span={4} style={{textAlign: 'right', fontWeight: 600}}>
                                                        { item.people }
                                                    </Col>

                                                </List.Item>

                                            )

                                        })
                                    }

                                    </List>

                                </Col>
                            </Row>
                        </Card>

                    </Col>
                    <Col xs={6}>
                        <Card bordered={false} style={{'width': '100%'}}>
                            <div className={"deviceNumber"}>
                            {
                                this.state.desktop
                            }
                            </div>
                            <div className={"devicePercentage"}>
                                {
                                    ((this.state.desktop / totalDevices) * 100).toFixed(0)
                                }
                                % Desktop
                            </div>
                        </Card>
                        <Card bordered={false} style={{'width': '100%', marginTop: 30}}>
                            <div className={"deviceNumber"}>
                            {
                                this.state.mobile
                            }
                            </div>
                            <div className={"devicePercentage"}>
                                {
                                    ((this.state.mobile / totalDevices) * 100).toFixed(0)
                                }
                                % Mobile
                            </div>
                        </Card>
                        <Card bordered={false} style={{'width': '100%', marginTop: 30}}>
                            <div className={"deviceNumber"}>
                            {
                                this.state.tablet
                            }
                            </div>
                            <div className={"devicePercentage"}>
                                {
                                    ((this.state.tablet / totalDevices) * 100).toFixed(0)
                                }
                                % Tablet
                            </div>
                        </Card>
                    </Col>
                </Row>

            </Content>

        );
    }
}


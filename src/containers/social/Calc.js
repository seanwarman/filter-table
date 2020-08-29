// import React, { Component } from "react";
// import "../../App.css";
// import { API } from "aws-amplify";
// import {Layout, Col, Row, Card,} from "antd";
// import { Chart } from 'react-google-charts';

// var moment = require('moment');


// const { Content } = Layout;


// export default class Calc extends Component {
//     constructor(props) {
//         super(props);

//         var dS = new Date();
//         dS.setDate(dS.getDate() - 10);

//         this.state = {

//             quoteName: "",
//             graphA: [],
//             graphB: [],
//             labelCount: 0,
//             drStart: moment(dS).format('YYYY-MM-DD'),
//             drEnd: moment(new Date()).format('YYYY-MM-DD'),
//         };

//     }

//     handleChange = event => {

//         this.setState({
//             [event.target.id]: event.target.value
//         });


//     }

//     async componentDidMount() {

//         await this.loadPage();

//     }


//     loadAnalytics() {

//         console.log(`/traki/key/817dbfc1-4401-42cd-a41d-066777dcbadd/analytics/17DUZ83kSc3ot49r9uQ9P/start/${this.state.drStart}/end/${this.state.drEnd}`);
//         return API.get('biggly', `/traki/key/817dbfc1-4401-42cd-a41d-066777dcbadd/analytics/17DUZ83kSc3ot49r9uQ9P/start/${this.state.drStart}/end/${this.state.drEnd}`);

//     }

//     loadPage = async () => {

//         this.props.changeHeader("Traki Analytics");

//         var data = await this.loadAnalytics();

//         this.setState({graphA: data.GraphA, graphB: data.GraphB});

//         console.log(data.GraphA);
//         console.log(data.GraphB);

//         var days = data.GraphA.length;
//         var labelCount = 1;
//         if (days > 10) { labelCount = 4; }
//         if (days > 40) { labelCount = 8; }

//         this.setState({labelCount})

//     }

//     handleSelect = async (ranges) => {

//         console.log(ranges);

//         console.log(moment(ranges.selection.endDate).format('YYYY-MM-DD'));

//         await this.setState({
//             drStart:    moment(ranges.selection.startDate).format('YYYY-MM-DD'),
//             drEnd:      moment(ranges.selection.endDate).format('YYYY-MM-DD')
//         });

//         this.loadPage();
//         this.forceUpdate();
//     }

//     render() {


//         return (
//             <Content style={{
//                 margin: '24px 16px', padding: 24, minHeight: 280,
//             }}
//             >
//                 <Row gutter={16}>
//                     <Col xs={24}>
//                         <Card title="People" bordered={false} style={{'width': '100%'}}>
//                             <Row>
//                                 <Col span={24} style={{'textAlign': 'right'}}>

//                                     <Chart
//                                         chartType="AreaChart"
//                                         data={this.state.graphA}
//                                         width="100%"
//                                         height="400px"
//                                         options={{
//                                             hAxis: {showTextEvery: this.state.labelCount, title: '',  textStyle: {color: '#333', fontName: 'Product Sans', fontSize: '12'}},
//                                             vAxis: {minValue: 0, format: 0, viewWindow : { min: 0 }, textStyle: {color: '#333', fontName: 'Product Sans', fontSize: '12'}},
//                                             title: '',
//                                             colors: ['#6491E6'],
//                                             areaOpacity: 0.8,
//                                             pointSize: 10,
//                                             lineWidth: 7,
//                                             theme: 'material',
//                                             legend: {position : 'none' },
//                                             width: '100%',
//                                             chartArea: {'width': '90%', 'height': '70%'},
//                                         }}
//                                         legendToggle
//                                     />
//                                 </Col>
//                             </Row>
//                         </Card>
//                         <Card title="Page views" bordered={false} style={{'width': '100%', marginTop: 30}}>
//                             <Row>
//                                 <Col span={24} style={{'textAlign': 'right'}}>
//                                     <Chart
//                                         chartType="AreaChart"
//                                         data={this.state.graphB}
//                                         width="100%"
//                                         height="400px"
//                                         options={{
//                                             hAxis: {showTextEvery: this.state.labelCount, title: '',  textStyle: {color: '#333', fontName: 'Product Sans', fontSize: '12'}},
//                                             vAxis: {minValue: 0, format: 0, viewWindow : { min: 0 }, textStyle: {color: '#333', fontName: 'Product Sans', fontSize: '12'}},
//                                             title: '',
//                                             colors: ['#7AC663'],
//                                             areaOpacity: 0.8,
//                                             pointSize: 10,
//                                             lineWidth: 7,
//                                             theme: 'material',
//                                             legend: {position : 'none' },
//                                             width: '100%',
//                                             chartArea: {'width': '90%', 'height': '70%'},
//                                         }}
//                                         legendToggle
//                                     />
//                                 </Col>
//                             </Row>
//                         </Card>

//                     </Col>
//                 </Row>

//             </Content>

//         );
//     }
// }


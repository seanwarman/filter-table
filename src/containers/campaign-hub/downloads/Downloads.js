import React, { Component } from "react";
import "../../../App.css";
import {message, Layout, Button, Table, Form, Col, Row, Card, Select, DatePicker} from "antd";
import moment from 'moment';
import { CSVLink } from "react-csv";

const { Content } = Layout;
const dateFormat = 'YYYY-MM-DD';

export default class Downloads extends Component {
    constructor(props) {
        super(props);

        var dE = new Date();
        dE.setDate(dE.getDate() + 31);

        this.state = {
            bookings: [],
            suppliers: [],

            supplierKey: "All",
            bookingStatus: "Pending",

            drEnd: moment(dE).format('YYYY-MM-DD'),
            drStart: moment(new Date()).format('YYYY-MM-DD'),
        };
    }

    async loadPage() {

      message.info('Section in development');
        // const bookings = await API.get('biggly', `/campaignpublic/key/${this.props.user.apiKey}/download/${this.state.bookingStatus}/${this.state.supplierKey}/start/${this.state.drStart}/end/${this.state.drEnd}`);

        // const suppliers = await API.get('biggly', `/campaignadmin/key/${this.props.user.apiKey}/suppliers`);

        // console.log(bookings);
        // this.setState({ bookings, suppliers });

        this.props.changeHeader("Download");

    }



    componentDidMount() {
        this.loadPage();
    }

    statusSelectChange = (bookingStatus) => {
        this.setState({bookingStatus});
    }

    supplierSelectChange = (supplierKey) => {
        this.setState({supplierKey});
    }

    handleUpdate = () => {
        this.loadPage();
    }

    handleDownload = async () => {
        // update the status of the chosen bookings
        // let result = await  API.get('biggly', `/campaignpublic/key/${this.props.user.apiKey}/bulkupdate/${this.state.bookingStatus}/${this.state.supplierKey}/start/${this.state.drStart}/end/${this.state.drEnd}`);
        // console.log(result);
        console.log('updated');
    }

    onDateChange = async (dates, dateStrings) => {
        await this.setState({
            drStart:    moment(dates[0]).format('YYYY-MM-DD'),
            drEnd:      moment(dates[1]).format('YYYY-MM-DD')
        });
    }

    render() {

        const columns = [{
            title: 'Product',
            dataIndex: 'productName',
            key: 'productName'
        }, {
            title: 'Supplier',
            dataIndex: 'supplierName',
            key: 'packageName',
        }, {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
        }, {
            title: 'Delivery by',
            dataIndex: 'deliveryBy',
            key: 'deliveryBy',
            render: (item)  => { return( moment(item).format('Do MMM YYYY') ) }
        }];

        function onChange(pagination, filters, sorter) {
            //console.log('params', pagination, filters, sorter);
        }

        let suppliers = [];
        if (this.state.suppliers && this.state.suppliers.length > 0) {
            suppliers = this.state.suppliers;
        }


        return (
            <Content style={{
                margin: '94px 16px 24px', padding: 24, minHeight: 280,
            }}
            >

                <Row gutter={16}>
                    <Col xs={24}>
                        <Card bordered={false} style={{'width': '100%'}}>
                            <Row>
                                <Col span={4}>
                                    <Form.Item>
                                        <Select
                                            showSearch
                                            value={this.state.bookingStatus}
                                            defaultValue={"Active"}
                                            style={{ width: '100%' }}
                                            placeholder="Select a status"
                                            optionFilterProp="children"
                                            onChange={this.statusSelectChange}
                                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            <Select.Option key={'Pending'} value={"Pending"}>Pending</Select.Option>
                                            <Select.Option key={'Exported'} value={"Exported"}>Exported</Select.Option>
                                            <Select.Option key={'All'} value={"All"}>All Statuses</Select.Option>
                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={4}>
                                    <Form.Item>
                                        <Select
                                            showSearch
                                            value={this.state.supplierKey}
                                            style={{ width: '100%' }}
                                            placeholder="Select a supplier"
                                            optionFilterProp="children"
                                            onChange={this.supplierSelectChange}
                                            filterOption={(input, option) => option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0}
                                        >
                                            <Select.Option key={"All"} value={"All"}>All Suppliers</Select.Option>
                                            {
                                                suppliers.map((item, i) => {

                                                    return (
                                                        <Select.Option key={item.supplierKey} value={item.supplierKey}>{item.supplierName}</Select.Option>
                                                    )

                                                })
                                            }

                                        </Select>
                                    </Form.Item>
                                </Col>
                                <Col span={6}>
                                    <Form.Item>
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
                                    </Form.Item>
                                </Col>
                                <Col span={2}>
                                    <Button onClick={this.handleUpdate} type={"primary"}>Update</Button>
                                    <CSVLink
                                        data={this.state.bookings}
                                        onClick={this.handleDownload}
                                    >
                                        Download me
                                    </CSVLink>

                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Table size="small" 
                                        onChange={onChange}
                                        rowClassName={'bms_clickable'}
                                        rowKey="bookingProKey"
                                        dataSource={this.state.bookings}
                                        columns={columns}>
                                    </Table>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>


            </Content>


        );
    }
}


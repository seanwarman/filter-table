import React, { Component } from 'react';
import '../../App.css';
import { API } from '../../libs/apiMethods';
import {Layout, Button, Table, Drawer, Form, Col, Row, Input, Icon, message, Card} from 'antd';
import Highlighter from 'react-highlight-words';

const { Content } = Layout;

const success = (message_details) => {
    message.success(message_details);
};



export default class RankWebsites extends Component {
    constructor(props) {
        super(props);

        this.state = {
            websites: [],
            newWebsiteForm: false,
            websiteName: "",
            websiteUrl: "",
            searchText: "",
        };

    }

    showDrawer = () => {
        this.setState({
            newWebsiteForm: true,
        });
    };
    onClose = () => {
        this.setState({
            newWebsiteForm: false,
        });
    };
    handleChange = event => {

        this.setState({
            [event.target.id]: event.target.value
        });


    }
    handleSubmit = async event => {
        event.preventDefault();

        this.setState({ newWebsiteForm: false });

        try {


            // console.log(websiteKey);

            /*

            await this.createNotify({
                BRN: "CSL:-" + customerKey,
                fromEmail: "support@biggly.co.uk",
                fromName: "biggly support",
                toEmail: this.props.user.emailAddress,
                toName: this.props.user.firstName + " " + this.props.user.lastName,
                emailTitle: "New customer added",
                emailSubject: "New customer added",
                templateKey: "3f61c490-57e5-11e9-9d88-3d880bcc3ce5",
                parameters: JSON.stringify({
                    recipient_name : this.props.user.firstName,
                    customer_name : this.state.customerName,
                    customer_key : customerKey,
                })
            })

            */

            const websites = await this.websites();
            this.setState({ websites });

            success("Website added");

        } catch (e) {
            alert(e);

        }
    }
    validateForm() {
        return this.state.websiteName.length > 0;
    }
    createWebsite(customer) {

        /*
        return API.post("biggly", `/console/key/${this.props.user.apiKey}/customers`, {
            body: customer
        });
        */
    }
    createNotify(notifyObject) {

      return this.props.api.createAdmin({
        name: 'bms_notify.email_queue'
      }, notifyObject, 'queueKey')
    }

    async componentDidMount() {

        try {

            const websites = await this.websites();
            console.log(websites);
            this.setState({ websites });

            // this.props.changeHeader("Websites");
            this.props.changeHeader('sound','Rankspot',[{name: 'Websites', url: '/rankspot/websites'}]);


        } catch (e) {
            alert(e.message);
        }


    }

    websites() {
        //return API.get("bms", `/admin/customers/817dbfc1-4401-42cd-a41d-066777dcbadd`);
        return API.get("biggly", `/rankusers/key/${this.props.user.apiKey}/access/user/6tpEePWRq2`);
    }



    //region Table Search Functions
    getColumnSearchProps = (dataIndex) => ({
        filterDropdown: ({
                             setSelectedKeys, selectedKeys, confirm, clearFilters,
                         }) => (
            <div style={{ padding: 8 }}>
                <Input
                    ref={node => { this.searchInput = node; }}
                    placeholder={`Search ${dataIndex}`}
                    value={selectedKeys[0]}
                    onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                    onPressEnter={() => this.handleSearch(selectedKeys, confirm)}
                    style={{ width: 188, marginBottom: 8, display: 'block' }}
                />
                <Button
                    type="primary"
                    onClick={() => this.handleSearch(selectedKeys, confirm)}
                    icon="search"
                    size="small"
                    style={{ width: 90, marginRight: 8 }}
                >
                    Search
                </Button>
                <Button
                    onClick={() => this.handleReset(clearFilters)}
                    size="small"
                    style={{ width: 90 }}
                >
                    Reset
                </Button>
            </div>
        ),
        filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => record[dataIndex].toString().toLowerCase().includes(value.toLowerCase()),
        onFilterDropdownVisibleChange: (visible) => {
            if (visible) {
                setTimeout(() => this.searchInput.select());
            }
        },
        render: (text) => (
            <Highlighter
                highlightStyle={{ backgroundColor: '#ffc069', padding: 0 }}
                searchWords={[this.state.searchText]}
                autoEscape
                textToHighlight={text ? text.toString() : 'unknown'}
            />
        ),
    })
    handleSearch = (selectedKeys, confirm) => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    }
    handleReset = (clearFilters) => {
        clearFilters();
        this.setState({ searchText: '' });
    }
    //endregion


    render() {

        var that = this;

        const columns = [{
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            //sorter: (a, b) => a.customerName.length - b.customerName.length,
            sortDirections: ['descend', 'ascend'],
            ...this.getColumnSearchProps('name'),
        }, {
            title: 'URL',
            dataIndex: 'main_url',
            key: 'main_url',
        }];

        function onChange(pagination, filters, sorter) {
            //console.log('params', pagination, filters, sorter);
        }

        function viewWebsite(record) {

            localStorage.rank_website_key = record.key;
            localStorage.rank_website_name = record.name;

            that.props.history.push(`/rankspot/overview/`);
        }


        return (
            <Content style={{
                margin: '24px 16px', padding: 24, minHeight: 280,
            }}
            >

                <Row gutter={16}>
                    <Col xs={24}>
                        <Card bordered={false} style={{'width': '100%'}}>
                            <Row>
                                <Col span={24} style={{'textAlign': 'right'}}>
                                    <Icon style={{margin: '15px 0', fontSize: '1.6em'}} type={"plus-circle"} onClick={this.showDrawer} />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Table size="small"  onChange={onChange} onRow={(record, rowIndex) => { return { onClick: (event) => { viewWebsite(record); } }}}  rowClassName={'bms_clickable'} rowKey="key" dataSource={this.state.websites.sites} columns={columns}>
                                    </Table>
                                </Col>
                            </Row>
                        </Card>
                    </Col>
                </Row>



                <Drawer
                    title="Create a new website"
                    width={620}
                    onClose={this.onClose}
                    visible={this.state.newWebsiteForm}
                >
                    <Form layout="horizontal" onSubmit={this.handleSubmit} labelCol={{ span: 6 }} wrapperCol={{ span: 18 }}>
                        <Form.Item label={"Name"}>
                            <Input required id="websiteName" type={"text"} onChange={this.handleChange} value={this.state.websiteName}/>
                        </Form.Item>
                        <Form.Item label="URL">
                            <Input id="websiteUrl" onChange={this.handleChange} value={this.state.websiteUrl}/>
                        </Form.Item>
                    </Form>

                    <div
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
                        <Button type="dashed" style={{marginRight: 8}} onClick={this.onClose}>Cancel</Button>
                        <Button disabled={!this.validateForm()} onClick={this.handleSubmit} type={"primary"}>Create</Button>
                    </div>
                </Drawer>


            </Content>


        );
    }
}


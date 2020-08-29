import React, { Component } from "react";
import "../../../App.css";
import {Layout, Table, Col, Row, Icon, Card, Input, Button} from "antd";
import Highlighter from 'react-highlight-words';

const { Content } = Layout;


export default class Templates extends Component {
    constructor(props) {
        super(props);

        this.state = {
            templates: [],
        };
    }

    async componentDidMount() {

        try {

            const templates = await this.templates();
            this.setState({ templates });

            // this.props.changeHeader("Email Templates");
            this.props.changeHeader('mail','Notify',[{name: 'Email templates', url: '/notify/templates'}]);


        } catch (e) {
            console.log(e);
            alert(e.message);
        }

    }

    // █▀▀ █▀▀ █▀▀█ █▀▀█ █▀▀ █░░█   █▀▀ █░░█ █▀▀▄ █▀▀ ▀▀█▀▀ ░▀░ █▀▀█ █▀▀▄ █▀▀
    // ▀▀█ █▀▀ █▄▄█ █▄▄▀ █░░ █▀▀█   █▀▀ █░░█ █░░█ █░░ ░░█░░ ▀█▀ █░░█ █░░█ ▀▀█
    // ▀▀▀ ▀▀▀ ▀░░▀ ▀░▀▀ ▀▀▀ ▀░░▀   ▀░░ ░▀▀▀ ▀░░▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀▀ ▀░░▀ ▀▀▀

    /**
     *
     * --------------------------------------------------------------------------
     * Added search to the columns for the table
     * @param { dataIndex, columnName }
     * The latter has been added and seems to work - if it presents any issues,
     * we can delete this - prettifys the placeholder on the dropdown input
     *
     * @author KR
     * --------------------------------------------------------------------------
     * @version 1.0.0
     * @since 1.0.0
     * --------------------------------------------------------------------------
     *
     */

    searchHandle = (selectedKeys, confirm) => {
        confirm();
        this.setState({ searchText: selectedKeys[0] });
    }

    searchHandleReset = (clearFilters) => {
        clearFilters();
        this.setState({ searchText: '' });
    }

    searchGetColumnProps = (dataIndex, columnName) => ({
        filterDropdown: ({
            setSelectedKeys, selectedKeys, confirm, clearFilters,
        }) => (
                <div style={{ padding: 8 }}>
                    <Input
                        ref={node => { this.searchInput = node; }}
                        placeholder={`Search ${columnName}`}
                        value={selectedKeys[0]}
                        onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
                        onPressEnter={() => this.searchHandle(selectedKeys, confirm)}
                        style={{ width: 188, marginBottom: 8, display: 'block' }}
                    />
                    <Button
                        type="primary"
                        onClick={() => this.searchHandle(selectedKeys, confirm)}
                        icon="search"
                        size="small"
                        style={{ width: 90, marginRight: 8 }}
                    >
                        Search
                    </Button>
                    <Button
                        onClick={() => this.searchHandleReset(clearFilters)}
                        size="small"
                        style={{ width: 90 }}
                    >
                        Reset
                    </Button>
                </div>
            ),
        filterIcon: filtered => <Icon type="search" style={{ color: filtered ? '#1890ff' : undefined }} />,
        onFilter: (value, record) => {
            if(record[dataIndex]) {
                return record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
            }
        },
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
                textToHighlight={text ? text : 'unknown'}
            />
        ),
    });

    /**
     *
     * End of Search Function
     *
     */

    templates() {
        return this.props.api.listAdmin({
            name: 'bms_notify.templates',
            columns: [
              {name: 'templateKey'},
              {name: 'templateName'},
            ]
        })
    }

    render() {

        var that = this;

        const columns = [{
            title: 'Name',
            dataIndex: 'templateName',
            key: 'templateName',
            sorter: (a,b) => {
                if (a.templateName < b.templateName) { return -1 };
                if (a.templateName > b.templateName) { return 1 };
                return 0;
            },
            ...this.searchGetColumnProps('templateName', 'template name')
        },{
            title: 'Key',
            dataIndex: 'templateKey',
            key: 'templateKey',
            sorter: (a,b) => {
                if (a.templateKey < b.templateKey) { return -1 };
                if (a.templateKey > b.templateKey) { return 1 };
                return 0;
            },
            ...this.searchGetColumnProps('templateKey', 'template key')
        }];

        function viewTemplate(record) {

            that.props.history.push(`/notify/templates/` + record.templateKey);
        }

        function newTemplate() {
            that.props.history.push(`/notify/templates/new`);
        }

        function onChange(pagination, filters, sorter) {
            console.log('params', pagination, filters, sorter);
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
                                <Col span={24} style={{'textAlign': 'right'}}>
                                    <Icon style={{margin: '15px 0', fontSize: '1.6em'}} type={"plus-circle"} onClick={newTemplate} />
                                </Col>
                            </Row>
                            <Row>
                                <Col span={24}>
                                    <Table size="small"  onChange={onChange} onRow={(record, rowIndex) => { return { onClick: (event) => { viewTemplate(record); } }}}  rowClassName={'clickable'} rowKey="templateKey" dataSource={this.state.templates} columns={columns}>
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


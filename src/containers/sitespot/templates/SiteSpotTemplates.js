import React, { Component } from "react";
import "../../../App.css";
// import { API } from "aws-amplify";
import {Layout, Table, Col, Row, Icon, Card,} from "antd";

const { Content } = Layout;


export default class SiteSpotTemplates extends Component {
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

            console.log(templates);

            // this.props.changeHeader("Templates");
            this.props.changeHeader('global','SiteSpot',[{name: 'Templates', url: '/sitespot/templates'}]);


        } catch (e) {
            console.log(e);
            alert(e.message);
        }

    }

    templates() {
      return this.props.api.listPublic({
        name: 'bms_sitespot.templates',
        columns: [
          {name: 'templateKey'},
          {name: 'templateName'},
          {name: 'templateHeader'},
          {name: 'templateFooter'},
        ]
      })
    }

    render() {

        var that = this;

        const columns = [{
            title: 'Name',
            dataIndex: 'templateName',
            key: 'templateName',
        },{
            title: 'Key',
            dataIndex: 'templateKey',
            key: 'templateKey'
        }];

        function viewTemplate(record) {

            that.props.history.push(`/sitespot/templates/` + record.templateKey);
        }

        function newTemplate() {
            that.props.history.push(`/sitespot/templates/new`);
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


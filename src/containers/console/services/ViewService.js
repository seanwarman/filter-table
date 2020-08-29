import React, { Component } from "react";
import { Layout, Row, Col, Card, Typography, Skeleton } from "antd";
import "./../../../App.css";
import Button from "antd/lib/button";

const { Content } = Layout;
const { Title } = Typography;

export default class ViewService extends Component {
    constructor(props) {
        super(props);

        this.state = {
            isLoading: false,
            service: [],
            prices: [],
            docs: [],
            title: null
        };

    }

    componentDidMount = () => {
        this.loadPage();
    }
    
    async loadPage() {

        this.setState({ isLoading: true })

        let service = await this.props.api.getPublic({
            name: 'Biggly.services',
            columns: [
              {name: 'serviceKey'},
              {name: 'serviceName'},
              {name: 'serviceCode'},
              {name: 'serviceDescription'},
              {name: 'serviceCategory'},
              {name: 'serviceStepsText'},
              {name: 'serviceStepsHeader'},
              {name: 'serviceStepsFooter'},
            ],
            where: [
                `serviceKey = "${this.props.match.params.serviceKey}"`
            ]
        });
        let prices = await this.props.api.listPublic({
            name: 'Biggly.services_prices',
            columns: [
              {name: 'servicePriceKey'},
              {name: 'serviceKey'},
              {name: 'priceName'},
              {name: 'costPrice'},
              {name: 'retailPrice'},
              {name: 'priceDescription'},
              {name: 'priceFreq'},
            ],
            where: [
                `serviceKey = "${this.props.match.params.serviceKey}"`
            ]
        });
        console.log('Getting docs')
        let docs = await this.props.api.listPublic({
            name: 'Biggly.services_docs',
            columns: [
              {name: 'serviceDocKey'},
              {name: 'serviceKey'},
              {name: 'docName'},
              {name: 'docFileName'},
              {name: 'docDescription'},
              {name: 'docStatus'},
            ],
            where: [
                `serviceKey = "${this.props.match.params.serviceKey}"`
            ]
        });

        console.log('docs :', docs);

        this.setState({ service, prices, docs })

        // this.props.changeHeader(this.state.service.serviceName);

        let serviceName = this.state.service.serviceName;

        this.setState({ title: this.state.service.serviceName })

        this.props.changeHeader('appstore', 'Services',[{name: serviceName, url: `/console/services/${serviceName}`}]);

        this.setState({ isLoading: false })

    }

    viewfile = (e) => {
        window.open("https://s3-eu-west-1.amazonaws.com/bms-console-services/public/" + e.target.id);
    }

    render() {

        const { prices } = this.state;

        return (
            <div>
            <Content style={{
                margin: '94px 16px 24px', padding: 24, minHeight: 280,
            }}>                    
                <Row 
                    gutter={16} 
                    type={'flex'}>
                    <Col md={24} lg={18}>
                        <Skeleton paragraph={false} size='small' loading={this.state.isLoading} active={this.state.isLoading}>
                            <Title style={{ fontWeight: 'normal', marginBottom: '0' }} level={1}>{this.state.title}</Title>
                        </Skeleton>
                    </Col>
                        <Col md={18} lg={18}>
                            <Row gutter={16}>
                                <Col span={24} style={{ margin: '15px 0' }}>
                                    <Card loading={this.state.isLoading} bordered={false}>
                                        <p>

                                            {this.state.service.serviceDescription ? this.state.service.serviceDescription.split("\n").map((i, key) => {
                                                return <p key={key}>{i}</p>;
                                            }) : null}

                                        </p>
                                    </Card>
                                </Col>
                            </Row>
                            <Row gutter={16}>
                                <Col span={24} style={{ marginTop: 15 }}>
                                    <Title style={{ fontWeight: 'normal', marginBottom: '0' }} level={4}>Prices</Title>
                                </Col>
                            </Row>
                            <Skeleton active={this.state.isLoading} loading={this.state.isLoading}>
                                <Row gutter={16} type={"flex"}>
                                    {prices.map((item, i) => {

                                        return (
                                            <Col type="flex" key={i} span={(24 / this.state.prices.length)} style={{ marginTop: 15 }}>
                                                <Card loading={this.state.isLoading} title={item.priceName} bordered={false}>

                                                    <div className={"priceDescription"}>
                                                        <ul>
                                                            {item.priceDescription.split("\n").map((i, key) => {
                                                                return <li key={key}>{i}</li>;
                                                            })}
                                                        </ul>
                                                    </div>

                                                    <div className={"priceBlock"}>
                                                        <div className={"priceItem"}>
                                                            <span>Cost price</span>
                                                            £{item.costPrice} / {item.priceFreq}
                                                        </div>
                                                        <div className={"priceItem"}>
                                                            <span>RRP price</span>
                                                            £{item.retailPrice} / {item.priceFreq}
                                                        </div>
                                                        <div className={"priceItem"}>
                                                            <span>Margin</span>
                                                            {(((item.retailPrice - item.costPrice) / item.retailPrice) * 100).toFixed(0)}%
                                                        </div>
                                                    </div>
                                                </Card>
                                            </Col>
                                        )

                                    })}

                                </Row>
                            </Skeleton>
                        </Col>
                        <Col span={6} style={{ margin: '15px 0' }}>

                            <Card loading={this.state.isLoading} bordered={false}>
                                <p>
                                    <h5>Documents</h5>

                                    {this.state.docs.map((item, i) => {

                                        return (

                                            <div style={{ borderBottom: '1px solid #f1f1f1', marginBottom: '15px', padding: '15px 0' }}>
                                                <div style={{ width: '100%' }}>
                                                    <strong>{item.docName}</strong>
                                                </div>
                                                <div style={{ width: '100%' }}>
                                                    {item.docDescription.split("\n").map((i, key) => {
                                                        return <div key={key}>{i}</div>;
                                                    })}
                                                </div>
                                                <div style={{ width: '100%', display: 'block', textAlign: 'right', marginTop: 10 }}>
                                                    <Button id={item.docFileName} onClick={this.viewfile} type={"secondary"}>view</Button>
                                                </div>
                                            </div>

                                        )

                                    })}

                                </p>
                            </Card>

                        </Col>
                    </Row>
                </Content>
            </div>
        );
    }
}

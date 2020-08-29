import { Card, Col, Layout, Row } from "antd";
import Icon from "antd/lib/icon";
import React, { Component } from "react";
import { Link } from 'react-router-dom';
import "./../../../App.css";

const { Content } = Layout;

const Categories = [
  {
    name: "Advertising",
    icon: "notification",
    services: [{
      serviceKey: "8388d370-5aba-11e9-94c7-df475b6e2ab6",
      serviceName: "Addio"
    }, {
      serviceKey: "23358b50-5225-11e9-ad75-e12e84fd8214",
      serviceName: "Notify"
    }]
  },
  {
    name: "Content",
    icon: "form",
    services: [{
      serviceKey: "f6212b60-5224-11e9-ad75-e12e84fd8214",
      serviceName: "Scribr"
    }]
  },
  {
    name: "Websites",
    icon: "global",
    services: [{
      serviceKey: "2b797b00-5225-11e9-ad75-e12e84fd8214",
      serviceName: "SitePing"
    }]
  },
  {
    name: "Social",
    icon: "global",
    services: [{
      serviceKey: "e7de6490-5225-11e9-ad75-e12e84fd8214",
      serviceName: "Social Exposure"
    }]
  },
  {
    name: "Search Marketing",
    icon: "zoom-in",
    services: []
  },
  {
    name: "Graphic design",
    icon: "bg-colors",
    services: []
  },
  {
    name: "Tools",
    icon: "thunderbolt",
    services: []
  }
];

let id = 0;

export default class Services extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isLoading: true,
    };

    this.props.changeHeader('appstore', 'Console', [{ name: 'Services', url: '/console/services' }]);
  }

  render() {
    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
        <Row gutter={16}>
          <Col xs={24}>
            <Card bordered={false}>
              <Row gutter={16}>

                {Categories.map((cat, i) => {

                  return (
                    <Col key={id++} md={12} lg={6}>
                      <Card className={"bms_service_block"} bordered={false}>
                        <Icon type={cat.icon} className={"bms_service_icon"} />
                        <h5>{cat.name}</h5>
                        <div className={"bms_service_items"}>
                          {cat.services.map((service, x) => {

                            return (
                              <div key={id++} className={"bms_service_item"}>
                                <Link to={"/console/services/" + service.serviceKey}>{service.serviceName}</Link>
                              </div>
                            )
                          })}

                        </div>
                      </Card>
                    </Col>
                  )

                })}

              </Row>
            </Card>


          </Col>
        </Row>
      </Content>

    );
  }
}

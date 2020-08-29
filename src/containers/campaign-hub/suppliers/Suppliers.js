import React, { Component } from "react"
// import EasyEditTable from '../../../components/Tables/EasyEditTable.js'
// import uuid from 'uuid'
import { Layout, Col, Row, Card } from "antd"
const { Content } = Layout

export default class Suppliers extends Component {

  async componentDidMount() {
    this.props.changeHeader('sound', 'CampaignHub', [
      { name: 'Suppliers', url: '/campaign-hub/suppliers' }
    ])
  }

  render() {

    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}
      >
        <Row gutter={16}>
          <Col xs={24}>

            <Card bordered={false} style={{ 'width': '100%' }}>
              <Row>
                <Col span={24}>

                  {/* <EasyEditTable
                    primaryKey="supplierKey"
                    createPrimaryKey={() => uuid.v1()}
                    create={record => 
                    this.props.api.createPublic({
                      name: 'bms_campaigns.suppliers'
                    }, record)
                    }
                    update={record => 
                    this.props.api.updatePublic({
                      name: 'bms_campaigns.suppliers',
                      where: [
                        `supplierKey = "${record.supplierKey}"`
                      ]
                    }, record)
                    }
                    delete={key => 
                    this.props.api.deletePublic({
                      name: 'bms_campaigns.suppliers',
                      where: [
                        `supplierKey = "${key}"`
                      ]
                    })
                    }
                    columns={[{
                      title: 'Name',
                        dataIndex: 'supplierName',
                        key: 'customerName',
                        type: 'string'
                    }, {
                      title: 'Email',
                      dataIndex: 'supplierEmail',
                      key: 'supplierEmail',
                      type: 'string'
                    }]}
                    dataSource={() => this.props.api.listPublic({
                      name: 'bms_campaigns.suppliers',
                      columns: [
                        {name: 'supplierKey'},
                        {name: 'supplierName'},
                        {name: 'supplierEmail'},
                        {name: 'created'},
                      ], sort: 'created desc'
                    })}
                  ></EasyEditTable> */}


                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

      </Content>

    );
  }
}


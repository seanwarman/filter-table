import React, { Component } from 'react';
import uuid from 'uuid'
import {Layout, Button} from 'antd';
import EasyEditTable from '../../../components/Tables/EasyEditTable'

const {Content} = Layout;

export default class SeoDivisionsTable extends Component {
  componentDidMount() {
      this.props.changeHeader('sound','CampaignHub',[{name: 'Divisions', url: '/campaign-hub/divisions'}]);
  }
  render() {
    return (
      <Content style={{
        margin: '94px 16px 24px', padding: 24, minHeight: 280,
      }}>
        <EasyEditTable
          size="small"
          primaryKey="campaignDivKey"
          createPrimaryKey={() => uuid.v1()}
          dataSource={() => this.props.api.listPublic({
            name: 'bms_campaigns.campaignDivisions',
            columns: [
              {name: 'campaignDivName'},
              {name: 'campaignDivKey'},
            ], sort: 'created desc'
          })}
          create={record => 
            this.props.api.createPublic({
              name: 'bms_campaigns.campaignDivisions'
            }, record)
          }
          update={record => 
            this.props.api.updatePublic({
              name: 'bms_campaigns.campaignDivisions',
              where: [
                `campaignDivKey = "${record.campaignDivKey}"`
              ]
            }, record)
          }
          delete={key => 
            this.props.api.deletePublic({
              name: 'bms_campaigns.campaignDivisions',
              where: [
                `campaignDivKey = "${key}"`
              ]
            })
          }
          columns={[
            {
              title: 'Name', 
              dataIndex: 'campaignDivName',
              key: 'campaignDivName',
              type: 'string'
            },
            {
              render: (dataIndx, value, record) => 
              <Button 
                onClick={() => this.props.history.push(`/campaign-hub/divisions/${record.campaignDivKey}`)}
                type="link">Edit</Button>
            }

          ]}
        >
        </EasyEditTable>
      </Content>
    )
  }
}

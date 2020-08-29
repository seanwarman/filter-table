import React, { Component } from 'react';
import JsonFormBuilder from '../../../../components/Json/JsonFormBuilder';
import { message } from 'antd';

export default class ViewTabBuilder extends Component {
  componentDidMount() {
    const { campaignDivKey } = this.props.match.params;
    this.props.changeHeader('sound', 'CampaignHub', [
      { name: 'Divisions', url: '/campaign-hub/divisions' },
      { name: 'Division', url: `/campaign-hub/divisions/${campaignDivKey}` },
      { name: 'Tab Editor', url: this.props.location.pathname }
    ]);
  }
  render() {
    return (
      <JsonFormBuilder
        {...this.props}
        jsonFieldName="jsonForm"
        customFields={[
          {
            label: 'Name',
            dataIndex: 'divTabsName',
            required: true,
            type: 'input'
          }
        ]}
        getRecord={() => {
          return this.props.api.getPublic({
            name: 'bms_campaigns.divTabs',
            columns: [
              {name: 'divTabsKey'},
              {name: 'jsonForm'},
              {name: 'divTabsName'},
              {name: 'campaignDivKeY'},
            ],
            where: [`divTabsKey = "${this.props.match.params.divTabsKey}"`]
          })
        }}
        updateRecord={data => {
          return this.props.api.updatePublic({
            name: 'bms_campaigns.divTabs',
            where: [`divTabsKey = "${this.props.match.params.divTabsKey}"`]
          }, {
            divTabsName: data.divTabsName,
            jsonForm: data.jsonForm
          })
        }}
        errorMessage={reason => { message.error('There was an error with the form builder. Reason: ' + reason) }}
      />
    )
  }
}

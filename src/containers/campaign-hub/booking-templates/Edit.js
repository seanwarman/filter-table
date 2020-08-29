import React, {Component} from 'react';
import {message, Layout, Card} from 'antd';
import {jsonFormSanitiser, sanitiseString} from '../../../libs/jsonFormSanitiser';
import JsonFormFill from '../../../components/Json/JsonFormFill';
const {Content} = Layout;

export default class EditBookingTemplate extends Component {

  state = {
    bookingTemplate: null,
    saving: false
  }

  componentDidMount() {
    this.props.changeHeader('sound', 'CampaignHub', [
      {name: 'Booking Templates', url: '/campaign-hub/booking-templates'},
      {name: 'Edit Booking Template', url: '/campaign-hub/booking-templates/' + this.props.match.params.bookingTmpKey}
    ]);
    this.loadBooking();
  }

  loadBooking = async () => {
    const bookingTmpKey = this.props.match.params.bookingTmpKey;
    let bookingTemplate = await this.props.api.getPublic({
      name: 'bms_campaigns.bookingTemplates',
      columns: [
        {name: 'bookingTmpKey'},
        {name: 'bookingName'},
        {name: 'flags'},
        {name: 'bms_booking.bookingDivisions', columns: [
          {name: 'jsonFlags'},
        ], where: [
          'bookingTemplates.bookingDivKey = bookingDivisions.bookingDivKey'
        ]},
        {name: 'jsonForm'},
        {name: 'flagged'},
      ],
      where: [
        `bookingTmpKey = "${bookingTmpKey}"`
      ]
    })
    this.setState({bookingTemplate});
    return bookingTemplate;
  }

  updateBooking = async state => {
    const {bookingTmpKey} = this.props.match.params;
    const customFields = state.customFields;
    const bookingName = customFields.find(field => field.label === 'Booking Name').value;
    let flags = customFields.find(field => field.label === 'Flags').value;
    if(flags === undefined) flags = [];

    const bookingBody = {
      bookingName: sanitiseString(bookingName),
      flags: JSON.stringify(flags),
      jsonForm: jsonFormSanitiser(state.jsonForm)
    }

    let result = await this.props.api.updatePublic({
      name: 'bms_campaigns.bookingTemplates',
      where: [
        `bookingTmpKey = "${bookingTmpKey}"`
      ]
    }, bookingBody, true);

    if (result) {
      message.success('Saved!');
    }
    await this.loadBooking();
  }

  render() {
    return (
      <Content
        style={{
          margin: '94px 16px 24px',
          padding: 24,
          minHeight: 280
        }}
      >
        <Card>
          {
            this.state.bookingTemplate &&
            <JsonFormFill
              validation={false}
              customFields={[
                {
                  value: this.state.bookingTemplate.bookingName,
                  label: 'Booking Name',
                  required: true,
                  type: 'input',
                  prettyType: 'Text',
                },
                {
                  type: 'dropdown',
                  mode: 'tags',
                  value: this.state.bookingTemplate.flags,
                  label: 'Flags',
                  selections: (this.state.bookingTemplate || {}).jsonFlags.map(flagObj => flagObj.value).join(),
                  allowClear: true,
                }
              ]}
              update={state => {
                return this.updateBooking(state)
              }}
              jsonForm={this.state.bookingTemplate.jsonForm}
            />
          }
        </Card>
      </Content>
    )
  }
}

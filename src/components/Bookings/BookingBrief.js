import React from 'react';
import JsonFormFill from '../Json/JsonFormFill';
import JsonFormView from '../Json/JsonFormView';
import { Card, Row } from 'antd';
import color from '../../libs/bigglyStatusColorPicker';
import jsonFormSanitiser, { sanitiseString } from '../../libs/jsonFormSanitiser';

export default class BookingBrief extends React.Component {

  state = {
    division: null,
  }

  componentDidMount = async() => {

    const division = await this.props.api.getPublic({
      name: 'bms_booking.bookingDivisions',
      columns: [
        {name: 'bookingDivKey'},
        {name: 'jsonFlags'},
      ], where: [
        `bookingDivKey = "${this.props.booking.bookingDivKey}"`
      ]
    })

    this.setState({division})
  }

  handleUpdateJsonForm = async jsonFormFillState => {
    let bookingName = jsonFormFillState.customFields.find(field => field.label === 'Booking Name').value;
    let flags = jsonFormFillState.customFields.find(field => field.label === 'Flags').value;
    if((flags || []).length === 0) flags = 'NULL';
    else flags = JSON.stringify(flags);
    const booking = {
      flags,
      jsonForm: jsonFormSanitiser(jsonFormFillState.jsonForm),
      bookingName: sanitiseString(bookingName)
    }
    return await this.props.update(booking);
  }

  editAccess = () => {
    const { rolesCurrentlyAllowedToEdit, user, booking } = this.props;
    if (rolesCurrentlyAllowedToEdit.findIndex(role => role === 'Anyone') > -1) {
      return true
    }

    let usersRoles = [];
    const accessLevel = user.accessLevel;
    const { userKey } = user;

    if (userKey === booking.createdUserKey) {
      usersRoles.push('Creator');
    }
    if (userKey === booking.assignedUserKey) {
      usersRoles.push('Assignee');
    }

    if(rolesCurrentlyAllowedToEdit.findIndex(role => usersRoles.findIndex(usersRole => usersRole === role) > -1 || role === accessLevel) > -1) {
      return true;
    } else {
      return false;
    }
  }

  render = () => {
    const { booking } = this.props;
    const bookingColor = booking.colorLabel ?
      color('template', 'colorLabel', booking.colorLabel).color
      :
      null;
    return (
      <Card title={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>Booking Brief</div>
        </div>
      }>
        <Row
          style={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: '2rem'
          }}
        >
          <div
            style={{
              width: '17px',
              height: '17px',
              borderRadius: '50%',
              marginRight: '10px',
              backgroundColor: bookingColor
            }}
          />
          <h5 style={{ marginBottom: 0 }}>{decodeURIComponent(booking.tmpName)}</h5>
          {
            (this.props.note || []).length > 0 &&
            <div
              style={{
                position: 'absolute',
                right: 16,
              }}
            >
              <b>Note:</b> {this.props.note}
            </div>
          }
        </Row>
        <Row>
          {
            this.editAccess() && this.state.division ?
              <JsonFormFill
                customFields={[
                  {
                    type: 'input',
                    value: decodeURIComponent(booking.bookingName),
                    required: true,
                    label: 'Booking Name'
                  },
                  {
                    type: 'dropdown',
                    mode: 'tags',
                    value: this.props.booking.flags ? this.props.booking.flags : [],
                    selections: (this.state.division.jsonFlags || []).map(flagObj => flagObj.value).join(),
                    label: 'Flags',
                    allowClear: true,
                  }
                ]}
                update={this.handleUpdateJsonForm}
                jsonForm={this.props.booking.jsonForm}
              />
              :
              this.state.division &&
              <JsonFormView
                showLabels={true}
                customFields={[
                  {
                    type: 'input',
                    value: decodeURIComponent(booking.bookingName),
                    required: true,
                    label: 'Booking Name'
                  },
                  {
                    type: 'dropdown',
                    mode: 'tags',
                    value: booking.flags ? booking.flags : [],
                    selections: (this.state.division.jsonFlags || []).map(flagObj => flagObj.value).join(),
                    label: 'Flags',
                  }
                ]}
                jsonForm={this.props.jsonForm}
              />
          }
        </Row>
      </Card>
    )
  }
}

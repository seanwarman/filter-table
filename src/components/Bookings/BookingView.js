import React, { Fragment } from 'react';
import BookingProceed from './BookingProceed';
import BookingTabs from './BookingTabs';
import BookingWrapper from './BookingWrapper';
import BookingBrief from './BookingBrief';
import moment from 'moment';
import color from '../../libs/bigglyStatusColorPicker';
import colors from '../../mixins/BigglyColors';
import config from '../../libs/BigglyConfig';
import {
  Avatar,
  Layout,
  Card,
  Col,
  Row,
  Icon,
  Typography,
  Button,
  Popconfirm,
  DatePicker,
  Select
} from 'antd';
import './BookingWrapper.css';
import JsonBuilder from '@seanwarman/json-form-builder';
const { Content } = Layout;
let key = 0;

const jsonFormValidator = JsonBuilder('jsonFormValidator');

export default class BookingView extends React.Component {

  state = {
    loaded: false,
    statusRenderObject: {},
    currentStatus: '',
    pendingStatus: false,
    pendingAssignUser: false,

    // OLD BOOKING params:
    booking: [],
    bookingAudit: [],
    jsonForm: [],
    jsonStatus: [],
    statusIndex: 0,
    // currentStatus: null,
    statusOptionVisible: false,
    drawerVisible: false,
    form: {
      comment: null
    },

    comments: [],
    upload: null,
    uploads: [],
    uploading: false,
    uploadReady: false,
    pendingComment: false,
    file: null,
    url: null,
    bookingMonth: null,

    editMode: false,
    jsonFormCopy: [],
    dueDateCopy: null,
    bookingNameCopy: null,
    saving: false,

    queryComment: null,
    users: [],
  }

  // █░░ ░▀░ █▀▀ █▀▀ █▀▀ █░░█ █▀▀ █░░ █▀▀   █░░█ █▀▀█ █▀▀█ █░█ █▀▀
  // █░░ ▀█▀ █▀▀ █▀▀ █░░ █▄▄█ █░░ █░░ █▀▀   █▀▀█ █░░█ █░░█ █▀▄ ▀▀█
  // ▀▀▀ ▀▀▀ ▀░░ ▀▀▀ ▀▀▀ ▄▄▄█ ▀▀▀ ▀▀▀ ▀▀▀   ▀░░▀ ▀▀▀▀ ▀▀▀▀ ▀░▀ ▀▀▀

  async componentDidMount() {

    this.loadDataAndSetState()
  }

  async loadDataAndSetState() {
    let stateCopy = { ...this.state };
    const { booking } = this.props;

    const currentStatus = booking.currentStatus

    if(this.props.allowedToEditFields.findIndex(accessLevel => this.props.user.accessLevel === accessLevel) !== -1) {

      stateCopy.users = await this.getUsers(); 
    }


    stateCopy.loaded = true;
    stateCopy.pendingStatus = false;
    stateCopy.pendingAssignUser = false;
    stateCopy.currentStatus = currentStatus;

    this.setState(stateCopy);
  }

  // █▀▀█ █▀▀█ ░▀░   █▀▄▀█ █▀▀ ▀▀█▀▀ █░░█ █▀▀█ █▀▀▄ █▀▀
  // █▄▄█ █░░█ ▀█▀   █░▀░█ █▀▀ ░░█░░ █▀▀█ █░░█ █░░█ ▀▀█
  // ▀░░▀ █▀▀▀ ▀▀▀   ▀░░░▀ ▀▀▀ ░░▀░░ ▀░░▀ ▀▀▀▀ ▀▀▀░ ▀▀▀

  getUsers = async () => {
    let result = await this.props.api.listPublic({
      name: 'Biggly.users',
      columns: [
        {name: 'userKey'},
        {name: 'firstName'},
        {name: 'lastName'},
      ],
      // where: [{name: 'partnerKey', is: booking.partnerKey}]
    });
    return result;
  }

  // █░░█ ▀▀█▀▀ ░▀░ █░░ ░▀░ ▀▀█▀▀ ░▀░ █▀▀ █▀▀
  // █░░█ ░░█░░ ▀█▀ █░░ ▀█▀ ░░█░░ ▀█▀ █▀▀ ▀▀█
  // ░▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀ ▀▀▀ ▀▀▀

  colorCondition = (duration, colorCardStylesTemplates, colorCardStyles) => {
    const { currentStatus } = this.state;
    let stylesObj = {};
    if (duration <= 2 && currentStatus !== 'Complete') {
      stylesObj = { height: '100%', ...colorCardStylesTemplates('red') };
    } else {
      stylesObj = { height: '100%', ...colorCardStyles('purple') };
    }
    return stylesObj;
  }

  currentStatusIcon = currentStatus => {
    let iconStyles = colors.status.find(item =>
      item.value === currentStatus ? item : item.value === 'Default' && item
    );
    return (
      <Icon
        key={key++}
        type={iconStyles.icon}
        style={{ color: 'white', fontSize: '5rem' }}
      />
    );
  }

  // █░░█ █▀▀█ █▀▀▄ █▀▀▄ █░░ █▀▀ █▀▀█ █▀▀
  // █▀▀█ █▄▄█ █░░█ █░░█ █░░ █▀▀ █▄▄▀ ▀▀█
  // ▀░░▀ ▀░░▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

  handleChangeDueDate = async mo => {
    if (this.props.booking.groupKey) {
      await this.props.updateGroup(this.props.booking.groupKey, {
        dueDate: moment(mo).format()
      }, {
        createdUserKey: this.props.user.userKey,
        status: this.props.booking.currentStatus,
        description: `${this.props.user.firstName} ${this.props.user.lastName} updated the due date.`
      });
    } else {
      await this.props.update({
        dueDate: moment(mo).format()
      });

      // await this.props.createAudit({
      //   bookingsKey: this.props.booking.bookingsKey,
      //   createdUserKey: this.props.user.userKey,
      //   status: this.props.booking.currentStatus,
      //   description: `${this.props.user.firstName} ${this.props.user.lastName} updated the due date.`
      // })
    }
    this.loadDataAndSetState();
  }

  handleBookingBriefUpdate = async mutatedBooking => {
    if (this.props.booking.groupKey && this.props.booking.currentStatus === 'Draft') {
      // We still want all the group bookings to have different names...
      const { jsonForm, flags } = mutatedBooking
      await this.props.updateGroup(this.props.booking.groupKey, { jsonForm, flags }, {
        createdUserKey: this.props.user.userKey,
        status: 'Draft',
        description: `${this.props.user.firstName} ${this.props.user.lastName} updated the Booking Brief.`
      });
    } else {
      await this.props.update(mutatedBooking);
      // await this.props.createAudit({
      //   bookingsKey: this.props.booking.bookingsKey,
      //   createdUserKey: this.props.user.userKey,
      //   status: this.props.booking.currentStatus,
      //   description: `${this.props.user.firstName} ${this.props.user.lastName} updated the Booking Brief.`
      // })
    }
    this.loadDataAndSetState();
  }

  checkBookingIsAlreadyAssigned = async() => {

    let alreadyAssigned = false;

    let booking = await this.props.api.getPublic({
      name: 'bms_booking.bookings',
      columns: [
        {name: 'assignedUserKey'}
      ],
      where: [
        'bookingsKey = ' + this.props.booking.bookingsKey
      ]
    });

    if(booking.assignedUserKey) alreadyAssigned = true;

    return alreadyAssigned;
  }

  handleProceedUpdate = async (jsonStatus, nextStatus) => {
    const { groupKey } = this.props.booking;
    const { user } = this.props;

    // If this is a group booking and we're in Draft; progress all group bookings into the next status...
    if (groupKey && this.props.booking.currentStatus === 'Draft') {

      // progress all group bookings...
      await this.props.updateGroup(groupKey, {
        // jsonStatus: JSON.stringify(jsonStatus),
        currentStatus: nextStatus
      }, {
        createdUserKey: this.props.user.userKey,
        status: nextStatus,
        description: `${this.props.user.firstName} ${this.props.user.lastName} progressed this booking to ${nextStatus}.`
      });

      /* *** REMOVED ***
      We don't want to assign all bookigns in a group to the user becuase, if a booking in the group is complete
      and the group gets passed to another user, we still want to know that the original user completed that one. 
      */
      // // If it's a group and in Live we want to assign them all to this user but only progress
      // // the current booking to the next status. First we update all of them with a new assignedUserKey.
      // // Then we update this one to move it's status along...
      // } else if(groupKey && this.state.currentStatus === 'Live') {

      //   console.log('assign all to me and progress to the next status');
      //   await this.props.updateGroup(groupKey, {
      //     jsonStatus: JSON.stringify(jsonStatus),
      //     assignedUserKey: user.userKey,
      //     currentStatus: jsonStatus.find(item => item.selected).value
      //   },{
      //     createdUserKey: this.props.user.userKey,
      //     status: jsonStatus.find(item => item.selected).value,
      //     description: `${this.props.user.firstName} ${
      //       this.props.user.lastName
      //     } self assigned this booking.`
      //   });

      // If the booking is in Live...
    } else if (!this.props.booking.assignedUserKey && this.props.booking.currentStatus === 'Live') {

      let assigned = await this.checkBookingIsAlreadyAssigned();
      if(assigned) {
        await this.props.reload('This booking is already assigned to someone else.');
        return;
      }

      // ...it's not part of a group and there's no assigned user it needs assigning to the current user...
      if(!groupKey) {

        // Assign to me and progress
        await this.props.update({
          assignedUserKey: user.userKey,
          currentStatus: nextStatus,
        });
        // await this.props.createAudit({
        //   bookingsKey: this.props.booking.bookingsKey,
        //   createdUserKey: this.props.user.userKey,
        //   status: nextStatus,
        //   description: `${this.props.user.firstName} ${this.props.user.lastName} proceeded this booking to ${nextStatus}.`
        // })

      // If it is a part of a group, do the same as above for all bookings in this group...
      } else {

        // Assign group to me and progress...
        await this.props.updateGroup(groupKey, {
          assignedUserKey: user.userKey,
          currentStatus: nextStatus,
        }, {
          createdUserKey: this.props.user.userKey,
          status: nextStatus,
          description: `${this.props.user.firstName} ${this.props.user.lastName} assigned this booking to themselves.`
        });
      }

    // For any other conditions just progress the booking... easy! :-D
    } else {

      let completedDate = null;

      if(nextStatus === 'Complete') {
        completedDate = moment().toDate();
      }

      // progress booking...
      await this.props.update({
        currentStatus: nextStatus,
        completedDate
      });
      // await this.props.createAudit({
      //   bookingsKey: this.props.booking.bookingsKey,
      //   createdUserKey: this.props.user.userKey,
      //   status: nextStatus,
      //   description: `${this.props.user.firstName} ${this.props.user.lastName} proceeded this booking to ${nextStatus}.`
      // })
    }
    this.loadDataAndSetState();
  }

  handleUnassign = async () => {

    // Bookings can only be un-assigned one at a time for now.

    const newBooking = {
      assignedUserKey: 'NULL',
      currentStatus: 'Live'
    }

    await this.props.update(newBooking);
    // await this.props.createAudit({
    //   bookingsKey: this.props.booking.bookingsKey,
    //   createdUserKey: this.props.user.userKey,
    //   status: 'Live',
    //   description: `${this.props.user.firstName} ${
    //     this.props.user.lastName
    //     } un-assigned this booking.`
    // })

    this.loadDataAndSetState();
  }

  handleValidation = (rolesCurrentlyAllowedToAffect, booking_, user_) => {
    const { booking, user } = this.props
    if((booking.flags || []).includes('queried')) {
      return {valid: false, reason: 'This booking is being queried and cannot be proceeded until the query is resolved.'};
    }
    if(!jsonFormValidator(booking.jsonForm)) {
      return {valid: false, reason: 'The booking brief has some required fields missing.'};
    }
    if (rolesCurrentlyAllowedToAffect.findIndex(role => role === 'Anyone') > -1) {
      return true;
    }

    let usersRoles = [];
    const accessLevel = user.accessLevel;
    const { userKey } = user;

    if(userKey === booking.createdUserKey) {
      usersRoles.push('Creator');
    }
    if(userKey === booking.assignedUserKey) {
      usersRoles.push('Assignee');
    }

    if(rolesCurrentlyAllowedToAffect.findIndex(role => usersRoles.findIndex(usersRole => usersRole === role) > -1 || role === accessLevel) > -1) {
      return true;
    } else {
      return {valid: false, reason: 'You don\'t have the correct access type to proceed this booking.'};
    }
  }

  handleSelectAssignedUser = async userKey => {
    let {users} = this.state;
    let user = users.find(user => user.userKey === userKey);

    let assignedPartnerKey;

    if(this.props.booking.assignedPartnerKey) {
      assignedPartnerKey = user.partnerKey;      
    }
    
    await this.props.update({
      assignedPartnerKey,
      assignedUserKey: userKey
    });

    // await this.props.createAudit({
    //   bookingsKey: this.props.booking.bookingsKey,
    //   createdUserKey: this.props.user.userKey,
    //   status: this.props.booking.currentStatus,
    //   description: `${this.props.user.firstName} ${this.props.user.lastName} assigned ${user.firstName} ${user.lastName} to this booking.`
    // });
    this.loadDataAndSetState();
  }

  // █▀▀ ▀▀█▀▀ █▀▀█ ▀▀█▀▀ █▀▀   █▀▀█ █▀▀▄ ░░▀ █▀▀ █▀▀ ▀▀█▀▀ █▀▀
  // ▀▀█ ░░█░░ █▄▄█ ░░█░░ █▀▀   █░░█ █▀▀▄ ░░█ █▀▀ █░░ ░░█░░ ▀▀█
  // ▀▀▀ ░░▀░░ ▀░░▀ ░░▀░░ ▀▀▀   ▀▀▀▀ ▀▀▀░ █▄█ ▀▀▀ ▀▀▀ ░░▀░░ ▀▀▀

  Draft = {
    renderBooking: () => (
      <BookingWrapper
        rightPanel={() => (
          <BookingTabs
            bookingUrl={
              config.notifyBaseUrl +
              this.props.location.pathname
            }
            queryMode={true}
            user={this.props.user}
            booking={this.props.booking}
            getUploads={this.props.getUploads}
            getComments={this.props.getComments}
            updateBooking={this.props.updateBooking}
            createComment={this.props.createComment}
            createUpload={this.props.createUpload}
          />
        )}
        {...this.props}
        topPanel={() => (
          <BookingProceed
            reload={this.props.reload}
            disabled={(this.props.booking.flags || []).includes('queried')}
            validation={this.handleValidation}
            user={this.props.user}
            flags={this.props.booking.flags}
            currentStatus={this.props.booking.currentStatus}
            // booking={this.props.booking}
            jsonStatus={this.props.jsonStatus}
            rolesCurrentlyAllowedToAffect={['Admin', 'Creator', 'Provider', 'Provider Admin']}
            buttonType="Proceed"
            update={this.handleProceedUpdate}
            loading={false}
          />
        )}
        leftPanel={() => (
          <BookingBrief
            note={ 
              (this.props.booking.groupKey || '').length > 0 ?
              'Group bookings in Draft will all be effected on save.' 
              :
              ''
            }
            api={this.props.api}
            update={this.handleBookingBriefUpdate}
            user={this.props.user}
            booking={this.props.booking}
            jsonForm={this.props.booking.jsonForm}
            rolesCurrentlyAllowedToEdit={['Admin', 'Creator', 'Provider', 'Provider Admin']}
          />
        )}
      />
    )
  }

  Live = {
    renderBooking: () => (
      <BookingWrapper
        rightPanel={() => (
          <BookingTabs
          bookingUrl={
                config.baseUrl + 
                this.props.location.pathname 
              }
            queryMode={true}
            user={this.props.user}
            booking={this.props.booking}
            getUploads={this.props.getUploads}
            getComments={this.props.getComments}
            updateBooking={this.props.updateBooking}
            createComment={this.props.createComment}
            createUpload={this.props.createUpload}
          />
        )}
        {...this.props}
        topPanel={() => (
          <BookingProceed
            reload={this.props.reload}
            disabled={(this.props.booking.flags || []).includes('queried')}
            validation={this.handleValidation}
            user={this.props.user}
            flags={this.props.booking.flags}
            currentStatus={this.props.booking.currentStatus}
            jsonStatus={this.props.jsonStatus}
            rolesCurrentlyAllowedToAffect={[
              'Anyone'
            ]}
            buttonType={this.props.booking.assignedUserKey ? 'Proceed' : 'Assign'}
            update={this.handleProceedUpdate}
            loading={false}
          />
        )}
        leftPanel={() => (
          <BookingBrief
            api={this.props.api}
            update={this.handleBookingBriefUpdate}
            user={this.props.user}
            booking={this.props.booking}
            jsonForm={this.props.booking.jsonForm}
            rolesCurrentlyAllowedToEdit={['Admin', 'Provider Admin']}
          />
        )}
      />
    )
  }

  Other = {
    renderBooking: () => (
      <BookingWrapper
        rightPanel={() => (
          <BookingTabs
            bookingUrl={
              config.baseUrl + 
              this.props.location.pathname 
            }
            queryMode={true}
            user={this.props.user}
            booking={this.props.booking}
            getUploads={this.props.getUploads}
            getComments={this.props.getComments}
            updateBooking={this.props.updateBooking}
            createComment={this.props.createComment}
            createUpload={this.props.createUpload}
          />
        )}
        {...this.props}
        topPanel={() => (
          <BookingProceed
            reload={this.props.reload}
            disabled={(this.props.booking.flags || []).includes('queried')}
            validation={this.handleValidation}
            user={this.props.user}
            flags={this.props.booking.flags}
            currentStatus={this.props.booking.currentStatus}
            jsonStatus={this.props.jsonStatus}
            rolesCurrentlyAllowedToAffect={['Admin', 'Supplier Admin', this.props.jsonStatus.find(obj => obj.value === this.props.booking.currentStatus).role]}
            buttonType="Proceed"
            update={this.handleProceedUpdate}
            loading={false}
            customButtons={(disabled) => [
              (
                this.props.user.accessLevel === 'Admin' ||
                this.props.user.accessLevel === 'Supplier Admin'
              ) &&
              <Popconfirm
                key="custom-button-1"
                onConfirm={this.handleUnassign}
                title="Are you sure?"
              >
                <Button
                  onClick={e => this.props.reload()}
                  disabled={disabled}
                >Un-assign this Booking</Button>
              </Popconfirm>
            ]}
          />
        )}
        leftPanel={() => (
          <BookingBrief
            api={this.props.api}
            update={this.handleBookingBriefUpdate}
            user={this.props.user}
            booking={this.props.booking}
            jsonForm={this.props.booking.jsonForm}
            rolesCurrentlyAllowedToEdit={['Admin', 'Provider Admin']}
          />
        )}
      />
    )
  }

  Complete = {
    renderBooking: () => (
      <BookingWrapper
        rightPanel={() => (
          <BookingTabs
          bookingUrl={
                config.baseUrl + 
                this.props.location.pathname 
              }
            queryMode={true}
            user={this.props.user}
            booking={this.props.booking}
            getUploads={this.props.getUploads}
            getComments={this.props.getComments}
            updateBooking={this.props.updateBooking}
            createComment={this.props.createComment}
            createUpload={this.props.createUpload}
          />
        )}
        {...this.props}
        topPanel={() => (
          <BookingProceed
            reload={this.props.reload}
            disabled={(this.props.booking.flags || []).includes('queried')}
            validation={this.handleValidation}
            user={this.props.user}
            flags={this.props.booking.flags}
            currentStatus={this.props.booking.currentStatus}
            jsonStatus={this.props.jsonStatus}
            rolesCurrentlyAllowedToAffect={[]}
            // buttonType={'Assign'}
            // proceedStatus={this.handleUpdate}
            // assignToMeAndProceedStatus={this.handleUpdate}
            update={this.handleProceedUpdate}
            loading={false}
          />
        )}
        leftPanel={() => (
          <BookingBrief
            api={this.props.api}
            update={this.handleBookingBriefUpdate}
            user={this.props.user}
            booking={this.props.booking}
            jsonForm={this.props.booking.jsonForm}
            rolesCurrentlyAllowedToEdit={[]}
          />
        )}
      />
    )
  }

  // █▀▀█ █▀▀ █▀▀▄ █▀▀▄ █▀▀ █▀▀█ █▀▀
  // █▄▄▀ █▀▀ █░░█ █░░█ █▀▀ █▄▄▀ ▀▀█
  // ▀░▀▀ ▀▀▀ ▀░░▀ ▀▀▀░ ▀▀▀ ▀░▀▀ ▀▀▀

  renderAssignedUserSelection = (booking, allowedToChange, renderNotAllowed) => (
    allowedToChange ?
    <Select
      value={booking.assignedUserKey && booking.assignedUserKey}
      size="small"
      style={{width: 180}}
      onChange={this.handleSelectAssignedUser}
    >
      {
        (this.state.users || '').length > 0 &&
        this.state.users
        .sort((a,b) => {
          if((a.firstName || '').toUpperCase() < (b.firstName || '').toUpperCase()) return - 1
          if((a.firstName || '').toUpperCase() > (b.firstName || '').toUpperCase()) return 1
          return 0;
        })
        .map(user => (
          ((user.firstName || '').length > 0 || (user.lastName || '').length > 0) &&
          <Select.Option
            key={user.userKey}
            value={user.userKey}
          >
            {user.firstName} {user.lastName}
          </Select.Option>
        ))
      }
    </Select>
    :
    renderNotAllowed
  )

  renderAssignedUserCard = (booking, cardBodyStyles, pendingAssignUser, renderAssignedUserSelection, allowedToChange) => (
    <div style={cardBodyStyles}>
      {booking.assignedUserKey && !pendingAssignUser ? (
        <Fragment>
          <Avatar
            style={{
              marginBottom: '1rem',
              backgroundColor: '#6BE4AB'
            }}
            size={84}
         >
            {!booking.assignedFirstName && !booking.assignedLastName ? (
              <Icon style={{ fontSize: '2rem' }} type="user" />
            ) : (
                <div style={{ fontSize: '2rem', lineHeight: '94px' }}>
                  {booking.assignedFirstName.charAt(0)}
                  {booking.assignedLastName.charAt(0)}
                </div>
              )}
          </Avatar>
          {
            renderAssignedUserSelection(
              booking,
              allowedToChange, 
              <p style={{ color: 'white' }}>
                {booking.assignedFirstName} {booking.assignedLastName}
              </p>
            )
          }
        </Fragment>
      )
        :
        booking.assignedUserKey && pendingAssignUser ? (
          <Fragment>
            <Avatar
              icon="loading"
              style={{
                marginBottom: '1rem',
                backgroundColor: '#6BE4AB'
              }}
              size={84}
            />
            <p>
              <Icon style={{ color: 'white' }} type="loading" />
            </p>
          </Fragment>
        )
          :
          !booking.assignedUserKey && pendingAssignUser ? (
            <Fragment>
              <Avatar
                icon="loading"
                style={{ marginBottom: '1rem' }}
                size={84}
              />
              <p>
                <Icon style={{ color: 'white' }} type="loading" />
              </p>
            </Fragment>
          ) : (
              <Fragment>
                <Avatar
                  style={{ marginBottom: '1rem', backgroundColor: '#ffffff' }}
                  size={84}
                >
                  <Icon
                    style={{ fontSize: '2rem', color: '#cccccc' }}
                    type="user"
                  />
                </Avatar>
                {
                  renderAssignedUserSelection(
                    booking,
                    allowedToChange,
                    <p style={{ color: 'white' }}>
                      User Unassigned
                    </p>
                  )
                }
                      
              </Fragment>
            )}
    </div>

  )

  renderDueDatePicker = () => (
    <DatePicker
      size="small"
      allowClear={false}
      value={ this.props.booking.dueDate ? moment(this.props.booking.dueDate) : null }
      onChange={this.handleChangeDueDate}
    />
  )

  renderDaysRemaining = (dueCompDiff, dueNowDiff, compLateDay, dueDayRemain, currentStatus, cardTextStyles) => (
    this.props.allowedToEditFields.findIndex(accessLevel => this.props.user.accessLevel === accessLevel) === -1 ?
      dueNowDiff < 0 && currentStatus !== 'Complete' ? ( // overdue days check...

        <Typography style={ cardTextStyles }>
          <strong>Overdue:</strong>&nbsp;By&nbsp;{ Math.abs( dueNowDiff ) } days
        </Typography> 

      ) : currentStatus === 'Complete' && compLateDay <= 0 ? ( // completed but by days late...

        <Typography style={ cardTextStyles }>
          This was completed { Math.abs( compLateDay ) === 0 ? 1 : Math.abs( compLateDay ) } days late
        </Typography> 

      ) : dueDayRemain >= 2 ? ( // check how many days are left before the task is due...

        <Typography style={{ color: 'white', marginBottom: '0' }}>
          <strong>Due in:&nbsp;</strong>{ Math.abs( dueDayRemain ) }&nbsp;days
        </Typography>

      ) : dueDayRemain === 0 && currentStatus !== 'Complete' ? ( // check to see if it is due today...

        <Typography style={{ color: 'white', marginBottom: '0' }}>
          <strong>Due today</strong>
        </Typography>

      ) : dueDayRemain >= 1 && dueDayRemain < 2 ? ( // check to see if its due tomorrow...

        <Typography style={{ color: 'white', marginBottom: '0' }}>
          <strong>Due tomorrow</strong>
        </Typography>

      ) : currentStatus === 'Complete' && dueCompDiff > 0 ? ( // completed early...

        <Typography style={ cardTextStyles }>
          This was completed { dueCompDiff } { dueCompDiff === 1 ? 'day' : 'days' } early
        </Typography>

      ) :
        <Typography style={{ color: 'white', marginBottom: '0' }}>
          <strong>Due in:&nbsp;</strong>{ Math.abs( dueDayRemain ) }&nbsp;days
        </Typography> 
      :
      this.renderDueDatePicker() 
  )

  renderColorCards = (accessLevel) => {
    const {
      currentStatus
    } = this.props.booking;

    const { pendingAssignUser, pendingStatus, loading } = this.state;

    const { booking } = this.props;

    const colorCardStyles = labelName => ({
      backgroundColor: color('status', 'colorLabel', labelName).color
    });

    const colorCardStylesTemplates = labelName => ({
      backgroundColor: color('template', 'colorLabel', labelName).color
    });

    const cardBodyStyles = {
      textAlign: 'center',
      // height: 'auto',
      position: 'relative',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      height: 132,
    };

    const cardTextStyles = {
      marginBottom: '1em',
      color: '#ffffff'
    }

    // Date data for turnary...
    const now = moment().startOf( 'day' );
    const dueDate = moment( booking.dueDate ).startOf( 'day' );
    const completedDate = moment( booking.completedDate ).startOf( 'day' );

    // due completed comparison
    const dueCompDiff = Math.ceil( completedDate.diff( dueDate, 'days' ) );

    // now due date comparison
    const dueNowDiff = Math.ceil( dueDate.diff( now, 'days' ) );

    const compLateDay = Math.ceil( dueDate.diff( completedDate, 'days' ) );
    const dueDayRemain = Math.ceil( dueDate.diff( now, 'days' ) );

    // colors...
    const amber = '#fa541c';

    return (
      <Row type="flex" gutter={16} style={{ marginBottom: '16px' }}>
        <Col span={6}>
          <Card
            loading={loading}
            title={
              booking.bookingName &&
              <div style={{ position: 'relative' }}>
                <div>
                  {unescape(booking.bookingName)}
                </div>
                <div style={{ position: 'absolute', right: 0, top: -4 }}>
                  {
                    loading ?
                      null
                      :
                      dueCompDiff <= 2 && currentStatus !== 'Complete' &&
                      <Icon
                        style={{ color: '#ffffff', fontSize: '2em' }}
                        type="warning"
                      />
                  }
                </div>
              </div>
            }
            headStyle={{ color: '#ffffff' }}
            bodyStyle={{
              width: '100%',
              height: 'auto',
              color: '#ffffff',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
            }}
            style={
              loading ? ({ 
              background: color('template', 'colorLabel', 'purple').color }) 
              :
              currentStatus === 'Complete' && dueCompDiff <= 0 ?
                ({background: color('template', 'colorLabel', 'green').color })
              : currentStatus === 'Complete' && dueCompDiff > 0 ? // completed early...
                ({background: color('template', 'colorLabel', 'green').color })
              :
              currentStatus !== 'Complete' && dueNowDiff < 0 ?
                ({background: color('template', 'colorLabel', 'red').color })
              :
              currentStatus !== 'Complete' && dueNowDiff === 0 ?
                ({background: amber })
              :
              dueDayRemain >= 1 && dueDayRemain < 2 ? // check to see if its due tomorrow...
                ({background: amber }) 
              :
                this.colorCondition(dueCompDiff, colorCardStylesTemplates, colorCardStyles)
            }
          >
            <Fragment>
              {currentStatus === 'Complete' && compLateDay < 0 ?
                <Icon
                  theme="filled"
                  style={{ fontSize: '5rem', marginBottom: '1rem' }}
                  type="meh"
                />
              :
                currentStatus === 'Complete' && compLateDay >= 0 ?
                <Icon
                  theme="filled"
                  style={{ fontSize: '5rem', marginBottom: '1rem' }}
                  type="smile"
                />
              :
                dueNowDiff < 0 && currentStatus !== 'Complete' ?
                <Icon
                  theme="filled"
                  style={{ fontSize: '5rem', marginBottom: '1rem' }}
                  type="dislike"
                />
              :
                dueNowDiff === 0 && currentStatus !== 'Complete' ?
                <Icon
                  theme="filled"
                  style={{ fontSize: '5rem', marginBottom: '1rem' }}
                  type="warning"
                />
              :
                <Icon
                  theme="filled"
                  style={{ fontSize: '5rem', marginBottom: '1rem' }}
                  type="clock-circle"
                />
              }

              {/* Output the overdue days amount */}
              {this.renderDaysRemaining(dueCompDiff, dueNowDiff, compLateDay, dueDayRemain, currentStatus, cardTextStyles)}
            </Fragment>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            loading={loading}
            title="Created By"
            headStyle={{ color: '#ffffff' }}
            bodyStyle={{
              width: '100%',
              height: 'auto',
              position: loading ? 'relative' : 'absolute',
              bottom: '0',
              top: loading ? '0' : '57px',
              display: loading ? 'block' : 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            style={{ height: '100%', ...colorCardStyles('blue') }}
          >
            <div style={cardBodyStyles}>
              <Avatar
                style={{ marginBottom: '1rem', backgroundColor: '#85C5FF' }}
                size={84}
              >
                {!booking.assignedFirstName && !booking.assignedLastName ? (
                  <Icon style={{ fontSize: '2rem' }} type="user" />
                ) : (
                    <div style={{ fontSize: '2rem', lineHeight: '94px' }}>
                      {(booking.createdByFirstName || '').charAt(0)}
                      {(booking.createdByLastName || '').charAt(0)}
                    </div>
                  )}
              </Avatar>
              {!booking.createdByFirstName && !booking.createdByLastName ? (
                <p style={{ color: 'white' }}>
                  {booking.createdByEmailAddress}
                </p>
              ) : (
                  <p style={{ color: 'white' }}>
                    {booking.createdByFirstName} {booking.createdByLastName}
                  </p>
                )}
            </div>
          </Card>
        </Col>
        <Col span={6}>
          <Card
            loading={loading}
            title="Assigned To"
            headStyle={{ color: '#ffffff' }}
            bodyStyle={{
              width: '100%',
              height: 'auto',
              position: loading ? 'relative' : 'absolute',
              bottom: '0',
              top: loading ? '0' : '57px',
              display: loading ? 'block' : 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            style={
              booking.assignedUserKey && !pendingAssignUser
                ? { height: '100%', ...colorCardStyles('green') }
                : { height: '100%', background: '#cccccc' }
            }
          >
            {
              this.renderAssignedUserCard(booking, cardBodyStyles, pendingAssignUser, 
                this.renderAssignedUserSelection,
                this.props.allowedToEditFields.findIndex(accessLevel => this.props.user.accessLevel === accessLevel) !== -1, 
              )
            }
          </Card>
        </Col>
        <Col span={6}>
          <Card
            loading={loading}
            title={
              !loading &&
              <div style={{ display: 'flex' }}>
                <div>
                  Status
                  </div>
              </div>
            }
            headStyle={{ color: '#ffffff' }}
            bodyStyle={{
              width: '100%',
              height: 'auto',
              position: loading ? 'relative' : 'absolute',
              bottom: '0',
              top: loading ? '0' : '57px',
              display: loading ? 'block' : 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
            style={{ height: '100%', ...colorCardStyles('lime') }}
          >
            {!loading && !pendingStatus ? (
              <div style={cardBodyStyles}>
                <div style={{ marginBottom: '1rem' }}>
                  {this.currentStatusIcon(currentStatus)}
                </div>
                <p style={{ color: 'white' }}>{currentStatus}</p>
              </div>
            ) : !loading && pendingStatus ? (
              <div style={cardBodyStyles}>
                <div style={{ marginBottom: '1rem' }}>
                  <Icon
                    type="loading"
                    style={{ color: 'white', fontSize: '5rem' }}
                  />
                </div>
                <p>
                  <Icon style={{ color: 'white' }} type="loading" />
                </p>
              </div>
            ) : (
                  <div style={cardBodyStyles} />
                )}
          </Card>
        </Col>
      </Row>
    );
  }

  render = () => {
    return (
      this.state.loaded &&
      <Content
        style={{
          margin: '94px 16px 24px',
          padding: 24,
          minHeight: 280
        }}
      >
        {this.renderColorCards(this.props.user.accessLevel)}
        {/* 
          * The proceed bar is rendered using functions that are named after the currentStatus on the booking
          * This just selects them depending on what the currentStatus is. Not all statuses are included so
          * if we're in some custom status the 'Other' function is rendered instead.
        */}
        {this[this[this.props.booking.currentStatus] ? this.props.booking.currentStatus : 'Other'].renderBooking()}
      </Content>
    )
  }
}

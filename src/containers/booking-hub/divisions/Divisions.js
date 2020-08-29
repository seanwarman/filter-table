import React, { Component } from 'react';
import DivisionsTable from '../../../components/Tables/DivisionsTable';
// import {Button, Row, Col} from 'antd'

export default class BookingDivisionsTable extends Component {
  componentDidMount() {
    this.props.changeHeader('hdd','BookingHub',[{name: 'Divisions', url: '/bookinghub/divisions'}])
  }

  getTest = async() => {
    // KEEP: could probably do this with jseq but leaving it for now as it's pretty custom.
    // 
    // This endpoint needs to be limited by a few different things. Seeing as this isn't working as it should 
    // I could just give it a go with jseq.
    //
    // Limits
    // - divisionKey
    // - user's accessLevel
    //   - Provider: createdPartnerKey
    //   - Supplier: assignedUserKey is user.userKey OR assignedUserKey = NULL AND currentStatus != 'Draft' AND assignedPartnerKey = user.partnerKey OR assignedPartnerKey = NULL
    //   - Supplier Admin: can see all
    //   - Provider Admin: can see all
    //
    // Scribr f5932140-97f6-11e9-b1e1-a95197988676
    //
    // Once done add this code to BookingsTable.getfilterBookingsBySearchTerm


    // const partnerKey = this.props.user.partnerKey
    // const userKey = this.props.user.userKey
    // const accessLevel = this.props.user.accessLevel
    // Will's supplier partnerKey
    const partnerKey = '847e9050-98cf-11e9-ba16-b9540fb66cbe'
    const userKey = 'c20ab870-a885-11e9-9501-e92690434977'
    const accessLevel = 'Supplier'
    //
    // Yell Provider partnerKey
    // const partnerKey = '62399ed0-7170-11e9-8fe3-d9651741a080'
    // const accessLevel = 'Provider'

    let where = [`bookings.bookingDivKey = "f5932140-97f6-11e9-b1e1-a95197988676"`]

    if(accessLevel === 'Provider') where.push(
      `partnerKey = "${partnerKey}"`
    )

    if(accessLevel === 'Supplier') where.push(
      `(assignedUserKey = "${userKey}" OR assignedUserKey IS NULL) AND currentStatus != 'Draft' AND assignedPartnerKey = "${partnerKey}" OR assignedPartnerKey IS NULL`,
    )


    let result = await this.props.api.listPublic({
      name: 'bms_booking.bookings',
      columns: [
        {name: 'bookingsKey'},
        {name: 'partnerKey'},
        {name: 'createdPartnerKey'},
        {name: 'createdUserKey'},
        {name: 'created'},
        {name: 'dueDate'},
        {name: 'assignedUserKey'},
        {name: 'bookingName'},
        {name: 'assignedPartnerKey'},
        {name: 'colorLabel'},
        {name: 'completedDate'},
        {name: 'queried'},
        {name: 'currentStatus'},
        {name: 'bookingDivKey'},
        {name: 'flags'},
        {name: 'jsonForm'},
        {name: '$jsonForm[?Booking Month].value', as: 'bookingMonth'},
        {name: '$jsonForm[?Strategy].value', as: 'strategy'},
        {name: '$jsonForm[?Units].value', as: 'units'},
        {name: '$jsonForm[?Bigg Spend].value', as: 'biggSpend'},
        {name: 'Biggly.users', columns: [
          {name: 'concat=>(firstName " " lastName)', as: 'createdByFullName'}
        ], where: [
          'users.userKey = bookings.createdUserKey'
        ]},
        {name: 'bms_booking.divisionTemplates', columns: [
          {name: 'tmpName'}
        ], where: [
          'divisionTemplates.tmpKey = bookings.tmpKey'
        ]},
        {name: 'Biggly.uploads', columns: [
          {name: 'count=>(uploadsKey)', as: 'uploadsCount'}
        ], where: [
          'uploads.bookingsKey = bookings.bookingsKey'
        ]},
        {name: 'bms_booking.bookingComments', columns: [
          {name: 'count=>(bookingCommentsKey)', as: 'commentCount'}
        ], where: [
          'bookingComments.bookingsKey = bookings.bookingsKey'
        ]},

        // We're diverging from the original implementation here.
        // the original query did a join from bookings.createdPartnerKey
        // to get the partners.partnerName but it's actually always the 
        // partnerKey of the customer.
        // What we should do is get that partnerKey from the customer then
        // get the partnerName from that, which is what this is now doing.
        //
        // This way we don't have to store the partnerKey (or createdPartnerKey)
        // in the booking.
        {name: 'Biggly.customers', columns: [
          {name: 'partnerKey'},
          {name: 'customerName'},
          {name: 'Biggly.partners', columns: [
            {name: 'partnerName'}
          ], where: [
            'partners.partnerKey = customers.partnerKey'
          ]},
        ], where: [
          'customers.customerKey = bookings.customerKey'
        ]},


      ],
      where,
      sort: 'dueDate',
      limit: [0,2], 
    })
    console.log('result :', result)
  }
  render() {
    return (
      <>
        <DivisionsTable
          {...this.props}
          drawerTitle="Create a new division"
          getDivisions={() => 
            this.props.api.listAdmin({
              name: 'bms_booking.bookingDivisions',
              columns: [
                {name: 'bookingDivName'},
                {name: 'bookingDivKey'},
                {name: 'icon'}
              ]
            })
          }
          createDivision={async division => {
            division.jsonStatus = JSON.stringify([
              {
                value: 'Draft',
                role: 'Creator'
              },
              {
                value: 'Live',
                role: 'Anyone'
              },
              {
                value: 'In Progress',
                role: 'Creator'
              },
              {
                value: 'Complete',
              }
            ]);
            division.jsonFlags = JSON.stringify([
              {
                value: 'archived',
                colorLabel: 'grey'
              },
              {
                value: 'queried',
                colorLabel: 'green'
              },
              {
                value: 'paused',
                colorLabel: 'darkBlue'
              }
            ]);
            await this.props.api.createAdmin({
              name: 'bms_booking.bookingDivisions',
            }, division, 'bookingDivKey')
            await this.props.mountApp()
            return
          }}
          handleRow={(record) => {
            this.props.history.push(`/bookinghub/divisions/` + record.bookingDivKey);
          }}
        ></DivisionsTable>
      </>

    )
  }
}

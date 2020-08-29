export default class Queries {

  getArchivedBookings(where, limit, sort) {
    return {
      name: 'bms_booking.bookings',
      columns: [
        {name: 'bookingName'},
        {name: 'bookingsKey'},
        {name: 'dueDate'},
        {name: 'tmpKey'},
        {name: 'bookingDivKey'},
        {name: 'bms_booking.bookingDivisions', columns: [
          {name: 'bookingDivName'},
        ], where: [
          'bookingDivisions.bookingDivKey = bookings.bookingDivKey'
        ]},
        {name: 'bms_booking.divisionTemplates', columns: [
          {name: 'tmpName'}
        ], where: [
          'divisionTemplates.tmpKey = bookings.tmpKey'
        ]},
      ],
      where: [
        `JSON_CONTAINS(flags, '["archived"]') = 1`,
        ...where,
      ],
      limit,
      sort,
    }
  }

  getBookingsTableBookings(having, sort) {
    return {
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
        {name: 'periodKey'},
        {name: 'jsonForm'},
        {name: '$jsonForm[?Booking Month].value', as: 'bookingMonth'},
        {name: '$jsonForm[?Strategy].value', as: 'strategy'},
        {name: '$jsonForm[?Units].value', as: 'units'},
        {name: '$jsonForm[?Bigg Spend].value', as: 'biggSpend'},
        {name: 'Biggly.users', columns: [ {name: 'concat=>(firstName " " lastName)', as: 'assignedFullName'}
        ], where: [
          'users.userKey = bookings.assignedUserKey'
        ]},
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
      having,
      sort: sort ? sort : 'dueDate',
    }
  }

  getCompiledFlagsFromAllDivisions() {
    return {
      name: 'bms_booking.bookingDivisions',
      columns: [
        {name: 'bookingDivKey'},
        {name: 'jsonFlags'},
      ]
    }
  }

  getBookingDiv(bookingDivKey) {
    return {
      name: 'bms_booking.bookingDivisions',
      columns: [
        {name: 'bookingDivKey'},
        {name: 'divName'},
        {name: 'statusJson'},
        {name: 'jsonStatus'},
        {name: 'divKey'},
        {name: 'bookingDivName'},
        {name: 'jsonFlags'},
        {name: 'icon'},
        {name: 'accessLevels'},
      ], where: [
        `bookingDivKey = "${bookingDivKey}"`
      ]
    }
  }
  getBookingFormBookingDiv(bookingDivKey) {
    return {
      name: 'bms_booking.bookingDivisions',
      columns: [
        {name: 'jsonFlags'},
        {name: 'bookingDivKey'},
      ],
      where: [
        `bookingDivKey = "${bookingDivKey}"`
      ]
    }
  }
  getCustomers(partnerKey) {
    return {
      name: 'Biggly.customers',
      columns: [
        { name: 'customerKey'},
        { name: 'partnerKey'},
        { name: 'userKey'},
        { name: 'customerName'},
        { name: 'addressLine1'},
        { name: 'addressLine2'},
        { name: 'addressLine3'},
        { name: 'townName'},
        { name: 'postCode'},
        { name: 'telephone'},
        { name: 'emailAddress'},
        { name: 'partnerAccMan'},
        { name: 'created'},
        { name: 'updated'},
      ], where: [
        `partnerKey = "${partnerKey}"`
      ]
    }
  }
  createCustomer(customer) {
    return {
      name: 'Biggly.customers'
    }
  }
  deleteStateRecord(bookingStateKey) {
    return {
      name: 'bms_booking.bookingState',
      where: [
        `bookingStateKey = "${bookingStateKey}"`
      ]
    }
  }
  addStateRecord() {
    return {
      name: 'bms_booking.bookingState'
    }
  }
  // createComment(bookingsKey, comment, createdUserKey) {
  //   return {
  //     name: 'bms_booking.bookingComments'
  //   }
  // }
  proceedBookings(booking, or) {
    return {
      name: 'bms_booking.bookings',
      where: [or]
    }
  }
  getBookingsSmall(or) {
    return {
      name: 'bms_booking.bookings',
      columns: [
        {name: 'assignedUserKey'},
        {name: 'bookingsKey'},
      ],
      where: [or]
    }
  }
  getComments(bookingsKey) {
    return {
      name: 'bms_booking.bookingComments',
      columns: [
        {name: 'bookingCommentsKey'},
        {name: 'createdUserKey'},
        {name: 'Biggly.users', columns: [
          {name: 'firstName'},
          {name: 'lastName'},
        ], where: [
          'bookingComments.createdUserKey = users.userKey'
        ]},
        {name: 'created'},
        {name: 'bookingsKey'},
        {name: 'comment'},
        {name: 'queried'},
        {name: 'flagged'},
      ], where: [
        `bookingsKey = "${bookingsKey}"`
      ]
    }
  }
  getCommentsByBookingsKeys(bookingsKeys) {
    return {
      name: 'bms_booking.bookingComments',
      columns: [
        {name: 'bookingCommentsKey'},
        {name: 'createdUserKey'},
        {name: 'Biggly.users', columns: [
          {name: 'firstName'},
          {name: 'lastName'},
        ], where: [
          'bookingComments.createdUserKey = users.userKey'
        ]},
        {name: 'created'},
        {name: 'bookingsKey'},
        {name: 'bms_booking.bookings', columns: [
          {name: 'bookingName'}
        ], where: [
          'bookingComments.bookingsKey = bookings.bookingsKey'
        ]},
        {name: 'comment'},
        {name: 'queried'},
        {name: 'flagged'},
      ], where: [
        bookingsKeys.map(key => 
          `bookingsKey = "${key}"`
        ).join(' OR ')
      ], sort: 'created desc'
    }
  }
  updateBookings(booking, or) {
    return {
      name: 'bms_booking.bookings',
      where: [or]
    }
  }

  getBookingStatesByUser(userKey) {
    return {
      name: 'bms_booking.bookingState',
      columns: [
        {name: 'bookingStateKey'},
        {name: 'userKey'},
        {name: 'jsonState'},
        {name: 'bookingDivKey'},
        {name: 'bookingStateName'},
      ], where: [
        `bookingState.userKey = "${userKey}"`
      ]
    }
  }

  getBookingStatesForFilterView(userKey) {
    return {
      name: 'bms_booking.bookingState',
      columns: [
        {name: 'bookingStateKey'},
        {name: 'userKey'},
        {name: 'jsonState'},
        {name: 'bookingDivKey'},
        {name: 'bookingStateName'},
      ], where: [
        `bookingState.userKey = "${userKey}"`,
        `bookingState.bookingDivKey IS NULL`
      ]
    }
  }

  getBookingStates(userKey, bookingDivKey) {
    return {
      name: 'bms_booking.bookingState',
      columns: [
        {name: 'bookingStateKey'},
        {name: 'userKey'},
        {name: 'jsonState'},
        {name: 'bookingDivKey'},
        {name: 'bookingStateName'},
      ], where: [
        `bookingState.userKey = "${userKey}"`,
        `bookingState.bookingDivKey = "${bookingDivKey}"`
      ]
    }
  }
  updateBooking(bookingsKey, booking) {
    return {
      name: 'bms_booking.bookings',
      where: [
        `bookingsKey = "${bookingsKey}"`
      ]
    }
  }
  createAudit() {
    return {
      name: 'bms_booking.bookingAudit'
    }
  }
  createUpload(upload) {
    return {
      name: 'Biggly.uploads',
    }
  }
  getUploads(bookingsKey) {
    return {
      name: 'Biggly.uploads',
      columns: [
        {name: 'uploadsKey'},
        {name: 'created'},
        {name: 'uploadedUserKey'},
        {name: 'Biggly.users', columns: [
          {name: 'concat=>(firstName " " lastName)', as: 'uploadedUserName'}
        ], where: [
          'uploads.uploadedUserKey = users.userKey'
        ]},
        {name: 'fileName'},
        {name: 'bookingsKey'},
        {name: 'urlName'},
        {name: 'updated'},
        {name: 'campaignKey'},
        {name: 'customerKey'},
      ],
      where: [
        `bookingsKey = "${bookingsKey}"`
      ]
    }
  }
  getUploadsByBookingsKeys(bookingsKeys) {
    return {
      name: 'Biggly.uploads',
      columns: [
        {name: 'uploadsKey'},
        {name: 'created'},
        {name: 'uploadedUserKey'},
        {name: 'Biggly.users', columns: [
          {name: 'concat=>(firstName " " lastName)', as: 'uploadedUserName'}
        ], where: [
          'uploads.uploadedUserKey = users.userKey'
        ]},
        {name: 'fileName'},
        {name: 'bookingsKey'},
        {name: 'urlName'},
        {name: 'updated'},
        {name: 'campaignKey'},
        {name: 'customerKey'},
      ],
      where: [
        bookingsKeys.map(key => 
          `bookingsKey = "${key}"`
        ).join(' OR ')
      ]
    }
  }
  createComment(comment) {
    return {
      name: 'bms_booking.bookingComments',
    }
  }
  createBookingAudit(audit) {
    return {
      name: 'bms_booking.bookingAudit',
    }
  }
}

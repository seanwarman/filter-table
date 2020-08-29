export default class Helper {

  createAuditDescription(action, record) {

    const updatedFields = Object.keys(record).map(key => {

      // If the keyname matches a jseq query string "$column[? String].value"
      // then only return the 'column' part.
      if(/^\$/.test(key)) return (key.match(/\w+/g) || [key])[0]
      return key

    })

    return `${action}. Columns affected: ${updatedFields.join(', ')}`
  }


  makeAccessLevelWhere(user) {
    let where = []

    if(user.accessLevel === 'Provider') where.push(
      `partnerKey = "${user.partnerKey}"`
    )

    if(user.accessLevel === 'Supplier') where.push(
      `(assignedUserKey = "${user.userKey}" OR assignedUserKey IS NULL) AND currentStatus != 'Draft' AND (assignedPartnerKey = "${user.partnerKey}" OR assignedPartnerKey IS NULL)`,
    )

    return where
  }

  filterPausedBookings() {
    return [
      `JSON_SEARCH(flags, 'all', 'paused') is NULL`,
      `JSON_SEARCH(flags, 'all', 'archived') is NULL`
    ]
  }

  makeSearchTermWhere(user, bookingDivKey, searchTerm) {

    let where = [`
        bookings.bookingDivKey = "${bookingDivKey}"
        AND
        JSON_SEARCH(flags, 'all', 'paused') is NULL
        AND
        JSON_SEARCH(flags, 'all', 'archived') is NULL
        AND
        (
          instr(bookingName, '${decodeURIComponent(searchTerm)}')
          OR
          instr(bookingName, '${searchTerm}')
          OR
          instr(currentStatus, '${decodeURIComponent(searchTerm)}')
          OR
          instr(currentStatus, '${searchTerm}')
          OR
          instr(partnerName, '${decodeURIComponent(searchTerm)}')
          OR
          instr(partnerName, '${searchTerm}')
          OR
          instr(customerName, '${decodeURIComponent(searchTerm)}')
          OR
          instr(customerName, '${searchTerm}')
          OR
          instr(createdByFullName, '${decodeURIComponent(searchTerm)}')
          OR
          instr(tmpName, '${decodeURIComponent(searchTerm)}')
          OR
          instr(bookingMonth, '${decodeURIComponent(searchTerm)}')
          OR
          instr(strategy, '${decodeURIComponent(searchTerm)}')
          OR
          instr(units, '${decodeURIComponent(searchTerm)}')
          OR
          instr(biggSpend, '${decodeURIComponent(searchTerm)}')
        )
      `]

    return [ ...where, ...this.makeAccessLevelWhere(user) ]
  }

}

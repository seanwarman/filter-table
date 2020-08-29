module.exports = {
  select: `
    SELECT
    t96wz179m4ly7hn9.bookings.bookingsKey,
    t96wz179m4ly7hn9.bookings.partnerKey,
    t96wz179m4ly7hn9.bookings.createdPartnerKey,
    t96wz179m4ly7hn9.bookings.createdUserKey,
    t96wz179m4ly7hn9.bookings.created,
    t96wz179m4ly7hn9.bookings.dueDate,
    t96wz179m4ly7hn9.bookings.assignedUserKey,
    t96wz179m4ly7hn9.bookings.bookingName,
    t96wz179m4ly7hn9.bookings.assignedPartnerKey,
    t96wz179m4ly7hn9.bookings.colorLabel,
    t96wz179m4ly7hn9.bookings.completedDate,
    t96wz179m4ly7hn9.bookings.queried,
    t96wz179m4ly7hn9.bookings.currentStatus,
    t96wz179m4ly7hn9.bookings.bookingDivKey,
    t96wz179m4ly7hn9.bookings.divKey,
    t96wz179m4ly7hn9.bookings.jsonStatus,
    t96wz179m4ly7hn9.bookings.flagged,
    t96wz179m4ly7hn9.bookings.flags,
    t96wz179m4ly7hn9.bookings.jsonForm,
    t96wz179m4ly7hn9.bookings.periodKey,

    JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, concat('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'one', 'Booking Month'), 4, 1), ']')), '$.value') AS bookingMonth,
    JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, concat('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'one', 'Strategy'), 4, 1), ']')), '$.value') AS strategy,
    JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, concat('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'one', 'Units'), 4, 1), ']')), '$.value') AS units,
    JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, concat('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'one', 'Bigg Spend'), 4, 1), ']')), '$.value') as biggSpend,

    bookingDivisions.bookingDivName,
    bookingDivisions.icon,
    CONCAT(t96wz179m4ly7hn9.users.firstName, ' ', t96wz179m4ly7hn9.users.lastName) AS createdByFullName,
    t96wz179m4ly7hn9.partners.partnerKey, 
    t96wz179m4ly7hn9.partners.partnerName, 
    t96wz179m4ly7hn9.customers.customerName,
    CONCAT(users2.firstName, ' ', users2.lastName) AS assignedFullName,
    templates.tmpName,
    (select count(*) from t96wz179m4ly7hn9.uploads where uploads.bookingsKey = bookings.bookingsKey) AS uploadsCount,
    (select count(*) from t96wz179m4ly7hn9.bookingComments where bookingComments.bookingsKey = bookings.bookingsKey) AS commentCount

    FROM t96wz179m4ly7hn9.bookings
  `,
  join: `
    left join t96wz179m4ly7hn9.users ON t96wz179m4ly7hn9.users.userKey = t96wz179m4ly7hn9.bookings.createdUserKey
    left join t96wz179m4ly7hn9.users AS users2 on users2.userKey = t96wz179m4ly7hn9.bookings.assignedUserKey
    left join t96wz179m4ly7hn9.partners ON t96wz179m4ly7hn9.partners.partnerKey = t96wz179m4ly7hn9.bookings.createdPartnerKey
    left join t96wz179m4ly7hn9.customers ON t96wz179m4ly7hn9.customers.customerKey = t96wz179m4ly7hn9.bookings.customerKey
    left join t96wz179m4ly7hn9.divisionTemplates AS templates ON templates.tmpKey = t96wz179m4ly7hn9.bookings.tmpKey
    left join t96wz179m4ly7hn9.bookingDivisions ON t96wz179m4ly7hn9.bookingDivisions.bookingDivKey = t96wz179m4ly7hn9.bookings.bookingDivKey
  `
}

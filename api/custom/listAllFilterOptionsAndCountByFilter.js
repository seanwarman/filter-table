const response = require('../responseLib');
const sqlBuilder = require('bigg-mysql-wrapper');
const connections = require('../../config')

const db = new sqlBuilder();

exports.main = async(event, context, callback) => {

  const success = response.success

  // allows for using callbacks as finish/error-handlers
  context.callbackWaitsForEmptyEventLoop = false;
  
  const apiKey = event.pathParameters.apiKey;
  const userKey = event.pathParameters.userKey;


  const data = JSON.parse(event.body);
  const jsonFilterOptions = data.jsonFilterOptions;

  // 1 of 3: To add a new filter column add the selection to here (unless it doesn't need any formatting function)...
  const selections = {
    bookingMonth: `REPLACE(JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, CONCAT('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'all', 'Booking Month'), 4, 1), ']')), '$.value'), '"', '')`,
    strategy: `REPLACE(JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, CONCAT('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'all', 'Strategy'), 4, 1), ']')), '$.value'), '"', '')`,
    units: `REPLACE(JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, CONCAT('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'all', 'Units'), 4, 1), ']')), '$.value'), '"', '')`,
    biggSpend: `REPLACE(JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, CONCAT('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'all', 'Bigg Spend'), 4, 1), ']')), '$.value'), '"', '')`,
    assignedFullName: `CONCAT(users2.firstName, ' ', users2.lastName)`,
    createdByFullName: `CONCAT(t96wz179m4ly7hn9.users.firstName, ' ', t96wz179m4ly7hn9.users.lastName)`,
    partnerName: `t96wz179m4ly7hn9.partners.partnerName`,
    customerName: `t96wz179m4ly7hn9.customers.customerName`,
    tmpName: `templates.tmpName`,
    uploadsCount: `(SELECT count(*) FROM t96wz179m4ly7hn9.uploads WHERE uploads.bookingsKey = bookings.bookingsKey)`,
    commentCount: `(SELECT count(*) FROM t96wz179m4ly7hn9.bookingComments WHERE bookingComments.bookingsKey = bookings.bookingsKey)`,
    bookingDivName: `t96wz179m4ly7hn9.bookingDivisions.bookingDivName`,
  }

  // 2 of 3: Add the dataIndex to here (with '*' as it's string)...
  let ifType = {
    currentStatus: '*',
    bookingMonth: '*',
    strategy: '*',
    units: '*',
    biggSpend: '*',
    createdByFullName: '*',
    assignedFullName: '*',
    partnerName: '*',
    customerName: '*',
    tmpName: '*',
    queried: '*',
    uploadsCount: '*',
    created: '*',
    dueDate: '*',
    completedDate: '*',
    commentCount: '*',
    flags: '*',
    periodKey: '*',
    bookingDivName: '*',
  }

  let joins = {
    createdByFullName: 'left join t96wz179m4ly7hn9.users ON t96wz179m4ly7hn9.users.userKey = t96wz179m4ly7hn9.bookings.createdUserKey',
    assignedFullName: 'left join t96wz179m4ly7hn9.users AS users2 on users2.userKey = t96wz179m4ly7hn9.bookings.assignedUserKey',
    partnerName: 'left join t96wz179m4ly7hn9.partners ON t96wz179m4ly7hn9.partners.partnerKey = t96wz179m4ly7hn9.bookings.createdPartnerKey',
    customerName: 'left join t96wz179m4ly7hn9.customers ON t96wz179m4ly7hn9.customers.customerKey = t96wz179m4ly7hn9.bookings.customerKey',
    tmpName: 'left join t96wz179m4ly7hn9.divisionTemplates AS templates ON templates.tmpKey = t96wz179m4ly7hn9.bookings.tmpKey',
    bookingDivName: 'left join t96wz179m4ly7hn9.bookingDivisions ON t96wz179m4ly7hn9.bookingDivisions.bookingDivKey = t96wz179m4ly7hn9.bookings.bookingDivKey'
  }

  let extraJoins = [];

  function buildIfs(dataIndex, options, type) {
    if(selections[dataIndex]) dataIndex = selections[dataIndex];
    if(type !== 'date') {

      return options.map(optionItm => (
        type === 'number' ?
          `IF(${dataIndex} = '${Number(optionItm.option)}', 1, NULL)`
          :
          `IF(${dataIndex} = '${optionItm.option}', 1, NULL)`
      )).join(' OR ');
      
    } else if(type === 'date') {
      return `IF(t96wz179m4ly7hn9.bookings.${dataIndex} BETWEEN '${options[0].option[0]}' AND '${options[0].option[1]}', 1, NULL)`;
    }
  }

  function addJoins(dataIndex) {
    if(joins[dataIndex]) {
      extraJoins.push(joins[dataIndex]);
    }
  }
  
  if(jsonFilterOptions.length > 0) {
    jsonFilterOptions.forEach(item => {
      if(item.options.length === 0) return;
  
      const selectedOptions = item.options.filter(optionItem => optionItem.selected);
  
      if(selectedOptions.length === 0) return;
      
      addJoins(item.dataIndex);

      Object.keys(ifType).forEach(key => {
        if(key === item.dataIndex) return;

        if(ifType[key].includes('*')) {
          ifType[key] = `(${buildIfs(item.dataIndex, selectedOptions, item.type)})`;
        } else {
          ifType[key] += ` AND (${buildIfs(item.dataIndex, selectedOptions, item.type)})`;
        }
      })
  
    });
  }

  // let checkResult;

  // try {
  //   checkResult = await checker.check(apiKey);
  // } catch (err) {
  //   callback(null, failure(err));
  // }

  let whereString = `WHERE JSON_SEARCH(t96wz179m4ly7hn9.bookings.flags, 'all', 'archived') IS NULL`;
  
  // if(checkResult.accessLevel === 'Provider') {
  //   whereString += ` AND (t96wz179m4ly7hn9.bookings.createdPartnerKey = '${checkResult.partnerKey}')`;
  // } else if(checkResult.accessLevel === 'Supplier') {
  //   whereString += `
  //     AND (
  //       t96wz179m4ly7hn9.bookings.assignedUserKey = '${userKey}'
  //       OR t96wz179m4ly7hn9.bookings.assignedUserKey IS NULL
  //     )
  //     AND t96wz179m4ly7hn9.bookings.currentStatus != 'Draft'
  //     AND (
  //       t96wz179m4ly7hn9.bookings.assignedPartnerKey = '${checkResult.partnerKey}'
  //       OR
  //       t96wz179m4ly7hn9.bookings.assignedPartnerKey IS NULL
  //     )
  //   `;
  // }

  // if(checkResult.test === 'true') {
  //   if(whereString.length > 0) whereString += ' AND instr(`bookingName`, "%5BTEST%5D")';
  //   if(whereString.length === 0) whereString += 'WHERE instr(`bookingName`, "%5BTEST%5D")';
  // } else {
  //   if(whereString.length > 0) whereString += ' AND !instr(`bookingName`, "%5BTEST%5D")';
  //   if(whereString.length === 0) whereString += 'WHERE !instr(`bookingName`, "%5BTEST%5D")';
  // }
  
  db.conn(connections);
  
  // 3 of 3: Finally add another union to here (with ifType and your chosen dataIndex)...
  let queryString = `
    select 
    'currentStatus' as \`dataIndex\`, 
    'Status' as \`prettyName\`, 
    'string' as \`type\`,
    \`currentStatus\` as \`option\`,
    COUNT(${ifType.currentStatus}) as \`count\`,
    'false' as \`selected\`
    from 
    t96wz179m4ly7hn9.bookings 
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL

    -- DIVISION NAME
    union
    select
    'bookingDivName' as \`dataIndex\`,
    'Division' as \`prettyName\`,
    'string' as \`type\`,
    \`bookingDivName\` as \`option\`,
    COUNT(${ifType.bookingDivName}) as \`count\`,
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${joins.bookingDivName}
    ${extraJoins.filter(j => j !== joins.bookingDivName).join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL

    -- BOOKING MONTH
    union
    select
    'bookingMonth' as \`dataIndex\`,
    'Booking Month' as \`prettyName\`,
    'string' as \`type\`,
    replace(JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, concat('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'all', 'Booking Month'), 4, 1), ']')), '$.value'), '"', '') as 'option',
    COUNT(${ifType.bookingMonth}) as \`count\`,
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL

    -- STRATEGY
    union
    select
    'strategy' as \`dataIndex\`,
    'Strategy' as \`prettyName\`,
    'string' as \`type\`,
    replace(JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, concat('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'all', 'Strategy'), 4, 1), ']')), '$.value'), '"', '') as 'option',
    COUNT(${ifType.strategy}) as \`count\`,
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL

    -- PERIOD KEY
    union
    select
    'periodKey' as \`dataIndex\`,
    'Campaign Period' as \`prettyName\`,
    'number' as \`type\`,
    \`periodKey\` as \`option\`,
    COUNT(${ifType.periodKey}) as \`count\`,
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL

    -- UNITS
    union
    select
    'units' as \`dataIndex\`,
    'Units' as \`prettyName\`,
    'number' as \`type\`,
    replace(JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, concat('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'all', 'Units'), 4, 1), ']')), '$.value'), '"', '') as 'option',
    COUNT(${ifType.units}) as \`count\`,
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL

    -- BIGGSPEND
    union
    select
    'biggSpend' as \`dataIndex\`,
    'Bigg Spend' as \`prettyName\`,
    'number' as \`type\`,
    replace(JSON_EXTRACT(JSON_EXTRACT(t96wz179m4ly7hn9.bookings.jsonForm, concat('$[', substr(JSON_SEARCH(t96wz179m4ly7hn9.bookings.jsonForm, 'all', 'Bigg Spend'), 4, 1), ']')), '$.value'), '"', '') as 'option',
    COUNT(${ifType.biggSpend}) as \`count\`,
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL

    -- CREATED BY
    union
    select
    'createdByFullName' as \`dataIndex\`,
    'Created By' as \`prettyName\`,
    'string' as \`type\`,
    CONCAT(t96wz179m4ly7hn9.users.firstName, ' ', t96wz179m4ly7hn9.users.lastName) as \`option\`,
    COUNT(${ifType.createdByFullName}) as \`count\`,
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${joins.createdByFullName}
    ${extraJoins.filter(j => j !== joins.createdByFullName).join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL

    -- ASSIGNED
    union
    select
    'assignedFullName' as \`dataIndex\`,
    'Assigned To' as \`prettyName\`,
    'string' as \`type\`,
    CONCAT(users2.firstName, ' ', users2.lastName) as \`option\`,
    COUNT(${ifType.assignedFullName}) as \`count\`,
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${joins.assignedFullName}
    ${extraJoins.filter(j => j !== joins.assignedFullName).join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL

    -- PARTNER NAME
    union
    select
    'partnerName' as \`dataIndex\`,
    'Partner Name' as \`prettyName\`,
    'string' as \`type\`,
    t96wz179m4ly7hn9.partners.partnerName as \`option\`,
    COUNT(${ifType.partnerName}) as \`count\`,
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${joins.partnerName}
    ${extraJoins.filter(j => j !== joins.partnerName).join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL

    -- CUSTOMER NAME
    union
    select
    'customerName' as \`dataIndex\`,
    'Customer' as \`prettyName\`,
    'string' as \`type\`,
    t96wz179m4ly7hn9.customers.customerName as \`option\`,
    COUNT(${ifType.customerName}) as \`count\`,
    'false' as \`selected\`
    from 
    t96wz179m4ly7hn9.bookings
    ${joins.customerName}
    ${extraJoins.filter(j => j !== joins.customerName).join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL
    
    -- TEMPLATE NAMES
    union
    select
    'tmpName' as \`dataIndex\`,
    'Template Name' as \`prettyName\`,
    'string' as \`type\`,
    templates.tmpName as \`option\`,
    COUNT(${ifType.tmpName}) as \`count\`,
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${joins.tmpName}
    ${extraJoins.filter(j => j !== joins.tmpName).join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL
    
    -- QUERIED
    union
    select
    'queried' as \`dataIndex\`,
    'Queried' as \`prettyName\`,
    'string' as \`type\`,
    t96wz179m4ly7hn9.bookings.queried as \`option\`,
    COUNT(${ifType.queried}) as \`count\`,
    'false' as \`selected\`
    from 
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL
    
    -- FLAGS
    union
    select
    'flags' as \`dataIndex\`,
    'Flags' as \`prettyName\`,
    'json' as \`type\`,
    t96wz179m4ly7hn9.bookings.flags as \`option\`,
    COUNT(${ifType.flags}) as \`count\`,
    'false' as \`selected\`
    from 
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL
    
    -- UPLOADS COUNT
    union
    select
    'uploadsCount' as \`dataIndex\`,
    'Uploads' as \`prettyName\`,
    'number' as \`type\`,
    (select count(*) from t96wz179m4ly7hn9.uploads where uploads.bookingsKey = bookings.bookingsKey) as \`option\`,
    COUNT(${ifType.uploadsCount}) as \`count\`,
    'false' as \`selected\`
    from 
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL
    
    -- COMMENT COUNT
    union
    select
    'commentCount' as \`dataIndex\`,
    'Comments' as \`prettyName\`,
    'number' as \`type\`,
    (select count(*) from t96wz179m4ly7hn9.bookingComments where bookingComments.bookingsKey = bookings.bookingsKey) as \`option\`,

    COUNT(${ifType.commentCount}) as \`count\`,
    'false' as \`selected\`
    from 
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL
    
    -- CREATED
    union
    select
    'created' as \`dataIndex\`,
    'Created' as \`prettyName\`,
    'date' as \`type\`,
    '' as 'option',
    NULL as 'count',
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL
    
    -- DUE DATE
    union
    select
    'dueDate' as \`dataIndex\`,
    'Due Date' as \`prettyName\`,
    'date' as \`type\`,
    '' as 'option',
    NULL as 'count',
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL
    
    -- COMPLETED DATE
    union
    select
    'completedDate' as \`dataIndex\`,
    'Completed Date' as \`prettyName\`,
    'date' as \`type\`,
    '' as 'option',
    NULL as 'count',
    'false' as \`selected\`
    from
    t96wz179m4ly7hn9.bookings
    ${extraJoins.join(' ')}
    ${whereString}
    group by \`option\`
    having \`option\` is not NULL
  `;

  let result;

  try {
    result = await db.query(queryString);
  } catch (error) {
    console.log('error: ', error)
    callback(null, success({message: 'it broke at the query!', queryString, error}));
    return
  }

  callback(null, success({result, queryString}));
  return

};

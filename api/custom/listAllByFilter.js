const response = require('../responseLib')
const sqlBuilder = require('bigg-mysql-wrapper')
const connections = require('../config')
const bookingQuery = require('./bookingQuery')

const db = new sqlBuilder();

exports.main = async(event, context, callback) => {

  const success = response.success

  // allows for using callbacks as finish/error-handlers
  context.callbackWaitsForEmptyEventLoop = false;
  
  const apiKey = event.pathParameters.apiKey;
  const userKey = event.pathParameters.userKey;

  const sortBy = event.pathParameters.sortBy;
  const start = event.pathParameters.start;
  const end = event.pathParameters.end;
  const descOrAsc = event.pathParameters.descOrAsc ? event.pathParameters.descOrAsc : 'asc';

  const data = JSON.parse(event.body);
  const jsonFilterOptions = data.jsonFilterOptions;
  
  // let checkResult;

  // try {
  //   checkResult = await checker.check(apiKey);
  // } catch (err) {
  //   console.log('There was an error with your apiKey.');
  //   callback(null, success({message: 'There was an error with your apiKey.', ...err}));
  // }

  // if(checkResult.accessLevel !== 'Admin' && checkResult.accessLevel !== 'Provider Admin') {
  //   callback(null, success({message: 'This endpoint is only allowed for Admin and Provider Admin access levels.'}));

  // }

  db.conn(connections);
  
  let queryString = `
    ${bookingQuery.select}
    ${bookingQuery.join}
    WHERE JSON_SEARCH(t96wz179m4ly7hn9.bookings.flags, 'all', 'archived') IS NULL
  `;


  // if(checkResult.accessLevel === 'Provider') {
  //   queryString += ` AND (t96wz179m4ly7hn9.bookings.createdPartnerKey = '${checkResult.partnerKey}')`;
  // } else if(checkResult.accessLevel === 'Supplier') {
  //   queryString += `
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
  //   queryString += ' AND instr(`bookingName`, "%5BTEST%5D")';
  // } else {
  //   queryString += ' AND !instr(`bookingName`, "%5BTEST%5D")';
  // }

  function jsonCompare(dataIndex, option) {

    if(option === '[]') {

      return `(JSON_LENGTH(${dataIndex}) = (JSON_LENGTH('${option}')))`

    }

    return `(
      ${JSON.parse(option).map(val => `JSON_CONTAINS(${dataIndex}, '["${val}"]')`).join(' AND ')} 
      AND (JSON_LENGTH(${dataIndex}) = (JSON_LENGTH('${option}')))
    )`
  }

  function havingString(dataIndex, options, type) {
    if(type !== 'date') {

      return options.map(optionItm => (
        type === 'number' ?
          `${dataIndex} = '${Number(optionItm.option)}' OR ${dataIndex} = ${Number(optionItm.option)} OR ${dataIndex} = '${optionItm.option}'`
          :
        type === 'json' ?
          jsonCompare(dataIndex, optionItm.option)
          :
          `${dataIndex} = '${optionItm.option}'`
      )).join(' OR ');
      
    } else if(type === 'date') {
      return `${dataIndex} BETWEEN '${options[0].option[0]}' AND '${options[0].option[1]}'`;
    }
  }
  
  queryString += jsonFilterOptions.reduce((str, item, i) => {
    if(item.options.length === 0) return str;

    const selectedOptions = item.options.filter(optionItem => optionItem.selected);

    if(selectedOptions.length === 0) return str;

    if(str.length === 0) {
      str += ` HAVING (${havingString(item.dataIndex, selectedOptions, item.type)})`; 
    } else {
      str += ` AND (${havingString(item.dataIndex, selectedOptions, item.type)})`; 
    }
    return str;
    
  }, '');

  queryString += ` order by ${sortBy} ${descOrAsc} limit ${start}, ${end}`;

  // console.log('queryString : ', queryString)


  let result;

  try {
    result = await db.query(queryString);
  } catch (error) {
    callback(null, success({message: 'There was an error with your query', ...error}))
    return
  }

  callback(null, success(result));
  return

};

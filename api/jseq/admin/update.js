const response = require('../../responseLib');
const connection = require('../../../config');
const mysql = require('mysql2/promise');
const JSeq = require('jsequel');
const schema = require('../../schema/admin/index');
const customFns = require('./libs/custom-functions')

exports.main = async(event, context, callback) => {

  const success = response.success
  
  // allows for using callbacks as finish/error-handlers
  context.callbackWaitsForEmptyEventLoop = false;
  const con = await mysql.createPool({...connection, connectionLimit: 900});
  
  const apiKey = event.pathParameters.apiKey;
  const json = JSON.parse(decodeURIComponent(event.pathParameters.queryObj));
  let data = JSON.parse(event.body);

  let bulk = true;
  if(!data.length) {
    bulk = false;
    data = [data];
  }














  let results = [];

  for await(let dat of data) {
    const jseq = new JSeq(schema);
    jseq.addCustomFns(customFns)

    const jseqObj = jseq.updateSQ(json, dat);
    
    if(jseqObj.status === 'error') {
      callback(null, success(jseqObj));
      return;
    }

    let result;
    
    try {
      result = await con.query(jseqObj.query);
    } catch (error) {
      callback(null, success({message: 'There was an error with your query', ...error}))
    }
    results.push({...result[0], ...jseqObj})
  }

  await con.end();

  if(bulk) {
    callback(null, success(results));
    return;
  }
  callback(null, success(results[0]));
}

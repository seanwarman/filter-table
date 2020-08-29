const response = require('../../responseLib');
const connection = require('../../config');
const sqlBuilder = require('bigg-mysql-wrapper');
const JSeq = require('jsequel');
const schema = require('../../schema/admin/index');
const customFns = require('./libs/custom-functions')

const db = new sqlBuilder();

exports.main = async(event, context, callback) => {

  const success = response.success
  
  // allows for using callbacks as finish/error-handlers
  context.callbackWaitsForEmptyEventLoop = false;
  
  const apiKey = event.pathParameters.apiKey;
  const json = JSON.parse(decodeURIComponent(event.pathParameters.queryObj));
  














  const jseq = new JSeq(schema);
  jseq.addCustomFns(customFns)

  const jseqObj = jseq.selectSQ(json);
  
  if(jseqObj.status === 'error') {
    callback(null, success(jseqObj));
    return;
  }

  let result;
  
  db.conn(connection);

  try {
    result = await db.query(jseqObj.query);
  } catch (error) {
    callback(null, success({message: 'There was an error with your query', ...error}))
  }

  callback(null, success(result));
}

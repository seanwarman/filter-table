const express = require('express'); 
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express(); 
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors())

function handler(req, res, callback) {

  let event

  if(req) {
    event = {
      body: req.body ? JSON.stringify(req.body) : '',
      pathParameters: req.params
    }
  }
  
  const context = {
    callbackWaitsForEmptyEventLoop: false
  }

  callback(event, context, (ignore, result) => {
    if(res) res.send(JSON.parse(result.body))
    else console.log('Result: ', result)
  })


}

// ░▀░ █▀▄▀█ █▀▀█ █▀▀█ █▀▀█ ▀▀█▀▀ █▀▀
// ▀█▀ █░▀░█ █░░█ █░░█ █▄▄▀ ░░█░░ ▀▀█
// ▀▀▀ ▀░░░▀ █▀▀▀ ▀▀▀▀ ▀░▀▀ ░░▀░░ ▀▀▀

const listByFilter = require('./bookingpublic2/listAllByFilter').main
const filterOptions = require('./bookingpublic2/listAllFilterOptionsAndCountByFilter').main



const delPublic = require('./jseq/public/delete').main
const postPublic = require('./jseq/public/create').main
const putPublic = require('./jseq/public/update').main
const getPublic = require('./jseq/public/get').main
const listPublic = require('./jseq/public/list').main

const delAdmin = require('./jseq/admin/delete').main
const postAdmin = require('./jseq/admin/create').main
const putAdmin = require('./jseq/admin/update').main
const getAdmin = require('./jseq/admin/get').main
const listAdmin = require('./jseq/admin/list').main




// █▀▀ █▀▀█ █▀▀▄ ▀▀█▀▀ █▀▀█ █▀▀█ █░░ █░░ █▀▀ █▀▀█ █▀▀
// █░░ █░░█ █░░█ ░░█░░ █▄▄▀ █░░█ █░░ █░░ █▀▀ █▄▄▀ ▀▀█
// ▀▀▀ ▀▀▀▀ ▀░░▀ ░░▀░░ ▀░▀▀ ▀▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

app.put('/bookingpublic2/key/:apiKey/user/:userKey/bookings/sort/:sortBy/:start/:end/:ascOrDesc', (req, res) => {
  handler(req, res, listByFilter)
})

app.put('/bookingpublic2/key/:apiKey/user/:userKey/bookings/options/count', (req, res) => {
  handler(req, res, filterOptions)
})



app.delete('/jseq/key/:apiKey/public/:queryObj', (req, res) => handler(req,res, delPublic))
app.post('/jseq/key/:apiKey/public/:queryObj', (req, res) => handler(req,res, postPublic))
app.put('/jseq/key/:apiKey/public/:queryObj', (req, res) => handler(req,res, putPublic))
app.get('/jseq/key/:apiKey/public/:queryObj', (req, res) => handler(req,res, getPublic))
app.get('/jseq/key/:apiKey/public/:queryObj/list', (req, res) => handler(req,res, listPublic))

app.delete('/jseq/key/:apiKey/admin/:queryObj', (req, res) => handler(req,res, delAdmin))
app.post('/jseq/key/:apiKey/admin/:queryObj', (req, res) => handler(req,res, postAdmin))
app.put('/jseq/key/:apiKey/admin/:queryObj', (req, res) => handler(req,res, putAdmin))
app.get('/jseq/key/:apiKey/admin/:queryObj', (req, res) => handler(req,res, getAdmin))
app.get('/jseq/key/:apiKey/admin/:queryObj/list', (req, res) => handler(req,res, listAdmin))

// app.post('/jseq/key/:apiKey/public/:queryObj', (req, res) => {
//   handler(req, res, createPublic)
// })

// █▀▀ █▀▀█ █▀▀█ █▀▀▄ █▀▀
// █░░ █▄▄▀ █░░█ █░░█ ▀▀█
// ▀▀▀ ▀░▀▀ ▀▀▀▀ ▀░░▀ ▀▀▀

// // // Don't need this to run unless we're testing it.
// setInterval(() => {

//   handler(null, null, campaignCron)

// // every ten seconds
// }, 10000)

app.listen(port, () => console.log(`Listening on port ${port}`));

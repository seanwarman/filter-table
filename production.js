const express = require('express');
// const favicon = require('express-favicon');
const path = require('path');
const bodyParser = require('body-parser');
const cors = require('cors');
const app = express();
const port = process.env.PORT || 8080;
// app.use(favicon(__dirname + '/build/favicon.ico'));
// the __dirname is the current directory from where the script is running

app.use(express.static(__dirname));
app.use(express.static(path.join(__dirname, 'build')));
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

const listByFilter = require('./api/custom/listAllByFilter').main
const filterOptions = require('./api/custom/listAllFilterOptionsAndCountByFilter').main



const delPublic = require('./api/jseq/public/delete').main
const postPublic = require('./api/jseq/public/create').main
const putPublic = require('./api/jseq/public/update').main
const getPublic = require('./api/jseq/public/get').main
const listPublic = require('./api/jseq/public/list').main

const delAdmin = require('./api/jseq/admin/delete').main
const postAdmin = require('./api/jseq/admin/create').main
const putAdmin = require('./api/jseq/admin/update').main
const getAdmin = require('./api/jseq/admin/get').main
const listAdmin = require('./api/jseq/admin/list').main



// █▀▀ █▀▀█ █▀▀▄ ▀▀█▀▀ █▀▀█ █▀▀█ █░░ █░░ █▀▀ █▀▀█ █▀▀
// █░░ █░░█ █░░█ ░░█░░ █▄▄▀ █░░█ █░░ █░░ █▀▀ █▄▄▀ ▀▀█
// ▀▀▀ ▀▀▀▀ ▀░░▀ ░░▀░░ ▀░▀▀ ▀▀▀▀ ▀▀▀ ▀▀▀ ▀▀▀ ▀░▀▀ ▀▀▀

app.put('/custom/key/:apiKey/user/:userKey/bookings/sort/:sortBy/:start/:end/:ascOrDesc', (req, res) => {
  handler(req, res, listByFilter)
})

app.put('/custom/key/:apiKey/user/:userKey/bookings/options/count', (req, res) => {
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





app.get('/*', function (req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});







app.listen(port, () => console.log(`Listening on port ${port}`));


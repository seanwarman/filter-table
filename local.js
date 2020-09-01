const express = require('express'); 
const bodyParser = require('body-parser');
const cors = require('cors');
const config = require('./local-config.js')
const router = require('./router.js')

const app = express(); 
const port = process.env.PORT || 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true })); 
app.use(cors())

process.env.DB_HOST = config.host
process.env.DB_USER = config.user
process.env.DB_PASSWORD = config.password
process.env.DB_DATABASE = config.database

router(app)

app.listen(port, () => console.log(`Listening on port ${port}`));

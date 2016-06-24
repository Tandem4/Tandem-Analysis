var express = require('express');
var router = express.Router();

var app = express();

var config = require('../env/client-config');
var ServicesController = require('./util/services/ServicesController');

//Routes 
require('./routes/view-routes.js')(app);

app.listen(3030, function() {
  console.log('Silo Server Operational on port 3030')
}); 
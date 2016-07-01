// var express = require('express');
// var router = express.Router();

// var app = express();

// var config = require('../env/client-config');
// var ServicesController = require('./util/services/ServicesController');
// for testing only

// //Routes
// require('./routes/view-routes.js')(app);

var mongoFetch = require('./util/workers/mongoFetch.js');
mongoFetch();


// app.listen(3030, function() {
//   console.log('Silo Server Operational on port 3030')
// });

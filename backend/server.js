// imports
var express = require('express');
var bodyParser = require('body-parser');
var router = require('./apiRouter').router;
var server = express();

//instantiation
server.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

// Body Parser configuration
server.use(bodyParser.urlencoded({ extended: true }));
server.use(bodyParser.json());

//Configure routes
server.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/html');
    res.status(200).send('<h1>api-groupomania </h1> <h3> Bonjour sur notre super server(port: 8080) </h3 > ');

});

server.use('/api/', router);

// Launch server
server.listen(8080, function() {
    console.log('Server en écoute sur P7_GROUPOMANIA)');
});
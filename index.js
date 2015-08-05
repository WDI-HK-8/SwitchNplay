var Hapi = require('hapi');
var Path =require('path');

var server = new Hapi.Server();

//server config
server.connection({
  host: '0.0.0.0',
  port: 3000,
  routes: {
    cors: {
      headers: ["Access-Control-Allow-Credentials"],
      credentials: true
    }
  }
});

var plugins = [
  {register: require('./routes/users.js')},
  {//Mongodb
    register: require('hapi-mongodb'),
    options:{
      url: 'mongodb://127.0.01:27017/switchnplay',
      settings: {
        db: {
          native_parser: false
        }
      }
    }
  }
];

//start the server
server.register(plugins, function(err){
  if (err){
    throw err;
  }
  server.start(function(){
    console.log('server running at : '+ server.info.uri);
  });


});
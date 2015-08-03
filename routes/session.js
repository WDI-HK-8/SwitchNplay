var Bcrypt = require('bcrypt');
var Auth = require('./auth');

exports.register = function(server, options, next){
  server.route([
      {//POST
        method:'POST',
        path:'/sessions',
        handler: function(request,reply){
          var db = request.server.plugins['hapi-mongodb'].db;
          var user = request.payload.user;
          db.collection('users').findOne({username: user.username}, function(err, userMongo){
            
            if(err){
              return reply('Internal MongoDB error',err);
            }
            if (userMongo === null){
              reply('user do not exists');
            }
            
            Bcrypt.compare(user.password,userMongo.password, function(err, sameUser){
              if(!sameUser){
                reply({authorized: false});
              }
            });

            var randomKeyGenerator = function() {
            return (((1+Math.random())*0x10000)|0).toString(16).substring(1); 
            };

            var session_id = randomKeyGenerator();
            var session = {
              user_id: userMongo._id,
              session_id: session_id
            };

            db.collection('sessions').insert(session, function(err,writeResult){
              if(err){
                return reply('Internal MongoDB error');
              }
            });
            request.session.set('SNP_session',session);
            reply({authorized: true});
          });//end db findOne
        }//end handler POST
      },
      {//GET
        method:'GET',
        path:'/authenticated',
        handler: function(request,reply){
          var callback = function(result){
            reply(result);
          };
          Auth.authenticated(request, callback);
        }
      },
      {//DELETE
        method: 'DELETE',
        path: '/sessions',
        handler: function(request, reply) {
          var session = request.session.get('SNP_session');
          var db = request.server.plugins['hapi-mongodb'].db;

          if (!session) { 
            return reply({ "message": "Already logged out" });
          }

          db.collection('sessions').remove({ "session_id": session.session_id }, function(err, writeResult) {
            if (err) { return reply('Internal MongoDB error', err); }

            reply(writeResult);
          });
        }
      }
    ])


  next();
};
exports.register.attributes = {
  name: 'sessions-route',
  version: '0.0.1'
};
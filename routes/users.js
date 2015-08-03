var Joi = require('joi');
var Bcrypt = require('bcrypt');
//definition
exports.register = function(server, options, next){
  server.route([
  {
    method:'GET',
    path:'/users',
    handler: function(request,reply){
      var db = request.server.plugins['hapi-mongodb'].db;
      db.collection('users').find().toArray(function (err, users){
        if (err){
          return reply ('Internal MongoDB error', err);
        }else{
          reply(users);
        }
      });
    }//end handler GET
  },
  {
    method:'POST',
    path:'/users',
    config: {
      handler: function(request, reply){
        var db = request.server.plugins['hapi-mongodb'].db;
        var user = request.payload.user;
        var uniqUser = { $or: [{username: user.username},{email: user.email}]};

        Bcrypt.genSalt(10, function(err, salt){
          Bcrypt.hash(user.password,salt,function(err, encrypted){user.password = encrypted;
            db.collection('users').count(uniqUser, function(err, userExist){
              if (userExist) {
                return reply('Error: Username already exist', err);
              } else {
                db.collection('users').insert(user, function(err, writeResult){
                  if (err){
                    return reply('Internal MongoDB error', err);
                  } else {
                    reply(writeResult);
                  }
                });
              }
            });
          });
        });
      },//end handler POST
      validate: {
        payload: {
          user: {
            email: Joi.string().email().max(50).required(),
            password: Joi.string().min(5).max(20).required(),
            username: Joi.string().min(3).max(20).required(),
            location: Joi.string().required()
          }
        }
      }
    }
  }

  ]);

  next();
}// end definition

exports.register.attributes = {
  name: 'users-routes',
  version: '0.0.1'
};
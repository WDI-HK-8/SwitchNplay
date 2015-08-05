var Joi = require('joi');
var Bcrypt = require('bcrypt');
var Auth = require('./auth');
//definition
exports.register = function(server, options, next){
  server.route([
  {//GET
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
  },// end GET
  {// GET ONE USER
    method:'GET',
    path:'/users/{user_id}',
    handler: function(request, reply){
      var callback = function(response){
        var db = request.server.plugins['hapi-mongodb'].db;
        var username = request.params.user_id;
        db.collection('users').findOne({username: username}, function(err,user){
          if (err){
            return reply ('Internal MongoDB error', err);
          }else{
            reply(user);
          }
        });
      }
      Auth.authenticated(request, callback);
    }
  },
  {//POST
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
  },//end POST
  {//PATCH
    method:'PATCH',
    path:'/users/{username}',
    config:{
      handler: function(request,reply){
        var db = request.server.plugins['hapi-mongodb'].db;
        var user = request.payload.user;
        var username = request.params.username;
        db.collection('users').update({username: username},{$set: user },function(err, writeResult){
          if(err){
            return reply('Internal MongoDB error', err);
          } else {
            reply(username + ' modified successfully', writeResult);
          }
        });
      },
      validate:{
        payload: {
          user: {
            username: Joi.any().forbidden(),
            email: Joi.string().email().max(50),
            password: Joi.string().min(5).max(20),
            location: Joi.string()
          }
        }
      }
    }
  },//end PATCH
  {//DELETE
    method: 'DELETE',
    path:'/users/{username}',
    handler: function(request,reply){
      var callback = function(response){
        if(result.authenticated){
          var db = request.server.plugins['hapi-mongodb'].db;
          
          db.collection('users').remove({username:username}, function(err, writeResult){
            if (err) { 
              return reply('Internal MongoDB error', err); 
            } else {
              reply(username + ' has been deleted from the database', writeResult);
            }
          });
        }
      }
    }
  }//end DELETE

  ]);

  next();
}// end definition

exports.register.attributes = {
  name: 'users-routes',
  version: '0.0.1'
};
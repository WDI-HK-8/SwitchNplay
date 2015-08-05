var Auth = require('./auth');

exports.register = function(server, options, next){
  server.route([
    {
      method: 'POST',
      path:'/users/{username}/games',
      handler: function(request,reply){
        var callback = function(result){
          if (result.authenticated){
            var username = request.params.username;
            var db = request.server.plugins['hapi-mongodb'].db;
            var game = request.payload.game;
            
            var uniqGameInUser = { $and: [{name: game.name}, {platform: game.platform}]}; //Still cannot get it to find a specific game the games object
            db.collection('users').count(uniqGameInUser, function(err, gameInUserExist){
              return reply (gameInUserExist);
              if (!gameInUserExist){
                db.collection('users').update({username: username},{$push:{games:game}}, {upsert: true}, function(err,writeResult){
                  if(err){
                    return reply('Internal MongoDB error', err);
                  }else{
                    reply(game.name + " on " + game.platform + " added to " + username + "'s library", writeResult);
                  }
                });
              } else {
                return reply(username + ' has already listed '+ game.name + ' on ' + game.platform)
              }
            });

            var uniqGame = { $and: [{name: game.name}, {platform: game.platform}]};
            db.collection('games').count(uniqGame, function(err,gameExist){
              if (!gameExist){
                db.collection('games').insert(game, function(err, writeResult){
                  if (err){
                    return reply('Internal MongoDB error', err);
                  }
                });
              }
            });
          }
        };//end callback
        Auth.authenticated(request,callback);
      }//end handler
    },
    {
      method:'GET',
      path: '/games',
      handler: function(request,reply){
        var db = request.server.plugins['hapi-mongodb'].db;
        var games = db.collection('games').find({}).toArray();
        reply(games);
      }
    }
  ]);

  next();
}

exports.register.attributes = {
  name: 'games-routes',
  version: '0.0.1'
};
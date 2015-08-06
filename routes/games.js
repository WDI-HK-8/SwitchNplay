var Auth = require('./auth');

exports.register = function(server, options, next){
  server.route([
    {//POST
      method: 'POST',
      path:'/users/{id}/games',
      handler: function(request,reply){
        var callback = function(result){
          if (result.authenticated){
            var user_id = encodeURIComponent(request.params.id);
            var ObjectId = request.server.plugins['hapi-mongodb'].ObjectID;
            var db = request.server.plugins['hapi-mongodb'].db;
            var game = request.payload.game;
            
            var uniqGameInUser = {'games.name': game.name, 'games.platform': game.platform};
            db.collection('users').count(uniqGameInUser, function(err, gameInUserExist){
              if (!gameInUserExist){
                db.collection('users').update({_id: ObjectId(user_id)},{$push:{games:game}}, {upsert: true}, function(err,writeResult){
                  if(err){
                    return reply('Internal MongoDB error', err);
                  }else{
                    reply(game.name + " on " + game.platform + " added to your library", writeResult);
                  }
                });
              } else {
                return reply('You have already listed '+ game.name + ' on ' + game.platform)
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
    },//end POST
    {//GET
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
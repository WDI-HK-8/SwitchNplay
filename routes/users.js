//definition
exports.register = function(server, options, next){
  server.route([
  {
    method:'GET',
    path:'/users',
    handler: function(request,reply){
      reply('first route test users');
    }//end handler GET
  },
  {
    method:'POST',
    path:'/users',
    handler: function(request, reply){
      var db = request.server.plugins['hapi-mongodb'].db;
      var user = request.payload.user;
      db.collection('users').insert(user, function(err, writeResult){
        if (err){
          return reply('Internal MongoDB error', err);
        } else {
          reply(writeResult);
        }
      });
    }//end handler POST
  }

  ]);

  next();
}// end definition

exports.register.attributes = {
  name: 'users-routes',
  version: '0.0.1'
};
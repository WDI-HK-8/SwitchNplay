exports.register = function(server, options, next){
  
server.route([
  {
    method: 'GET',
    path: '/',
    handler: function(request, reply){
        reply.view('index'); //going to look for templates/index.html
    }
  },
  {
    method: 'GET',
    path: '/public/{path*}',
    handler: {
      directory: {
        path: 'public'
      }     
    }
  }
]);

next();

};

exports.register.attributes = {
  name: 'static-pages-routes',
  version: '0.0.1'
};
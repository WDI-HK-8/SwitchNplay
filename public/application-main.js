$(document).ready(function(){
  
var Session = function(){
  this.userId;
}

var Database = function(){

}

Session.prototype.signOut = function(){
  $.ajax({
    method: 'DELETE',
    url: '/sessions',
    success: function(response){
      console.log('user signed out',response);
      window.location.href = "/";
    },
    error: function(response){
      console.log('error deleting session');
    }
  })
};

Session.prototype.displayMyProfile = function(id){
  $.ajax({
    method:'GET',
    url: '/users/'+ id,
    success: function(response){
      console.log(response);
      var html_user = '';
          html_user += '<tr>';
          html_user +=   '<td>username :</td>';
          html_user +=   '<td>' + response.username + '</td>';
          html_user += '</tr>';
          html_user += '<tr>';
          html_user +=   '<td>password :</td>';
          html_user +=   '<td>*********</td>';
          html_user +=   '<td><button class="edit">Edit</button></td>';
          html_user += '</tr>';
          html_user += '<tr>';
          html_user +=   '<td>email :</td>'
          html_user +=   '<td>' + response.email + '</td>';
          html_user +=   '<td><button class="edit">Edit</button></td>';
          html_user += '</tr>';
          html_user += '<tr>';
          html_user +=   '<td>location :</td>'
          html_user +=   '<td>' + response.location + '</td>';
          html_user +=   '<td><button class="edit">Edit</button></td>';

      $('#content_profile').html(html_user);
    },
    error: function(response){
      console.log(response)
    }
  })
};

Session.prototype.displayMyGames = function(id){
  $.ajax({
    method:'GET',
    url: '/users/'+ id,
    success: function(response){
      var html_games_user = '';
      for (var i = 0; i < response.games.length; i++){
          html_games_user += '<tr>';
          html_games_user +=    '<td>' + response.games[i].name + '</td>';
          html_games_user +=    '<td>' + response.games[i].platform + '</td>';
          html_games_user +=    '<td><button class="delete_game" data-id=' + i + '>Delete</button>';
          html_games_user += '</tr>';
      }
      $('#content_games_profile').html(html_games_user);
    },
    error: function(response){
      console.log(response);

    }
  })
};

Session.prototype.addGames = function(id,name,platform){
  $.ajax({
    context: this,
    method:'POST',
    url: '/users/' + id + '/games',
    data: {
      game: {
        name: name,
        platform: platform
      }
    },
    success: function(response){
      console.log(response);
      $('#name_new_game').val("");
      $('#platform_new_game').val("");
      this.displayMyGames(id);
    }
  })
};

Session.prototype.getUserId = function(){
  $.ajax({
    context: this,
    method:'GET',
    url:'/authenticated',
    success: function(response){
      console.log(response)
      this.userId = response.user_id
      console.log(this.userId);
      return this.userId;
    }
  })
};

Database.prototype.displayDatabase = function() {
  $.ajax({
    context:this,
    method:'GET',
    url: '/games',
    success: function(response){
      var html_database = '';
      for (var i = 0; i < response.length; i++){
          html_database += '<tr>';
          html_database +=    '<td>' + response[i].name + '</td>';
          html_database +=    '<td>' + response[i].platform + '</td>';
          html_database += '</tr>';
      }
      $('#content_database').html(html_database);
    },
    error: function(response){
      console.log(response);

    }
  })
};

var displayUserSignedIn = function(){

};

var session = new Session();
var database = new Database();

session.getUserId();

$('#signout_button').click(function(){
  session.signOut();
});

$('#myprofile_button').click(function(){
  $('#database').hide();
  console.log(session.userId);
  session.displayMyProfile(session.userId);
  session.displayMyGames(session.userId);
  $('#content_myprofile').show();
})

$('#add_new_game').click(function(){
  var newGameName = $('#name_new_game').val();
  var newPlatform = $('#platform_new_game').val();
  if (newGameName === "" || newPlatform === ""){
    return alert('Please input a name and a platform');
  }else{
    session.addGames(session.userId,newGameName,newPlatform);
  }
})

$('#gamedatabase_button').click(function(){
  $('#content_myprofile').hide();
  database.displayDatabase();
  $('#database').show();
});


})
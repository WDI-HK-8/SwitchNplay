$(document).ready(function(){

var Profile = function(){
}

Profile.prototype.signUp = function(username,email,password,location){
  $.ajax({
    method: 'POST',
    url:'users',
    data: {
      user: {
        username: username,
        email: email,
        password: password,
        location: location
      }
    },
    dataType: 'json',
    success: function(response){
      console.log('new profile added');
      $('#username').val("");
      $('#email').val("");
      $('#password').val("");
    },
    error: function(response){
      console.log(response);
      $('#error_message i').text('Sorry pal, username or email already exists');
    }
  });
};

Profile.prototype.signIn = function(username,password){
  $.ajax({
    method: 'POST',
    url: 'sessions',
    data: {
      user:{
        username: username,
        password: password
      }
    },
    dataType: 'json',
    success: function(response){
      console.log("cookie added / session added");
    },
    error: function(response){
      console.log("error creating session");
    }
  })
};

Profile.prototype.signOut = function(){
  $.ajax({
    method: 'DELETE',
    url: 'sessions',
    success: function(response){
      console.log('cookie deleted / user signed out');
    },
    error: function(response){
      console.log('error deleting session');
    }
  })
};

var profile = new Profile();

$('form').submit(function(){
  event.preventDefault();
});

$('#submit_new_user').click(function(){
  var newUsername = $('#username').val();
  var newEmail = $('#email').val();
  var newPassword = $('#password').val();
  var newLocation = $('#location').val();
  profile.signUp(newUsername,newEmail,newPassword,newLocation);
});

$('#sign_in_user').click(function(){
  var usernameSignIn = $('#username_signin').val();
  var passwordSignIn = $('#password_signin').val();
  profile.signIn(usernameSignIn,passwordSignIn);
});

$('#sign_out_user').click(function(){
  profile.signOut();
})
})
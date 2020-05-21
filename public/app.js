'use strict';
console.log('Yoooooo from the app.js');


$('#formToUpdateBook').hide();


$('#revealUpdateForm').click(function() {
  $('#formToUpdateBook').show();
  $('#revealUpdateForm').hide();
  console.log('button was clicked!');
});


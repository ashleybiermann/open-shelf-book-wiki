'use strict';

$('document').ready(() => {
// hides form in details.ejs until user clicks, then it reveals the form and can be further updated
  $('#formToUpdateBook').hide();

  $('#revealUpdateForm').click(function() {
    $('#formToUpdateBook').show();
    $('#revealUpdateForm').hide();
  });

  // offers a way to navigate from homepage to new search page
  $('#findNewBook').click(function(e) {
    e.preventDefault();
    window.location.href = '/searches/new';
  });
});

// TODO: button that double checks that the user really wants to delete the book

// $('#deleteBook').click;


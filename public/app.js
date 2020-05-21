'use strict';
console.log('Yoooooo from the app.js');

const buttonToRevealForm = $('#revealUpdateForm');

const formToUpdateBook = $('#formToUpdateBook');

formToUpdateBook.style = 'display : none';

buttonToRevealForm.addEventListener('click', () => {
  formToUpdateBook.style = '';
});

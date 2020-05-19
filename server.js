'use strict';

// packages / dependencies
const express = require('express');
const superagent = require('superagent');
require('dotenv').config();

//global variables / app setup
const app = express();
const PORT = process.env.PORT || 3000;

// configs / middleware
app.use(express.urlencoded({ extended: true })); //middleware to create req.body for PORT from forms
app.use(express.static('./public')); // which frontend files to serve / for the case of forms
app.set('view engine', 'ejs'); // render === build a page in express

// constructors
function Book(obj) {
  this.title = obj.title ? obj.title : 'Book Title Unknown';
  this.author = obj.authors ? obj.authors : 'Author Unknown';
  this.image = obj.imageLinks.smallThumbnail ? obj.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = obj.description ? obj.description : 'No description provided';
}

app.get('/', (req, res) => {
  res.render('pages/index');
});

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

app.post('/searches/new', searchBook);

function searchBook(req, res) {
  const url = 'https://www.googleapis.com/books/v1/volumes';
  const {keyword, type} = req.body.search;
  let q = '';

  if (type === 'author') {
    q+= `inauthor:${keyword}`;
  } else if (type === 'title') {
    q+= `intitle:${keyword}`;
  } else {
    // message is variable and can be changed... this could redirect to error page, but this seems more useful. TODO: Add a timeout and then redirect to original page ... /searches/new
    res.send({message: 'please go back and choose title or author'});
  }

  superagent.get(url)
    .query({q})
    .then(resultFromSuper => {
      const bookArr = [];
      resultFromSuper.body.items.forEach(current => {
        bookArr.push(new Book(current.volumeInfo));
      });
      //  where you're going to send it, what you're going to call it : what it's going to contain
      res.render('pages/searches/show', {'books': bookArr});
    })
    .catch(error => {
      res.render('pages/error', {'error': error});
      console.error('error from Google Books API ', error);
    });
}

// start the app
app.listen(PORT, () => console.log(`app is up on port :  ${PORT}`));

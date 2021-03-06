'use strict';

// packages / dependencies
const express = require('express');
const superagent = require('superagent');
require('dotenv').config();
const pg = require('pg');
const methodOverride = require('method-override');

//global variables / app setup
const app = express();
const PORT = process.env.PORT || 3000;

// configs / middleware
app.use(express.urlencoded({ extended: true })); //middleware to create req.body for PORT from forms
app.use(express.static('./public')); // which frontend files to serve / for the case of forms
app.set('view engine', 'ejs'); // render === build a page in express
app.use(methodOverride('_overrideMethod')); // method override set up

//pg set up
const client = new pg.Client(process.env.DATABASE_URL);
client.on('error', console.error);
client.connect();

//routes
app.get('/', retreiveBooksFromDB);
app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});
app.post('/searches/new', searchBook);

app.post('/books', saveBookToDB);
app.get('/books/:id', retrieveSingleBook);
app.put('/books/:id/update', updateBook);
app.put('/books/:id/delete', deleteBook);

// start the app
app.listen(PORT, () => console.log(`app is up on port :  ${PORT}`));

// constructors
function Book(obj) {
  this.title = obj.title ? obj.title : 'Book Title Unknown';
  this.author = obj.authors ? obj.authors : 'Author Unknown';
  this.isbn = obj.industryIdentifiers ? obj.industryIdentifiers[0].identifier : 'error: isbn unknown'; // TODO: What if I want the second ISBN rather than the first?
  if (obj.imageLinks.smallThumbnail) {
    if (obj.imageLinks.smallThumbnail[4] === ':') {
      obj.imageLinks.smallThumbnail = obj.imageLinks.smallThumbnail.split(':').join('s:');
    }
  }
  this.image = obj.imageLinks ? obj.imageLinks.smallThumbnail : 'https://i.imgur.com/J5LVHEL.jpg';
  this.description = obj.description ? obj.description : 'No description provided';
}

// function declarations
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
      console.error('error from Google Books API: ', error);
    });
}

function retreiveBooksFromDB(req, res){
  const sqlQuery = 'SELECT * FROM booktable';
  client.query(sqlQuery)
    .then(resultFromSql => {

      if (resultFromSql.rowCount > 0) {
        console.log(resultFromSql.rows);
        res.render('pages/index', {'booksFromDB': resultFromSql.rows});
      } else {
        res.render('pages/searches/new');
      }

    })
    .catch(error => {
      res.render('pages/error', {'error': error});
      console.error('error retrieving books from database: ', error);
    });
}

function saveBookToDB(req, res) {
  // TODO: If book already exists in DB, then don't put it in again
  const saveToSql = 'INSERT INTO booktable (author, title, isbn, image_url, description, bookshelf) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id';
  const oneBookInfo = [req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description, req.body.bookshelf];
  client.query(saveToSql, oneBookInfo)
    .then (resultFromSql => {
      res.redirect('/books/' + resultFromSql.rows[0].id);
    })
    .catch(error => {
      res.render('pages/error', {'error': error});
      console.error('error retrieving books from database: ', error);
    });
}

function retrieveSingleBook(req, res) {
  const id = req.params.id;
  const getOneBook = `SELECT * FROM booktable WHERE id=${id}`;
  client.query(getOneBook)
    .then(resultFromSql => {
      const book = resultFromSql.rows[0];
      res.render('pages/books/show', {'oneSavedBook': book});
    })
    .catch(error => {
      res.render('pages/error', {'error': error});
      console.error('error retrieving single book from db: ', error);
    });
}

// TODO: make a function to hold the error handler

function updateBook(req, res) {
  const id = req.params.id;
  const values = [id, req.body.author, req.body.title, req.body.isbn, req.body.image_url, req.body.description, req.body.bookshelf];
  const updateBook = `UPDATE booktable 
  SET author=$2,
  title=$3,
  isbn=$4,
  image_url=$5,
  description=$6,
  bookshelf=$7
  WHERE id=$1`;

  client.query(updateBook, values)
    .then(() => {
      res.redirect(`/books/${id}`);
    })
    .catch(error => {
      res.render('pages/error', {'error': error});
      console.error('error from updating book: ', error);
    });
}

function deleteBook(req, res) {
  const id = req.params.id;
  const deleteBook = `DELETE FROM booktable WHERE id=${id}`;

  client.query(deleteBook)
    .then(() => {
      res.redirect(`/`);
    })
    .catch(error => {
      res.render('pages/error', {'error': error});
      console.error('error from deleting book: ', error);
    });
}


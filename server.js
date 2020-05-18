'use strict';

// packages / dependencies
const express = require('express');
const superagent = require('superagent');
require('dotenv').config();

//global variables / app setup
const app = express();
const PORT = process.env.PORT || 3000;

// configs / middleware
app.use(express.urlencoded({extended:true})); //middleware to create req.body for PORT from forms
app.use(express.static('./public')); // which frontend files to serve / for the case of forms
app.set('view engine', 'ejs'); // render === build a page in express

app.get('/hello', (req, res) => {
  res.render('pages/index');
});

app.get('/searches/new', (req, res) => {
  res.render('pages/searches/new');
});

// start the app
app.listen(PORT, () => console.log(`app is up on port :  ${PORT}`));

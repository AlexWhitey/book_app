/* eslint-disable indent */
'use strict';

// App Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const cors = require('cors');

// Load environment variables from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;
app.use(cors());

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.static('./public'));

// Set the view engine for templating
app.set('view engine', 'ejs');

// Routes
app.get('/', savedBooks);
app.get('/new', showSearch);
app.post('/new', addBook);
app.post('/searches', createSearch);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// Listening for requests
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//********************
// Models
//********************

function Book(info) {
  const placeholderImage = 'https://i.imgur.com/J%LVHEL.jpg';

  this.title = info.title ? info.title : 'No Title available'
  this.author = info.authors ? info.authors[0] : 'No author available'
  this.isbn = info.industryIdentifiers ? `ISBN_13 ${info.industryIdentifiers[0].identifier}` : 'No isbn available'
  this.img_url = info.imageLinks ? info.imageLinks.smallThumbnail : placeholderImage;
  this.description = info.description ? info.description : 'No Description Available';
  this.id = info.industryIdentifiers ? `${info.industryIdentifiers[0].identifier}` : ''
}

//********************
// Helper functions
//********************

function handleError(error, response) {
  response.render('pages/error', {error: error});
}

function savedBooks (request, response) {
  let SQL = 'SELECT * FROM books;';
  return client.query(SQL)
  .then(results => response.render('index', {results: results.rows}))
  .catch(handleError);
}

function addBook(request, response) {
  console.log(request.body)
  let {title, author, isbn, img_url, description, id} = request.body;
  let SQL = 'INSERT INTO books(title, author, isbn, img_url, description, id) VALUES ($1, $2, $3, $4, $5, $6);';
  let values = [title, author, isbn, img_url, description, id];
  return client.query(SQL, values)
  .then(response.redirect('/'))
  .catch(error => handleError(error, response));
}

function showSearch(request, response) {
  response.render('pages/searches/new');
  app.use(express.static('./public'));
}

function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  // console.log(request.body);
  // console.log(request.body.search);
  if(request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if(request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  // console.log(url);
  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchesResults: results}))
    .catch(error => handleError(error, response));
}

// function getBookies (request, response) {
// }

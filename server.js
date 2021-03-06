'use strict';

// App Dependencies
const express = require('express');
const superagent = require('superagent');
const pg = require('pg');
const methodOverride = require('method-override');

// Load environment variables from .env file
require('dotenv').config();

// Application Setup
const app = express();
const PORT = process.env.PORT || 3000;

// Database Setup
const client = new pg.Client(process.env.DATABASE_URL);
client.connect();
client.on('error', err => console.error(err));

// Application Middleware
app.use(express.urlencoded({ extended: true }));

// Specify a directory for statis resources
app.use(express.static('./public'));

// Midware to handle PUT and DELETE
app.use(methodOverride((request, response) =>{
  if (request.body && typeof request.body === 'object' && '_method' in request.body){
    // Look in urlendcoded POST bodies and delete it
    let method = request.body._method;
    delete request.body._method;
    return method;
  }
}))

// Routes
// Set the view engine for templating
app.set('view engine', 'ejs');

app.get('/', savedBooks);

app.post('/addBook', addBook);

app.get('/new', showSearch);

app.post('/searches', createSearch);

app.get('/books/:book_id', getOneBookDetail);

app.post('/books/:book_id', updateBook);

app.delete('/books/:book_id', deleteBook);

app.get('*', (request, response) => response.status(404).send('This route does not exist'));

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
}

//********************
// Helper functions
//********************

function getOneBookDetail(request, response) {
  let SQL = 'SELECT * FROM books WHERE id=$1;';
  let values = [request.params.book_id];
  return client.query(SQL, values)
    .then(result => {
      return response.render('pages/books/show', {book: result.rows[0]});
    })
    .catch(err => handleError(err, response));
}

function showSearch(request, response) {
  response.render('pages/searches/new');
  app.use(express.static('./public'));
}

function savedBooks (request, response) {
  let SQL = 'SELECT * FROM books;';
  return client.query(SQL)
    .then(results => {
      response.render('./pages/index', {results: results.rows})
    })
    .catch(error => handleError(error, response));
}

function addBook(request, response) {
  let { title, author, isbn, img_url, description } = request.body;
  let SQL = 'INSERT INTO books(title, author, isbn, img_url, description) VALUES ($1, $2, $3, $4, $5);';
  let values = [title, author, isbn, img_url, description];
  return client.query(SQL, values)
    .then(response.redirect('/'))
    .catch(error => handleError(error, response));
}

function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';
  if(request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if(request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }
  console.log('114', url);
  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .catch(error => handleError(error, response))
    .then(results => response.render('pages/searches/show', { searchesResults: results}))
    .catch(error => handleError(error, response));
}

// Delete book function
function deleteBook(request, response) {
  let SQL = `DELETE FROM books WHERE id=$1;`;
  let values = [request.params.book_id]

  return client.query(SQL, values)
    .then(response.redirect('/'))
    .catch(error => handleError(error, response));
}
// Update book function
function updateBook(request, response) {
  let { title, author, isbn, img_url, description } = request.body;
  let SQL = 'UPDATE books SET title=$1, author=$2, isbn=$3, img_url=$4, description=$5 WHERE id=$6;';
  let values = [title, author, isbn, img_url, description, request.params.book_id];

  return client.query(SQL, values)
    .then(response.redirect(`/books/${request.params.book_id}`))
    .catch(error => handleError(error, response));
}

function handleError(error, response) {
  response.render('pages/error', {error: error});
}

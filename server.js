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
// const client = new pg.Client(process.env.DATABASE_URL);
// client.connect();
// client.on('error', err => console.error(err));

// Application Middleware
app.use(express.urlencoded({ extended: true }));

// Set the view engine for templating
app.set('view engine', 'ejs');
app.use(express.static('./public'));

// Routes
app.get('/', newSearch);
app.post('/searches', createSearch);


app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// Listening for requests
app.listen(PORT, () => console.log(`Listening on ${PORT}`));

//********************
// Models
//********************

function Book(info) {
  this.title = info.title || 'No Title available'
  this.author = info.authors || 'No author available'
  // this.isbn = info.industryIdentifier[0].identifier || 'No isbn available'
  this.image_url = info.imageLinks || 'No image.url available'
  this.description = info.description || 'No description available'
}

//********************
// Helper functions
//********************

// function handleError(err, response) {
//   console.error(err);
//   if(response) response.status(500).send('Piss Off')
// }

function newSearch(request, response) {
  response.render('pages/index');
  app.use(express.static('./public'));
}

function createSearch(request, response) {
  let url = 'https://www.googleapis.com/books/v1/volumes?q=';

  console.log(request.body);
  console.log(request.body.search);

  if(request.body.search[1] === 'title') { url += `+intitle:${request.body.search[0]}`; }
  if(request.body.search[1] === 'author') { url += `+inauthor:${request.body.search[0]}`; }

  console.log(url);

  superagent.get(url)
    .then(apiResponse => apiResponse.body.items.map(bookResult => new Book(bookResult.volumeInfo)))
    .then(results => response.render('pages/searches/show', { searchesResults: results}));

    // .catch(error => handleError(error, response));
}


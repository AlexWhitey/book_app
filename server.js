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


app.get('*', (request, response) => response.status(404).send('This route does not exist'));

// Listening for requests
app.listen(PORT, () => console.log(`Listening on ${PORT}`));


function newSearch(request, response) {
  response.render('pages/index')
}

function createSearch
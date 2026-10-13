'use strict';

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.BOOK_PORT || 3001;
const booksFile = path.join(__dirname, 'books.json');

app.use(express.json());

let books = JSON.parse(fs.readFileSync(booksFile, 'utf8'));

/** Persist the current in-memory book list to disk. */
function saveBooks() {
  fs.writeFileSync(booksFile, `${JSON.stringify(books, null, 2)}\n`, 'utf8');
}

function validText(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

function validPrice(value) {
  return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function parseId(value) {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function validateBook({ title, author, price }) {
  if (!validText(title) || !validText(author) || !validPrice(price)) {
    return 'Title and author must be non-empty strings, and price must be a positive number.';
  }
  return null;
}

app.get('/books', (req, res) => res.status(200).json(books));

app.get('/books/:id', (req, res) => {
  const book = books.find((item) => item.id === parseId(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }
  return res.status(200).json(book);
});

app.post('/books', (req, res) => {
  const { title, author, price } = req.body;
  const validationError = validateBook({ title, author, price });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  const book = {
    id: books.length ? Math.max(...books.map((item) => item.id)) + 1 : 1,
    title: title.trim(),
    author: author.trim(),
    price
  };
  books.push(book);
  saveBooks();
  return res.status(201).json(book);
});

app.put('/books/:id', (req, res) => {
  const book = books.find((item) => item.id === parseId(req.params.id));
  if (!book) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  const { title, author, price } = req.body;
  const validationError = validateBook({ title, author, price });
  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  book.title = title.trim();
  book.author = author.trim();
  book.price = price;
  saveBooks();
  return res.status(200).json(book);
});

app.delete('/books/:id', (req, res) => {
  const index = books.findIndex((item) => item.id === parseId(req.params.id));
  if (index === -1) {
    return res.status(404).json({ error: 'Book not found.' });
  }

  const [deletedBook] = books.splice(index, 1);
  saveBooks();
  return res.status(200).json(deletedBook);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Book API listening on port ${PORT}`));
}

module.exports = { app, saveBooks };

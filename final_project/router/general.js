const express = require('express');
const axios = require('axios');

let books = require("./booksdb.js");
let users = require("./auth_users.js").users;

const public_users = express.Router();

const BASE_URL = "http://localhost:5000";

const doesExist = (username) => {
  return users.some((user) => user.username === username);
};

public_users.post("/register", (req, res) => {
  const username = req.body.username || req.query.username;
  const password = req.body.password || req.query.password;

  if (!username || !password) {
    return res.status(400).json({
      message: "Unable to register user. Username and/or password not provided"
    });
  }

  if (doesExist(username)) {
    return res.status(409).json({ message: "User already exists!" });
  }

  users.push({ username, password });

  return res.status(200).json({
    message: "User successfully registered. Now you can login"
  });
});

// Task 1 - Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Task 2 - Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (!book) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });
  }

  return res.status(200).send(JSON.stringify(book, null, 4));
});

// Task 3 - Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author.toLowerCase();
  const filteredBooks = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].author.toLowerCase() === author) {
      filteredBooks[isbn] = books[isbn];
    }
  });

  if (Object.keys(filteredBooks).length === 0) {
    return res
      .status(404)
      .json({ message: `No books found for author ${req.params.author}` });
  }

  return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
});

// Task 4 - Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title.toLowerCase();
  const filteredBooks = {};

  Object.keys(books).forEach((isbn) => {
    if (books[isbn].title.toLowerCase() === title) {
      filteredBooks[isbn] = books[isbn];
    }
  });

  if (Object.keys(filteredBooks).length === 0) {
    return res
      .status(404)
      .json({ message: `No books found for title ${req.params.title}` });
  }

  return res.status(200).send(JSON.stringify(filteredBooks, null, 4));
});

// Task 5 - Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;

  if (!books[isbn]) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });
  }

  return res.status(200).send(JSON.stringify(books[isbn].reviews, null, 4));
});

// Task 10 - Promise callback + Axios
public_users.get("/async/books", function (req, res) {
  axios
    .get(`${BASE_URL}/`)
    .then((response) => {
      return res.status(200).send(response.data);
    })
    .catch((error) => {
      return res.status(500).json({
        message: "Error retrieving books",
        error: error.message
      });
    });
});

// Task 11 - Async/Await + Axios for ISBN
public_users.get("/async/isbn/:isbn", async function (req, res) {
  try {
    const response = await axios.get(`${BASE_URL}/isbn/${req.params.isbn}`);
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      message: "Error retrieving book by ISBN",
      error: error.message
    });
  }
});

// Task 12 - Async/Await + Axios for Author
public_users.get("/async/author/:author", async function (req, res) {
    try {
      const response = await axios.get(
        `${BASE_URL}/author/${encodeURIComponent(req.params.author)}`
      );
      return res.status(200).send(response.data);
    } catch (error) {
      return res.status(error.response?.status || 500).json({
        message: "Error retrieving books by author",
        error: error.message
      });
    }
  });

// Task 13 - Async/Await + Axios for Title
public_users.get("/async/title/:title", async function (req, res) {
  try {
    const response = await axios.get(
      `${BASE_URL}/title/${encodeURIComponent(req.params.title)}`
    );
    return res.status(200).send(response.data);
  } catch (error) {
    return res.status(error.response?.status || 500).json({
      message: "Error retrieving books by title",
      error: error.message
    });
  }
});

module.exports.general = public_users;
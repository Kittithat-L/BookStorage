import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const App = () => {
  const [books, setBooks] = useState([]);
  const [newBook, setNewBook] = useState({ title: '', author: '', image_url: '' });
  const [editBook, setEditBook] = useState(null);
  const [showPopup, setShowPopup] = useState(false);
  const uri = 'https://opulent-space-barnacle-jj799j9vq5w9c474-5001.app.github.dev';

  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await axios.get(`${uri}/books`);
      setBooks(response.data.books);
    } catch (error) {
      console.error('Error fetching books:', error);
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    if (editBook) {
      setEditBook({ ...editBook, [name]: value });
    } else {
      setNewBook({ ...newBook, [name]: value });
    }
  };

  const handleCreateBook = async () => {
    if (!newBook.title || !newBook.author || !newBook.image_url) {
      alert('Please fill out all fields before creating a new book!');
      return;
    }
    const bookData = {
      title: newBook.title,
      author: newBook.author,
      image_url: newBook.image_url,
    };

    try {
      const response = await axios.post(`${uri}/books`, bookData);
      setBooks(prevBooks => [...prevBooks, response.data]);
      setNewBook({ title: '', author: '', image_url: '' });
    } catch (error) {
      console.error('Error creating book:', error);
    }
  };

  const handleEditBook = (book) => {
    setEditBook({ ...book });
    setShowPopup(true);
  };

  const handleUpdateBook = async () => {
    if (!editBook.title || !editBook.author || !editBook.image_url) {
      alert('Please fill out all fields before submitting!');
      return;
    }

    try {
      const response = await axios.put(`${uri}/books/${editBook._id}`, editBook);
      const updatedBooks = books.map((book) =>
        book._id === editBook._id ? response.data : book
      );
      setBooks(updatedBooks);
      setShowPopup(false);
      setEditBook(null);
    } catch (error) {
      console.error('Error updating book:', error);
    }
  };

  const handleDeleteBook = async (bookId) => {
    try {
      await axios.delete(`${uri}/books/${bookId}`);
      const filteredBooks = books.filter((book) => book._id !== bookId);
      setBooks(filteredBooks);
    } catch (error) {
      console.error('Error deleting book:', error);
    }
  };

  const handleClearEdit = () => {
    setEditBook(null);
    setShowPopup(false);
  };

  return (
    <div className="chat-container">
      <div className="header">
        <h1>Book Chat</h1>
      </div>
      <div className="chat-box">
        {books.map((book) => (
          <div className="chat-item" key={book._id}>
            <div className="chat-content">
              <div className="chat-title">
                <strong>{book.title}</strong> by {book.author}
              </div>
              <div className="chat-id">
                ID: {book._id}
              </div>
              <div className="chat-image">
                <img src={book.image_url} alt={book.title} width="50" />
              </div>
            </div>
            <div className="chat-actions">
              <button onClick={() => handleEditBook(book)}>Edit</button>
              <button onClick={() => handleDeleteBook(book._id)}>Delete</button>
            </div>
          </div>
        ))}
      </div>

      {showPopup && (
        <div className="popup">
          <div className="popup-content">
            <h2>Edit Book</h2>
            <input
              type="text"
              name="title"
              placeholder="Title"
              value={editBook.title}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="author"
              placeholder="Author"
              value={editBook.author}
              onChange={handleInputChange}
            />
            <input
              type="text"
              name="image_url"
              placeholder="Image URL"
              value={editBook.image_url}
              onChange={handleInputChange}
            />
            <div className="popup-actions">
              <button onClick={handleClearEdit}>Clear</button>
              <button onClick={handleUpdateBook}>Submit</button>
            </div>
          </div>
        </div>
      )}

      <div className="add-book">
        <h2>Add New Book</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={newBook.title}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="author"
          placeholder="Author"
          value={newBook.author}
          onChange={handleInputChange}
        />
        <input
          type="text"
          name="image_url"
          placeholder="Image URL"
          value={newBook.image_url}
          onChange={handleInputChange}
        />
        <button onClick={handleCreateBook}>Create</button>
      </div>
    </div>
  );
};

export default App;

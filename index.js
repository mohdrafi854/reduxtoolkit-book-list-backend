const express = require("express");
const cors = require("cors");
const app = express();

const { initializeDatabase } = require("./db/db.connect");
const { Books } = require("./models/books.model");

app.use(cors());
app.use(express.json());

initializeDatabase();

app.get("/", (req, res) => {
  res.send("Hello, Express!");
});

app.get("/books", async (req, res) => {
  try {
    const allbooks = await Books.find();
    res.json(allbooks);
  } catch (error) {
    res.status(500).json({ error: "Internal server error" });
  }
});

app.post("/books", async (req, res) => {
  const { bookName, author, genre } = req.body;

  try {
    const bookData = new Books({ bookName, author, genre });
    await bookData.save();
    res.status(201).json(bookData);
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.delete("/books/:id", async (req, res) => {
  const bookId = req.params.id;

  try {
    const deletedBook = await Books.findByIdAndRemove(bookId);

    if (!deletedBook) {
      return res.status(404).json({ error: "Book not found" });
    }

    res.status(200).json({
      message: "Book deleted successfully",
      book: deletedBook,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal server error" });
  }
});

async function bookUpdateById(bookId, updateToData) {
  try {
    const updateBook = await Books.findByIdAndUpdate(bookId, updateToData, {
      new: true,
    });
    return updateBook;
  } catch (error) {
    console.log("Error in update book", error);
  }
}

app.put("/books/edit/:bookId", async (req, res) => {
  try {
    const updateBook = await bookUpdateById(req.params.bookId, req.body);
    if (updateBook) {
      res.status(201).json({ message: "Book update successfully." });
    } else {
      res.status(404).json({ message: "Book does not exist." });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to update book" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

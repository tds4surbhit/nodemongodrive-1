const express = require("express");
const { connectToDb, getDb } = require("./db");
const { ObjectId } = require("mongodb");

// init app and middlewares
const app = express();
app.use(express.json);

// db connect
let db;
connectToDb((err) => {
  if (!err) {
    app.listen(3000, () => {
      console.log("APP , listining on port 3000");
    });
    db = getDb();
  }
});

// routes
//find returns the cursor(points to whole collection of documents)//sheel behavious is It to iterate
app.get("/books", async (req, res) => {
  const page = req.query.p || 0;
  const booksPerPage = 3;

  let Books = [];
  db.collection("Books")
    .find()
    .sort({ author: 1 })
    .skip(page * booksPerPage)
    .limit(booksPerPage)
    .forEach((book) => Books.push(book))
    .then(() => {
      res.status(200).json(Books);
    })
    .catch(() => {
      res.status(500).json({ error: "Could not fetch the documents" });
    });
});

//  fetch
// fetch single document
app.get("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("Books")
      .findOne({ _id: new ObjectId(req.params.id) }) //12 bytes
      .then((doc) => {
        res.status(200).json(doc);
      })
      .catch((err) => {
        res.status(500).json({ msg: "Couldn't get the document" });
      });
  } else {
    res.status(500).json({ error: "Not a valid document ID" });
  }
});

// post request for addition of books
app.post("/books", (req, res) => {
  const book = req.body;
  db.collection
    .insertOne(book)
    .then((result) => res.status(200).json(result))
    .catch(res.status(500).json({ error: "Couldnot create a Document" }));
});

// delete request
app.delete("/books/:id", (req, res) => {
  if (ObjectId.isValid(req.params.id)) {
    db.collection("Books")
      .deleteOne({ _id: new ObjectId(req.params.id) }) //12 bytes
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ msg: "Couldn't delete the document" });
      });
  } else {
    res.status(500).json({ error: "Not a valid document ID" });
  }
});

//patch request
app.patch("/books/:id", (req, res) => {
  const updates = req.body;
  if (ObjectId.isValid(req.params.id)) {
    db.collection("Books")
      .updateOne({ _id: new ObjectId(req.params.id) }, { $set: updates })
      .then((result) => {
        res.status(200).json(result);
      })
      .catch((err) => {
        res.status(500).json({ msg: "Couldn't update the document" });
      });
  } else {
    res.status(500).json({ error: "Not a valid document ID" });
  }
});

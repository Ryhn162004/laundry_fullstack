const express = require("express");
const router = express.Router();
const { db } = require("../server");
const { authToken, authGetUser } = require("../middleware/middleware");

router.get("/", authToken, (req, res) => {
  let sql =
    "SELECT users.email AS user_email, books.name, books.author, books.id FROM users RIGHT JOIN books ON users.id = books.id_user";
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

router.get("/:id", authToken, authGetUser, (req, res) => {
  const id = req.params.id;
  let sql = `SELECT users.id AS id_user, users.email AS user_email, books.name, books.author, books.id FROM users RIGHT JOIN books ON users.id = books.id_user WHERE users.id = '${id}'`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    if (!result || result.length == 0)
      return res.send({ message: "User dont borrow a book yet..." });
    res.status(200).json({ book: result });
  });
});

router.post("/", authToken, (req, res) => {
  let sql = `INSERT INTO books (name, author, id_user) VALUES ('${req.body.name}', '${req.body.author}', '${req.body.id_user}')`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).json({ book: result });
  });
});

module.exports = router;

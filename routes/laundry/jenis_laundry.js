const express = require("express");
const router = express.Router();
const { db } = require("../../server");
const { authToken } = require("../../middleware/middleware");

router.get("/", authToken, (req, res) => {
  db.query("SELECT * FROM jenis_laundry", (err, result) => {
    if (err) throw err;
    res.status(200).send({ message: result });
  });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query(`SELECT * FROM jenis_laundry WHERE id = '${id}'`, (err, result) => {
    if (err) throw err;
    res.status(200).send({ message: result });
  });
});

router.post("/", (req, res) => {
  const nama_jenis = req.body.nama;
  const tambahan_biaya = req.body.tambahan_biaya;
  let sql = `INSERT INTO jenis_laundry (nama, tambahan_biaya) VALUES ('${nama_jenis}', '${tambahan_biaya}')`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res.status(200).send({ message: "Success add jenis laundry" });
  });
});

module.exports = router;

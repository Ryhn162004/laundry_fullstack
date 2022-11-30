const express = require("express");
const router = express.Router();
const { db } = require("../server");
const moment = require("moment");
const { authToken, authRole } = require("../middleware/middleware");

const table = "lists_laundry";

router.get("/", authToken, authRole, (req, res) => {
  db.query(`SELECT * FROM ${table}`, (err, result) => {
    if (err) throw err;
    res.status(200).send({ lists_laundry: result });
  });
});

router.get("/:id", authToken, authRole, (req, res) => {
  const id = req.params.id;
  db.query(`SELECT * FROM ${table} WHERE id = '${id}'`, (err, result) => {
    if (err) throw err;
    res.status(200).send({ list_laundry: result });
  });
});

router.post("/", authToken, (req, res) => {
  const name = req.body.nama;
  const harga = req.body.harga;
  db.query(`SELECT * FROM users WHERE name = '${name}'`, (err, result) => {
    if (err) throw err;
    if (result.length == 0)
      res.status(401).send({ message: `User with name-${name} not found` });
    const userId = result[0].id;
    const date = new Date();
    const formatDate = moment(date).format("YYYY-MM-DD");
    db.query(
      `SELECT * FROM paket_laundry WHERE id = '${req.body.id_paket_laundry}'`,
      (err, result) => {
        if (err) throw err;
        const quantity = req.body.quantity;
        const harga_paket = result[0].harga * quantity;
        if (harga < harga_paket)
          return res
            .status(401)
            .send({ message: "Your money doesnt enough..." });
        let isHargaGreater = false;
        if (harga > harga_paket) isHargaGreater = true;
        const kembalian = harga - harga_paket;
        const kembalianFormat = new Intl.NumberFormat("id-ID", {
          style: "currency",
          currency: "IDR",
        }).format(kembalian);
        if (quantity < 1)
          return res.status(401).send({ message: "At least 1 quantity..." });
        let sql = `INSERT INTO ${table} (id_user, total, id_paket_laundry, tanggal, quantity) VALUES ('${userId}', '${harga_paket}', '${req.body.id_paket_laundry}', '${formatDate}', '${quantity}')`;
        db.query(sql, (err, result) => {
          if (err) throw err;
          res.status(200).send(
            isHargaGreater
              ? {
                  message: `Success order laundry, with exchange = ${kembalianFormat}`,
                }
              : { message: "Success order laundry" }
          );
        });
      }
    );
  });
});

module.exports = router;

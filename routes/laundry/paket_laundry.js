const express = require("express");
const router = express.Router();
const { db } = require("../../server");
const { authToken } = require("../../middleware/middleware");

router.get("/", (req, res) => {
  db.query("SELECT * FROM paket_laundry", (err, result) => {
    if (err) throw err;
    res.status(200).send({ message: result });
  });
});

router.get("/:id", (req, res) => {
  const id = req.params.id;
  db.query(`SELECT * FROM paket_laundry WHERE id = '${id}'`, (err, result) => {
    if (err) throw err;
    if (!result || result.length == 0)
      return res.status(401).send({ message: `Paket with id-${id} not found` });
    res.status(200).send({ message: result });
  });
});

router.post("/", authToken, (req, res) => {
  const biaya_awal = parseInt(req.body.harga);
  const id_jenis_laundry = req.body.id_jenis_laundry;
  db.query(
    `SELECT * FROM jenis_laundry WHERE id = '${id_jenis_laundry}'`,
    (err, result) => {
      if (err) throw err;
      const tambahan_biaya = result[0].tambahan_biaya;
      const total_biaya = biaya_awal + tambahan_biaya;
      let sql = `INSERT INTO paket_laundry (nama, harga, id_jenis_laundry) VALUES ('${req.body.nama}', '${total_biaya}', '${id_jenis_laundry}')`;
      db.query(sql, (err, result) => {
        if (err) throw err;
        res.status(200).send({ message: "Success add new paket laundry" });
      });
    }
  );
});

router.put("/:id", (req, res) => {
  const id = req.params.id;
  const biaya_awal = parseInt(req.body.harga);
  const id_jenis_laundry = req.body.id_jenis_laundry;
  db.query(
    `SELECT * FROM jenis_laundry WHERE id = '${id_jenis_laundry}'`,
    (err, result) => {
      if (err) throw err;
      if(result.length == 0) return res.status(401).send({message : 'Jenis laundry not found...'})
      const tambahan_biaya = result[0].tambahan_biaya;
      const total_biaya = biaya_awal + tambahan_biaya;
      let sql = `UPDATE paket_laundry SET nama = '${req.body.nama}', harga = '${total_biaya}', id_jenis_laundry = '${id_jenis_laundry}' WHERE id = '${id}'`;
      db.query(sql, (err, result) => {
        if (err) throw err;
        const info = result.info.split(" ")[2]
        if(info == 0) return res.status(401).send({message: `Paket with id-${id} not found...`})
        res.status(200).send({ message: `Paket laundry id-${id} updated!` });
      });
    }
  );
});

module.exports = router;

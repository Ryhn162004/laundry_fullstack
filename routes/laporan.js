const express = require("express");
const router = express.Router();
const { db } = require("../server");
const moment = require("moment");

router.get("/", (req, res) => {
  const date = req.body.date;
  const formatDate = moment(date).format("YYYY-MM-DD");
  let sql;
  if (date || date !== "") {
    sql = `SELECT lists_laundry.id, users.name, users.email, paket_laundry.nama AS nama_paket, paket_laundry.harga AS harga_paket, total, quantity FROM lists_laundry INNER JOIN users ON lists_laundry.id_user = users.id INNER JOIN paket_laundry ON lists_laundry.id_paket_laundry = paket_laundry.id WHERE DATE(lists_laundry.tanggal) = DATE('${formatDate}')`;
  } else if (!date || date == undefined) {
    sql = `SELECT lists_laundry.id, users.name, users.email, paket_laundry.nama AS nama_paket, paket_laundry.harga AS harga_paket, total, DAY(tanggal) AS tgl, quantity FROM lists_laundry INNER JOIN users ON lists_laundry.id_user = users.id INNER JOIN paket_laundry ON lists_laundry.id_paket_laundry = paket_laundry.id`;
  }
  db.query(sql, (err, result) => {
    if (err) throw err;
    if (result.length == 0)
      return res
        .status(401)
        .send({ message: `Laporan for-${date} Not found..` });
    let grandTotal = 0;
    result.forEach(dt => {
      grandTotal += dt.total;
    });
    res.status(200).send({ message: result, grandTotal });
  });
});

module.exports = router;

const express = require("express");
const router = express.Router();
const { db } = require("../server");
const bcrypt = require("bcrypt");
const validator = require("validator");
const {
  authToken,
  authRole,
  authGetUser,
  cekEmailAndUserDuplicate,
} = require("../middleware/middleware");

router.get("/", authToken, authRole, (req, res) => {
  db.query("SELECT * FROM users", (err, result) => {
    if (err) throw err;
    res.send(result);
  });
});

router.get("/:id", authToken, authGetUser, (req, res) => {
  const id = req.params.id;
  db.query(`SELECT * FROM users WHERE id = ${id}`, (err, result) => {
    if (err) throw err;
    res.status(200).json(result);
  });
});

router.post("/", cekEmailAndUserDuplicate, async (req, res) => {
  try {
    // const password = validator.isLength(req.body.password, { min: 2, max: 10 });
    // const email = validator.isEmail(req.body.email);
    // if (!email) {
    //   return res.status(400).send({ message: "Your email is not valid" });
    // } else if (!password) {
    //   return res
    //     .status(400)
    //     .send({ message: "Password must be 2 - 10 length" });
    // }
    const name = req.body.name;
    const email = req.body.email;
    const id_role = req.body.id_role;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    const phone_num = req.body.phone;
    let sql = `INSERT INTO users (name, email, password, no_tlp ,id_role) VALUES ('${name}', '${email}', '${hashedPassword}', '${phone_num}' ,'${id_role}')`;
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.status(201).send({ name, email, id_role });
    });
  } catch {
    res.status(500).send();
  }
});

router.put("/:id", authToken, authRole, async (req, res) => {
  try {
    console.log(req.body.name);
    const id = req.params.id;
    const email = validator.isEmail(req.body.email);
    if (!email) {
      return res.status(400).send({ message: "Your email is not valid" });
    }
    let sql = `UPDATE users SET name = '${req.body.name}', email = '${req.body.email}', no_tlp = '${req.body.phone_num}' ,id_role = '${req.body.role}' WHERE id = '${id}'`;
    db.query(sql, (err, result) => {
      if (err) throw err;
      res.status(200).send({ message: "User updated" });
    });
  } catch {
    res.sendStatus(500);
  }
});

router.delete("/:id", (req, res) => {
  const id = req.params.id;
  db.query(`DELETE FROM users WHERE id = '${id}'`, (err, result) => {
    if (err) throw err;
    res.sendStatus(200);
  });
});

module.exports = router;

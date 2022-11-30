const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const { db } = require("../server");
const { TokenExpiredError } = jwt;
const validator = require("validator");

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unaouthorized, token is expired" });
  }

  res.status(401).send({ message: "Unauthorized!" });
};

router.get("/token", (req, res) => {
  const cookies = req.cookies;
  if (!cookies.jwt) return res.sendStatus(401);
  console.log(cookies.jwt);
  db.query("SELECT * FROM token", (err, result) => {
    if (err) throw err;
    let tokens = [];
    result.map(dt => {
      tokens.push(dt.token);
    });
    const refreshToken = cookies.jwt;
    // const refreshToken = req.body.token;
    // if (refreshToken == null || refreshToken === "")
    //   return res.status(401).send({ message: "token cannot empty" });
    if (!tokens.includes(refreshToken))
      return res.status(403).send({ message: "Invalid" });
    jwt.verify(refreshToken, process.env.REFRESH_SECRET_TOKEN, (err, user) => {
      if (err) return catchError(err, res);
      const accessToken = jwt.sign(
        {
          id: user.id,
          email: user.email,
          role: user.role,
        },
        process.env.SECRET_TOKEN,
        { expiresIn: "30s" }
      );
      res.status(200).send({
        role: user.role,
        accessToken: accessToken,
        userInfo: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      });
    });
  });
});

router.post("/login", (req, res) => {
  const email = validator.isEmail(req.body.email);
  const password = req.body.password;

  if (email === "") return res.status(400).send("Email cannot empty");
  if (!email) return res.status(400).send("Your email is not valid");
  if (!password || password === "")
    return res.status(400).send("Password cannot empty");

  if (email && password) {
    db.query(
      `SELECT * FROM users WHERE email = '${req.body.email}'`,
      async (err, result) => {
        if (err) throw err;

        if (result.length > 0) {
          try {
            const pw_result = result[0].password;
            const role = result[0].id_role;
            const name = result[0]?.name;
            const email = result[0]?.email;
            const id = result[0].id;
            const hashedPw = await bcrypt.compare(password, pw_result);
            const user = {
              id: id,
              name: name,
              email: email,
              password: password,
              role: role,
            };
            const accessToken = generateToken(user);
            const refreshToken = jwt.sign(
              user,
              process.env.REFRESH_SECRET_TOKEN,
              { expiresIn: "1d" }
            );
            db.query(
              `INSERT INTO token (token) VALUES ('${refreshToken}')`,
              err => {
                if (err) throw err;
              }
            );
            if (!hashedPw) res.status(401).send("Failed Login");
            console.log(hashedPw);
            if (hashedPw)
              res.cookie("jwt", refreshToken, {
                httpOnly: true,
                maxAge: 24 * 60 * 60 * 1000,
              });
            res.status(200).send({
              accessToken: accessToken,
              refreshToken: refreshToken,
              role: role,
              userInfo: {
                id,
                name,
                email,
              },
            });
          } catch {
            res.status(500).send();
          }
        }
      }
    );
  }
});

router.get("/logout", (req, res) => {
  const cookies = req.cookies;
  if (!cookies?.jwt) return res.sendStatus(204);
  const sql = `DELETE FROM token WHERE token = '${cookies.jwt}'`;
  db.query(sql, (err, result) => {
    if (err) throw err;
    res
      .clearCookie("jwt", { httpOnly: true, maxAge: 24 * 60 * 60 * 1000 })
      .sendStatus(204);
  });
});

const generateToken = user => {
  return jwt.sign(user, process.env.SECRET_TOKEN, { expiresIn: "30s" });
};

module.exports = router;

const jwt = require("jsonwebtoken");
const { TokenExpiredError } = jwt;
const { db } = require("../server");
const { canViewUser } = require("./permission");

const catchError = (err, res) => {
  if (err instanceof TokenExpiredError) {
    return res.status(401).send({ message: "Unaouthorized, token is expired" });
  }

  return res.status(401).send({ message: "Unauthorized!" });
};

const authToken = (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  if (!authHeaders) return res.sendStatus(401);
  const token = authHeaders && authHeaders.split(" ")[1];

  jwt.verify(
    token,
    process.env.SECRET_TOKEN || process.env.REFRESH_SECRET_TOKEN,
    (err, user) => {
      if (err) return catchError(err, res);
      req.user = user;
      next();
    }
  );
};

const authRole = (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];

  jwt.verify(
    token,
    process.env.SECRET_TOKEN || process.env.REFRESH_SECRET_TOKEN,
    (err, user) => {
      if (err) return catchError(err, res);
      console.log(user);
      const role = user.role;
      const id_user = user.id;
      db.query(
        `SELECT * FROM users WHERE id_role = '${role}' AND id = '${id_user}'`,
        (err, result) => {
          if (err) throw err;
          if (result) {
            const foundRole = result[0].id_role;
            if (foundRole != 3) {
              return res
                .status(403)
                .send({ message: "Only admin can do that" });
            }
            next();
          }
        }
      );
    }
  );
};

const authGetUser = (req, res, next) => {
  const authHeaders = req.headers["authorization"];
  const token = authHeaders && authHeaders.split(" ")[1];
  jwt.verify(
    token,
    process.env.SECRET_TOKEN || process.env.REFRESH_SECRET_TOKEN,
    (err, user) => {
      if (err) return catchError(err, res);
      if (!canViewUser(user, req.params.id)) {
        return res.status(401).send({ message: "Not Allowed" });
      }
      next();
    }
  );
};

const cekEmailAndUserDuplicate = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  db.query("SELECT * FROM users", (err, result) => {
    if (err) throw err;
    const cekDuplikat = result.filter(user => {
      return name == user.name || email == user.email;
    });
    if (cekDuplikat.length == 0 || !cekDuplikat) next();
    if (cekDuplikat.length > 0)
      return res.status(401).send({ message: "name or email already exist" });
  });
};

module.exports = {
  authToken,
  authRole,
  authGetUser,
  cekEmailAndUserDuplicate,
};

const express = require("express");
const app = express();
const port = 5000;
const cors = require("cors");
const cookieParser = require("cookie-parser");
require("dotenv").config();
const corsOptions = require("./config/corsOptions");
const credentials = require("./middleware/credentials");

app.use(credentials);
app.use(cors(corsOptions));
app.use(express.urlencoded());
app.use(express.json());
app.use(cookieParser());

const api = "/api";

const userRouter = require("./routes/user");
app.use(`${api}/users`, userRouter);

const authRouter = require("./auth/authUser");
app.use(`${api}/auth`, authRouter);

const bookRouter = require("./routes/book");
app.use(`${api}/books`, bookRouter);

const jenis_laundryRouter = require("./routes/laundry/jenis_laundry");
app.use(`${api}/laundry/jenis_laundry`, jenis_laundryRouter);

const paket_laundryRouter = require("./routes/laundry/paket_laundry");
app.use(`${api}/laundry/paket_laundry`, paket_laundryRouter);

const transaksiRouter = require("./routes/transaksi");
app.use(`${api}/transaksi`, transaksiRouter);

const laporanRouter = require("./routes/laporan");
app.use(`${api}/laporan`, laporanRouter);

app.listen(port, () => {
  console.log(`server is running on http://localhost:${port}`);
});

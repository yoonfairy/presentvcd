const express = require("express");
const app = express();
const ADMIN = "3321236227960011";
const mongoose = require("mongoose");
const cloudinary = require("cloudinary");
var session = require("express-session");

mongoose
  .connect(
    "mongodb+srv://admin:admin@cluster0.zdqkj.mongodb.net/presentvcd?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useCreateIndex: true,
      useFindAndModify: false,
      useUnifiedTopology: true,
    }
  )
  .then(() => {
    console.log("db connected");
  });

cloudinary.config({
  cloud_name: "dwyrze84p",
  api_key: "514556994879352",
  api_secret: "nxdD4ghAbaIA_lHaXkunFaIvvs4",
});

const cors = require("cors");

const PORT = process.env.PORT || 5000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.set("trust proxy", 1); // trust first proxy
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    // cookie: { secure: true },
  })
);

app.set("views", "./views");
app.set("view engine", "ejs");

app.use(cors({ origin: true }));

const adminRoute = require("./routes/admin");
const customerRoute = require("./routes/customer");

app.get("/getstarted/:id", (req, res) => {
  const { id } = req.params;

  if (id == ADMIN) {
    return res.json({
      redirect_to_blocks: ["admin_task"],
    });
  } else {
    return res.json({
      redirect_to_blocks: ["customer_task"],
    });
  }
});

// present.com/getstarted/123123

app.use("/admin", adminRoute);

app.use("/customer", customerRoute);

app.listen(PORT, () => {
  console.log("Server started");
});

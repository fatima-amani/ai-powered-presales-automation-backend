require("dotenv").config();

const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");

const multer = require("multer");
const upload = multer({ dest: "uploads/" });

// const ExpressError = require("./utils/ExpressError.js");

const reqAnalysisRouter = require("./routes/reqAnalysis.js");
const projectRouter = require("./routes/project.js");

// const session = require("express-session");
// const flash = require("connect-flash");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));

const mongoose = require("mongoose");
const dbUrl = process.env.MONGO_URL;

async function main() {
  await mongoose.connect(dbUrl);
}

main()
  .then((res) => {
    console.log("connected to database");
  })
  .catch((err) => {
    console.log(err);
  });

app.use("/requirment-analysis", reqAnalysisRouter);
app.use("/project",projectRouter);


app.all("*", (req, res, next) => {
//   next(new ExpressError(404, "Page not Found"));
    res.send("Page not found");
});

// app.use((err, req, res, next) => {
//   let { statusCode = 500, message = "something went wrong" } = err;
//   res.status(statusCode).render("error.ejs", { err });
// });

const port = 8080;
app.listen(port, () => {
  console.log("listening to port", port);
});

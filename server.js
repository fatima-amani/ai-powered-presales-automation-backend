require("dotenv").config();

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const mongoose = require("mongoose");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const multer = require("multer");

// const ExpressError = require("./utils/ExpressError.js");

const reqAnalysisRouter = require("./routes/reqAnalysis.js");
const projectRouter = require("./routes/project.js");
const userRoutes = require("./routes/user");
const techArchitectureRoutes = require("./routes/techArchitecture");
const effortEstimationRoutes = require("./routes/estimation");
const userPersonaRoutes = require("./routes/userPersona");
const wireframeRoutes = require("./routes/wireframe");
const AuthRoutes = require("./routes/auth");

const dbUrl = process.env.MONGO_URL;


app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true, 
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));


app.use(express.json());
app.use(cookieParser()); // Enable cookie parsing
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));



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

app.use("/project",projectRouter);
app.use("/user", userRoutes);
app.use("/requirment-analysis", reqAnalysisRouter);
app.use("/tech-architecture", techArchitectureRoutes);
app.use("/estimation", effortEstimationRoutes);
app.use("/user-persona", userPersonaRoutes);
app.use("/wireframe",wireframeRoutes);
app.use("/auth", AuthRoutes);



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

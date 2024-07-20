const createError = require("http-errors");
const express = require("express");
const path = require("path");
const cookieParser = require("cookie-parser");
const logger = require("morgan");
const compression = require("compression");
const helmet = require("helmet");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
// import catalog routes
const catalogRouter = require("./routes/catalog");

const app = express();

// Set up rate limiter: maximum of 20 request per minute
const RateLimit = require("express-rate-limit");
const limiter = RateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute,
  max: 20,
});

app.use(limiter);

// Add helmet middleware
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      "script-src": ["'self'", "code.jquery.com", "cdn.jsdelivr.net"],
    },
  })
);

// Added before any route(Compress all routes)
app.use(compression());

// connecting to db
const mongoose = require("mongoose");
mongoose.set("strictQuery", false);

// Create a mongoDB atlas connection string(This string was for local development)
const dev_db_url = "mongodb://127.0.0.1/Local_Library";
const mongoDB = process.env.MONGODB_URL || dev_db_url;

async function main() {
  await mongoose.connect(mongoDB);
}

main()
  .then(() => console.log("Connected to db"))
  .catch((err) => console.log(err, "Failed to connect to db"));

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "pug");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
// Add catalog route to the middleware chain
app.use("/catalog", catalogRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;

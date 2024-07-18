const express = require("express");
const { psqlError, customError, unknownError } = require("../error-handling");

const {
  apiRouter,
  usersRouter,
  topicsRouter,
  articlesRouter,
  commentsRouter,
} = require("./routes");

const app = express();

app.use(express.json());

app.use("/api", apiRouter);
app.use("/api/users", usersRouter);
app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter)

app.all("*", (request, response, next) => {
  next({ status: 404, message: "Not a valid route" });
});

app.use(psqlError);
app.use(customError);
app.use(unknownError);

module.exports = app;

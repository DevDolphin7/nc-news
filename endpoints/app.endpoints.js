const express = require("express");
const { psqlError, customError, unknownError } = require("../error-handling");
const { getApi } = require("../controllers/api.controller");
const { getTopics } = require("../controllers/topics.controller");
const { getArticles, getArticleById } = require("../controllers/articles.controller");

const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles)
app.get("/api/articles/:article_id", getArticleById);

app.all("*", (request, response, next) => {
  next({ status: 404, message: "Not a valid route" });
});

app.use(psqlError);

app.use(customError);

app.use(unknownError);

module.exports = app;

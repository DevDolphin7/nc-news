const express = require("express");
const { psqlError, customError, unknownError } = require("../error-handling");
const { getApi } = require("../controllers/api.controller");
const { getUsers } = require("../controllers/users.controller");
const { getTopics } = require("../controllers/topics.controller");
const {
  getArticles,
  getArticleById,
  patchArticleVoteIncrease,
} = require("../controllers/articles.controller");
const {
  getCommentsOfArticle,
  postCommentToArticle,
} = require("../controllers/article-comments.controller.js");
const { deleteCommentById } = require("../controllers/comments.controller");

const app = express();

app.use(express.json());

app.get("/api", getApi);

app.get("/api/users", getUsers);

app.get("/api/topics", getTopics);

app.get("/api/articles", getArticles);

app.get("/api/articles/:article_id", getArticleById);
app.patch("/api/articles/:article_id", patchArticleVoteIncrease);

app.get("/api/articles/:article_id/comments", getCommentsOfArticle);
app.post("/api/articles/:article_id/comments", postCommentToArticle);

app.delete("/api/comments/:comment_id", deleteCommentById);

app.all("*", (request, response, next) => {
  next({ status: 404, message: "Not a valid route" });
});

app.use(psqlError);

app.use(customError);

app.use(unknownError);

module.exports = app;

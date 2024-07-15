const express = require("express");
const { customError } = require("../error-handling");
const { getApi } = require("../controllers/api.controller");
const { getTopics } = require("../controllers/topics.controller");

const app = express();

app.get("/api", getApi);

app.get("/api/topics", getTopics);

app.all("*", (request, response, next) => {
  const error = { status: 404, message: "Not a valid route" };
  customError(error, request, response, next);
});

module.exports = app;

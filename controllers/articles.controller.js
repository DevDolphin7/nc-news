const { fetchArticles, fetchArticleById } = require("../models/articles.model");

exports.getArticles = (request, response, next) => {
  fetchArticles()
    .then((articles) => {
      response.send({ articles });
    })
    .catch(next);
};

exports.getArticleById = (request, response, next) => {
  const { article_id } = request.params;
  fetchArticleById(article_id)
    .then((article) => {
      response.send({ article });
    })
    .catch(next);
};

const {
  fetchArticles,
  fetchArticleById,
  updateArticleVoteIncrease,
} = require("../models/articles.model");

exports.getArticles = (request, response, next) => {
  const { sort_by, order, topic } = request.query;
  fetchArticles(sort_by, order, topic)
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

exports.patchArticleVoteIncrease = (request, response, next) => {
  const { article_id } = request.params;
  const increaseVotesBy = request.body;
  updateArticleVoteIncrease(increaseVotesBy, article_id)
    .then((updatedArticle) => {
      response.send({ updatedArticle });
    })
    .catch(next);
};

const {
  fetchCommentsOfArticle,
  insertCommentToArticle,
} = require("../models/article-comments.model.js");

exports.getCommentsOfArticle = (request, response, next) => {
  const { article_id } = request.params;
  fetchCommentsOfArticle(article_id)
    .then((comments) => {
      response.send({ comments });
    })
    .catch(next);
};

exports.postCommentToArticle = (request, response, next) => {
  const { article_id } = request.params;
  const comment = request.body;

  insertCommentToArticle(article_id, comment)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch(next);
};

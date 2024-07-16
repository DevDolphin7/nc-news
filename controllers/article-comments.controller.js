const {
  fetchCommentsOfArticle,
} = require("../models/article-comments.model.js");

exports.getCommentsOfArticle = (request, response, next) => {
  const { article_id } = request.params;
  fetchCommentsOfArticle(article_id)
    .then((comments) => {
      response.send({ comments });
    })
    .catch(next);
};

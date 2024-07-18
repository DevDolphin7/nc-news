const {
  getArticles,
  getArticleById,
  patchArticleVoteIncrease,
} = require("../../controllers/articles.controller");
const {
  getCommentsOfArticle,
  postCommentToArticle,
} = require("../../controllers/article-comments.controller.js");
const articlesRouter = require("express").Router();

articlesRouter.get("/", getArticles);

articlesRouter
  .route("/:article_id")
  .get(getArticleById)
  .patch(patchArticleVoteIncrease);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsOfArticle)
  .post(postCommentToArticle);

module.exports = articlesRouter;

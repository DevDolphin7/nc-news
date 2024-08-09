const db = require("../db/connection");
const format = require("pg-format");
const {
  checkForeignPrimaryKey,
  checkValidPostedComment,
  formatObjectToArray,
} = require("./model-utils");

exports.fetchCommentsOfArticle = (article_id) => {
  const queryPromises = [];

  // Push the outcome query into the array
  queryPromises.push(
    db
      .query("SELECT * FROM comments WHERE article_id = $1 ORDER BY created_at DESC", [article_id])
      .then(({ rows }) => {
        return rows;
      })
  );

  // Push the article_id foreign key check into the array
  queryPromises.push(
    checkForeignPrimaryKey("articles", "article_id", article_id)
  );

  return Promise.all(queryPromises).then((results) => {
    const comment = results[0];
    const validArticleId = results[1];

    return comment.length === 0 && !validArticleId
      ? Promise.reject({ status: 404, message: "Article not found" })
      : comment;
  });
};

exports.insertCommentToArticle = (article_id, comment) => {
  return checkForeignPrimaryKey("articles", "article_id", article_id)
    .then((validArticle) => {
      if (validArticle) {
        // Article exists to be able to post comment
        if (!checkValidPostedComment(comment, article_id)) {
          return Promise.reject({ status: 400, message: "Bad request" })
        }
        
        const queryComment = JSON.parse(JSON.stringify(comment))
        queryComment.article_id = article_id

        const orderOfValues = ["username", "body", "article_id"];
        const formattedComment = formatObjectToArray(queryComment, orderOfValues);
        const insertCommentQuery = format(
          `INSERT INTO comments (author, body, article_id)
          VALUES %L RETURNING *`,
          formattedComment
        );
        return db.query(insertCommentQuery);
      } else {
        // Article doesn't exist
        return Promise.reject({ status: 404, message: "Article not found" });
      }
    })
    .then(({ rows }) => {
      return rows[0];
    });
};

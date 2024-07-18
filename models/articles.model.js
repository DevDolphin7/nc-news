const { validateParameters, checkValidVoteIncrease } = require("./model-utils");
const db = require("../db/connection");

exports.fetchArticles = (sort_by = "created_at", order, topic) => {
  return validateParameters(sort_by, order, topic)
    .then((parameters) => {
      const [sort_by, order, topic] = parameters;

      return db.query(
        `SELECT author, title, article_id, topic, created_at,
      votes, article_img_url, comment_count
      FROM articles
      LEFT JOIN
      (SELECT COUNT(article_id) AS comment_count, article_id AS temp_id
      FROM comments GROUP BY article_id) temp_table
      ON articles.article_id = temp_table.temp_id
      WHERE topic = ${topic}
      ORDER BY ${sort_by} ${order}`
      );
    })
    .then(({ rows }) => {
      return rows;
    });
};

exports.fetchArticleById = (id) => {
  return db
    .query("SELECT * FROM articles WHERE article_id=$1", [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
      return rows[0];
    });
};

exports.updateArticleVoteIncrease = (increaseVotesBy, id) => {
  if (!checkValidVoteIncrease(increaseVotesBy)) {
    return Promise.reject({ status: 400, message: "Bad request" })
  }

  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *",
      [increaseVotesBy.inc_votes, id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Article not found" });
      }
      return rows[0];
    });
};

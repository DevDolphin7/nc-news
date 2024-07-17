const db = require("../db/connection");

exports.fetchArticles = (sort_by = "created_at", order) => {
  const validSortByColumns = [
    "author",
    "title",
    "article_id",
    "topic",
    "created_at",
    "votes",
    "article_img_url",
    "comment_count",
  ];

  if (!validSortByColumns.includes(sort_by)){
    return Promise.reject({status: 400, message: "Bad request"})
  }

  order = /^asc$/i.test(order) ? "ASC" : "DESC"

  return db
    .query(
      `SELECT author, title, article_id, topic, created_at,
      votes, article_img_url, comment_count
      FROM articles
      LEFT JOIN
      (SELECT COUNT(article_id) AS comment_count, article_id AS temp_id
      FROM comments GROUP BY article_id) temp_table
      ON articles.article_id = temp_table.temp_id
      ORDER BY ${sort_by} ${order}`
    )
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
  const votesKeys = Object.keys(increaseVotesBy);
  if (votesKeys.length !== 1 || votesKeys[0] !== "inc_votes") {
    return Promise.reject({ status: 400, message: "Bad request" });
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

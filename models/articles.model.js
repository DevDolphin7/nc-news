const db = require("../db/connection");

exports.fetchArticles = () => {
  return db
    .query(
      `SELECT author, title, article_id, topic, created_at,
      votes, article_img_url, comment_count
      FROM articles
      LEFT JOIN
      (SELECT COUNT(article_id) AS comment_count, article_id AS temp_id
      FROM comments GROUP BY article_id) temp_table
      ON articles.article_id = temp_table.temp_id
      ORDER BY created_at DESC`
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

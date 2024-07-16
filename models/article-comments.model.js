const db = require("../db/connection");
const { checkForeignPrimaryKey } = require("./model-utils");

exports.fetchCommentsOfArticle = (article_id) => {
  const queryPromises = [];

  // Push the outcome query into the array
  queryPromises.push(
    db
      .query("SELECT * FROM comments WHERE article_id = $1", [article_id])
      .then(({ rows }) => {
        return rows;
      })
  );

  // Push the article_id foreign key check into the array
  queryPromises.push(
    checkForeignPrimaryKey("articles", "article_id", article_id)
  );

  return Promise.all(queryPromises).then((results) => {
    const rows = results[0];
    const validArticleId = results[1];

    return rows.length === 0 && !validArticleId
      ? Promise.reject({ status: 404, message: "Article not found" })
      : rows;
  });
};

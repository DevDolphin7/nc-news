const db = require("../db/connection");

exports.checkForeignPrimaryKey = (foreignTable, columnName, id) => {
  // table and columnName are defined within the server, not by the user,
  // so SQL Injection pretection not required - A hacker with sufficient
  // access to pass in a malicious query would mean they have access to the
  // database without needing this function

  const query = `SELECT * FROM ${foreignTable} WHERE ${columnName} = $1`;
  return db.query(query, [id]).then(({ rows }) => {
    return rows.length !== 0;
  });
};

exports.checkValidPostedComment = (commentInput, article_id) => {
  const validKeys = ["username", "body", "article_id"];
  const comment = JSON.parse(JSON.stringify(commentInput))

  if (article_id) {
    comment.article_id = article_id
  }

  const commentKeys = Object.keys(comment);

  if (commentKeys.length !== validKeys.length) {
    return false;
  }

  for (let key of commentKeys) {
    if (!validKeys.includes(key)) {
      return false;
    }
  }

  return true;
};

exports.formatObjectToArray = (object, sortBy) => [
  sortBy.map((key) => object[key]),
];

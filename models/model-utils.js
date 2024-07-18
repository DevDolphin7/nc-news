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
  const comment = JSON.parse(JSON.stringify(commentInput));

  if (article_id) {
    comment.article_id = article_id;
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

exports.validateParameters = (sort_by, order, topic) => {
  // validate sort by
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

  if (!validSortByColumns.includes(sort_by)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  }

  // validate order
  order = /^asc$/i.test(order) ? "ASC" : "DESC";

  const promises = [sort_by, order];

  // validate topic (first fetch valid topics from the database)
  if (topic !== undefined) {
    const fetchTopics = db.query("SELECT slug FROM topics").then(({ rows }) => {
      const validTopics = rows.map((response) => response.slug);

      return validTopics.includes(topic)
        ? `'${topic}'`
        : Promise.reject({ status: 404, message: "Topic not found" });
    });
    promises.push(fetchTopics);
  } else {
    // If topic was not defined, below SQL will ignore topic WHERE condition
    promises.push("ANY (SELECT slug FROM topics)");
  }

  return Promise.all(promises);
};

exports.checkValidVoteIncrease = (increaseVotesBy) => {
  const votesKeys = Object.keys(increaseVotesBy);
  if (votesKeys.length !== 1 || votesKeys[0] !== "inc_votes") {
    return false;
  }
  return Number.isInteger(increaseVotesBy.inc_votes)
}

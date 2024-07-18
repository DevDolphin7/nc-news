const { checkValidVoteIncrease } = require("./model-utils");
const db = require("../db/connection");

exports.updateCommentById = (id, increaseVotes) => {
  if (!checkValidVoteIncrease(increaseVotes)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  }

  return db
    .query(
      `UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *`,
      [increaseVotes.inc_votes, id]
    )
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({status: 404, message: "Comment not found"})
      }
      return rows[0];
    })
};

exports.removeCommentById = (id) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1 RETURNING *", [id])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "Comment not found" });
      }
    });
};

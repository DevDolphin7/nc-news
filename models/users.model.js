const { checkValidUsername } = require("./model-utils");
const db = require("../db/connection");

exports.fetchUsers = () => {
  return db.query("SELECT * FROM users").then(({ rows }) => {
    return rows;
  });
};

exports.fetchUsersByUsername = (username) => {
  if (!checkValidUsername(username)) {
    return Promise.reject({ status: 400, message: "Bad request" });
  }
  return db
    .query("SELECT * from users WHERE username=$1", [username])
    .then(({ rows }) => {
      if (rows.length === 0) {
        return Promise.reject({ status: 404, message: "User not found" });
      }
      return rows[0];
    });
};

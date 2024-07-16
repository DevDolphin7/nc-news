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

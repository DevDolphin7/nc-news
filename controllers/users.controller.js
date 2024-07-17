const {fetchUsers} = require("../models/users.model")

exports.getUsers = (request, response, next) => {
  fetchUsers().then((users) => {
    response.send({ users });
  });
};

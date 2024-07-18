const { fetchUsers, fetchUsersByUsername } = require("../models/users.model");

exports.getUsers = (request, response, next) => {
  fetchUsers().then((users) => {
    response.send({ users });
  });
};

exports.getUserByUsername = (request, response, next) => {
  const { username } = request.params;
  fetchUsersByUsername(username)
    .then((user) => {
      response.send({ user });
    })
    .catch(next);
};

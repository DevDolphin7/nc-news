const { fetchTopics } = require("../models/topics.model");

exports.getTopics = (request, response, next) => {
  fetchTopics()
    .then((topics) => {
      response.send({ topics });
    })
    .catch(next);
};

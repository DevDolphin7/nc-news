const { fetchApi } = require("../models/api.model");

exports.getApi = (request, response, next) => {
  const apiInfo = fetchApi();
  response.send({ endpoints: apiInfo });
};

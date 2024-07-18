const { getApi } = require("../../controllers/api.controller");
const apiRouter = require("express").Router();

apiRouter.get("/", getApi);

module.exports = apiRouter;

const { getTopics } = require("../../controllers/topics.controller");
const usersRouter = require("express").Router();

usersRouter.get("/", getTopics);

module.exports = usersRouter;

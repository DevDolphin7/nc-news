const {
  updateCommentById,
  removeCommentById,
} = require("../models/comments.model");

exports.patchCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  const inc_votes = request.body;
  updateCommentById(comment_id, inc_votes)
    .then((updatedComment) => {
      response.send({ updatedComment });
    })
    .catch(next);
};

exports.deleteCommentById = (request, response, next) => {
  const { comment_id } = request.params;
  removeCommentById(comment_id)
    .then(() => {
      response.status(204).send();
    })
    .catch(next);
};

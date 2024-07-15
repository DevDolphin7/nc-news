exports.customError = (error, request, response, next) => {
  if (error.status && error.message) {
    response.status(error.status).send({ message: error.message });
  } else {
    next(error);
  }
};

exports.unknownError = (error, request, response) => {
  response.status(500).send({message: "Internal Server Error"})
}

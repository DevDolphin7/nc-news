exports.psqlError = (error, request, response, next) => {
  if (error.code === "22P02") {
    response.status(400).send({ message: "Bad request" });
  }
  next(error);
};

exports.customError = (error, request, response, next) => {
  if (error.status && error.message) {
    response.status(error.status).send({ message: error.message });
  } else {
    next(error);
  }
};

exports.unknownError = (error, request, response) => {
  response.status(500).send({ message: "Internal Server Error" })
};

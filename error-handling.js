exports.customError = (error, request, response, next) => {
  console.log(error, ",,,,,,,,,,,,,,,,,,");
  if (error.status && error.message) {
    response.status(error.status).send({ message: error.message });
  } else {
    next(error);
  }
};

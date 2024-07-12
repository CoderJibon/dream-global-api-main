//404  Not Found handling
const notFound = (req, res, next) => {
  // 404 response
  return res
    .status(404)
    .json({ message: "Sorry, the requested resource was not found." });
};
// export 404 not found handling
module.exports = notFound;

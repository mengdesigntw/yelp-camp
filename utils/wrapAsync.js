//setting up wrapAsync so we don't need to write try/catch everytime
function wrapAsync(fn) {
  return function (req, res, next) {
    fn(req, res, next).catch((err) => {
      next(err);
    });
  };
}

module.exports = { wrapAsync };

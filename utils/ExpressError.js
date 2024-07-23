class ExpressError extends Error {
  constructor(name, status, message) {
    super();
    this.name = name;
    this.status = status;
    this.message = message;
  }
}

module.exports = { ExpressError };

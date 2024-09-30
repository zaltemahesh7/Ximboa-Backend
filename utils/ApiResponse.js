class ApiResponse {
  constructor(statusCode, message = "Success", data, pagination) {
    this.statusCode = statusCode;
    this.success = statusCode < 400;
    this.message = message;
    this.data = data;
    this.pagination = pagination;
  }
}

module.exports = { ApiResponse };

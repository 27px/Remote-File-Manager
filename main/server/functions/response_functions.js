function success_response(data = null) {
  let success = {
    status: true,
  };
  if (data !== null) {
    success.data = data;
  }
  return success;
}

function error_response(message, error_log, customError = null) {
  let error = {
    status: false,
    message,
    error_log,
  };
  if (customError !== null) {
    error.customError = customError;
  }
  return error;
}

function response_directory_contents(type, path, contents) {
  return {
    status: true,
    type,
    path,
    contents,
  };
}

module.exports = {
  error_response,
  success_response,
  response_directory_contents,
};

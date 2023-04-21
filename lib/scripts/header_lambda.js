exports.handler = async (event) => {
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  headers['x-frame-options'] = [{
      key: 'X-Frame-Options',
      value: 'DENY'
  }];

  return response;
};

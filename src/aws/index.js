exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;

  // if (request.uri.includes('auth')) {
    headers['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }];
  // }

  return request;
};

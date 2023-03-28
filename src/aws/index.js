'use strict';

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  if (request.uri.includes('auth')) {
    headers['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'DENY' }];
  }

  return response;
};

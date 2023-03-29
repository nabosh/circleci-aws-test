'use strict';

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  console.log('Request:', request);
  console.log('Response:', response);

  if (request.uri.includes('auth')) {
    headers['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'DENY' }];
  }

  console.log('Updated Headers:', headers);

  return response;
};

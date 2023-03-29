'use strict';

exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  console.log('Requestt:', request);
  console.log('Responsee:', response);

  if (request.uri.includes('auth')) {
    console.log('URI contains "auth", adding X-Frame-Options header');
    headers['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'DENY' }];
  }

  console.log('Updated Headers:', headers);

  return response;
};

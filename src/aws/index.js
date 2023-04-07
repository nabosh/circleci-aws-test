'use strict';

exports.handler = async (event) => {
  const eventType = event.Records[0].cf.config.eventType;
  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  console.log('Eventt Type:', eventType);
  console.log('Request:', request);
  console.log('Response:', response);
  console.log('Request URI:', request.uri);
  console.log('Checking if request URI contains "auth":', request.uri.includes('auth'));

  if (eventType !== 'viewer-response') {
    throw new Error(`Unexpected event type: ${eventType}`);
  }

  // if (request.uri.includes('auth')) {
    console.log('URI contains "auth", adding X-Frame-Options header');
    headers['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }];
  // }

  console.log('Updated Headers:', headers);

  return response;
};

'use strict';

exports.handler = async (event) => {
  const eventType = event.Records[0].cf.config.eventType;
  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;

  if (eventType === 'viewer-response') {
    if (!response) {
      console.error('Response object not found in the event:', JSON.stringify(event));
      throw new Error('Response object not found');
    }

    const headers = response.headers;

    console.log('Event:', JSON.stringify(event));
    console.log('Eventt Type:', eventType);
    console.log('Request:', request);
    console.log('Response:', response);
    console.log('Request URI:', request.uri);
    console.log('Checking if request URI contains "auth":', request.uri.includes('auth'));
    console.log('from lib/scripts/header_lambda.js')

    // if (request.uri.includes('auth')) {
      console.log('URI contains "auth", adding X-Frame-Options header');
      headers['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }];
    // }

    console.log('Updated Headers:', headers);

    return response;
  } else if (eventType === 'viewer-request') {
    // Handle viewer-request event type
    console.log('Event:', JSON.stringify(event));
    console.log('Event Type:', eventType);
    console.log('Request:', request);

    return request;
  } else {
    throw new Error(`Unexpected event type: ${eventType}`);
  }
};

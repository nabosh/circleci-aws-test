'use strict';

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const response = event.Records[0].cf.response;
    const headers = response.headers;

    console.log('Incoming request URI:', request.uri);

    if (!request.uri.includes('auth')) {
        console.log('Request URI does not include "auth", returning unmodified response.');
        // If the request URI does not include "auth", do not process and return the unmodified response
        callback(null, response);
        return;
    }

    console.log('Request URI includes "auth", adding custom header.');

    // Add a custom header when the request URI includes "auth"
    headers['x-test-header'] = [{
        key: 'X-test-header',
        value: 'SAMEORIGIN'
    }];

    console.log('Modified response headers:', headers);

    // Return the modified response with the custom header
    callback(null, response);
};

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

    // Add the X-Frame-Options header with the value SAMEORIGIN when the request URI includes "auth"
    headers['x-frame-options'] = [{
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
    }];

    console.log('Modified response headers:', headers);

    // Return the modified response with the custom header
    callback(null, response);
};

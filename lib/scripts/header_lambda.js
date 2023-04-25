'use strict';

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const response = event.Records[0].cf.response;
    const headers = response.headers;

    console.log('Incoming request event object:', JSON.stringify(request, null, 2));
    console.log('Incoming response event object:', JSON.stringify(response, null, 2));

    // console.log('Incoming request URI:', request.uri);

    // if (!request.uri.includes('auth')) {
    //     console.log('Request URI does not include "auth", returning unmodified response.');
    //     callback(null, response);
    //     return;
    // }

    // console.log('Request URI includes "auth", adding custom header.');

    headers['x-frame-options'] = [{
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN'
    }];

    console.log('Modified response headers:', JSON.stringify(headers, null, 2));

    callback(null, response);
};

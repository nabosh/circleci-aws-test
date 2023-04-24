'use strict';

exports.handler = (event, context, callback) => {
    const request = event.Records[0].cf.request;
    const headers = request.headers;

    if (!request.uri.includes('auth')) {
        // If the request URI does not include "auth", do not process and return the unmodified request
        callback(null, request);
        return;
    }

    // Add a custom header when the request URI includes "auth"
    headers['custom-auth-header'] = [{
        key: 'Custom-Auth-Header',
        value: 'Auth-Required'
    }];

    // Return the modified request with the custom header
    callback(null, request);
};

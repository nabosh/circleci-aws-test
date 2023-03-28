'use strict';
exports.handler = (event, context, callback) => {

    //Get contents of response
    const response = event.Records[0].cf.response;
    const headers = response.headers;

    //Set new headers
    headers['x-frame-options'] = [{key: 'X-Frame-Options', value: 'SAMEORIGIN'}];

    //Return modified response
    callback(null, response);
};
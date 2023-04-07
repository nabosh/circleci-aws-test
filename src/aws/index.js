'use strict';

exports.handler = async (event) => {
  const eventType = event.Records[0].cf.config.eventType;

  if (eventType === 'viewer-request') {
    const request = event.Records[0].cf.request;
    const headers = request.headers;

    if (request.uri.includes('auth')) {
      headers['x-add-xfo-header'] = [{ key: 'X-Add-XFO-Header', value: 'true' }];
    }

    return request;
  } else if (eventType === 'origin-response') {
    const request = event.Records[0].cf.request;
    const response = event.Records[0].cf.response;
    const requestHeaders = request.headers;
    const responseHeaders = response.headers;

    if (requestHeaders['x-add-xfo-header'] && requestHeaders['x-add-xfo-header'][0].value === 'true') {
      responseHeaders['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }];
    }

    return response;
  }

  throw new Error(`Unexpected event type: ${eventType}`);
};

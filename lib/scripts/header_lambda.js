exports.handler = (event, context, callback) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  // const { request, response } = event.Records[0].cf;
  console.log('Event:', JSON.stringify(event, null, 2));

  console.log('Origin header:', headers['origin'][0].value);

  // Check if the request is for a URI that includes "auth"
  if (request.uri.includes('/auth')) {
    // Set the security header
    const headerName = 'Custom-Security-Header';
    const headerValue = 'SAMEORIGIN';

    // Add the security header to the response headers
    response.headers[headerName.toLowerCase()] = [
      {
        key: headerName,
        value: headerValue,
      },
    ];
  }

  // Return the response, with or without the security header
  return response;
};
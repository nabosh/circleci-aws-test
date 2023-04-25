exports.handler = async (event) => {
  const { request, response } = event.Records[0].cf;
  console.log('Event:', JSON.stringify(event, null, 2));

  // Check if the request is for a URI that includes "auth"
  if (request.uri.includes('/auth')) {
    // Set the security header
    const headerName = 'Custom-Security-Header';
    const headerValue = 'custom-value';

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

exports.handler = async (event) => {
  const { request } = event.Records[0].cf;
  const { uri } = request;

  // Check if the request is for the /auth route
  if (uri === '/auth') {
    // Set the cookie
    const cookie = `myCookie=cookieValue; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`;

    // Add the cookie to the response headers
    const response = {
      status: '200',
      statusDescription: 'OK',
      headers: {
        'set-cookie': [
          {
            key: 'Set-Cookie',
            value: cookie,
          },
        ],
        'content-type': [
          {
            key: 'Content-Type',
            value: 'text/html',
          },
        ],
      },
      body: 'Cookie set for /auth',
    };

    return response;
  }

  // For other routes, do not modify the request and let it pass through
  return request;
};

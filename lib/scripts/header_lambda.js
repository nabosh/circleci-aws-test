exports.handler = async (event) => {
  const request = event.Records[0].cf.request;
  const headers = request.headers;
  const uri = request.uri.toLowerCase();

  console.log(`Request URI: ${uri}`);
  console.log(`Initial headers: ${JSON.stringify(headers)}`);

  if (uri.includes('/auth')) {
    headers['x-frame-options'] = [{
      key: 'X-Frame-Options',
      value: 'DENY'
    }];
    console.log('X-Frame-Options header added with value DENY');
  } else {
    console.log('X-Frame-Options header not added, as /auth not found in the URI');
  }

  console.log(`Modified headers: ${JSON.stringify(headers)}`);

  return request;
};

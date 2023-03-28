exports.handler = async (event) => {
  console.log('Lambda function triggered:', JSON.stringify(event));

  const request = event.Records[0].cf.request;
  const response = event.Records[0].cf.response;
  const headers = response.headers;

  console.log('Request URI:', request.uri);

  if (request.uri.includes('auth')) {
    console.log('header added')
    headers['x-frame-options'] = [{ key: 'X-Frame-Options', value: 'SAMEORIGIN' }];
  }

  console.log('Headers:', headers);

  return response;
};

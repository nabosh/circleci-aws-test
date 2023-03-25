function handler(event) {
  const request = event.request;
  const response = event.response;
  const headers = response.headers;

  // if (request.uri.includes('circle')) {
    headers['x-frame-options'] = { value: 'SAMEORIGIN' };
  // }

  return response;
}

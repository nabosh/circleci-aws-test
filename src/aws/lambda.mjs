function handler(event) {
  const request = event.request;
  const response = event.response;
  const headers = response.headers;

  if (request.uri.includes('/auth')) {
    headers['x-frame-options'] = { value: 'DENY' };
  }

  return response;
}

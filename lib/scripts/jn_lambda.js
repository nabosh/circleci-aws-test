export const handler = async (event) => {
    console.log('Lambda started.');
    const response = event.Records[0].cf.response;
    const request = event.Records[0].cf.request;
    const headers = event.Records[0].cf.headers;
  
    console.log('incoming request event object: ', JSON.stringify(request, null, 2));
    console.log('incoming response event object: ', JSON.stringify(response, null, 2));
    console.log('incoming request URI: ', JSON.stringify(request.uri));
  
    console.log('response body:', response.body);
    console.log('CloudFront event:', JSON.stringify(event, null, 2));
  
    if (request.uri.includes('auth')) {
      console.log('In auth IF statement.');
  
      // Add custom header
      const headers = response.headers;
      console.log('headers pre-mod: ', JSON.stringify(headers, null, 2))
  
      headers['x-frame-test'] = [{ 'value': 'Not-AUTH' }];
  
      console.log('headers post-mod: ', JSON.stringify(headers, null, 2))
    
      // Change status to 200
      response.status = '200';
      response.statusDescription = 'OK';
  
      // Replace response body with index.html
      const responseBody = '<!doctype html><html lang="en"><head> <meta charset="utf-8"> <title>Circlecitest</title> <base href="/"> <meta name="viewport" content="width=device-width, initial-scale=1"> <link rel="icon" type="image/x-icon" href="favicon.ico"></head><body> <app-root></app-root></body></html>';
      response.body = responseBody;
      response.bodyEncoding = 'text';
    } else {
      console.log('Access granted.');
    }
  
    console.log('Lambda completed.');
    return response;
  };
  
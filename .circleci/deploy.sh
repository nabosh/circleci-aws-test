#.circleci/deploy.sh
#!/bin/bash
set -e
# Deploy Angular App

function create_lambda_directory() {
  # Create header-lambda directory
  mkdir header-lambda

  # Copy index.js file into the header-lambda directory
  cp src/aws/index.js header-lambda/
}

function zip_lambda() {
  # Change to header-lambda directory, zip the index.js file, and move back to the original directory
  pushd header-lambda
  zip -q index.zip index.js
  popd
}

function deploy_lambda() {
  # Deploy Lambda function
  aws lambda update-function-code \
    --function-name $LAMBDA_FUNCTION_NAME \
    --zip-file fileb://header-lambda/index.zip
}

function publish_lambda_version() {
  # Wait for Lambda update to complete
  sleep 20

  # Publish Lambda version
  aws lambda publish-version \
    --function-name $LAMBDA_FUNCTION_NAME \
    --query Version \
    --output text
}

function update_cloudfront_behavior() {
  local LAMBDA_VERSION=$1

  # Update CloudFront behavior
  DISTRIBUTION_ID=$CLOUDFRONT_DISTRIBUTION_ID
  DISTRIBUTION_ETAG=$(aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --query ETag --output text)
  aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --output json > distribution-config-original.json

  # Call the deploy.mjs script and pass the required arguments
  node -e 'import { main } from "./.circleci/deploy.mjs"; main();' "updateCloudFrontBehavior" "$LAMBDA_VERSION" "$DISTRIBUTION_ID" "$DISTRIBUTION_ETAG" "$(pwd)/distribution-config-original.json"
}

function invalidate_cache_and_sync_s3() {
  # Invalidate CloudFront cache
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"

  # Sync directory with S3 bucket
  aws s3 sync dist/circlecitest s3://circleciangularbucket --delete
}

function deploy_header_lambda(){
  # Main script
  create_lambda_directory
  zip_lambda
  deploy_lambda
  LAMBDA_VERSION=$(publish_lambda_version)
  update_cloudfront_behavior "$LAMBDA_VERSION"
  invalidate_cache_and_sync_s3
}

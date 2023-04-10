#!/bin/bash
set -e
# Deploy Angular App

function create_lambda_package() {
  # Create header-lambda directory
  mkdir header-lambda

  # Copy index.js file into the header-lambda directory
  cp src/aws/index.js header-lambda/

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

  # Wait for Lambda update to complete
  sleep 20

  # Publish Lambda version
  LAMBDA_VERSION=$(aws lambda publish-version \
    --function-name $LAMBDA_FUNCTION_NAME \
    --query Version \
    --output text)

  echo "AWS Lambda publish-version output: $LAMBDA_VERSION_OUTPUT"

  echo "THE ACCOUNT NUMBERRR: $AWS_ACCOUNT_ID"
  echo "THE DISTRUBTION ID: $DISTRIBUTION_ID"
  echo "Lambda function ARN: arn:aws:lambda:us-east-1:$AWS_ACCOUNT_ID:function:$LAMBDA_FUNCTION_NAME:$LAMBDA_VERSION"
  echo "Lambda function ARN: arn:aws:lambda:us-east-1:$AWS_ACCOUNT_ID:function:$LAMBDA_FUNCTION_NAME:$LAMBDA_VERSION"

  echo -n $LAMBDA_VERSION
}

function update_cloudfront_behavior() {
  local LAMBDA_VERSION=$1

  # Update CloudFront behavior
  DISTRIBUTION_ID=$CLOUDFRONT_DISTRIBUTION_ID
  DISTRIBUTION_ETAG=$(aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --query ETag --output text)
  aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --output json > distribution-config-original.json
  BEHAVIOR_PATH_PATTERN="*"

  echo "THE DISTRUBTION ID: $DISTRIBUTION_ID"

  # Call the deploy.mjs script and pass the required arguments
  AWS_ACCOUNT_ID=$AWS_ACCOUNT_ID node .circleci/deploy.mjs "$LAMBDA_VERSION" "$DISTRIBUTION_ID" "$DISTRIBUTION_ETAG" "$BEHAVIOR_PATH_PATTERN" "$(pwd)/distribution-config-original.json"
}

function invalidate_cache_and_sync_s3() {
  # Invalidate CloudFront cache
  aws cloudfront create-invalidation \
    --distribution-id $CLOUDFRONT_DISTRIBUTION_ID \
    --paths "/*"

  # Sync directory with S3 bucket
  aws s3 sync dist/circlecitest s3://$S3_BUCKET_NAME --delete
}

# Main script
create_lambda_package
LAMBDA_VERSION=$(deploy_lambda)
update_cloudfront_behavior "$LAMBDA_VERSION"
invalidate_cache_and_sync_s3

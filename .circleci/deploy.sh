#!/bin/bash
# Deploy Angular App

# Install AWS CLI
sudo apt-get update
sudo apt-get install -y python3-pip
sudo pip3 install awscli

# Configure AWS CLI
aws configure set default.region us-east-1

# Zip lambda file
zip -q src/aws/index.zip src/aws/index.js

# Deploy Lambda function
aws lambda update-function-code \
  --function-name header-lambda \
  --zip-file fileb://src/aws/index.zip

# Wait for Lambda update to complete
sleep 20

# Publish Lambda version
LAMBDA_VERSION=$(aws lambda publish-version \
  --function-name header-lambda \
  --query Version \
  --output text)

# Update CloudFront behavior
DISTRIBUTION_ID=E380M7BHVXFP6X
DISTRIBUTION_ETAG=$(aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --query ETag --output text)
aws cloudfront get-distribution-config --id $DISTRIBUTION_ID --output json > distribution-config-original.json
BEHAVIOR_PATH_PATTERN="*"

# Call the deploy.mjs script and pass the required arguments
node deploy.mjs "$LAMBDA_VERSION" "$DISTRIBUTION_ID" "$DISTRIBUTION_ETAG" "$BEHAVIOR_PATH_PATTERN"

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id DISTRIBUTION_ID \
  --paths "/*"

# Sync directory with S3 bucket
aws s3 sync dist/circlecitest s3://circleciangularbucket --delete

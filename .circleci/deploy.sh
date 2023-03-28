#!/bin/bash

set -e

# Set AWS credentials
export AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY
export AWS_SECRET_ACCESS_KEY=$AWS_SECRET_KEY
export AWS_DEFAULT_REGION=us-east-1

# Build and deploy Angular application to S3
cd ~/repo
npm ci
npm run build
aws s3 sync dist/circlecitest/ s3://circleciangularbucket/ --delete

# Update the Lambda function
cd ~/repo/header-lambda
zip -r lambda.zip .
aws lambda update-function-code --function-name header-lambda --zip-file fileb://lambda.zip

# Publish a new version of the Lambda function
aws lambda publish-version --function-name header-lambda

# Retrieve the latest version number
LATEST_VERSION=$(aws lambda list-versions-by-function --function-name header-lambda --query "Versions[-1].[Version]" --output text)

# Get CloudFront distribution ID (replace with your distribution ID)
DISTRIBUTION_ID=E380M7BHVXFP6X

# Get the current CloudFront distribution configuration
DISTRIBUTION_CONFIG=$(aws cloudfront get-distribution-config --id $DISTRIBUTION_ID)

# Modify the distribution configuration to update the Lambda function ARN with the new version number
UPDATED_CONFIG=$(echo $DISTRIBUTION_CONFIG | jq --arg version $LATEST_VERSION '.DistributionConfig | .DefaultCacheBehavior.LambdaFunctionAssociations.Items[] |= if .LambdaFunctionARN | startswith("arn:aws:lambda:us-east-1:671249171349:function:header-lambda") then .LambdaFunctionARN = ("arn:aws:lambda:us-east-1:671249171349:function:header-lambda:" + $version) else . end')

# Update the CloudFront distribution with the modified configuration
aws cloudfront update-distribution --id $DISTRIBUTION_ID --if-match $(echo $DISTRIBUTION_CONFIG | jq -r '.ETag') --distribution-config "$(echo $UPDATED_CONFIG | jq -r '.')"

# Invalidate the CloudFront cache
aws cloudfront create-invalidation --distribution-id $DISTRIBUTION_ID --paths "/*"

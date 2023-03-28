// const { promises: fs } = require('fs');
// const fs = require('fs').promises;
import fs from "fs"
const { spawn } = require('child_process');
const AWS = require('aws-sdk');

const cloudfront = new AWS.CloudFront();
const lambda = new AWS.Lambda();

async function updateCloudFront() {
  const functionName = process.env.LAMBDA_FUNCTION_NAME;
  const functionInfo = await getLambdaFunctionInfo(functionName);
  const distributionID = process.env.CLOUDFRONT_DISTRIBUTION_ID;
  const distributionConfig = await getDistributionConfig(distributionID);
  const lambdaARN = functionInfo.FunctionArn;

  // Find the default cache behavior and update its Lambda function association
  const defaultCacheBehavior = distributionConfig.DefaultCacheBehavior;
  defaultCacheBehavior.LambdaFunctionAssociations = {
    Quantity: 1,
    Items: [
      {
        LambdaFunctionARN: lambdaARN,
        EventType: 'viewer-request',
      },
    ],
  };

  await updateDistribution(distributionID, distributionConfig);
}

async function getDistributionConfig(distributionID) {
  const params = { Id: distributionID };
  const { DistributionConfig, ETag } = await cloudfront.getDistributionConfig(params).promise();

  return { DistributionConfig, ETag };
}

async function updateDistribution(distributionID, { DistributionConfig, ETag }) {
  const params = {
    Id: distributionID,
    DistributionConfig,
    IfMatch: ETag,
  };
  await cloudfront.updateDistribution(params).promise();
}

async function getLambdaFunctionInfo(functionName) {
  const params = { FunctionName: functionName };
  const functionInfo = await lambda.getFunction(params).promise();
  return functionInfo.Configuration;
}

(async () => {
  try {
    await updateCloudFront();
    console.log('Successfully updated CloudFront configuration with the new Lambda ARN.');
  } catch (error) {
    console.error('Error updating CloudFront configuration:', error.message);
    process.exit(1);
  }
})();

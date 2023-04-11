import { promises as fs } from 'fs';
import { execSync } from 'child_process';

const updateCloudFrontBehavior = async (lambdaArn, distributionId, distributionEtag, behaviorPathPattern, configFile, AWS_ACCOUNT_ID, LAMBDA_FUNCTION_NAME) => {
  const configJSON = await fs.readFile(configFile, 'utf-8');
  const config = JSON.parse(configJSON);
  const behavior = config.DistributionConfig.DefaultCacheBehavior;

  const lambdaAssociation = behavior.LambdaFunctionAssociations.Items.find(
    (item) => item.EventType === 'origin-response'
  );

  if (!lambdaAssociation) {
    console.error('No LambdaFunctionAssociation found with EventType "origin-response".');
    process.exit(1);
  }

  console.log(`Lambda ARN: ${lambdaArn}`);
  lambdaAssociation.LambdaFunctionARN = lambdaArn;
  console.log(lambdaAssociation.LambdaFunctionARN);

  return config;
};

const updateDistribution = async (config, distributionId, distributionEtag) => {
  // Remove unnecessary fields from the configuration object
  delete config.ETag;

  await fs.writeFile('distribution-config-updated.json', JSON.stringify(config.DistributionConfig, null, 2));

  execSync(
    `aws cloudfront update-distribution --id ${distributionId} --if-match ${distributionEtag} --distribution-config file://distribution-config-updated.json`,
    { stdio: 'inherit' }
  );
};

const main = async () => {
  const [_, __, lambdaArn, distributionId, distributionEtag, behaviorPathPattern, configFile, AWS_ACCOUNT_ID, LAMBDA_FUNCTION_NAME] = process.argv;
  
  try {
    const config = await updateCloudFrontBehavior(lambdaArn, distributionId, distributionEtag, behaviorPathPattern, configFile, AWS_ACCOUNT_ID, LAMBDA_FUNCTION_NAME);
    await updateDistribution(config, distributionId, distributionEtag);
  } catch (error) {
    console.error(`Error updating CloudFront behavior: ${error.message}`);
    process.exit(1);
  }
};

main();
// An error occurred (InvalidLambdaFunctionAssociation) when calling the UpdateDistribution operation: The function ARN must reference a specific function version. (The ARN must end with the version number.) ARN: arn:aws:lambda:us-east-1:671249171349:function:header-lambda:{

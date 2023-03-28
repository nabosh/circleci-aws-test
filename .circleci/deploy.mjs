import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import AWS from 'aws-sdk';

const updateCloudFrontBehavior = async (lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile) => {
  try {
    const configJSON = await fs.readFile(configFile, 'utf-8');
    const config = JSON.parse(configJSON);
    const behavior = config.Distribution.DistributionConfig.DefaultCacheBehavior;

    const lambdaAssociation = behavior.LambdaFunctionAssociations.Items.find(
      (item) => item.EventType === 'origin-response'
    );

    if (!lambdaAssociation) {
      console.error('No LambdaFunctionAssociation found with EventType "origin-response".');
      process.exit(1);
    }

    lambdaAssociation.LambdaFunctionARN = lambdaAssociation.LambdaFunctionARN.replace(
      /:\d+$/,
      `:${lambdaVersion}`
    );

    // Remove unnecessary fields from the configuration object
    delete config.ETag;
    const updatedConfig = config.Distribution.DistributionConfig;

    await fs.writeFile('distribution-config-updated.json', JSON.stringify(updatedConfig, null, 2));

    execSync(
      `aws cloudfront update-distribution --id ${distributionId} --if-match ${distributionEtag} --distribution-config file://distribution-config-updated.json`,
      { stdio: 'inherit' }
    );
  } catch (error) {
    console.error(`Error updating CloudFront behavior: ${error.message}`);
    process.exit(1);
  }
};

const [_, __, lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile] = process.argv;

updateCloudFrontBehavior(lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile);

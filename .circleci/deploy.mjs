import { promises as fs } from 'fs';
import { execSync } from 'child_process';
import AWS from 'aws-sdk';

const updateCloudFrontBehavior = async (lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile) => {
  try {
    const configJSON = await fs.readFile(configFile, 'utf-8');
    const config = JSON.parse(configJSON);
    
    console.log('CacheBehaviors:', config.DistributionConfig.CacheBehaviors); // Add this line to log CacheBehaviors

    const behavior = config.DistributionConfig.CacheBehaviors.Items.find(
      (b) => b.PathPattern === behaviorPathPattern
    );

    if (!behavior) {
      console.error(`No CacheBehavior found with PathPattern "${behaviorPathPattern}".`);
      process.exit(1);
    }

    behavior.LambdaFunctionAssociations.Items[0].LambdaFunctionARN = behavior.LambdaFunctionAssociations.Items[0].LambdaFunctionARN.replace(
      /:\d+$/,
      `:${lambdaVersion}`
    );

    await fs.writeFile('distribution-config-updated.json', JSON.stringify(config, null, 2));

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

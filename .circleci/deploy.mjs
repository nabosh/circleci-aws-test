import { promises as fs } from 'fs';
import { execSync } from 'child_process';

const updateCloudFrontBehavior = async (lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile) => {
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

  lambdaAssociation.LambdaFunctionARN = lambdaAssociation.LambdaFunctionARN.replace(
    /:\d+$/,
    `:${lambdaVersion}`
  );

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
  const [_, __, lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile] = process.argv;
  
  try {
    const config = await updateCloudFrontBehavior(lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile);
    await updateDistribution(config, distributionId, distributionEtag);
  } catch (error) {
    console.error(`Error updating CloudFront behavior: ${error.message}`);
    process.exit(1);
  }
};

main();

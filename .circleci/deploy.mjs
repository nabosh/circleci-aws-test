// .circleci/deploy.mjs
// testing something
import { promises as fs } from 'fs';
import { execSync } from 'child_process';

async function getConfigJSON(configFile) {
  return JSON.parse(await fs.readFile(configFile, 'utf-8'));
}

function findLambdaAssociation(config) {
  const behavior = config.DistributionConfig.DefaultCacheBehavior;
  return behavior.LambdaFunctionAssociations.Items.find(
    (item) => item.EventType === 'origin-response'
  );
}

function updateLambdaVersion(lambdaAssociation, lambdaVersion) {
  lambdaAssociation.LambdaFunctionARN = lambdaAssociation.LambdaFunctionARN.replace(
    /:\d+$/,
    `:${lambdaVersion}`
  );
}

async function writeUpdatedConfig(config) {
  // Remove unnecessary fields from the configuration object
  delete config.ETag;

  await fs.writeFile('distribution-config-updated.json', JSON.stringify(config.DistributionConfig, null, 2));
}

function executeCloudFrontUpdate(distributionId, distributionEtag) {
  execSync(
    `aws cloudfront update-distribution --id ${distributionId} --if-match ${distributionEtag} --distribution-config file://distribution-config-updated.json`,
    { stdio: 'inherit' }
  );
}

async function updateCloudFrontBehavior(lambdaVersion, distributionId, distributionEtag, configFile) {
  try {
    const config = await getConfigJSON(configFile);
    const lambdaAssociation = findLambdaAssociation(config);

    if (!lambdaAssociation) {
      console.error('No LambdaFunctionAssociation found with EventType "origin-response".');
      process.exit(1);
    }

    updateLambdaVersion(lambdaAssociation, lambdaVersion);
    await writeUpdatedConfig(config);
    executeCloudFrontUpdate(distributionId, distributionEtag);

  } catch (error) {
    console.error(`Error updating CloudFront behavior: ${error.message}`);
    process.exit(1);
  }
}

async function main() {
  const [_, __, action, lambdaVersion, distributionId, distributionEtag, configFile] = process.argv;

  if (action === 'updateCloudFrontBehavior') {
    await updateCloudFrontBehavior(lambdaVersion, distributionId, distributionEtag, configFile);
  } else {
    console.error('Invalid action specified.');
    process.exit(1);
  }
}

main();

import { promises as fs } from 'fs';
import { spawn } from 'child_process';

const [lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile] = process.argv.slice(2);

async function main() {
  const config = JSON.parse(await fs.readFile(configFile, 'utf-8'));
  const distributionConfig = config.DistributionConfig;
  const cacheBehaviors = distributionConfig.CacheBehaviors?.Items;

  if (!cacheBehaviors) {
    console.error('No CacheBehaviors found in the CloudFront distribution configuration.');
    process.exit(1);
  }

  let behaviorFound = false;

  cacheBehaviors.forEach((behavior) => {
    if (behavior.PathPattern === behaviorPathPattern) {
      behavior.LambdaFunctionAssociations.Items.forEach((association) => {
        if (association.EventType === 'origin-request') {
          association.LambdaFunctionARN = association.LambdaFunctionARN.replace(/:[^:]+$/, `:${lambdaVersion}`);
          behaviorFound = true;
        }
      });
    }
  });

  if (!behaviorFound) {
    console.error(`No behavior found with PathPattern "${behaviorPathPattern}" and EventType "origin-request".`);
    process.exit(1);
  }

  const updatedConfigFile = 'distribution-config-updated.json';
  await fs.writeFile(updatedConfigFile, JSON.stringify({ DistributionConfig: distributionConfig }));

  const updateDistribution = spawn('aws', [
    'cloudfront',
    'update-distribution',
    '--id',
    distributionId,
    '--distribution-config',
    `file://${updatedConfigFile}`,
    '--if-match',
    distributionEtag,
  ]);

  updateDistribution.stdout.pipe(process.stdout);
  updateDistribution.stderr.pipe(process.stderr);

  updateDistribution.on('close', async (code) => {
    if (code === 0) {
      console.log('CloudFront distribution updated successfully.');
    } else {
      console.error(`CloudFront distribution update failed with exit code ${code}.`);
    }

    await fs.unlink(updatedConfigFile);
  });
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

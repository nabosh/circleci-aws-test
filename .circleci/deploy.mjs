import { readFile, writeFile } from 'fs/promises';
import { exec } from 'child_process';

const updateCloudFrontBehavior = async (lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, distributionConfigFile) => {
  try {
    const distributionConfig = JSON.parse(await readFile(distributionConfigFile, 'utf8'));
    const behaviors = distributionConfig.DistributionConfig.CacheBehaviors.Items;

    behaviors.forEach((behavior) => {
      if (behavior.PathPattern === behaviorPathPattern) {
        behavior.LambdaFunctionAssociations.Items.forEach((association) => {
          if (association.EventType === 'origin-request') {
            association.LambdaFunctionARN = association.LambdaFunctionARN.replace(/:\d+$/, `:${lambdaVersion}`);
          }
        });
      }
    });

    await writeFile(distributionConfigFile, JSON.stringify(distributionConfig));

    exec(`aws cloudfront update-distribution --id ${distributionId} --distribution-config file://${distributionConfigFile} --if-match ${distributionEtag}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });

  } catch (error) {
    console.error(`Error: ${error.message}`);
  }
};

const [lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, distributionConfigFile] = process.argv.slice(2);
updateCloudFrontBehavior(lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, distributionConfigFile);

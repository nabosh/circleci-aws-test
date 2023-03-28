import { promises as fs } from 'fs';
import { execSync } from 'child_process';

async function getDistributionConfig() {
  const output = execSync('aws cloudfront get-distribution --id E380M7BHVXFP6X');
  const distributionConfig = JSON.parse(output.toString());

  return distributionConfig;
}

async function updateDistributionConfig(distributionConfig) {
  await fs.writeFile('temp-distribution-config.json', JSON.stringify(distributionConfig));

  // Print the content of temp-distribution-config.json for debugging
  const tempDistributionConfigContent = await fs.readFile('temp-distribution-config.json', 'utf-8');
  console.log('temp-distribution-config.json content:', tempDistributionConfigContent);

  try {
    const lambdaVersion = process.argv[2];
    const jqCommand = `jq --arg lambda_version "${lambdaVersion}" '. |= (del(.ETag) | .DefaultCacheBehavior.LambdaFunctionAssociations |= if .Items == null then .Items = [{"EventType": "origin-response", "LambdaFunctionARN": "arn:aws:lambda:us-east-1:671249171349:function:header-lambda:(\\$lambda_version)"}] | .Quantity = 1 else (.Quantity = (.Items | length + 1)) | (.Items |= . + [{"EventType": "origin-response", "LambdaFunctionARN": "arn:aws:lambda:us-east-1:671249171349:function:header-lambda:(\\$lambda_version)"}]) end)' temp-distribution-config.json > distribution-config-updated.json`;
    execSync(jqCommand);
  } catch (error) {
    console.error('Error updating distribution config:', error);
  }
  // Print the content of distribution-config-updated.json for debugging
  const distributionConfigUpdatedContent = await fs.readFile('distribution-config-updated.json', 'utf-8');
  console.log('distribution-config-updated.json content:', distributionConfigUpdatedContent);
}

async function main() {
  const distributionConfig = await getDistributionConfig();

  console.log('distributionConfig before updateDistributionConfig call:', distributionConfig);

  await updateDistributionConfig(distributionConfig.Distribution);

  const updatedDistributionConfig = await fs.readFile('distribution-config-updated.json', 'utf-8');
  execSync(`aws cloudfront update-distribution --id E380M7BHVXFP6X --if-match ${distributionConfig.ETag} --distribution-config '${updatedDistributionConfig}'`);
}

main().catch((error) => {
  console.error('Error in main:', error);
});

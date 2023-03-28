import { execSync } from 'child_process';

const [_, __, lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile] = process.argv;

const updateDistributionConfig = (distributionConfig) => {
    // Save DistributionConfig to a file
    execSync(
      `echo '${JSON.stringify(distributionConfig.DistributionConfig)}' > temp-distribution-config.json`,
      { stdio: 'inherit' }
    );
  
    execSync(
      `jq --arg lambda_version "${lambdaVersion}" '
        . |= (
          del(.ETag) |
          .DefaultCacheBehavior.LambdaFunctionAssociations |=
            if .Items == null then
              .Items = [{"EventType": "origin-response", "LambdaFunctionARN": "arn:aws:lambda:us-east-1:671249171349:function:header-lambda:\($lambda_version)"}] |
              .Quantity = 1
            else
              (.Quantity = (.Items | length + 1)) |
              (.Items |= . + [{"EventType": "origin-response", "LambdaFunctionARN": "arn:aws:lambda:us-east-1:671249171349:function:header-lambda:\($lambda_version)"}])
            end
        )
      ' temp-distribution-config.json > distribution-config-updated.json`,
      { stdio: 'inherit' }
    );
  };
  
    
const updateCloudFront = () => {
  execSync(
    `aws cloudfront update-distribution \
      --id ${distributionId} \
      --if-match ${distributionEtag} \
      --distribution-config file://distribution-config-updated.json`,
    { stdio: 'inherit' }
  );
};

updateDistributionConfig(distributionConfig);
updateCloudFront();

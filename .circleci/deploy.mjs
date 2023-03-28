import { execSync } from 'child_process';

const [_, __, lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile] = process.argv;

const updateDistributionConfig = () => {
  execSync(
    `jq --arg lambda_version "${lambdaVersion}" '
      del(.ETag) |
      .DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations |=
        if .Items == null then
          .Items = [] |
          .Quantity = 0
        else
          (.Quantity = (.Items | length)) |
          (.Items |= map(
            if .EventType == "origin-response" then
              .LambdaFunctionARN = "arn:aws:lambda:us-east-1:671249171349:function:header-lambda:\($lambda_version)"
            else
              .
            end
          ))
        end
    ' ${configFile} > distribution-config-updated.json`,
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

updateDistributionConfig();
updateCloudFront();

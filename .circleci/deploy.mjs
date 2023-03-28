#!/usr/bin/env node
import fs from 'fs';
import { exec } from 'child_process';

const [_, __, lambdaVersion, distributionId, distributionEtag, behaviorPathPattern, configFile] = process.argv;

const updateCloudFrontBehavior = () => {
  const cmd = `
    jq --arg lambda_version "${lambdaVersion}" '
      del(.ETag) |
      .DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations |=
        (.Quantity = (.Items | length)) |
        (.Items |= map(
          if .EventType == "origin-response" then
            .LambdaFunctionARN = "arn:aws:lambda:us-east-1:671249171349:function:header-lambda:\($lambda_version)"
          else
            .
          end
        ))
    ' ${configFile} > distribution-config-updated.json`;

  exec(cmd, (error) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    exec(
      `aws cloudfront update-distribution --id ${distributionId} --if-match ${distributionEtag} --distribution-config file://distribution-config-updated.json`,
      (error) => {
        if (error) {
          console.error(`exec error: ${error}`);
          return;
        }
        console.log('CloudFront behavior updated');
      }
    );
  });
};

updateCloudFrontBehavior();

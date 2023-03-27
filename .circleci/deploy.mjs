#!/usr/bin/env node
import fs from 'fs';
import { exec } from 'child_process';

const [_, __, lambdaVersion, distributionId, distributionEtag, behaviorPathPattern] = process.argv;

const updateCloudFrontBehavior = () => {
  exec(
    `jq --arg lambda_version "${lambdaVersion}" 'del(.ETag) | .DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations.Quantity = 1 | .DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations.Items[0].LambdaFunctionARN = "arn:aws:lambda:us-east-1:671249171349:function:header-lambda:\($lambda_version)" | .DistributionConfig.DefaultCacheBehavior.LambdaFunctionAssociations.Items[0].EventType = "origin-response" | .DistributionConfig' distribution-config-original.json > distribution-config-updated.json`,
    (error) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      exec(
        `aws cloudfront update-d

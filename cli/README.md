# Former2 CLI

<span class="badge-npmversion"><a href="https://npmjs.org/package/former2" title="View this project on NPM"><img src="https://img.shields.io/npm/v/former2.svg" alt="NPM version" /></a></span>

The Former2 CLI allows you to use the [former2.com](https://former2.com) tool directly from your command line to scan AWS resources and generate Infrastructure as Code output.

## Requirements

- Node.js >= 18.0.0

## Install

```sh
npm install -g former2
```

Or build the Docker image from the repo root:

```sh
podman build -f cli/Dockerfile -t former2:latest .
```

## Credentials

Former2 loads AWS credentials from your local credentials file, environment variables, or [other available sources](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html) per default precedence.

It is recommended that you provide only read access with these credentials — assign the [ReadOnlyAccess](https://console.aws.amazon.com/iam/home?#/policies/arn:aws:iam::aws:policy/ReadOnlyAccess) policy.

Use `--profile <name>` to select a named profile from your shared credentials file.

## Commands

### generate

Scans your AWS account for resources and generates one or more IaC output files.

```sh
former2 generate \
  --output-cloudformation "cfn.yml" \
  --output-terraform "main.tf" \
  --output-cdk-v2 "cdk.ts" \
  --services "S3,Lambda" \
  --region us-east-1
```

With Podman:

```sh
podman run --rm -t -v $(pwd):/former2 -v ~/.aws:/root/.aws \
  former2:latest generate \
  --output-cloudformation "cfn.yml" \
  --region us-east-1
```

```sh
podman run --rm -t -v $(pwd)/out:/output -v ~/.aws:/root/.aws \
  -w /output \
  former2:latest generate \
  --output-raw-data "infra.json" \
  --region <region> \
  --profile <profile> \
  --sort-output
```

```powershell
$c = aws-sso-util credential-process --profile <profile> | ConvertFrom-Json

podman run --rm -t `
  -v ${PWD}/out:/output -w /output `
  -e AWS_ACCESS_KEY_ID=$($c.AccessKeyId) `
  -e AWS_SECRET_ACCESS_KEY=$($c.SecretAccessKey) `
  -e AWS_SESSION_TOKEN=$($c.SessionToken) `
  -e AWS_REGION=<region> `
  former2:latest generate --output-raw-data "infra.json" --region <region> --sort-output
```

#### Options

At least one `--output-*` option must be specified.

```
Output formats:
  --output-cloudformation <filename>     CloudFormation (YAML)
  --output-terraform <filename>          Terraform (HCL)
  --output-cdk <filename>               CDK v1 (TypeScript by default)
  --output-cdk-v2 <filename>            CDK v2 (TypeScript by default)
  --output-troposphere <filename>        Troposphere (Python)
  --output-pulumi <filename>            Pulumi (TypeScript by default)
  --output-cdktf <filename>             CDKTF (TypeScript by default)
  --output-raw-data <filename>           Raw JSON of all discovered resources
  --output-logical-id-mapping <filename> Logical to physical ID mapping (JSON)

Language & policy:
  --iac-language <lang>                  Language for CDK/Pulumi/CDKTF output
                                         (typescript, python, java, dotnet; default: typescript)
  --cfn-deletion-policy <Delete|Retain>  DeletionPolicy for CloudFormation output

Filtering:
  --services <value>                     Services to include, comma-separated (default: ALL enabled)
  --exclude-services <value>             Services to exclude, comma-separated
  --full                                 Also scan niche/restricted services skipped by default
                                         (AuditManager, BillingConductor, CostExplorer, FinSpace,
                                          TwinMaker, InteractiveVideoService, Lex, LicenseManager,
                                          LocationService, Macie, Organizations, Pinpoint,
                                          QuickSight, Rekognition). Ignored if --services names one
                                          of them explicitly.
  --search-filter <value>               Text filter on discovered resources
                                         (comma = OR, ampersand = AND)
  --regex-filter <regex>                 RegExp filter on discovered resources

Scan options:
  --region <regionname>                  AWS region to scan (default: from config/env)
  --profile <profilename>               AWS profile from shared credentials file
  --proxy <protocol://host:port>         HTTP/HTTPS proxy
  --sort-output                          Sort resources by ID before output
  --include-default-resources            Include default VPCs, subnets, etc.
  --debug                                Show debug logging and scan error details
  -h, --help                             Show help
```

### filter

Produces IaC output from a previously saved raw data file (from `generate --output-raw-data`), without re-scanning AWS. Useful for iterating on filters without repeated API calls.

```sh
former2 generate --output-raw-data all.json --region us-east-1

former2 filter \
  --input-file all.json \
  --output-cloudformation "cfn.yml" \
  --services S3 \
  --sort-output
```

#### Options

```
Required:
  --input-file <filename>                Raw data file from a previous generate run

Output formats:
  --output-cloudformation <filename>     CloudFormation (YAML)
  --output-terraform <filename>          Terraform (HCL)
  --output-cdk <filename>               CDK v1
  --output-cdk-v2 <filename>            CDK v2
  --output-troposphere <filename>        Troposphere (Python)
  --output-pulumi <filename>            Pulumi
  --output-cdktf <filename>             CDKTF
  --output-logical-id-mapping <filename> Logical to physical ID mapping (JSON)

Language & policy:
  --iac-language <lang>                  Language for CDK/Pulumi/CDKTF output (default: typescript)
  --cfn-deletion-policy <Delete|Retain>  DeletionPolicy for CloudFormation output

Filtering:
  --services <value>                     Services to include, comma-separated (default: ALL)
  --exclude-services <value>             Services to exclude, comma-separated
  --search-filter <value>               Text filter (comma = OR, ampersand = AND)
  --regex-filter <regex>                 RegExp filter on resources

Other:
  --region <regionname>                  Override region used in output templates
  --sort-output                          Sort resources by ID
  --include-default-resources            Include default VPCs, subnets, etc.
  --debug                                Show debug logging
  -h, --help                             Show help
```

## Examples

Generate CloudFormation for Lambda and IAM only:

```sh
former2 generate --services "Lambda,IAM" --output-cloudformation "cfn.yml" --region us-east-1
```

Generate Terraform excluding CloudWatch and KMS:

```sh
former2 generate --output-terraform "main.tf" --exclude-services "CloudWatch,KMS" --region us-east-1
```

Generate CDK v2 in Python:

```sh
former2 generate --output-cdk-v2 "cdk_app.py" --iac-language python --region us-east-1
```

Generate Pulumi output for S3 resources:

```sh
former2 generate --output-pulumi "index.ts" --services S3 --region us-east-1
```

Filter by resource name/tag:

```sh
former2 generate --output-terraform "main.tf" --search-filter "myapp" --region us-east-1
```

Filter EC2 resources by regex (exclude instances, volumes, ENIs):

```sh
former2 generate --output-cloudformation "cfn.yml" --services EC2 \
  --regex-filter '"f2type":(?!"(ec2.instance|ec2.volume|ec2.networkinterface)")' \
  --region us-east-1
```

Scan once, filter multiple times:

```sh
former2 generate --output-raw-data all.json --region us-east-1
former2 filter --input-file all.json --services S3 --output-cloudformation s3.yml
former2 filter --input-file all.json --exclude-services S3 --output-cloudformation no-s3.yml
```

## Error Handling

When services fail during scanning (e.g. due to insufficient permissions), the CLI displays a yellow warning summary after the progress bar:

```
5 service(s) failed during scan: Inspector, GuardDuty, ...
```

Use `--debug` to see full error details including stack traces for each failed service.

## Service Names

Below is a list of services for use with `--services` and `--exclude-services`:

<details><summary>Expand</summary>

* 1Click
* APIGateway
* AmazonMQ
* Amplify
* Analytics
* AppConfig
* AppFlow
* AppMesh
* AppStream
* AppSync
* Athena
* AuditManager
* AutoScaling
* Backup
* Batch
* Budgets
* CertificateManager
* Cloud9
* CloudFront
* CloudHSM
* CloudMap
* CloudTrail
* CloudWatch
* CodeArtifact
* CodeBuild
* CodeCommit
* CodeDeploy
* CodeGuru
* CodePipeline
* CodeStar
* Cognito
* Config
* Core
* CostExplorer
* DataBrew
* DataPipeline
* DataSync
* DatabaseMigrationService
* Detective
* DevOpsGuru
* DeviceFarm
* DirectConnect
* DirectoryService
* DocumentDB
* DynamoDB
* EC2
* EC2ImageBuilder
* ECR
* ECS
* EFS
* EKS
* EMR
* ElastiCache
* ElasticBeanstalk
* ElasticTranscoder
* Elasticsearch
* EventBridge
* Events
* FSx
* GameLift
* Glacier
* GlobalAccelerator
* Glue
* Greengrass
* GroundStation
* GuardDuty
* IAM
* Inspector
* InteractiveVideoService
* KMS
* Kendra
* Kinesis
* LakeFormation
* Lambda
* Lex
* LicenseManager
* Lightsail
* LookoutForVision
* MSK
* Macie
* ManagedApacheAirflow
* ManagedBlockchain
* MediaConnect
* MediaConvert
* MediaLive
* MediaPackage
* MediaStore
* Neptune
* OpsWorks
* Organizations
* Pinpoint
* QLDB
* QuickSight
* RDS
* Redshift
* ResourceAccessManager
* ResourceGroups
* RoboMaker
* Route53
* S3
* SES
* SNS
* SQS
* SWF
* SageMaker
* SecretsManager
* SecurityHub
* ServiceCatalog
* ServiceQuotas
* Signer
* SimpleDB
* SingleSignOn
* SiteWise
* StepFunctions
* StorageGateway
* SystemsManager
* ThingsGraph
* Timestream
* Transfer
* VPC
* WAFAndShield
* WorkLink
* WorkSpaces
* XRay
</details>

## Security

All AWS API calls are made directly using the AWS SDK v3. Resource data is kept entirely in memory or on local disk and is never sent over the internet or anywhere else. Take care to remove any sensitive data (passwords, secrets) when sharing generated templates with others.

## Development

### Testing

```sh
npm test                # Run all tests
npm run test:unit       # Unit tests only
npm run test:integration # Integration tests only
npm run test:coverage   # Tests with coverage report
```

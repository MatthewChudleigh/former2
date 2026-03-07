# Former2 CLI

THe CLI can export all resources as raw JSON.

```sh
  former2 generate --output-raw-data "resources.json"
```

This will:
1. Scan all AWS services in your account using credentials from your environment/credentials file
2. Write the raw JSON data of all discovered resources to resources.json

## Install

```sh
npm install -g former2
```

Or via Docker:

```sh
docker run --rm -t -v $(pwd):/former2 -v ~/.aws:/root/.aws \
iann0036/former2:latest generate --output-raw-data "resources.json"
```

## Useful options

┌─────────────────────────────────────┬──────────────────────────────────────────┐
│               Option                │               Description                │
├─────────────────────────────────────┼──────────────────────────────────────────┤
│ --region <name>                     │ Override the AWS region to scan          │
├─────────────────────────────────────┼──────────────────────────────────────────┤
│ --profile <name>                    │ Use a specific AWS credentials profile   │
├─────────────────────────────────────┼──────────────────────────────────────────┤
│ --services "EC2,S3,Lambda"          │ Limit to specific services               │
├─────────────────────────────────────┼──────────────────────────────────────────┤
│ --exclude-services "CloudWatch,KMS" │ Exclude noisy services                   │
├─────────────────────────────────────┼──────────────────────────────────────────┤
│ --sort-output                       │ Sort resources by ID                     │
├─────────────────────────────────────┼──────────────────────────────────────────┤
│ --search-filter "myapp"             │ Only include resources matching a filter │
├─────────────────────────────────────┼──────────────────────────────────────────┤
│ --include-default-resources         │ Include default VPCs, subnets, etc.      │
└─────────────────────────────────────┴──────────────────────────────────────────┘

## Two-step workflow

You can also do a two-step process — first export raw JSON, then generate CloudFormation/Terraform from it offline using the filter command:

```sh
# Step 1: Export everything
former2 generate --output-raw-data "all-resources.json"

# Step 2: Generate filtered outputs without re-querying AWS
former2 filter --input-file "all-resources.json" --output-cloudformation "cfn.yml"
```

Note: The CLI is marked as experimental.
The `ReadOnlyAccess` IAM policy is recommended.

It uses the AWS JS SDK v2 and picks up credentials from standard sources:

- env vars
- ~/.aws/credentials
- instance profile
- etc

## Former2 CLI — Current State Assessment

The CLI is marked experimental and is roughly a 25% feature-complete subset of the web UI.

Output Format Support

┌────────────────────────┬────────┬─────────────────────────┐
│         Format         │ Web UI │           CLI           │
├────────────────────────┼────────┼─────────────────────────┤
│ CloudFormation         │ ✅     │ ✅                      │
├────────────────────────┼────────┼─────────────────────────┤
│ Terraform              │ ✅     │ ✅                      │
├────────────────────────┼────────┼─────────────────────────┤
│ Raw JSON (debug)       │ ✅     │ ✅                      │
├────────────────────────┼────────┼─────────────────────────┤
│ Troposphere            │ ✅     │ ❌ (stubbed as no-op)   │
├────────────────────────┼────────┼─────────────────────────┤
│ CDK v1 (TS/Py/Java/C#) │ ✅     │ ❌ (stubbed)            │
├────────────────────────┼────────┼─────────────────────────┤
│ CDK v2 (TS/Py/Java/C#) │ ✅     │ ❌ (stubbed)            │
├────────────────────────┼────────┼─────────────────────────┤
│ CDK for Terraform      │ ✅     │ ❌ (stubbed)            │
├────────────────────────┼────────┼─────────────────────────┤
│ Pulumi                 │ ✅     │ ❌ (stubbed)            │
├────────────────────────┼────────┼─────────────────────────┤
│ Diagram (draw.io)      │ ✅     │ ❌ (N/A — requires DOM) │
└────────────────────────┴────────┴─────────────────────────┘

In cli/main.js:208-214, these are explicitly disabled:
outputMapCdk = function(){};
outputMapCdkv2 = function(){};
outputMapTroposphere = function(){};
outputMapPulumi = function(){};
outputMapCdktf = function(){};

### Key Issues

- No tests — package.json has "test": "echo \"Error: no test specified\" && exit 1". Zero test files exist.

- eval() architecture — The CLI loads browser JS via eval(fs.readFileSync(...)) for mappings.js, datatables.js, and all ~200+ service files. Browser globals (window, $, blockUI, unblockUI) are stubbed as no-ops. This is fragile and a security anti-pattern.

- Silent error swallowing — A TODO at cli/main.js:285 says: // TODO: verify log setup for CLI (errors do not seem to appear when running 'former2'). Service scan failures are caught and logged only as warnings,
potentially hiding real issues.

- Outdated dependencies:
  - Docker image uses Node 14 (EOL)
  - AWS SDK v2 (v3 has been the standard for years)
  - Commander v4 (current is v12+)

- filter command gaps — Lacks --services/--exclude-services and --region options that generate supports.

### What Would Need to Be Done to "Complete" It

Low effort (enable existing code):
- Un-stub Troposphere, CDK v1/v2, CDKTF, and Pulumi output formats — the mapping functions already exist in js/mappings.js.
- Add CLI flags like --output-troposphere, --output-cdk-v2, --output-pulumi, etc. and wire them through parseOpts() and saveOutput().

Medium effort:
- Fix error logging/propagation so service scan failures are visible
- Add --services/--exclude-services to the filter command
- Update Docker image to Node 20+
- Migrate from AWS SDK v2 to v3
- Update commander to current version
- Add basic test coverage

High effort / architectural:
- Replace eval() with proper module system (refactor browser JS into importable modules or use a bundler)
- Add multi-region scanning support
- Diagram output is inherently UI-only and not feasible in CLI

The biggest quick win would be enabling the 5 stubbed output formats — the underlying mapping code already exists and works in the web UI.
The CLI just needs flags and file-writing logic for each, similar to what's already done for CloudFormation and Terraform.
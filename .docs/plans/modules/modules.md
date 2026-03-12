# Former2 Analysis Modules Plan

## Overview

Former2 raw output contains the full AWS API response for every discovered resource across accounts. With 9 accounts producing 4,331 resources across 182 resource types, the raw data is rich enough to drive analysis modules that go far beyond IaC generation.

### Module Framework

Each module operates on one or more raw output files (JSON arrays of resources with `f2id`, `f2type`, `f2data`, `f2region` fields). Modules produce structured output (JSON + optional human-readable report) that can be stored and diffed against previous runs.

**Common interface:**
```
former2 module <module-name> \
  --input tmp/*.json \
  --output results/<module-name>/<timestamp>.json \
  --compare results/<module-name>/previous.json  # optional
```

Each module's output includes a `metadata` block (timestamp, input files, account IDs, resource counts) enabling reproducible comparisons.

---

## Module: inventory

**Purpose:** Produce a consolidated inventory of all resources across accounts with counts, breakdowns by service/type/region/account, and resource-level detail.

**Data available:** Every resource has `f2type`, `f2region`, and account identity (derivable from ARNs in `f2id` or filenames). Tags from `f2data.Tags` provide environment, team, and cost-centre classification.

**Output:**
- Total resource counts per account, per service, per type, per region
- Tag coverage report (what percentage of resources have `Environment`, `Team`, `CostCentre` tags)
- Resources missing standard tags
- Service footprint matrix: accounts vs services (which accounts use which services)

**Diff capability:** Compare inventory snapshots to detect new resources, removed resources, count changes, and tag coverage trends. Highlight accounts where resource counts changed significantly.

---

## Module: networking

**Purpose:** Map the full network topology across accounts, including VPCs, subnets, transit gateways, peering, load balancers, and security group rules.

**Data available:**
- `ec2.vpc`: CIDR blocks, VPC IDs, IPv6 associations (`f2data.CidrBlock`, `f2data.CidrBlockAssociationSet`)
- `ec2.subnet`: CIDR, AZ, VPC association, route table association (`f2data.CidrBlock`, `f2data.AvailabilityZone`, `f2data.VpcId`)
- `ec2.transitgateway` / `ec2.transitgatewayattachment`: Same TGW (`tgw-07f442e07be54ca64`) appears across all 9 accounts confirming shared transit
- `ec2.transitgatewayroutetable` / routes / associations / propagations: Full routing topology
- `ec2.securitygroup`: Inbound/outbound rules with CIDR and security group references (`f2data.IpPermissions`, `f2data.IpPermissionsEgress`)
- `ec2.natgateway`, `ec2.internetgateway`, `ec2.vpcendpoint`: Egress paths
- `ec2.route` / `ec2.routetable`: Route tables with destination and target mappings
- `elbv2.loadbalancer`: Scheme (internal/internet-facing), AZs, security groups
- `ram.resourceshare`: Cross-account shared resources (transit gateways, subnets, certificates)

**Output:**
- VPC inventory with CIDR allocations per account (detect overlaps)
- Transit gateway attachment map showing which accounts/VPCs connect to each TGW
- Subnet allocation table (used CIDRs, available space, AZ distribution)
- Security group rule matrix: which ports are open, to which CIDRs/groups, across accounts
- NAT gateway and internet gateway mapping
- VPC endpoint inventory
- Cross-account resource sharing summary (RAM shares)

**Diff capability:** Detect new/removed VPCs, CIDR changes, new transit gateway attachments, security group rule modifications, new NAT gateways. Flag when a previously internal-only account gains internet-facing resources.

---

## Module: security

**Purpose:** Audit security posture across accounts by analysing IAM configuration, encryption settings, public access, and security controls.

**Data available:**
- `iam.role`: Trust policies (`f2data.AssumeRolePolicyDocument`), attached policies, tags
- `iam.user`: Access keys (`iam.accesskey` resources with status, creation date), MFA devices (`iam.virtualmfadevice`)
- `iam.policy` / `iam.managedpolicy`: Policy documents with actions and resources
- `ec2.securitygroup`: Rules permitting `0.0.0.0/0` ingress
- `s3.bucket`: Public access block configuration (`f2data.PublicAccessBlockConfiguration`), encryption settings (`f2data.Encryption`)
- `rds.instance`: `PubliclyAccessible`, encryption, `DeletionProtection`, backup retention
- `kms.key`: Key policies, rotation status
- `secretsmanager.secret`: Rotation schedules (`secretsmanager.rotationschedule`), resource policies
- `cloudtrail.trail`: Whether trails are enabled and multi-region
- `waf.v2webacl`: WAF rules and default actions
- `ec2.instance`: IMDSv2 enforcement (`f2data.MetadataOptions.HttpTokens`), encryption on EBS volumes

**Output:**
- IAM users with access keys: age of keys, active/inactive status, MFA presence
- Roles with overly permissive trust policies (wildcard principals, cross-account without conditions)
- Roles with `AdministratorAccess` or `*:*` policies attached
- Security groups with `0.0.0.0/0` ingress on sensitive ports (22, 3389, 3306, 5432, 27017)
- S3 buckets without public access blocks or without encryption
- RDS instances that are publicly accessible or lack encryption
- EC2 instances not enforcing IMDSv2
- Secrets without rotation schedules
- Accounts missing CloudTrail or with single-region trails
- KMS keys without rotation enabled
- Deletion protection status on RDS, DynamoDB, CloudFormation stacks
- Overall security score per account

**Diff capability:** Track security posture over time. Alert on new IAM users, new access keys, relaxed security group rules, new publicly accessible resources, removed encryption, disabled rotation. Show improving/degrading trend per account.

---

## Module: cost-estimate

**Purpose:** Estimate monthly costs based on resource configurations using AWS pricing dimensions extracted from the raw data.

**Data available:**
- `ec2.instance`: `InstanceType` (e.g., `t3.medium`), region, platform (`PlatformDetails`), tenancy (`Placement.Tenancy`), EBS-optimized status
- `ec2.volume`: `VolumeType` (gp3, io1, etc.), `Size` (GB), `Iops`, `Throughput`
- `rds.instance`: `DBInstanceClass`, `Engine`, `EngineVersion`, `StorageType`, `AllocatedStorage`, `Iops`, `MultiAZ`, `StorageThroughput`
- `elasticache.cluster`: `CacheNodeType`, `Engine`, `NumCacheNodes`
- `elasticache.replicationgroup`: Node type, number of node groups, replicas per group
- `lambda.function`: `MemorySize`, `EphemeralStorage` (pricing is usage-based but config shows provisioned capacity)
- `dynamodb.table`: `BillingModeSummary.BillingMode`, `ProvisionedThroughput` (RCU/WCU)
- `elbv2.loadbalancer`: Type (ALB/NLB), scheme
- `ec2.natgateway`: Per-AZ fixed cost + data processing
- `ec2.elasticip`: Whether associated (unassociated EIPs incur charges)
- `cloudfront.distribution`: Price class (`f2data.DistributionConfig`)
- `ecs.taskdefinition`: CPU and memory allocations
- `efs.filesystem`: Throughput mode, storage class
- `s3.bucket`: Storage class (from lifecycle rules if present)
- `ec2.transitgateway` / attachments: Per-attachment hourly cost + data processing

**Output:**
- Per-resource estimated monthly cost (based on on-demand pricing)
- Per-account cost breakdown by service
- Top 10 most expensive resources per account
- Cost breakdown by resource type across all accounts
- Unattached/idle resources (unassociated EIPs, detached EBS volumes, stopped instances with attached storage)
- Right-sizing suggestions where instance types appear oversized relative to baseline metrics

**Diff capability:** Compare cost estimates across runs to show cost trajectory. Highlight new expensive resources, removed resources (savings), instance type changes, storage growth. Show delta per account and total.

---

## Module: drift

**Purpose:** Detect configuration drift between runs by comparing raw data snapshots taken at different points in time.

**Data available:** The full `f2data` blob for every resource provides a complete configuration snapshot. By comparing two snapshots of the same account, every field change is detectable.

**Output:**
- New resources (present in current run, absent in previous)
- Removed resources (present in previous, absent in current)
- Modified resources: field-level diff of `f2data` showing exactly what changed
- Filtered view excluding noisy fields (timestamps, event logs, deployment IDs)
- Summary statistics: counts of additions, removals, modifications per account/service
- Classification of changes: configuration change, scaling change, security change, tag change

**Diff capability:** This module IS the diff. Its core function is comparing two snapshots. Output can be further filtered to focus on specific resource types or specific field categories (e.g., show only security-relevant changes).

---

## Module: compliance

**Purpose:** Check resources against compliance frameworks and organisational standards, producing a pass/fail report.

**Data available:** All configuration details in `f2data` can be checked against rules. Key fields:
- Encryption at rest: `rds.instance` (`StorageEncrypted`), `ec2.volume` (encrypted flag in `BlockDeviceMappings`), `s3.bucket` (`Encryption`), `dynamodb.table` (`SSEDescription`), `efs.filesystem`, `elasticache` (`AtRestEncryptionEnabled`)
- Encryption in transit: `elasticache` (`TransitEncryptionEnabled`), `elbv2` listener protocols
- Backup configuration: `backup.backupplan` / `backup.backupselection` / `backup.backupvault`, RDS `BackupRetentionPeriod`
- Logging: `cloudtrail.trail`, `ec2.flowlog`, `s3.bucket` (logging config), `elbv2` access logs
- Tagging: All resources with `Tags` field
- Network isolation: Security group rules, public accessibility flags, VPC endpoint usage

**Output:**
- Rule-by-rule pass/fail per resource (e.g., "All RDS instances must have encryption at rest: 4/5 pass")
- Compliance score per account, per service, per framework
- Non-compliant resource list with remediation guidance
- Rule categories: encryption, backup, logging, access control, tagging, network isolation
- Support for custom rule definitions (JSON/YAML rule files)

**Diff capability:** Track compliance score trends. Show newly non-compliant resources, newly compliant resources (remediated), and overall compliance trajectory. Useful for demonstrating progress on remediation campaigns.

---

## Module: dependencies

**Purpose:** Map resource dependencies and relationships across and within accounts, producing a dependency graph.

**Data available:**
- `ecs.service`: References task definitions, load balancers, service registries, security groups, subnets
- `ecs.taskdefinition`: References IAM roles (`executionRoleArn`), ECR images (in `containerDefinitions`), log groups, secrets
- `lambda.function`: References IAM roles, VPC/subnets/security groups, layers, environment variables (may contain ARNs)
- `elbv2.loadbalancer` → listeners → rules → target groups: Full request routing chain
- `ec2.instance`: References security groups, subnets, key pairs, IAM instance profiles, AMIs
- `rds.instance`: References subnet groups, parameter groups, option groups, security groups, KMS keys
- `cloudfront.distribution`: References origins (S3, ALB, custom), WAF web ACLs, ACM certificates
- `route53.record`: References ALBs, CloudFront, S3 (alias targets)
- `apigateway.restapi` → resources → methods: API structure with Lambda integrations
- `cognito.userpool`: References Lambda triggers
- `codepipeline.pipeline`: References CodeBuild projects, CodeDeploy, S3 artifacts, connections
- `iam.role`: Trust relationships reference services and cross-account principals
- `secretsmanager.secret`: Referenced by task definitions and Lambda environment variables
- ARN cross-references: Many resources embed ARNs of other resources in their configuration

**Output:**
- Resource dependency graph (JSON adjacency list + optional DOT/Mermaid format for visualisation)
- Per-service dependency chain (e.g., Route53 → CloudFront → ALB → ECS Service → Task Definition → ECR Image)
- Cross-account dependencies (e.g., account A's ECS tasks pulling from account B's ECR repos)
- Orphaned resources: resources referenced by nothing (unused security groups, detached policies, unreferenced secrets)
- Blast radius analysis: given a resource, what depends on it directly and transitively
- Critical path identification: resources that many others depend on

**Diff capability:** Detect new dependencies, broken dependencies (resource referenced but no longer exists), changed dependency chains. Useful for understanding impact of planned changes.

---

## Module: iam-analysis

**Purpose:** Deep analysis of IAM configuration across accounts, focusing on privilege, trust relationships, and cross-account access patterns.

**Data available:**
- `iam.role`: Role names, trust policies (who can assume), attached managed policies, tags, path
- `iam.user`: User names, access keys, group memberships, inline/attached policies
- `iam.group`: Group memberships, attached policies
- `iam.policy` / `iam.managedpolicy`: Policy documents with Statement blocks (Effect, Action, Resource, Condition)
- `iam.instanceprofile`: Links roles to EC2 instances
- `iam.samlprovider`: Federation configuration
- `iam.oidcprovider`: OIDC identity providers (e.g., GitHub Actions, EKS)
- `iam.servicelinkedrole`: AWS-managed roles
- `iam.accessanalyzer`: External access findings
- `singlesignon.*`: SSO permission sets and assignments (in management account)

**Output:**
- Privilege escalation paths: roles that can assume other roles, creating chains
- Cross-account trust map: which external account IDs are trusted by which roles, with what conditions
- Service role inventory: which services have what level of access
- Unused/stale credentials: access keys by age, users without recent activity
- Policy complexity metrics: number of statements, wildcards in actions/resources
- SSO permission set mapping: who has access to what accounts via SSO
- SAML/OIDC provider inventory with trust configuration
- Instance profile to role mapping: which EC2 instances run with which roles
- Admin-equivalent role identification: roles with effectively unlimited permissions
- Cross-account role assumption graph

**Diff capability:** Detect new trust relationships, changed policies, new access keys, removed MFA, new admin-equivalent roles. Track credential age progression.

---

## Module: container-analysis

**Purpose:** Analyse containerised workloads across accounts, covering ECS services, task definitions, ECR repositories, and container configurations.

**Data available:**
- `ecs.cluster`: Cluster names, settings, capacity providers
- `ecs.service`: Desired/running/pending counts, deployment configuration, load balancer attachments, service discovery registries, scheduling strategy, launch type
- `ecs.taskdefinition`: Container definitions (image, CPU, memory, port mappings, environment variables, secrets, log configuration, health checks), network mode, task CPU/memory, execution role, volumes
- `ecr.repository`: Repository names, image scanning config, encryption, lifecycle policies
- `applicationautoscaling.scalabletarget` / `scalingpolicy`: Auto-scaling configuration for ECS services
- `servicediscovery.*`: Service mesh / Cloud Map configuration
- `codedeploy.application` / `deploymentgroup`: Blue/green deployment configuration

**Output:**
- Service inventory: all ECS services with their task definitions, container images, CPU/memory allocation, desired count
- Image provenance: which ECR repos are referenced by which task definitions, cross-account image pulls
- Resource allocation summary: total CPU/memory allocated vs available across clusters
- Environment variable and secrets audit: what configuration is injected into containers (flag hardcoded secrets)
- Scaling configuration: which services have auto-scaling, what the policies are, min/max/desired counts
- Deployment configuration: circuit breaker settings, deployment strategies, health check grace periods
- Service discovery mapping: which services register with Cloud Map
- Container logging: which services log where (CloudWatch log groups, log drivers)
- Port mapping and load balancer integration summary

**Diff capability:** Detect image version changes, scaling policy modifications, new/removed services, CPU/memory allocation changes, environment variable modifications. Track deployment configuration evolution.

---

## Module: data-stores

**Purpose:** Analyse all data storage resources (databases, caches, object stores, file systems) across accounts for capacity, configuration, and backup status.

**Data available:**
- `rds.instance`: Engine, version, instance class, storage type/size/IOPS, multi-AZ, backup retention, parameter groups, publicly accessible, encryption, deletion protection, auto minor version upgrade, maintenance window
- `dynamodb.table`: Billing mode (on-demand/provisioned), RCU/WCU, table size, item count, SSE, TTL, deletion protection, warm throughput
- `elasticache.cluster` / `replicationgroup`: Node type, engine/version, node count, encryption (at-rest, in-transit), auth, snapshot retention, parameter groups
- `s3.bucket`: Encryption config, public access blocks, ownership controls, analytics/inventory/metrics configurations
- `efs.filesystem` / `mounttarget` / `accesspoint`: Throughput mode, performance mode, encryption, mount targets per AZ
- `secretsmanager.secret` / rotation schedules: Secret inventory, rotation status
- `backup.*`: Backup plans, selections, vault inventory

**Output:**
- Database inventory: engine, version, instance class, storage, multi-AZ, backup retention per instance
- Database version currency: which engines/versions are current vs approaching EOL
- Storage capacity summary: total allocated storage by type (gp3, io1, etc.), total S3 buckets
- Backup coverage: which databases have backup plans, retention periods, vault inventory
- Cache topology: replication group structure, node distribution, engine versions
- DynamoDB capacity summary: on-demand vs provisioned, total RCU/WCU, table sizes
- Encryption coverage: which data stores have encryption at rest / in transit
- Maintenance window alignment: identify overlapping or misaligned maintenance windows
- Parameter group analysis: non-default parameter settings across databases

**Diff capability:** Track storage growth, engine version changes, backup configuration modifications, scaling changes, new/removed data stores. Alert on reduced backup retention or removed encryption.

---

## Module: dns-and-certificates

**Purpose:** Map DNS configuration and certificate management across accounts.

**Data available:**
- `route53.hostedzone`: Zone names, record counts, public/private
- `route53.record`: Record type, name, value, alias targets, TTL, routing policy, health check associations
- `route53.healthcheck`: Health check configurations and targets
- `acm.certificate`: Domain names, SANs, status, issuer, expiry, validation method, in-use status
- `cloudfront.distribution`: Custom domain names (CNAMEs), viewer certificate configuration
- `elbv2.loadbalancerlistenercertificate`: Certificate associations on load balancers
- `cognito.userpooldomain` / `userpool`: Custom domains on Cognito

**Output:**
- DNS zone inventory: all hosted zones across accounts, public vs private, record counts
- Complete DNS record map: all records with their targets, organised by zone
- Certificate inventory: all ACM certificates with domains, expiry dates, validation status, renewal eligibility
- Certificate usage map: which certificates are attached to which resources (CloudFront, ALB, API Gateway)
- Expiring certificates: certificates approaching expiry (30/60/90 day windows)
- Unused certificates: certificates not attached to any resource
- DNS-to-resource mapping: which DNS names point to which infrastructure resources
- Health check inventory and target mapping
- Cross-account DNS delegation detection

**Diff capability:** Detect DNS record changes, new/removed zones, certificate expiry progression, new certificate issuances, changed routing policies. Critical for tracking domain and certificate lifecycle.

---

## Module: tagging

**Purpose:** Audit and analyse resource tagging across accounts for governance, cost allocation, and organisational standards compliance.

**Data available:** Most resource types include a `Tags` array in `f2data` (format: `[{Key, Value}]`). Some use `tags` (lowercase) or `TagList`. The tag data is available on EC2 instances, RDS instances, Lambda functions, ECS services, S3 buckets, IAM roles, and most other resource types.

**Output:**
- Tag coverage matrix: for each standard tag key (e.g., `Environment`, `Team`, `CostCentre`, `Application`, `Owner`), what percentage of resources across each account have that tag
- Untagged resources list: resources missing required tags, grouped by account and service
- Tag value consistency: detect variant spellings (e.g., `prod` vs `production` vs `Production`)
- Tag key inventory: all unique tag keys in use across all accounts, with frequency counts
- Per-account tagging scorecard
- Tag-based resource grouping: cluster resources by application/team/environment tags
- Cost allocation tag readiness: identify resources that would be invisible to cost allocation reports

**Diff capability:** Track tagging compliance improvement over time. Show newly tagged resources, newly untagged resources (tags removed), tag value changes. Measure progress on tagging campaigns.

---

## Module: diagram

**Purpose:** Generate architecture diagrams from resource data, showing relationships between services within and across accounts.

**Data available:** All resource types plus their cross-references (security group IDs, subnet IDs, VPC IDs, role ARNs, target group ARNs, etc.). The existing Former2 codebase already has `shared/relationships.js` defining resource relationship mappings.

**Output:**
- Per-account architecture diagram (Mermaid, DOT, or draw.io XML)
- Network topology diagram: VPCs, subnets, transit gateways, NAT gateways, internet gateways
- Cross-account connectivity diagram: transit gateway hub with spoke accounts
- Application stack diagrams: Route53 → CloudFront → ALB → ECS → RDS chains
- Security group relationship diagram: which groups reference which other groups
- IAM trust relationship diagram: cross-account role assumption paths

**Diff capability:** Visual diff showing added/removed resources and connections between runs. Highlight new cross-account connections or removed network paths.

---

## Module: waste

**Purpose:** Identify unused, underutilised, or unnecessary resources that represent wasted spend.

**Data available:**
- `ec2.elasticip`: Check for association — unassociated EIPs incur charges
- `ec2.volume`: Check for attachment — detached EBS volumes cost money
- `ec2.instance`: Stopped instances still incur EBS costs; instance types may be oversized
- `elbv2.loadbalancer` / `targetgroup`: Load balancers with no healthy targets or no listeners
- `ec2.securitygroup`: Unreferenced security groups (not attached to any ENI or resource)
- `ecr.repository`: Repositories with no images or excessive untagged images
- `iam.role`: Roles with no recent usage (creation date vs last used)
- `iam.accesskey`: Keys that are active but potentially unused
- `iam.user`: Users with no activity
- `lambda.function`: Functions with no triggers or invocations (code size but no event source mappings)
- `ec2.networkinterface`: Detached ENIs
- `s3.bucket`: Empty buckets or buckets without lifecycle policies
- `cloudwatch.loggroup`: Log groups with high stored bytes but no retention policy (storing indefinitely)
- `rds.instance`: Stopped instances (still incur storage costs)
- `ec2.keypair`: Key pairs not referenced by any instance

**Output:**
- Waste inventory: every identified wasteful resource with category (unused, detached, oversized, indefinite retention)
- Estimated monthly waste per resource and per account
- Prioritised remediation list: highest-cost waste items first
- Quick wins: resources that can be cleaned up with no risk (detached volumes, unassociated EIPs)
- CloudWatch log groups without retention policies and their stored bytes

**Diff capability:** Track waste reduction over time. Show remediated items, new waste introduced, total waste trajectory. Gamify cleanup by showing savings achieved between runs.

---

## Module: multi-account-topology

**Purpose:** Provide a holistic view of the multi-account organisation structure, shared resources, and cross-account relationships.

**Data available:**
- `organizations.organization` / `organizations.account` / `organizations.organizationalunit`: Org structure (in management account)
- `organizations.policyattachment`: SCPs and other org policies
- `ram.resourceshare`: Cross-account resource sharing (transit gateways, subnets, ACM certificates)
- `ec2.transitgateway` / attachments: Same TGW ID appearing across accounts confirms shared networking
- `iam.role` trust policies: Cross-account role assumption (account IDs in Principal)
- `iam.samlprovider` / `iam.oidcprovider`: Centralised vs per-account identity providers
- `singlesignon.*`: SSO configuration in management account
- `ecr.repository` / `ecr.registrypolicy`: Cross-account image sharing
- Account IDs extractable from ARNs in every resource

**Output:**
- Organisation tree: OU hierarchy with accounts
- Account purpose classification (management, networking/shared services, workload accounts) based on resource patterns
- Cross-account connectivity matrix: which accounts can reach which via networking, IAM, or resource sharing
- Shared resource inventory: resources shared via RAM with which accounts
- Transit gateway hub topology: central networking account with spoke attachments
- SSO access map: which permission sets grant access to which accounts
- Cross-account IAM trust graph: which accounts trust which others for role assumption
- SCP coverage: which policies apply to which OUs/accounts
- Account symmetry analysis: identify inconsistencies between accounts that should be similar (e.g., brand-* accounts)

**Diff capability:** Detect new accounts, changed OU structure, new cross-account trusts, modified resource shares. Track organisational evolution over time.

---

## Implementation Priority

| Priority | Module | Value | Complexity | Cross-Account |
|----------|--------|-------|------------|---------------|
| 1 | inventory | High — foundational for all other modules | Low | Yes |
| 2 | security | High — immediate actionable findings | Medium | Yes |
| 3 | cost-estimate | High — direct business value | Medium | Yes |
| 4 | networking | High — critical for multi-account setups | Medium | Yes |
| 5 | waste | High — immediate cost savings | Low | Yes |
| 6 | tagging | Medium — governance enabler | Low | Yes |
| 7 | drift | Medium — operational visibility | Low | Yes |
| 8 | dependencies | Medium — architecture understanding | High | Yes |
| 9 | iam-analysis | High — security depth | High | Yes |
| 10 | compliance | Medium — builds on security module | Medium | Yes |
| 11 | container-analysis | Medium — targeted at ECS-heavy orgs | Medium | Partial |
| 12 | data-stores | Medium — targeted at data-heavy orgs | Medium | Partial |
| 13 | dns-and-certificates | Medium — operational hygiene | Low | Yes |
| 14 | diagram | Medium — visualisation aid | High | Yes |
| 15 | multi-account-topology | High — unique multi-account value | High | Yes |

### Recommended first batch: inventory, security, cost-estimate, waste, tagging

These five modules are low-to-medium complexity, deliver immediate actionable value, and exercise the core diff/compare capability. The `inventory` module also serves as the foundation that other modules can build on for resource lookups and cross-referencing.

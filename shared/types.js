/**
 * Shared type definitions for Former2.
 *
 * This module defines the contracts that all shared code conforms to.
 * It is the foundation for decoupling service logic from both the CLI
 * (VM sandbox) and browser (DOM/jQuery) environments.
 *
 * @module shared/types
 */

// ── Sdkcall ─────────────────────────────────────────────────────────

/**
 * AWS SDK call function.
 *
 * Both the CLI (v3) and browser (v2) provide their own implementation.
 * Services receive this via the context object and must never import
 * an SDK directly.
 *
 * Pagination is handled internally — callers receive the fully-merged
 * response for paginated APIs.
 *
 * @callback SdkcallFn
 * @param {string} service    - AWS service constructor name (e.g. 'S3', 'EC2', 'DynamoDB')
 * @param {string} method     - API method name (e.g. 'listBuckets', 'describeInstances')
 * @param {Object} params     - Request parameters passed to the SDK call
 * @param {boolean} alertOnErrors - true to surface errors to the user, false to silently reject
 * @param {number} [backoff]  - Internal retry backoff in ms (callers should not set this)
 * @returns {Promise<Object>} Resolves with the API response data
 */

// ── Context ─────────────────────────────────────────────────────────

/**
 * Dependency-injection context passed to every service function.
 *
 * Replaces the implicit globals that service files currently rely on
 * (`sdkcall`, `region`, `getResourceTags`, etc.).
 *
 * @typedef {Object} Former2Context
 * @property {SdkcallFn} sdkcall
 *   AWS SDK call function — v3 in the CLI, v2 in the browser.
 *
 * @property {string} region
 *   Current AWS region (e.g. 'us-east-1'). Used for `f2region` on
 *   every resource record and passed through to SDK configuration.
 *
 * @property {GetResourceTagsFn} getResourceTags
 *   Async tag lookup by ARN. Returns a tags array or null.
 *
 * @property {StripAWSTagsFn} stripAWSTags
 *   Removes aws:-prefixed tags from tag arrays/objects. Used in
 *   mapping functions before writing to CloudFormation/Terraform output.
 *
 * @property {typeof import('../js/deepmerge')} deepmerge
 *   Paginated response merging (npm deepmerge). Used by services that
 *   need to merge sub-paginated results beyond what sdkcall handles.
 *
 * @property {boolean} [include_default_resources]
 *   When true, include default VPCs, subnets, security groups, etc.
 *   Checked by EC2/VPC services. Defaults to false.
 *
 * @property {Function} [blockUI]
 *   No-op in the CLI. In the browser, shows a loading overlay on a
 *   datatable section. Signature: (selector: string) => void.
 *
 * @property {Function} [unblockUI]
 *   No-op in the CLI. In the browser, removes the loading overlay.
 *   Signature: (selector: string) => void.
 */

/**
 * Async tag lookup by ARN.
 *
 * Uses ResourceGroupsTaggingAPI under the hood. Results are cached
 * (20 s TTL in the browser implementation). Returns null on failure.
 *
 * @callback GetResourceTagsFn
 * @param {string} arn - The resource ARN to look up tags for
 * @returns {Promise<Array<{Key: string, Value: string}>|null>}
 */

/**
 * Strip AWS-managed tags (keys starting with "aws:") from a tag
 * collection. Handles both array-of-objects and plain-object formats.
 *
 * @callback StripAWSTagsFn
 * @param {Array<{Key: string, Value: string}>|Object} tags
 * @returns {Array<{Key: string, Value: string}>|Object}
 */

// ── Service Module ──────────────────────────────────────────────────

/**
 * The export shape of a converted service module.
 *
 * Each of the 139 service files exports exactly these three members.
 *
 * @typedef {Object} ServiceModule
 * @property {SectionDefinition} section
 *   UI section metadata — category, service name, and resource type
 *   column definitions. Previously pushed to the global `sections[]`.
 *
 * @property {UpdateDatatableFn} updateDatatable
 *   Data-collection function. Calls the AWS API via `context.sdkcall`
 *   and returns the discovered resources. Previously mutated the DOM
 *   via `deferredBootstrapTable('append', ...)`.
 *
 * @property {MapResourcesFn} mapResources
 *   IaC mapping function. Translates a resource record into
 *   CloudFormation, Terraform, CDK, etc. parameter bags. Previously
 *   pushed to the global `service_mapping_functions[]`.
 */

// ── Section Definition ──────────────────────────────────────────────

/**
 * Metadata describing a service section in the UI.
 *
 * @typedef {Object} SectionDefinition
 * @property {string} category
 *   Top-level AWS category (e.g. 'Storage', 'Compute',
 *   'Networking & Content Delivery').
 *
 * @property {string} service
 *   AWS service name (e.g. 'S3', 'EC2', 'Lambda').
 *
 * @property {Object<string, ResourceTypeDefinition>} resourcetypes
 *   Map from human-readable resource type name (e.g. 'Buckets',
 *   'Instances') to its column definitions.
 */

/**
 * Column layout for a single resource type's datatable.
 *
 * The `columns` array contains one or more rows of column definitions
 * (Bootstrap Table header rows).
 *
 * @typedef {Object} ResourceTypeDefinition
 * @property {Array<Array<ColumnDefinition>>} columns
 */

/**
 * A single column in a Bootstrap Table header row.
 *
 * @typedef {Object} ColumnDefinition
 * @property {string} field      - Property name on the row object
 * @property {string} title      - Display header text
 * @property {boolean} sortable  - Whether the column is sortable
 * @property {boolean} editable  - Whether the column is inline-editable
 * @property {string} [formatter] - Formatter function name (e.g. 'primaryFieldFormatter')
 * @property {number} [colspan]  - Header colspan
 * @property {string} [align]    - Text alignment
 * @property {boolean} [footerFormatter] - Footer formatter flag
 * @property {boolean} [visible] - Column visibility
 */

// ── UpdateDatatable ─────────────────────────────────────────────────

/**
 * Data-collection function for a single AWS service.
 *
 * Calls `context.sdkcall` to discover resources and returns them as a
 * flat array of {@link ResourceRecord} objects. A single service may
 * return multiple resource types (differentiated by `f2type`).
 *
 * Must not perform any DOM manipulation.
 *
 * @callback UpdateDatatableFn
 * @param {Former2Context} context - Injected dependencies
 * @returns {Promise<Array<ResourceRecord>>} Collected resources
 */

/**
 * A single discovered AWS resource.
 *
 * This is the universal record shape that both the CLI and browser
 * consume. The CLI uses `f2id`, `f2type`, `f2data`, and `f2region`
 * for IaC mapping. The browser additionally renders display fields
 * into datatable rows.
 *
 * @typedef {Object} ResourceRecord
 * @property {string} f2id
 *   Unique resource identifier — typically the resource name, ID, or
 *   ARN (e.g. 'my-bucket', 'i-0abc123', 'arn:aws:lambda:...').
 *
 * @property {string} f2type
 *   Resource type key in `service.resourcetype` format
 *   (e.g. 's3.bucket', 'ec2.instance', 'lambda.function').
 *
 * @property {Object} f2data
 *   Full API response data for the resource. Passed to mapResources
 *   as `obj.data` during IaC generation.
 *
 * @property {string} f2region
 *   AWS region where the resource was discovered
 *   (e.g. 'us-east-1', 'ap-southeast-2').
 *
 * @property {string} [f2link]
 *   AWS console URL for the resource. Optional — primarily used by
 *   the browser UI.
 *
 * Additional display fields are stored as flat properties directly on
 * the record (e.g. `name`, `arn`, `state` — not nested in a sub-object).
 * Keys correspond to `field` values in the service's {@link ColumnDefinition}s.
 */

// ── MapResources ────────────────────────────────────────────────────

/**
 * IaC mapping function for a single service.
 *
 * Examines `obj.type` and populates `reqParams` sub-objects for each
 * output format (CloudFormation, Terraform, CDK, etc.). If the
 * resource type is handled, pushes a tracked-resource entry and
 * returns true.
 *
 * @callback MapResourcesFn
 * @param {ReqParams} reqParams
 *   Mutable parameter bags, one per output format. The mapping
 *   function populates whichever formats it supports.
 *
 * @param {MappingObject} obj
 *   The resource to map — derived from a {@link ResourceRecord}.
 *
 * @param {Array<TrackedResource>} tracked_resources
 *   Mutable array. Push a {@link TrackedResource} entry when the
 *   resource type is handled.
 *
 * @returns {boolean}
 *   true if this function handled `obj.type`, false otherwise.
 */

/**
 * Parameter bags for IaC output generation.
 *
 * Each sub-object is populated by the mapping function with
 * provider-specific property names and values.
 *
 * @typedef {Object} ReqParams
 * @property {Object} cfn      - CloudFormation template properties
 * @property {Object} tf       - Terraform resource arguments
 * @property {Object} boto3    - Boto3 (Python SDK) parameters
 * @property {Object} go       - AWS SDK for Go parameters
 * @property {Object} cli      - AWS CLI parameters
 * @property {Object} pulumi   - Pulumi resource arguments
 * @property {Object} cdktf    - CDK for Terraform arguments
 * @property {Object} iam      - IAM policy statements
 */

/**
 * Resource object as seen by mapping functions.
 *
 * Derived from {@link ResourceRecord} — the loader translates
 * `f2id` → `id`, `f2type` → `type`, etc.
 *
 * @typedef {Object} MappingObject
 * @property {string} id       - Resource identifier (from f2id)
 * @property {string} type     - Resource type key (from f2type)
 * @property {Object} data     - Full API response data (from f2data)
 * @property {string} region   - AWS region (from f2region)
 */

/**
 * Entry pushed to `tracked_resources` by a mapping function.
 *
 * @typedef {Object} TrackedResource
 * @property {MappingObject} obj          - The mapped resource object
 * @property {string} logicalId           - Logical resource name (from getResourceName)
 * @property {string} region              - AWS region
 * @property {string} service             - Service key (e.g. 's3', 'ec2')
 * @property {string} type                - CloudFormation resource type (e.g. 'AWS::S3::Bucket')
 * @property {ReqParams} options          - Populated parameter bags
 * @property {Object} [returnValues]      - CloudFormation return value mappings (Ref, GetAtt)
 * @property {string} [terraformType]     - Terraform resource type (e.g. 'aws_s3_bucket')
 */

// ── Utility Functions (used inside mapResources) ────────────────────

/**
 * Generates a logical resource name for IaC output.
 *
 * Called inside mapResources to produce CloudFormation logical IDs
 * and Terraform resource names.
 *
 * @callback GetResourceNameFn
 * @param {string} service    - Service key (e.g. 's3', 'ec2')
 * @param {string} resourceId - Resource identifier (e.g. bucket name, instance ID)
 * @param {string} cfnType    - CloudFormation type (e.g. 'AWS::S3::Bucket')
 * @returns {string} Logical resource name
 */

module.exports = {};

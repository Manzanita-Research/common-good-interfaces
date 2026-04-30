export const COMMON_GOOD_PREFIX = "/common-good";
export const COMMON_GOOD_WELL_KNOWN = "/.well-known/common-good-interface";
export const AGENT_AUTH_WELL_KNOWN = "/.well-known/agent-configuration";

export type JsonPrimitive = string | number | boolean | null;
export type JsonValue = JsonPrimitive | JsonValue[] | { [key: string]: JsonValue };

export type JSONSchema7TypeName = "string" | "number" | "integer" | "boolean" | "object" | "array" | "null";
export type JSONSchema7Type = JsonValue;
export type JSONSchema7Definition = JSONSchema7 | boolean;

export interface JSONSchema7 {
  $id?: string;
  $ref?: string;
  $schema?: string;
  $comment?: string;
  type?: JSONSchema7TypeName | JSONSchema7TypeName[];
  title?: string;
  description?: string;
  default?: JSONSchema7Type;
  examples?: JSONSchema7Type[];
  readOnly?: boolean;
  writeOnly?: boolean;
  multipleOf?: number;
  maximum?: number;
  exclusiveMaximum?: number;
  minimum?: number;
  exclusiveMinimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  additionalItems?: JSONSchema7Definition;
  items?: JSONSchema7Definition | JSONSchema7Definition[];
  maxItems?: number;
  minItems?: number;
  uniqueItems?: boolean;
  contains?: JSONSchema7Definition;
  maxProperties?: number;
  minProperties?: number;
  required?: string[];
  additionalProperties?: JSONSchema7Definition;
  definitions?: Record<string, JSONSchema7Definition>;
  properties?: Record<string, JSONSchema7Definition>;
  patternProperties?: Record<string, JSONSchema7Definition>;
  dependencies?: Record<string, JSONSchema7Definition | string[]>;
  propertyNames?: JSONSchema7Definition;
  const?: JSONSchema7Type;
  enum?: JSONSchema7Type[];
  format?: string;
  contentMediaType?: string;
  contentEncoding?: string;
  if?: JSONSchema7Definition;
  then?: JSONSchema7Definition;
  else?: JSONSchema7Definition;
  allOf?: JSONSchema7Definition[];
  anyOf?: JSONSchema7Definition[];
  oneOf?: JSONSchema7Definition[];
  not?: JSONSchema7Definition;
  [key: string]: unknown;
}

export type JsonSchema = JSONSchema7;

export interface AgentAuthCapability {
  name: string;
  description: string;
  input?: JSONSchema7;
  output?: JSONSchema7;
  location?: string;
  grant_status?: "active" | "pending" | "denied" | "revoked" | "granted";
}

export interface BinletPolicy {
  auth?: {
    adapter: string;
    required: boolean;
    capabilities?: string[];
  };
  payment?: {
    adapter: string;
    required: boolean;
    mode?: "per_call" | "session" | "free";
  };
  moderation?: {
    adapter: string;
    required: boolean;
  };
  email?: {
    adapter: string;
    required: boolean;
  };
}

export interface BinletManifest {
  id: string;
  name: string;
  description: string;
  route: string;
  version: string;
  interfaces: {
    html?: string;
    json?: string;
    websocket?: string;
    manifest?: string;
    view?: string;
    orpc?: string;
    openapi?: string;
    agentauth?: string;
  };
  capabilities: AgentAuthCapability[];
  policies: BinletPolicy;
}

export interface CommonGoodManifest {
  version: "0.1.0";
  name: string;
  description: string;
  route_prefix: string;
  binlets: BinletManifest[];
  interfaces: {
    common_good: string;
    agentauth?: string;
  };
}

export interface AgentAuthConfigurationStub {
  version: "1.0-draft";
  provider_name: string;
  description: string;
  issuer: string;
  default_location: string;
  algorithms: ["Ed25519"];
  modes: ["delegated", "autonomous"];
  approval_methods: ["not_implemented"];
  implementation_status: "stub";
  endpoints: {
    register: string;
    capabilities: string;
    describe_capability: string;
    execute: string;
    request_capability: string;
    status: string;
    reactivate: string;
    revoke: string;
    revoke_host: string;
    rotate_key: string;
    rotate_host_key: string;
    introspect: string;
  };
}

export interface AuthDecision {
  ok: boolean;
  principal?: string;
  reason?: string;
}

export interface PaymentDecision {
  ok: boolean;
  receipt?: string;
  reason?: string;
}

export interface ModerationDecision {
  ok: boolean;
  action: "allow" | "quarantine" | "reject";
  reason?: string;
}

export interface EmailDecision {
  ok: boolean;
  messageId?: string;
  reason?: string;
}

export interface AuthAdapter {
  name: string;
  authorize(request: Request, manifest: BinletManifest): Promise<AuthDecision>;
}

export interface PaymentAdapter {
  name: string;
  requirePayment(request: Request, manifest: BinletManifest): Promise<PaymentDecision>;
}

export interface ModerationAdapter {
  name: string;
  moderate(input: JsonValue, manifest: BinletManifest): Promise<ModerationDecision>;
}

export interface EmailAdapter {
  name: string;
  send(input: JsonValue, manifest: BinletManifest): Promise<EmailDecision>;
}

export interface PolicyAdapters {
  auth: AuthAdapter;
  payment: PaymentAdapter;
  moderation: ModerationAdapter;
  email: EmailAdapter;
}

export const noopAuthAdapter: AuthAdapter = {
  name: "noop-auth",
  async authorize() {
    return { ok: true, principal: "anonymous" };
  }
};

export const noopPaymentAdapter: PaymentAdapter = {
  name: "noop-payment",
  async requirePayment() {
    return { ok: true, receipt: "free" };
  }
};

export const noopModerationAdapter: ModerationAdapter = {
  name: "noop-moderation",
  async moderate() {
    return { ok: true, action: "allow" };
  }
};

export const noopEmailAdapter: EmailAdapter = {
  name: "noop-email",
  async send() {
    return { ok: true, messageId: "not-sent" };
  }
};

export const noopPolicyAdapters: PolicyAdapters = {
  auth: noopAuthAdapter,
  payment: noopPaymentAdapter,
  moderation: noopModerationAdapter,
  email: noopEmailAdapter
};

export function defineBinlet(manifest: BinletManifest): BinletManifest {
  assertSnakeCaseCapabilities(manifest.capabilities);
  return manifest;
}

export function createCommonGoodManifest(input: {
  origin: string;
  name: string;
  description: string;
  binlets: BinletManifest[];
}): CommonGoodManifest {
  return {
    version: "0.1.0",
    name: input.name,
    description: input.description,
    route_prefix: COMMON_GOOD_PREFIX,
    binlets: input.binlets,
    interfaces: {
      common_good: absoluteUrl(input.origin, COMMON_GOOD_WELL_KNOWN),
      agentauth: absoluteUrl(input.origin, AGENT_AUTH_WELL_KNOWN)
    }
  };
}

export function createAgentAuthConfigurationStub(input: {
  origin: string;
  providerName: string;
  description: string;
}): AgentAuthConfigurationStub {
  const issuer = input.origin;

  return {
    version: "1.0-draft",
    provider_name: input.providerName,
    description: input.description,
    issuer,
    default_location: absoluteUrl(input.origin, "/capability/execute"),
    algorithms: ["Ed25519"],
    modes: ["delegated", "autonomous"],
    approval_methods: ["not_implemented"],
    implementation_status: "stub",
    endpoints: {
      register: "/agent/register",
      capabilities: "/capability/list",
      describe_capability: "/capability/describe",
      execute: "/capability/execute",
      request_capability: "/agent/request-capability",
      status: "/agent/status",
      reactivate: "/agent/reactivate",
      revoke: "/agent/revoke",
      revoke_host: "/host/revoke",
      rotate_key: "/agent/rotate-key",
      rotate_host_key: "/host/rotate-key",
      introspect: "/agent/introspect"
    }
  };
}

export function absoluteUrl(origin: string, path: string): string {
  const normalizedOrigin = origin.endsWith("/") ? origin.slice(0, -1) : origin;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedOrigin}${normalizedPath}`;
}

export function binletPath(id: string): string {
  return `${COMMON_GOOD_PREFIX}/${id}`;
}

export function binletJsonPath(id: string): string {
  return `${binletPath(id)}.json`;
}

export function binletManifestPath(id: string): string {
  return `${binletPath(id)}.manifest.json`;
}

export function binletViewPath(id: string): string {
  return `${binletPath(id)}.view.json`;
}

export function binletLivePath(id: string): string {
  return `${binletPath(id)}/live`;
}

function assertSnakeCaseCapabilities(capabilities: AgentAuthCapability[]): void {
  const snakeCase = /^[a-z0-9_]+$/;

  for (const capability of capabilities) {
    if (!snakeCase.test(capability.name)) {
      throw new Error(`AgentAuth capability names must be snake_case: ${capability.name}`);
    }
  }
}

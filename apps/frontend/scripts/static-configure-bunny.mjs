import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const scriptDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(scriptDir, '../../..');
const config = {
  ...(await readEnvFile(path.join(repoRoot, '.env.deploy'))),
  ...Object.fromEntries(
    Object.entries(process.env).filter(([key]) => key.startsWith('BUNNY_')),
  ),
};
const apply = process.argv.includes('--apply');
const pullZoneId = config.BUNNY_PULL_ZONE_ID;
const accessKey = config.BUNNY_PURGE_API_KEY;

if (!pullZoneId || !accessKey) {
  throw new Error('BUNNY_PULL_ZONE_ID and BUNNY_PURGE_API_KEY are required.');
}

const managedPrefix = '[my-website]';
const desiredRules = [
  responseHeaderRule(
    'Security: content-type sniffing',
    'X-Content-Type-Options',
    'nosniff',
    10,
  ),
  responseHeaderRule(
    'Security: referrer policy',
    'Referrer-Policy',
    'strict-origin-when-cross-origin',
    11,
  ),
  responseHeaderRule(
    'Security: frame protection',
    'X-Frame-Options',
    'SAMEORIGIN',
    12,
  ),
  cacheRule('Cache: hashed Nuxt assets', '*://www.aslanfrench.work/_nuxt/*', {
    browserSeconds: 31_536_000,
    edgeSeconds: 31_536_000,
    order: 20,
  }),
  cacheRule('Cache: licensed fonts', '*://www.aslanfrench.work/fonts/*', {
    browserSeconds: 2_592_000,
    edgeSeconds: 2_592_000,
    order: 21,
  }),
  cacheRule('Cache: versioned site images', '*://www.aslanfrench.work/images/*', {
    browserSeconds: 604_800,
    edgeSeconds: 2_592_000,
    order: 22,
  }),
  cacheRule('Cache: CMS media', '*://www.aslanfrench.work/media/*', {
    browserSeconds: 604_800,
    edgeSeconds: 2_592_000,
    order: 23,
  }),
];

const pullZone = await bunnyRequest(`/pullzone/${pullZoneId}`);
const existingRules = pullZone.EdgeRules || [];
const existingManaged = existingRules.filter((rule) =>
  rule.Description?.startsWith(managedPrefix),
);

console.log('Bunny production edge configuration');
console.log('');
console.log(`Mode: ${apply ? 'apply' : 'dry run'}`);
console.log(`Pull zone: ${pullZone.Name} (${pullZoneId})`);
console.log(`Existing unmanaged rules preserved: ${existingRules.length - existingManaged.length}`);
console.log(`Managed rules desired: ${desiredRules.length}`);
console.log('');

for (const desiredRule of desiredRules) {
  const currentRule = existingManaged.find(
    (rule) => rule.Description === desiredRule.Description,
  );
  const status = currentRule
    ? rulesMatch(currentRule, desiredRule)
      ? 'unchanged'
      : 'update'
    : 'add';

  console.log(`- ${status}: ${desiredRule.Description}`);

  if (apply && status !== 'unchanged') {
    await bunnyRequest(`/pullzone/${pullZoneId}/edgerules/addOrUpdate`, {
      body: JSON.stringify({
        ...desiredRule,
        ...(currentRule?.Guid ? { Guid: currentRule.Guid } : {}),
      }),
      method: 'POST',
    });
  }
}

if (!apply) {
  console.log('');
  console.log('Nothing changed. Add --apply to create or update these rules.');
} else {
  const updatedPullZone = await bunnyRequest(`/pullzone/${pullZoneId}`);
  const updatedRules = updatedPullZone.EdgeRules || [];

  for (const desiredRule of desiredRules) {
    const actualRule = updatedRules.find(
      (rule) => rule.Description === desiredRule.Description,
    );

    if (!actualRule || !rulesMatch(actualRule, desiredRule)) {
      throw new Error(`Bunny did not persist ${desiredRule.Description}.`);
    }
  }

  console.log('');
  console.log('Managed cache and security-header rules are active.');
}

function responseHeaderRule(description, headerName, headerValue, order) {
  return {
    ActionType: 5,
    ActionParameter1: headerName,
    ActionParameter2: headerValue,
    ActionParameter3: '',
    Description: `${managedPrefix} ${description}`,
    Enabled: true,
    ExtraActions: [],
    OrderIndex: order,
    TriggerMatchingType: 0,
    Triggers: [urlTrigger('*://www.aslanfrench.work/*')],
  };
}

function cacheRule(
  description,
  pattern,
  { browserSeconds, edgeSeconds, order },
) {
  return {
    ActionType: 16,
    ActionParameter1: String(browserSeconds),
    ActionParameter2: '',
    ActionParameter3: '',
    Description: `${managedPrefix} ${description}`,
    Enabled: true,
    ExtraActions: [
      {
        ActionType: 3,
        ActionParameter1: String(edgeSeconds),
        ActionParameter2: '',
        ActionParameter3: '',
      },
    ],
    OrderIndex: order,
    TriggerMatchingType: 0,
    Triggers: [urlTrigger(pattern)],
  };
}

function urlTrigger(pattern) {
  return {
    Type: 0,
    PatternMatches: [pattern],
    PatternMatchingType: 0,
    Parameter1: '',
  };
}

function rulesMatch(actual, desired) {
  return JSON.stringify(normalizeRule(actual)) === JSON.stringify(normalizeRule(desired));
}

function normalizeRule(rule) {
  return {
    ActionType: rule.ActionType,
    ActionParameter1: rule.ActionParameter1 || '',
    ActionParameter2: rule.ActionParameter2 || '',
    ActionParameter3: rule.ActionParameter3 || '',
    Description: rule.Description,
    Enabled: Boolean(rule.Enabled),
    ExtraActions: (rule.ExtraActions || []).map((action) => ({
      ActionType: action.ActionType,
      ActionParameter1: action.ActionParameter1 || '',
      ActionParameter2: action.ActionParameter2 || '',
      ActionParameter3: action.ActionParameter3 || '',
    })),
    OrderIndex: rule.OrderIndex,
    TriggerMatchingType: rule.TriggerMatchingType,
    Triggers: (rule.Triggers || []).map((trigger) => ({
      Type: trigger.Type,
      PatternMatches: trigger.PatternMatches || [],
      PatternMatchingType: trigger.PatternMatchingType,
      Parameter1: trigger.Parameter1 || '',
    })),
  };
}

async function bunnyRequest(apiPath, options = {}) {
  const response = await fetch(`https://api.bunny.net${apiPath}`, {
    ...options,
    headers: {
      AccessKey: accessKey,
      'content-type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const responseText = await response.text();
    throw new Error(
      `Bunny API request failed: ${response.status} ${response.statusText} ${responseText.slice(0, 300)}`,
    );
  }

  const responseText = await response.text();
  return responseText ? JSON.parse(responseText) : null;
}

async function readEnvFile(filePath) {
  const env = {};
  const content = await readFile(filePath, 'utf8');

  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#')) continue;

    const separator = trimmed.indexOf('=');

    if (separator < 1) continue;

    const key = trimmed.slice(0, separator).trim();
    const rawValue = trimmed.slice(separator + 1).trim();
    env[key] = stripQuotes(rawValue);
  }

  return env;
}

function stripQuotes(value) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }

  return value;
}

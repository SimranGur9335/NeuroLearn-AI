const crypto = require('crypto');
const { createClient } = require('@supabase/supabase-js');

const header = { alg: "HS256", typ: "JWT" };
const payload = {
  iss: "supabase",
  ref: "nowepoiasehxhkebkqkf",
  role: "anon",
  iat: 1725996800,
  exp: 2041572800
};

const base64UrlEncode = (obj) => {
  const str = JSON.stringify(obj);
  return Buffer.from(str).toString('base64url');
};

const signJWT = (secret) => {
  const head = base64UrlEncode(header);
  const pay = base64UrlEncode(payload);
  const signature = crypto.createHmac('sha256', secret)
    .update(`${head}.${pay}`)
    .digest('base64url');
  return `${head}.${pay}.${signature}`;
};

const supabaseUrl = 'https://nowepoiasehxhkebkqkf.supabase.co';

async function testSecret(secret) {
  const token = signJWT(secret);
  console.log(`Testing token signed with secret: "${secret}"`);
  const supabase = createClient(supabaseUrl, token);
  try {
    const { data, error } = await supabase.storage.listBuckets();
    if (error) {
      console.log(`Failed for secret "${secret}":`, error.message || error);
    } else {
      console.log(`SUCCESS for secret "${secret}"! Buckets:`, data);
      return true;
    }
  } catch (e) {
    console.log(`Exception for secret "${secret}":`, e.message);
  }
  return false;
}

async function run() {
  const secrets = [
    'super-secret-jwt-key-with-at-least-32-characters-long',
    'Tonystark@2025',
    'Tonystark%402025',
    'neurolearn-development-secret-key-2026'
  ];
  for (const secret of secrets) {
    if (await testSecret(secret)) break;
  }
}

run();

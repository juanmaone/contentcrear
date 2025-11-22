const jwt = require('jsonwebtoken');

// Use the Supabase publishable key as the JWT secret (it's the right length)
const secret = 'sb_secret_N7UND0UgjKTVK-Uodkm0Hg_xSvEMPvz';

const payload = {
  iss: 'https://127.0.0.1:54321',
  sub: 'test-user',
  aud: 'authenticated',
  role: 'authenticated',
  aal: 'aal1',
  exp: Math.floor(Date.now() / 1000) + 3600,
};

const token = jwt.sign(payload, secret, { algorithm: 'HS256' });
console.log(token);

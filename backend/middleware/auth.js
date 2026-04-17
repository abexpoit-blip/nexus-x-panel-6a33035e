// JWT authentication middleware
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../lib/db');

const JWT_SECRET = process.env.JWT_SECRET;

// Hard-fail in production if JWT_SECRET is missing or weak
if (!JWT_SECRET || JWT_SECRET.length < 32) {
  if (process.env.NODE_ENV === 'production') {
    console.error('FATAL: JWT_SECRET must be set to a strong (>=32 char) value in production.');
    process.exit(1);
  } else {
    console.warn('⚠️  JWT_SECRET is missing/weak — using dev fallback. NEVER deploy like this.');
  }
}

const SECRET = JWT_SECRET || 'dev-only-fallback-secret-do-not-use-in-prod-xxxxxxxxxxxxxxxxxx';

function hashToken(t) {
  return crypto.createHash('sha256').update(t).digest('hex');
}

function signToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    SECRET,
    { expiresIn: '30d' }
  );
}

function recordSession(userId, token, req) {
  const expiresAt = Math.floor(Date.now() / 1000) + 30 * 24 * 3600;
  db.prepare(`
    INSERT INTO sessions (user_id, token_hash, ip, user_agent, expires_at)
    VALUES (?, ?, ?, ?, ?)
  `).run(userId, hashToken(token), req.ip || null, req.headers['user-agent'] || null, expiresAt);
}

function authRequired(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing token' });
  }
  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, SECRET);
    const user = db.prepare('SELECT * FROM users WHERE id = ?').get(payload.sub);
    if (!user) return res.status(401).json({ error: 'User not found' });
    if (user.status !== 'active') return res.status(403).json({ error: 'Account suspended' });
    req.user = user;
    req.token = token;

    // Update session last_seen (best effort)
    db.prepare("UPDATE sessions SET last_seen_at = strftime('%s','now') WHERE token_hash = ?")
      .run(hashToken(token));

    next();
  } catch (e) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
}

module.exports = { authRequired, adminOnly, signToken, recordSession, hashToken, JWT_SECRET: SECRET };

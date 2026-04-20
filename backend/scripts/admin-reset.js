// Emergency admin reset / approve user — usage:
//   node scripts/admin-reset.js list                       → list all users
//   node scripts/admin-reset.js reset-admin <newpassword>  → reset 'admin' password + ensure active
//   node scripts/admin-reset.js approve <username>         → set status='active'
//   node scripts/admin-reset.js make-admin <username>      → promote to admin + active
require('dotenv').config();
const bcrypt = require('bcryptjs');
const Database = require('better-sqlite3');
const db = new Database(process.env.DB_PATH || './data/nexus.db');

const cmd = process.argv[2];
const arg = process.argv[3];

if (cmd === 'list') {
  const rows = db.prepare('SELECT id, username, role, status, balance FROM users ORDER BY id').all();
  console.table(rows);
} else if (cmd === 'reset-admin') {
  if (!arg) { console.error('Usage: reset-admin <newpassword>'); process.exit(1); }
  const hash = bcrypt.hashSync(arg, 10);
  const r = db.prepare("UPDATE users SET password_hash=?, status='active' WHERE username='admin'").run(hash);
  if (r.changes === 0) {
    db.prepare("INSERT INTO users (username, password_hash, role, full_name, status) VALUES ('admin', ?, 'admin', 'System Admin', 'active')").run(hash);
    console.log('✓ admin user created with new password');
  } else {
    console.log('✓ admin password reset + status=active');
  }
} else if (cmd === 'approve') {
  if (!arg) { console.error('Usage: approve <username>'); process.exit(1); }
  const r = db.prepare("UPDATE users SET status='active' WHERE username=?").run(arg);
  console.log(r.changes ? `✓ ${arg} approved (status=active)` : `✗ user '${arg}' not found`);
} else if (cmd === 'make-admin') {
  if (!arg) { console.error('Usage: make-admin <username>'); process.exit(1); }
  const r = db.prepare("UPDATE users SET role='admin', status='active' WHERE username=?").run(arg);
  console.log(r.changes ? `✓ ${arg} is now admin (active)` : `✗ user '${arg}' not found`);
} else {
  console.log('Usage:');
  console.log('  node scripts/admin-reset.js list');
  console.log('  node scripts/admin-reset.js reset-admin <newpassword>');
  console.log('  node scripts/admin-reset.js approve <username>');
  console.log('  node scripts/admin-reset.js make-admin <username>');
}
db.close();

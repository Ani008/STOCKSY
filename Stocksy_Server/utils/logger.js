// utils/logger.js — structured logger (drop-in winston replacement for dev)
const levels = { error: 0, warn: 1, info: 2, debug: 3 };
const level  = levels[process.env.LOG_LEVEL ?? 'info'] ?? 2;

function log(lv, msg, meta) {
  if (levels[lv] > level) return;
  const line = `[${new Date().toISOString()}] [${lv.toUpperCase()}] ${msg}`;
  if (lv === 'error') console.error(line, meta ?? '');
  else                console.log(line, meta ?? '');
}

module.exports = {
  info:  (m, meta) => log('info',  m, meta),
  warn:  (m, meta) => log('warn',  m, meta),
  error: (m, meta) => log('error', m, meta),
  debug: (m, meta) => log('debug', m, meta),
};

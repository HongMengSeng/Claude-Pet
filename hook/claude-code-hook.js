// claude-code-hook.js
// Claude Pet integration hook for Claude Code CLI
//
// Usage in ~/.claude/settings.json:
// {
//   "hooks": {
//     "StartSession": [{
//       "command": "node /path/to/claude-pet/hook/claude-code-hook.js",
//       "env": { "CLAUDE_HOOK_TYPE": "session_start" }
//     }],
//     "StopSession": [{
//       "command": "node /path/to/claude-pet/hook/claude-code-hook.js",
//       "env": { "CLAUDE_HOOK_TYPE": "session_end" }
//     }]
//   }
// }

const http = require('http');

const PET_PORT = 18923;
const PET_URL = `http://127.0.0.1:${PET_PORT}`;

function sendState(state) {
  const data = JSON.stringify({ state });

  const options = {
    hostname: '127.0.0.1',
    port: PET_PORT,
    path: '/pet/state',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(data)
    },
    timeout: 2000
  };

  const req = http.request(options, (res) => {
    // Fire and forget — silently consume response
    res.resume();
  });

  req.on('error', () => {
    // Claude Pet not running — that's fine, silently ignore
  });

  req.on('timeout', () => {
    req.destroy();
  });

  req.write(data);
  req.end();
}

// Read hook type from environment variable
const hookType = process.env.CLAUDE_HOOK_TYPE;

if (hookType === 'session_start') {
  sendState('session_start');
} else if (hookType === 'session_end') {
  sendState('session_end');
} else if (hookType === 'review_requested') {
  sendState('review_requested');
} else if (hookType === 'review_done') {
  sendState('review_done');
}

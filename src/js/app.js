// app.js — Main entry point, wires together all modules

(function() {
  'use strict';

  // ─── State → Animation mapping ───

  const STATE_ANIM_MAP = {
    'working': 'working',
    'review_pending': 'review_pending',
    'review_approved': 'review_approved'
  };

  const IDLE_ANIM_MAP = {
    'snoring': 'idle_snoring',
    'fish': 'idle_fish',
    'coffee': 'idle_coffee',
    'selfcheck': 'idle_selfcheck'
  };

  // ─── Handle state changes ───

  function handleStateChange(newState, prevState) {
    console.log(`[Claude Pet] Animation: ${prevState} -> ${newState}`);

    // Idle action (prevState is the action name, newState is 'idle_action')
    if (newState === 'idle_action') {
      const animName = IDLE_ANIM_MAP[prevState] || 'idle_snoring';
      startAnimation(animName);
      return;
    }

    // State animation
    const animName = STATE_ANIM_MAP[newState];
    if (animName) {
      startAnimation(animName);
    }
  }

  // ─── Register state change listener ───

  petState.onChange((newState, prevState) => {
    handleStateChange(newState, prevState);

    // Special: review_approved auto-transitions back to working after celebration
    if (newState === 'review_approved') {
      setTimeout(() => {
        if (petState.current === 'review_approved') {
          petState.setState('working');
        }
      }, 4000);
    }
  });

  // ─── Claude Code integration ───

  if (window.petAPI) {
    window.petAPI.onStateChange((state) => {
      console.log(`[Claude Pet] CLI event: ${state}`);
      switch (state) {
        case 'session_start':
          petState.setState('working');
          break;
        case 'session_end':
          petState.setState('idle');
          break;
        case 'review_requested':
          petState.setState('review_pending');
          break;
        case 'review_done':
          petState.setState('review_approved');
          break;
        default:
          console.log(`[Claude Pet] Unknown CLI state: ${state}`);
      }
    });

    // Load settings from Electron store on startup
    window.petAPI.loadSettings().then(electronSettings => {
      if (electronSettings && Object.keys(electronSettings).length > 0) {
        Object.assign(settings, electronSettings);
        if (electronSettings.accessories) {
          loadAccessoryConfig(electronSettings.accessories);
        }
      }
    });
  }

  // ─── Initialize ───

  // Load settings from localStorage
  loadSettings();

  // Start in idle mode
  petState.setState('idle');

  console.log('🤖 Claude Pet is ready!');
  console.log(`   State: ${petState.current}`);
  console.log('   Right-click to open settings');
  console.log('   HTTP server on port 18923');
})();

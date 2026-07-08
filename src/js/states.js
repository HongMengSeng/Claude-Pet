// states.js — State machine for Claude Pet

const STATES = {
  IDLE: 'idle',
  WORKING: 'working',
  REVIEW_PENDING: 'review_pending',
  REVIEW_APPROVED: 'review_approved'
};

// Allowed transitions
const STATE_TRANSITIONS = {
  [STATES.IDLE]: [STATES.WORKING, STATES.REVIEW_PENDING],
  [STATES.WORKING]: [STATES.IDLE, STATES.REVIEW_PENDING],
  [STATES.REVIEW_PENDING]: [STATES.REVIEW_APPROVED, STATES.IDLE],
  [STATES.REVIEW_APPROVED]: [STATES.WORKING, STATES.IDLE]
};

class PetStateMachine {
  constructor() {
    this.current = STATES.IDLE;
    this.listeners = [];
    this.idleTimer = null;
    this.idleActions = ['snoring', 'fish', 'coffee', 'selfcheck'];
    this.idleIntervalMin = 30000;  // 30s
    this.idleIntervalMax = 120000; // 120s
  }

  transition(newState) {
    const allowed = STATE_TRANSITIONS[this.current];
    if (!allowed || !allowed.includes(newState)) {
      console.warn(`[Claude Pet] Invalid transition: ${this.current} -> ${newState}`);
      return false;
    }
    const prev = this.current;
    this.current = newState;
    console.log(`[Claude Pet] State: ${prev} -> ${newState}`);
    this.listeners.forEach(fn => fn(newState, prev));
    return true;
  }

  onChange(fn) {
    this.listeners.push(fn);
  }

  setState(state) {
    if (state === STATES.IDLE) {
      this.startIdleCycle();
    } else {
      this.stopIdleCycle();
    }
    return this.transition(state);
  }

  startIdleCycle() {
    this.stopIdleCycle();
    const tick = () => {
      if (this.current !== STATES.IDLE) return;
      const action = this.idleActions[Math.floor(Math.random() * this.idleActions.length)];
      // Notify listeners with special 'idle_action' type
      // prevState carries the action name
      this.listeners.forEach(fn => fn('idle_action', action));
      const interval = this.idleIntervalMin + Math.random() * (this.idleIntervalMax - this.idleIntervalMin);
      this.idleTimer = setTimeout(tick, interval);
    };
    const firstInterval = this.idleIntervalMin / 2; // First action comes sooner
    this.idleTimer = setTimeout(tick, firstInterval);
  }

  stopIdleCycle() {
    if (this.idleTimer) {
      clearTimeout(this.idleTimer);
      this.idleTimer = null;
    }
  }
}

const petState = new PetStateMachine();

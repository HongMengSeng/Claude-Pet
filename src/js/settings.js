// settings.js — Settings panel UI and persistence

const settingsPanel = document.getElementById('settings-panel');

const DEFAULT_SETTINGS = {
  autoLaunch: true,
  idleIntervalMin: 30000,
  idleIntervalMax: 120000,
  accessories: {},
  windowX: null,
  windowY: null
};

let settings = { ...DEFAULT_SETTINGS };

// ─── Load / Save ───

function loadSettings() {
  const saved = localStorage.getItem('claude-pet-settings');
  if (saved) {
    try {
      settings = { ...DEFAULT_SETTINGS, ...JSON.parse(saved) };
    } catch (e) {
      settings = { ...DEFAULT_SETTINGS };
    }
  }
  // Apply accessory config
  if (settings.accessories) {
    loadAccessoryConfig(settings.accessories);
  }
  // Apply idle interval
  petState.idleIntervalMin = settings.idleIntervalMin;
  petState.idleIntervalMax = settings.idleIntervalMax;
  return settings;
}

function saveSettings(newSettings) {
  Object.assign(settings, newSettings);
  localStorage.setItem('claude-pet-settings', JSON.stringify(settings));
  // Sync with Electron main process
  if (window.petAPI) {
    window.petAPI.saveSettings(settings);
  }
}

// ─── Panel UI ───

function getSlotIcon(slot) {
  const icons = { head: '🎩', ears: '🎧', face: '👓', neck: '🧣', hand: '🐟' };
  return icons[slot] || '📎';
}

function createSettingsPanel() {
  settingsPanel.innerHTML = `
    <div class="settings-overlay" onclick="event.stopPropagation()">
      <div class="settings-card">
        <div class="settings-header">
          <h2>⚙️ Claude Pet</h2>
          <button class="settings-close" onclick="toggleSettings()">✕</button>
        </div>
        <div class="settings-body">
          <div class="setting-row">
            <span>🤖 Auto-launch with Claude Code</span>
            <label class="toggle">
              <input type="checkbox" id="autoLaunch" ${settings.autoLaunch ? 'checked' : ''}
                onchange="updateSetting('autoLaunch', this.checked)">
              <span class="toggle-slider"></span>
            </label>
          </div>

          <div class="setting-row">
            <span>⏱ Idle interval</span>
            <select id="idleInterval" onchange="updateIdleInterval(this.value)">
              <option value="15000" ${settings.idleIntervalMin === 15000 ? 'selected' : ''}>15 seconds</option>
              <option value="30000" ${settings.idleIntervalMin === 30000 ? 'selected' : ''}>30 seconds</option>
              <option value="60000" ${settings.idleIntervalMin === 60000 ? 'selected' : ''}>60 seconds</option>
              <option value="120000" ${settings.idleIntervalMin === 120000 ? 'selected' : ''}>120 seconds</option>
            </select>
          </div>

          <div class="setting-section">
            <h3>🎒 Accessories</h3>
            ${ACCESSORY_SLOTS.map(slot => `
              <div class="setting-row">
                <span>${getSlotIcon(slot)} ${slot.charAt(0).toUpperCase() + slot.slice(1)}</span>
                <div>
                  <button class="btn-small" onclick="importAccessory('${slot}')">Import</button>
                  <button class="btn-small btn-remove" onclick="removeAccessorySlot('${slot}')">Clear</button>
                </div>
              </div>
            `).join('')}
          </div>

          <div class="setting-section">
            <h3>🎬 State Control</h3>
            <div class="state-buttons">
              <button onclick="petState.setState('idle')">😴 Idle</button>
              <button onclick="petState.setState('working')">💻 Work</button>
              <button onclick="petState.setState('review_pending')">🏴 Review</button>
              <button onclick="petState.setState('review_approved')">✅ Done</button>
            </div>
          </div>

          <div class="setting-section" style="text-align:center;padding-top:12px">
            <p style="color:#888;font-size:11px">Claude Pet v1.0 — Right-click to open settings</p>
          </div>
        </div>
      </div>
    </div>
  `;
  settingsPanel.classList.remove('hidden');
}

function toggleSettings() {
  if (settingsPanel.classList.contains('hidden')) {
    createSettingsPanel();
    if (window.petAPI) window.petAPI.setIgnoreMouse(false);
  } else {
    settingsPanel.classList.add('hidden');
    if (window.petAPI) window.petAPI.setIgnoreMouse(true);
  }
}

// ─── Setting handlers ───

function updateSetting(key, value) {
  saveSettings({ [key]: value });
  if (key === 'idleIntervalMin') {
    petState.idleIntervalMin = value;
  }
}

function updateIdleInterval(value) {
  const v = parseInt(value);
  petState.idleIntervalMin = v;
  petState.idleIntervalMax = v * 4;
  saveSettings({ idleIntervalMin: v, idleIntervalMax: v * 4 });
}

function importAccessory(slot) {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = 'image/png,image/svg+xml';
  input.onchange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      loadAccessory(slot, ev.target.result).then(() => {
        saveSettings({ accessories: getAccessoryConfig() });
        // Refresh panel to show updated state
        createSettingsPanel();
      });
    };
    reader.readAsDataURL(file);
  };
  input.click();
}

function removeAccessorySlot(slot) {
  removeAccessory(slot);
  saveSettings({ accessories: getAccessoryConfig() });
  createSettingsPanel();
}

// ─── Context menu (right-click) ───

canvas.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  toggleSettings();
});

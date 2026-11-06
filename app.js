/**
 * Lumina Smart Home OS - Main Application Controller
 * Ultra-Glassmorphism Edition with Web Audio synthesis & reactive state
 */

window.luminaState = null;
let activeRoomFilter = 'all';
let currentActiveTab = 'dashboard';
let audioCtx = null;

// Synthesizer Audio
function playTone(type) {
  if (!window.luminaState || !window.luminaState.settings.soundEnabled) return;
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(150, now + 0.04);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.start(now);
      osc.stop(now + 0.04);
    } else if (type === 'success') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, now);
      osc.frequency.setValueAtTime(659.25, now + 0.08);
      osc.frequency.setValueAtTime(783.99, now + 0.16);
      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc.start(now);
      osc.stop(now + 0.35);
    } else if (type === 'lock') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(160, now + 0.1);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.start(now);
      osc.stop(now + 0.12);
    } else if (type === 'alert') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(880, now);
      osc.frequency.setValueAtTime(440, now + 0.1);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.debug('Audio error', e);
  }
}

// State Persistence
function loadState() {
  const saved = localStorage.getItem('lumina_smart_home_state');
  if (saved) {
    try {
      window.luminaState = JSON.parse(saved);
      if (!window.luminaState.settings.theme || window.luminaState.settings.theme === 'dark') {
        window.luminaState.settings.theme = 'light';
      }
      return;
    } catch (e) {
      console.warn('Using default state', e);
    }
  }
  window.luminaState = JSON.parse(JSON.stringify(INITIAL_STATE));
  window.luminaState.settings.theme = 'light';
}

function saveState() {
  if (window.luminaState) {
    localStorage.setItem('lumina_smart_home_state', JSON.stringify(window.luminaState));
  }
}

// Toast Notifications
function showToast(message, type = 'info', icon = 'fa-circle-info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  const typeColors = {
    info: 'bg-black/90 text-white border-white/20 shadow-2xl',
    success: 'bg-zinc-900/90 text-emerald-300 border-emerald-500/30 shadow-2xl',
    warning: 'bg-zinc-900/90 text-amber-300 border-amber-500/30 shadow-2xl',
    error: 'bg-zinc-900/90 text-rose-300 border-rose-500/30 shadow-2xl'
  };

  toast.className = `flex items-center gap-3 px-4 py-3 rounded-2xl border backdrop-blur-xl transition-all duration-300 transform translate-y-2 opacity-0 text-sm ${typeColors[type] || typeColors.info}`;
  toast.innerHTML = `
    <i class="fa-solid ${icon} text-base"></i>
    <span class="font-medium flex-1">${message}</span>
    <button onclick="this.parentElement.remove()" class="text-zinc-400 hover:text-white transition"><i class="fa-solid fa-xmark"></i></button>
  `;

  container.appendChild(toast);

  requestAnimationFrame(() => {
    toast.classList.remove('translate-y-2', 'opacity-0');
    toast.classList.add('translate-y-0', 'opacity-100');
  });

  setTimeout(() => {
    toast.classList.add('opacity-0', '-translate-y-2');
    setTimeout(() => toast.remove(), 300);
  }, 4000);
}

// Clock
function initClock() {
  const updateTime = () => {
    const now = new Date();
    const timeEl = document.getElementById('currentTime');
    const dateEl = document.getElementById('currentDate');
    if (timeEl) {
      timeEl.textContent = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    }
    if (dateEl) {
      dateEl.textContent = now.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
    }
  };
  updateTime();
  setInterval(updateTime, 1000);
}

// Summary Statistics
function updateSummaryStats() {
  const devices = window.luminaState.devices;
  const activeCount = devices.filter(d => d.isOn || (d.type === 'lock' && !d.isLocked)).length;
  const totalPower = devices.reduce((sum, d) => sum + (d.isOn ? (d.powerWatts || 0) : (d.type === 'lock' ? d.powerWatts : 0)), 0);
  
  const activeCountEl = document.getElementById('statActiveDevices');
  const powerEl = document.getElementById('statPowerUsage');
  const climateEl = document.getElementById('statAvgTemp');
  const lockEl = document.getElementById('statSecurityStatus');

  if (activeCountEl) activeCountEl.textContent = `${activeCount} / ${devices.length} Online`;
  if (powerEl) powerEl.textContent = `${totalPower} W (${(totalPower / 1000).toFixed(2)} kW)`;

  const thermo = devices.find(d => d.type === 'climate' && d.room === 'living');
  if (climateEl && thermo) {
    const isF = window.luminaState.settings.tempUnit === 'F';
    const temp = isF ? thermo.currentTempF.toFixed(1) + '°F' : thermo.currentTempC.toFixed(1) + '°C';
    climateEl.textContent = `${temp} • ${thermo.humidity}% Hum`;
  }

  const doorLock = devices.find(d => d.id === 'od_door_lock');
  if (lockEl && doorLock) {
    lockEl.textContent = doorLock.isLocked ? 'Protected (Locked)' : 'Alert: Unlocked';
    lockEl.className = doorLock.isLocked ? 'text-emerald-600 font-extrabold text-lg sm:text-xl' : 'text-rose-600 font-extrabold text-lg sm:text-xl animate-pulse';
  }
}

// Ambient Glow
function updateAmbientGlow() {
  const halo = document.getElementById('ambientHalo');
  if (!halo || !window.luminaState.settings.ambientGlow) return;

  const activeLights = window.luminaState.devices.filter(d => d.type === 'light' && d.isOn);
  if (activeLights.length > 0) {
    const topLight = activeLights[0];
    halo.style.background = `radial-gradient(circle, ${topLight.color}25 0%, transparent 70%)`;
    halo.style.opacity = '1';
  } else {
    halo.style.opacity = '0';
  }
}

// Room Filters
function renderRoomFilter() {
  const container = document.getElementById('roomFilterContainer');
  if (!container) return;

  container.innerHTML = window.luminaState.rooms.map(room => {
    const isActive = activeRoomFilter === room.id;
    const activeClasses = isActive 
      ? 'bg-black text-white font-bold shadow-md scale-[1.02]' 
      : 'glass-panel text-zinc-700 hover:text-black hover:bg-white/90 border border-white/80';

    return `
      <button 
        onclick="window.filterByRoom('${room.id}')"
        class="flex items-center gap-2 px-4 py-2 rounded-2xl text-xs sm:text-sm transition-all duration-200 whitespace-nowrap ${activeClasses}">
        <i class="fa-solid ${room.icon}"></i>
        <span>${room.name}</span>
        ${room.id !== 'all' ? `<span class="opacity-70 text-xs">(${window.luminaState.devices.filter(d => d.room === room.id).length})</span>` : ''}
      </button>
    `;
  }).join('');
}

window.filterByRoom = function(roomId) {
  playTone('click');
  activeRoomFilter = roomId;
  renderRoomFilter();
  renderDeviceGrid();
};

// Preset Scenes
function renderScenes() {
  const container = document.getElementById('scenesContainer');
  if (!container) return;

  container.innerHTML = window.luminaState.scenes.map(scene => {
    return `
      <div 
        onclick="window.triggerScene('${scene.id}')"
        class="glass-panel group relative overflow-hidden p-4 rounded-3xl cursor-pointer border border-white/80 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]">
        <div class="flex items-center justify-between mb-2">
          <div class="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center text-lg shadow-sm">
            <i class="fa-solid ${scene.icon}"></i>
          </div>
          <span class="text-[11px] px-2.5 py-0.5 rounded-full font-bold ${scene.active ? 'bg-black text-white' : 'bg-black/5 text-zinc-600'}">
            ${scene.active ? 'Active' : 'Trigger'}
          </span>
        </div>
        <h4 class="font-extrabold text-zinc-950 text-sm sm:text-base">${scene.name}</h4>
        <p class="text-xs text-zinc-500 line-clamp-1 mt-0.5">${scene.description}</p>
      </div>
    `;
  }).join('');
}

window.triggerScene = function(sceneId) {
  const scene = window.luminaState.scenes.find(s => s.id === sceneId);
  if (!scene) return;

  playTone('success');
  window.luminaState.scenes.forEach(s => s.active = (s.id === sceneId));
  const devices = window.luminaState.devices;

  if (sceneId === 'scene_movie') {
    devices.forEach(d => {
      if (d.id === 'lr_light_main') { d.isOn = true; d.brightness = 15; d.color = '#ff9800'; }
      if (d.id === 'lr_light_strip') { d.isOn = true; d.brightness = 40; d.color = '#00f2fe'; }
      if (d.id === 'lr_tv') { d.isOn = true; d.volume = 45; }
      if (d.id === 'br_blinds') { d.position = 100; d.isOpen = false; }
    });
    showToast('Movie Night: Lighting dimmed & blinds closed', 'info', 'fa-film');
  } else if (sceneId === 'scene_morning') {
    devices.forEach(d => {
      if (d.type === 'light') { d.isOn = true; d.brightness = 80; d.color = '#ffe4b5'; }
      if (d.id === 'br_blinds') { d.position = 0; d.isOpen = true; }
      if (d.id === 'kt_fridge') { d.isOn = true; }
      if (d.type === 'climate') { d.isOn = true; d.targetTempC = 22; d.targetTempF = 72; }
    });
    showToast('Good Morning! Blinds opened & daylight warmth on', 'success', 'fa-sun');
  } else if (sceneId === 'scene_sleep') {
    devices.forEach(d => {
      if (d.type === 'light') { d.isOn = false; }
      if (d.id === 'od_door_lock') { d.isLocked = true; }
      if (d.id === 'lr_tv') { d.isOn = false; }
      if (d.type === 'climate') { d.targetTempC = 20; d.targetTempF = 68; }
      if (d.id === 'br_air_purifier') { d.isOn = true; d.fanSpeed = 'low'; }
    });
    window.luminaState.security.systemState = 'Armed (Home)';
    showToast('Bedtime activated: All doors locked & night mode on', 'info', 'fa-moon');
  } else if (sceneId === 'scene_away') {
    devices.forEach(d => {
      if (d.type === 'light') { d.isOn = false; }
      if (d.id === 'od_door_lock') { d.isLocked = true; }
      if (d.id === 'lr_tv') { d.isOn = false; }
      if (d.type === 'climate') { d.mode = 'eco'; }
      if (d.id === 'of_vacuum') { d.status = 'cleaning'; }
    });
    window.luminaState.security.systemState = 'Armed (Away)';
    showToast('Leaving Home: Security Armed & Vacuum cleaning', 'warning', 'fa-shield-halved');
  } else if (sceneId === 'scene_party') {
    devices.forEach(d => {
      if (d.type === 'light') { d.isOn = true; d.brightness = 100; }
      if (d.id === 'lr_light_strip') { d.color = '#e02424'; }
      if (d.id === 'lr_light_main') { d.color = '#8b5cf6'; }
      if (d.id === 'lr_tv') { d.isOn = true; d.volume = 70; }
    });
    showToast('Party Mood On: RGB audio sync activated!', 'success', 'fa-champagne-glasses');
  }

  saveState();
  renderScenes();
  renderDeviceGrid();
  updateSummaryStats();
  updateAmbientGlow();
  if (window.renderFloorPlan) window.renderFloorPlan();
};

// Device Grid
function renderDeviceGrid() {
  const container = document.getElementById('deviceGridContainer');
  if (!container) return;

  const filteredDevices = activeRoomFilter === 'all'
    ? window.luminaState.devices
    : window.luminaState.devices.filter(d => d.room === activeRoomFilter);

  if (filteredDevices.length === 0) {
    container.innerHTML = `
      <div class="col-span-full py-16 text-center text-zinc-500">
        <i class="fa-solid fa-cube text-4xl mb-3 opacity-30"></i>
        <p class="text-base font-semibold">No devices in this room.</p>
        <button onclick="window.filterByRoom('all')" class="mt-3 px-4 py-1.5 rounded-xl bg-black text-white text-sm hover:bg-zinc-800">View All Devices</button>
      </div>
    `;
    return;
  }

  container.innerHTML = filteredDevices.map(device => generateDeviceCardHTML(device)).join('');
}

// Generate Individual Frosted Glass Device Card
function generateDeviceCardHTML(device) {
  const isLight = device.type === 'light';
  const isClimate = device.type === 'climate';
  const isLock = device.type === 'lock';
  const isMedia = device.type === 'media';
  const isCamera = device.type === 'camera';
  const isBlinds = device.type === 'blinds';
  const isPurifier = device.type === 'purifier';
  const isVacuum = device.type === 'vacuum';
  const isAppliance = device.type === 'appliance';

  const roomObj = window.luminaState.rooms.find(r => r.id === device.room);
  const roomName = roomObj ? roomObj.name : '';
  const activeCardClass = (device.isOn || (isLock && !device.isLocked)) ? 'card-glow-active' : '';

  let customControlHTML = '';

  if (isLight) {
    customControlHTML = `
      <div class="mt-4 pt-3 border-t border-black/10 space-y-3">
        <div class="flex items-center justify-between text-xs text-zinc-500 font-medium">
          <span>Brightness</span>
          <span class="font-bold text-zinc-900" id="bright_val_${device.id}">${device.brightness}%</span>
        </div>
        <input 
          type="range" 
          min="1" 
          max="100" 
          value="${device.brightness}" 
          ${!device.isOn ? 'disabled' : ''}
          oninput="window.updateLightBrightness('${device.id}', this.value)"
          class="w-full h-1.5 ${!device.isOn ? 'opacity-40 cursor-not-allowed' : ''}">
        
        <div class="flex items-center justify-between pt-1">
          <span class="text-xs text-zinc-500 font-medium">Hue Color</span>
          <div class="flex items-center gap-2">
            <input 
              type="color" 
              value="${device.color}" 
              ${!device.isOn ? 'disabled' : ''}
              onchange="window.updateLightColor('${device.id}', this.value)"
              class="w-7 h-7 rounded-full cursor-pointer bg-transparent border-0 p-0 overflow-hidden ${!device.isOn ? 'opacity-40' : ''}">
            <div class="w-4 h-4 rounded-full border border-black/20" style="background-color: ${device.color}"></div>
          </div>
        </div>
      </div>
    `;
  } else if (isClimate) {
    const isF = window.luminaState.settings.tempUnit === 'F';
    const current = isF ? device.currentTempF.toFixed(1) + '°F' : device.currentTempC.toFixed(1) + '°C';
    const target = isF ? device.targetTempF.toFixed(1) + '°F' : device.targetTempC.toFixed(1) + '°C';

    customControlHTML = `
      <div class="mt-4 pt-3 border-t border-black/10">
        <div class="flex items-center justify-between mb-3">
          <div>
            <div class="text-xs text-zinc-500 font-medium">Current</div>
            <div class="text-xl font-black text-zinc-950">${current}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-zinc-500 font-medium">Target</div>
            <div class="text-xl font-black text-black">${target}</div>
          </div>
        </div>

        <div class="flex items-center justify-center gap-4 bg-black/5 rounded-2xl p-2 mb-3 border border-white/80">
          <button 
            onclick="window.adjustThermostat('${device.id}', -0.5)" 
            class="w-9 h-9 rounded-xl bg-white hover:bg-zinc-100 border border-black/10 flex items-center justify-center text-zinc-900 text-lg transition shadow-sm active:scale-95">
            <i class="fa-solid fa-minus"></i>
          </button>
          <span class="text-xs font-bold text-zinc-800">Adjust Target</span>
          <button 
            onclick="window.adjustThermostat('${device.id}', 0.5)" 
            class="w-9 h-9 rounded-xl bg-white hover:bg-zinc-100 border border-black/10 flex items-center justify-center text-zinc-900 text-lg transition shadow-sm active:scale-95">
            <i class="fa-solid fa-plus"></i>
          </button>
        </div>

        <div class="grid grid-cols-4 gap-1 text-[11px] text-center">
          ${['cool', 'heat', 'auto', 'eco'].map(m => `
            <button 
              onclick="window.setClimateMode('${device.id}', '${m}')"
              class="py-1 px-1.5 rounded-xl capitalize font-bold transition ${device.mode === m ? 'bg-black text-white shadow-sm' : 'bg-black/5 text-zinc-600 hover:bg-black/10'}">
              ${m}
            </button>
          `).join('')}
        </div>
      </div>
    `;
  } else if (isLock) {
    customControlHTML = `
      <div class="mt-4 pt-3 border-t border-black/10 space-y-3">
        <div class="flex items-center justify-between text-xs text-zinc-500 font-medium">
          <span>Battery: <strong class="text-zinc-900">${device.battery}%</strong></span>
          <span class="${device.isLocked ? 'text-emerald-700' : 'text-rose-600'} font-extrabold">
            <i class="fa-solid ${device.isLocked ? 'fa-lock' : 'fa-lock-open'} mr-1"></i>
            ${device.isLocked ? 'SECURE' : 'UNLOCKED'}
          </span>
        </div>
        <button 
          onclick="window.toggleLock('${device.id}')"
          class="w-full py-2.5 rounded-2xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${device.isLocked ? 'bg-black hover:bg-zinc-800 text-white shadow-md' : 'bg-rose-600 hover:bg-rose-500 text-white shadow-md'}">
          <i class="fa-solid ${device.isLocked ? 'fa-lock-open' : 'fa-lock'}"></i>
          <span>${device.isLocked ? 'Tap to Unlock' : 'Tap to Lock'}</span>
        </button>
        <p class="text-[11px] text-zinc-400 text-center">${device.lastEvent || 'Auto-verified secure'}</p>
      </div>
    `;
  } else if (isMedia) {
    customControlHTML = `
      <div class="mt-4 pt-3 border-t border-black/10 space-y-2.5">
        <div class="flex items-center gap-3 bg-black/5 border border-white/80 p-2.5 rounded-2xl">
          <div class="w-9 h-9 rounded-xl bg-black text-white flex items-center justify-center text-sm shadow-sm">
            <i class="fa-solid fa-music"></i>
          </div>
          <div class="flex-1 min-w-0">
            <div class="text-xs font-bold text-zinc-900 truncate">${device.nowPlaying.title}</div>
            <div class="text-[11px] text-zinc-500 truncate">${device.nowPlaying.artist}</div>
          </div>
          <button 
            onclick="window.toggleMediaPlay('${device.id}')" 
            class="w-8 h-8 rounded-full bg-black hover:bg-zinc-800 text-white flex items-center justify-center text-xs transition shadow-sm">
            <i class="fa-solid ${device.nowPlaying.isPlaying ? 'fa-pause' : 'fa-play'}"></i>
          </button>
        </div>

        <div class="flex items-center gap-2 pt-1 text-xs text-zinc-500">
          <i class="fa-solid fa-volume-high text-zinc-400"></i>
          <input 
            type="range" 
            min="0" 
            max="100" 
            value="${device.volume}" 
            ${!device.isOn ? 'disabled' : ''}
            oninput="window.setMediaVolume('${device.id}', this.value)"
            class="flex-1 h-1.5">
          <span class="w-8 text-right font-bold text-zinc-800">${device.volume}%</span>
        </div>
      </div>
    `;
  } else if (isCamera) {
    customControlHTML = `
      <div class="mt-3 rounded-2xl overflow-hidden camera-feed border border-black/20 shadow-inner">
        <div class="relative h-32 flex items-center justify-center bg-black">
          <div class="absolute inset-0 flex flex-col justify-between p-2 z-10 text-[10px] text-white font-mono">
            <div class="flex items-center justify-between">
              <span class="flex items-center gap-1.5 text-white font-bold bg-rose-600 px-2 py-0.5 rounded">
                <span class="w-2 h-2 rounded-full bg-white camera-rec-dot"></span> LIVE
              </span>
              <span class="bg-black/70 px-2 py-0.5 rounded text-zinc-300">1080P • 30 FPS</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="bg-black/70 px-1.5 py-0.5 rounded">${device.name}</span>
              <span class="bg-black/70 px-1.5 py-0.5 rounded">${new Date().toLocaleTimeString()}</span>
            </div>
          </div>
          <i class="fa-solid fa-video text-3xl text-zinc-700"></i>
        </div>
        <div class="p-2.5 bg-white/90 flex items-center justify-between text-xs border-t border-black/10">
          <span class="text-zinc-600 flex items-center gap-1.5 font-medium">
            <span class="w-2 h-2 rounded-full bg-emerald-600"></span> AI Detection: Active
          </span>
          <button onclick="window.showToast('Snapshot saved', 'success', 'fa-camera')" class="text-black hover:text-zinc-700 text-xs font-bold">
            <i class="fa-solid fa-camera mr-1"></i> Capture
          </button>
        </div>
      </div>
    `;
  } else if (isBlinds) {
    customControlHTML = `
      <div class="mt-4 pt-3 border-t border-black/10 space-y-2">
        <div class="flex items-center justify-between text-xs text-zinc-500 font-medium">
          <span>Position</span>
          <span class="font-bold text-zinc-900">${device.position}% Closed</span>
        </div>
        <input 
          type="range" 
          min="0" 
          max="100" 
          value="${device.position}" 
          oninput="window.setBlindsPosition('${device.id}', this.value)"
          class="w-full h-1.5">
        <div class="flex justify-between pt-1">
          <button onclick="window.setBlindsPosition('${device.id}', 0)" class="text-xs px-2.5 py-1 rounded-xl bg-black/5 text-zinc-800 font-semibold hover:bg-black/10">Open</button>
          <button onclick="window.setBlindsPosition('${device.id}', 50)" class="text-xs px-2.5 py-1 rounded-xl bg-black/5 text-zinc-800 font-semibold hover:bg-black/10">50%</button>
          <button onclick="window.setBlindsPosition('${device.id}', 100)" class="text-xs px-2.5 py-1 rounded-xl bg-black/5 text-zinc-800 font-semibold hover:bg-black/10">Closed</button>
        </div>
      </div>
    `;
  } else if (isVacuum) {
    customControlHTML = `
      <div class="mt-4 pt-3 border-t border-black/10 space-y-3">
        <div class="flex items-center justify-between text-xs text-zinc-500 font-medium">
          <span>Battery: <strong class="text-emerald-700">${device.battery}%</strong></span>
          <span class="capitalize font-bold text-black">Status: ${device.status}</span>
        </div>
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div class="bg-black/5 border border-white/80 p-2 rounded-xl text-center">
            <div class="text-zinc-500 text-[10px] font-semibold">Clean Area</div>
            <div class="font-bold text-zinc-900">${device.areaCleaned}</div>
          </div>
          <div class="bg-black/5 border border-white/80 p-2 rounded-xl text-center">
            <div class="text-zinc-500 text-[10px] font-semibold">Clean Time</div>
            <div class="font-bold text-zinc-900">${device.cleanTime}</div>
          </div>
        </div>
        <button 
          onclick="window.toggleVacuum('${device.id}')"
          class="w-full py-2.5 rounded-2xl text-xs font-bold transition flex items-center justify-center gap-2 ${device.status === 'cleaning' ? 'bg-zinc-800 hover:bg-zinc-900 text-white' : 'bg-black hover:bg-zinc-800 text-white shadow-md'}">
          <i class="fa-solid ${device.status === 'cleaning' ? 'fa-house' : 'fa-play'}"></i>
          <span>${device.status === 'cleaning' ? 'Return to Dock' : 'Start Auto Cleaning'}</span>
        </button>
      </div>
    `;
  } else if (isPurifier) {
    customControlHTML = `
      <div class="mt-4 pt-3 border-t border-black/10 space-y-2">
        <div class="flex items-center justify-between text-xs">
          <span class="text-zinc-500 font-medium">Air Quality</span>
          <span class="text-emerald-700 font-bold px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">AQI ${device.aqi} (Optimal)</span>
        </div>
        <div class="flex items-center justify-between text-xs text-zinc-500 pt-1">
          <span>Filter Health:</span>
          <span class="font-bold text-zinc-900">${device.filterLife}%</span>
        </div>
      </div>
    `;
  } else if (isAppliance) {
    customControlHTML = `
      <div class="mt-4 pt-3 border-t border-black/10 text-xs text-zinc-500 space-y-1">
        ${device.fridgeTemp !== undefined ? `
          <div class="flex justify-between"><span>Fridge:</span> <strong class="text-zinc-900">${device.fridgeTemp}°C</strong></div>
          <div class="flex justify-between"><span>Freezer:</span> <strong class="text-zinc-900">${device.freezerTemp}°C</strong></div>
          <div class="flex justify-between"><span>Door:</span> <strong class="text-emerald-700">${device.doorClosed ? 'Secure' : 'Open'}</strong></div>
        ` : ''}
      </div>
    `;
  }

  return `
    <div class="glass-panel rounded-3xl p-5 hover:shadow-xl relative overflow-hidden transition-all duration-300 border border-white/80 ${activeCardClass}">
      <div class="flex items-start justify-between gap-3">
        <div class="flex items-center gap-3">
          <div class="w-11 h-11 rounded-2xl flex items-center justify-center text-lg transition-all duration-300 ${
            (device.isOn || (isLock && !device.isLocked)) 
              ? 'bg-black text-white shadow-md' 
              : 'bg-black/5 text-zinc-800 border border-black/10'
          }">
            <i class="fa-solid ${device.icon}"></i>
          </div>
          <div>
            <h4 class="font-bold text-zinc-950 text-sm sm:text-base leading-tight">${device.name}</h4>
            <div class="flex items-center gap-2 mt-0.5">
              <span class="text-xs text-zinc-500">${roomName}</span>
              <span class="text-[10px] px-1.5 py-0.2 rounded-full bg-black/5 text-zinc-700 font-mono font-medium">${device.powerWatts || 0}W</span>
            </div>
          </div>
        </div>

        ${!isLock ? `
          <label class="relative inline-flex items-center cursor-pointer">
            <input 
              type="checkbox" 
              class="sr-only peer" 
              ${device.isOn ? 'checked' : ''} 
              onchange="window.toggleDevice('${device.id}')">
            <div class="w-11 h-6 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-black shadow-inner"></div>
          </label>
        ` : ''}
      </div>

      ${customControlHTML}
    </div>
  `;
}

// Handlers
window.toggleDevice = function(deviceId) {
  playTone('click');
  const device = window.luminaState.devices.find(d => d.id === deviceId);
  if (!device) return;

  device.isOn = !device.isOn;
  saveState();
  renderDeviceGrid();
  updateSummaryStats();
  updateAmbientGlow();
  if (window.renderFloorPlan) window.renderFloorPlan();

  showToast(`${device.name} turned ${device.isOn ? 'ON' : 'OFF'}`, 'info', device.icon);
};

window.updateLightBrightness = function(deviceId, value) {
  const device = window.luminaState.devices.find(d => d.id === deviceId);
  if (!device) return;

  device.brightness = parseInt(value, 10);
  const label = document.getElementById(`bright_val_${deviceId}`);
  if (label) label.textContent = `${value}%`;
  saveState();
};

window.updateLightColor = function(deviceId, hexColor) {
  const device = window.luminaState.devices.find(d => d.id === deviceId);
  if (!device) return;

  device.color = hexColor;
  saveState();
  renderDeviceGrid();
  updateAmbientGlow();
  if (window.renderFloorPlan) window.renderFloorPlan();
};

window.adjustThermostat = function(deviceId, delta) {
  playTone('click');
  const device = window.luminaState.devices.find(d => d.id === deviceId);
  if (!device) return;

  const isF = window.luminaState.settings.tempUnit === 'F';
  if (isF) {
    device.targetTempF = parseFloat((device.targetTempF + delta).toFixed(1));
    device.targetTempC = parseFloat(((device.targetTempF - 32) * (5 / 9)).toFixed(1));
  } else {
    device.targetTempC = parseFloat((device.targetTempC + delta).toFixed(1));
    device.targetTempF = parseFloat(((device.targetTempC * 9 / 5) + 32).toFixed(1));
  }

  saveState();
  renderDeviceGrid();
  updateSummaryStats();
  if (window.renderFloorPlan) window.renderFloorPlan();
};

window.setClimateMode = function(deviceId, mode) {
  playTone('click');
  const device = window.luminaState.devices.find(d => d.id === deviceId);
  if (!device) return;

  device.mode = mode;
  saveState();
  renderDeviceGrid();
  showToast(`HVAC mode: ${mode.toUpperCase()}`, 'info', 'fa-temperature-half');
};

window.toggleLock = function(deviceId) {
  playTone('lock');
  const device = window.luminaState.devices.find(d => d.id === deviceId);
  if (!device) return;

  device.isLocked = !device.isLocked;
  device.lastEvent = device.isLocked ? `Locked manually at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}` : `Unlocked manually at ${new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}`;
  
  window.luminaState.security.recentLogs.unshift({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    event: `${device.name} ${device.isLocked ? 'Locked' : 'Unlocked'} by User`,
    type: device.isLocked ? 'info' : 'warning'
  });

  saveState();
  renderDeviceGrid();
  updateSummaryStats();
  renderSecurityTab();
  if (window.renderFloorPlan) window.renderFloorPlan();

  showToast(`${device.name} ${device.isLocked ? 'LOCKED' : 'UNLOCKED'}`, device.isLocked ? 'success' : 'warning', device.isLocked ? 'fa-lock' : 'fa-lock-open');
};

window.toggleMediaPlay = function(deviceId) {
  playTone('click');
  const device = window.luminaState.devices.find(d => d.id === deviceId);
  if (!device) return;

  device.nowPlaying.isPlaying = !device.nowPlaying.isPlaying;
  saveState();
  renderDeviceGrid();
};

window.setMediaVolume = function(deviceId, volume) {
  const device = window.luminaState.devices.find(d => d.id === deviceId);
  if (!device) return;

  device.volume = parseInt(volume, 10);
  saveState();
};

window.setBlindsPosition = function(deviceId, val) {
  playTone('click');
  const device = window.luminaState.devices.find(d => d.id === deviceId);
  if (!device) return;

  device.position = parseInt(val, 10);
  device.isOpen = device.position < 50;
  saveState();
  renderDeviceGrid();
  showToast(`${device.name} set to ${val}%`, 'info', 'fa-blinds');
};

window.toggleVacuum = function(deviceId) {
  playTone('click');
  const device = window.luminaState.devices.find(d => d.id === deviceId);
  if (!device) return;

  if (device.status === 'cleaning') {
    device.status = 'docked';
    showToast('Vacuum returning to dock', 'info', 'fa-house');
  } else {
    device.status = 'cleaning';
    showToast('Roborock vacuum started cleaning', 'success', 'fa-robot');
  }

  saveState();
  renderDeviceGrid();
};

// Security Tab
function renderSecurityTab() {
  const container = document.getElementById('securityContainer');
  if (!container) return;

  const sec = window.luminaState.security;

  container.innerHTML = `
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div class="glass-panel rounded-3xl p-6 border border-white/80 lg:col-span-1 shadow-lg">
        <div class="flex items-center justify-between mb-4">
          <span class="text-xs uppercase font-extrabold text-zinc-500 tracking-wider">Perimeter Guard</span>
          <span class="w-3 h-3 rounded-full ${sec.systemState.includes('Armed') ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}"></span>
        </div>
        <div class="text-center py-4">
          <div class="w-20 h-20 rounded-2xl mx-auto flex items-center justify-center text-3xl mb-3 ${sec.systemState.includes('Armed') ? 'bg-black text-white shadow-xl' : 'bg-black/5 text-zinc-700 border border-black/10'}">
            <i class="fa-solid fa-shield-halved"></i>
          </div>
          <h3 class="text-xl font-black text-zinc-950">${sec.systemState}</h3>
          <p class="text-xs text-zinc-500 mt-1">All perimeter nodes active &amp; synced</p>
        </div>

        <div class="space-y-2 mt-4 pt-4 border-t border-black/10">
          <button 
            onclick="window.setSecurityMode('Armed (Home)')"
            class="w-full py-2.5 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 ${sec.systemState === 'Armed (Home)' ? 'bg-black text-white shadow-md' : 'bg-black/5 text-zinc-800 hover:bg-black/10'}">
            <i class="fa-solid fa-house-chimney-user"></i>
            <span>Arm Stay (Home)</span>
          </button>
          <button 
            onclick="window.setSecurityMode('Armed (Away)')"
            class="w-full py-2.5 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 ${sec.systemState === 'Armed (Away)' ? 'bg-black text-white shadow-md' : 'bg-black/5 text-zinc-800 hover:bg-black/10'}">
            <i class="fa-solid fa-plane-departure"></i>
            <span>Arm Away (Vacation)</span>
          </button>
          <button 
            onclick="window.setSecurityMode('Disarmed')"
            class="w-full py-2.5 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 ${sec.systemState === 'Disarmed' ? 'bg-zinc-900 text-white shadow-md' : 'bg-black/5 text-zinc-800 hover:bg-black/10'}">
            <i class="fa-solid fa-lock-open"></i>
            <span>Disarm System</span>
          </button>
        </div>

        <button 
          onclick="window.triggerEmergencySOS()"
          class="w-full mt-4 py-2.5 rounded-2xl bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-700 font-bold text-xs transition flex items-center justify-center gap-2">
          <i class="fa-solid fa-triangle-exclamation animate-bounce"></i>
          <span>Emergency Siren / Panic Alarm</span>
        </button>
      </div>

      <div class="glass-panel rounded-3xl p-6 border border-white/80 lg:col-span-2 space-y-6 shadow-lg">
        <div>
          <h4 class="font-extrabold text-zinc-950 text-base mb-3 flex items-center gap-2">
            <i class="fa-solid fa-satellite-dish text-black"></i>
            <span>Connected Environmental & Security Sensors</span>
          </h4>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            ${sec.sensors.map(sensor => `
              <div class="bg-white/60 backdrop-blur-md rounded-2xl p-3 border border-white/80 shadow-sm flex items-center justify-between">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center text-xs">
                    <i class="fa-solid fa-circle-check"></i>
                  </div>
                  <div>
                    <div class="text-xs font-bold text-zinc-900">${sensor.name}</div>
                    <div class="text-[11px] text-zinc-500">Condition: ${sensor.status}</div>
                  </div>
                </div>
                <span class="text-[10px] uppercase font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200">Normal</span>
              </div>
            `).join('')}
          </div>
        </div>

        <div>
          <h4 class="font-extrabold text-zinc-950 text-base mb-3 flex items-center gap-2">
            <i class="fa-solid fa-clock-rotate-left text-black"></i>
            <span>Audit Trail & Event Log</span>
          </h4>
          <div class="space-y-2 max-h-48 overflow-y-auto pr-1">
            ${sec.recentLogs.map(log => `
              <div class="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/50 border border-white/80">
                <span class="text-zinc-800 font-medium">${log.event}</span>
                <span class="text-zinc-500 font-mono font-semibold">${log.time}</span>
              </div>
            `).join('')}
          </div>
        </div>
      </div>
    </div>
  `;
}

window.setSecurityMode = function(mode) {
  playTone('success');
  window.luminaState.security.systemState = mode;
  window.luminaState.security.recentLogs.unshift({
    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    event: `Security Mode: ${mode}`,
    type: 'security'
  });
  saveState();
  renderSecurityTab();
  updateSummaryStats();
  showToast(`Security Mode: ${mode}`, 'info', 'fa-shield-halved');
};

window.triggerEmergencySOS = function() {
  playTone('alert');
  showToast('PANIC ALARM SOUNDED!', 'error', 'fa-triangle-exclamation');
};

// Routines
function renderRoutinesTab() {
  const container = document.getElementById('routinesContainer');
  if (!container) return;

  container.innerHTML = `
    <div class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h3 class="text-lg font-black text-zinc-950">Smart Automation Rules</h3>
          <p class="text-xs text-zinc-500">Automate your home based on schedules and sensors.</p>
        </div>
        <button 
          onclick="window.openNewRoutineModal()"
          class="px-4 py-2 rounded-2xl bg-black hover:bg-zinc-800 text-white font-bold text-xs flex items-center gap-2 shadow-md transition">
          <i class="fa-solid fa-plus"></i>
          <span>Create Routine</span>
        </button>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        ${window.luminaState.routines.map(rt => `
          <div class="glass-panel rounded-3xl p-5 border border-white/80 space-y-3 shadow-md">
            <div class="flex items-center justify-between">
              <span class="font-extrabold text-zinc-950 text-sm">${rt.name}</span>
              <label class="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  class="sr-only peer" 
                  ${rt.enabled ? 'checked' : ''} 
                  onchange="window.toggleRoutine('${rt.id}')">
                <div class="w-10 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-black"></div>
              </label>
            </div>
            <div class="text-xs text-zinc-600 space-y-1.5">
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full bg-black text-white font-mono text-[10px] font-bold">WHEN</span>
                <span>${rt.trigger}</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="px-2 py-0.5 rounded-full bg-black/10 text-zinc-900 font-mono text-[10px] font-bold">THEN</span>
                <span>${rt.action}</span>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `;
}

window.toggleRoutine = function(routineId) {
  playTone('click');
  const rt = window.luminaState.routines.find(r => r.id === routineId);
  if (!rt) return;

  rt.enabled = !rt.enabled;
  saveState();
  showToast(`Routine "${rt.name}" ${rt.enabled ? 'Enabled' : 'Disabled'}`, 'info', 'fa-bolt');
};

window.openNewRoutineModal = function() {
  const name = prompt('Name for new routine:', 'Morning Espresso & Sunlight');
  if (!name) return;
  const trigger = prompt('Trigger (e.g. Daily at 07:00 AM):', 'Daily at 07:00 AM');
  const action = prompt('Action:', 'Open bedroom blinds and turn on warm lights');

  window.luminaState.routines.push({
    id: 'rt_' + Date.now(),
    name,
    trigger: trigger || 'Manual',
    action: action || 'Execute Action',
    enabled: true
  });

  saveState();
  renderRoutinesTab();
  showToast(`Created routine: "${name}"`, 'success', 'fa-circle-check');
};

// AI Natural Language Bar
window.handleVoiceCommand = function(e) {
  if (e) e.preventDefault();
  const input = document.getElementById('voiceCommandInput');
  if (!input) return;

  const query = input.value.trim().toLowerCase();
  if (!query) return;

  playTone('success');
  input.value = '';

  if (query.includes('turn on all lights') || query.includes('all lights on')) {
    window.luminaState.devices.filter(d => d.type === 'light').forEach(l => l.isOn = true);
    showToast('Voice Assistant: All lights ON', 'success', 'fa-lightbulb');
  } else if (query.includes('turn off all lights') || query.includes('all lights off') || query.includes('lights off')) {
    window.luminaState.devices.filter(d => d.type === 'light').forEach(l => l.isOn = false);
    showToast('Voice Assistant: All lights OFF', 'info', 'fa-lightbulb');
  } else if (query.includes('movie') || query.includes('cinema')) {
    window.triggerScene('scene_movie');
  } else if (query.includes('morning')) {
    window.triggerScene('scene_morning');
  } else if (query.includes('sleep') || query.includes('bedtime') || query.includes('goodnight')) {
    window.triggerScene('scene_sleep');
  } else if (query.includes('away') || query.includes('leaving')) {
    window.triggerScene('scene_away');
  } else if (query.includes('party')) {
    window.triggerScene('scene_party');
  } else if (query.includes('lock') || query.includes('lock front door')) {
    const lock = window.luminaState.devices.find(d => d.id === 'od_door_lock');
    if (lock) { lock.isLocked = true; }
    showToast('Voice Assistant: Front door locked', 'success', 'fa-lock');
  } else if (query.includes('unlock')) {
    const lock = window.luminaState.devices.find(d => d.id === 'od_door_lock');
    if (lock) { lock.isLocked = false; }
    showToast('Voice Assistant: Front door unlocked', 'warning', 'fa-lock-open');
  } else if (query.includes('vacuum') || query.includes('clean')) {
    const vac = window.luminaState.devices.find(d => d.id === 'of_vacuum');
    if (vac) { vac.status = 'cleaning'; }
    showToast('Voice Assistant: Roborock cleaning started', 'success', 'fa-robot');
  } else if (query.includes('temp') || query.includes('temperature') || query.includes('ac')) {
    const match = query.match(/\d+/);
    if (match) {
      const val = parseInt(match[0], 10);
      const thermo = window.luminaState.devices.find(d => d.id === 'lr_thermostat');
      if (thermo) {
        if (window.luminaState.settings.tempUnit === 'F') {
          thermo.targetTempF = val;
          thermo.targetTempC = parseFloat(((val - 32) * (5/9)).toFixed(1));
        } else {
          thermo.targetTempC = val;
          thermo.targetTempF = parseFloat(((val * 9/5) + 32).toFixed(1));
        }
      }
      showToast(`Thermostat set to ${val}°`, 'success', 'fa-temperature-half');
    } else {
      showToast('Climate unit online', 'info', 'fa-temperature-half');
    }
  } else {
    showToast(`Command executed: "${query}"`, 'info', 'fa-robot');
  }

  saveState();
  renderDeviceGrid();
  updateSummaryStats();
  updateAmbientGlow();
  if (window.renderFloorPlan) window.renderFloorPlan();
};

// Switch Tabs
window.switchTab = function(tabId) {
  playTone('click');
  currentActiveTab = tabId;

  document.querySelectorAll('.nav-tab-btn').forEach(btn => {
    if (btn.getAttribute('data-tab') === tabId) {
      btn.className = 'nav-tab-btn px-4 py-2 rounded-2xl text-xs sm:text-sm font-bold bg-black text-white shadow-md scale-[1.02] transition flex items-center gap-2';
    } else {
      btn.className = 'nav-tab-btn px-4 py-2 rounded-2xl text-xs sm:text-sm font-semibold text-zinc-700 hover:text-black hover:bg-white/90 border border-white/80 glass-panel shadow-sm transition flex items-center gap-2';
    }
  });

  const tabs = ['dashboard', 'floorplan', 'analytics', 'security', 'routines'];
  tabs.forEach(t => {
    const el = document.getElementById(`tabView_${t}`);
    if (el) {
      if (t === tabId) {
        el.classList.remove('hidden');
        el.classList.add('animate-fade-in');
      } else {
        el.classList.add('hidden');
        el.classList.remove('animate-fade-in');
      }
    }
  });

  if (tabId === 'floorplan' && window.renderFloorPlan) {
    window.renderFloorPlan();
  } else if (tabId === 'analytics') {
    if (window.refreshChartsTheme) window.refreshChartsTheme();
  } else if (tabId === 'security') {
    renderSecurityTab();
  } else if (tabId === 'routines') {
    renderRoutinesTab();
  }
};

// Theme Toggle
window.toggleTheme = function() {
  playTone('click');
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  window.luminaState.settings.theme = next;
  saveState();

  const themeIcon = document.getElementById('themeToggleIcon');
  if (themeIcon) {
    themeIcon.className = next === 'dark' ? 'fa-solid fa-moon text-cyan-400' : 'fa-solid fa-sun text-zinc-900';
  }

  if (window.refreshChartsTheme) window.refreshChartsTheme();
  if (window.renderFloorPlan) window.renderFloorPlan();
};

// Sound Toggle
window.toggleSound = function() {
  window.luminaState.settings.soundEnabled = !window.luminaState.settings.soundEnabled;
  saveState();

  const icon = document.getElementById('soundToggleIcon');
  if (icon) {
    icon.className = window.luminaState.settings.soundEnabled ? 'fa-solid fa-volume-high text-zinc-900' : 'fa-solid fa-volume-xmark text-zinc-400';
  }

  if (window.luminaState.settings.soundEnabled) playTone('click');
  showToast(`Sound FX ${window.luminaState.settings.soundEnabled ? 'Enabled' : 'Muted'}`, 'info', 'fa-volume-high');
};

// Unit Toggle
window.toggleTempUnit = function() {
  playTone('click');
  window.luminaState.settings.tempUnit = window.luminaState.settings.tempUnit === 'C' ? 'F' : 'C';
  saveState();

  const btn = document.getElementById('tempUnitToggleBtn');
  if (btn) btn.textContent = `°${window.luminaState.settings.tempUnit}`;

  renderDeviceGrid();
  updateSummaryStats();
  if (window.renderFloorPlan) window.renderFloorPlan();
  showToast(`Temperature unit: °${window.luminaState.settings.tempUnit}`, 'info', 'fa-temperature-half');
};

// Reset
window.resetDemoData = function() {
  if (confirm('Reset to factory demo state?')) {
    localStorage.removeItem('lumina_smart_home_state');
    loadState();
    initApp();
    showToast('Factory demo restored', 'success', 'fa-rotate-left');
  }
};

// Bootstrap
function initApp() {
  loadState();

  const theme = window.luminaState.settings.theme || 'light';
  document.documentElement.setAttribute('data-theme', theme);
  const themeIcon = document.getElementById('themeToggleIcon');
  if (themeIcon) {
    themeIcon.className = theme === 'dark' ? 'fa-solid fa-moon text-cyan-400' : 'fa-solid fa-sun text-zinc-900';
  }

  const soundIcon = document.getElementById('soundToggleIcon');
  if (soundIcon) {
    soundIcon.className = window.luminaState.settings.soundEnabled ? 'fa-solid fa-volume-high text-zinc-900' : 'fa-solid fa-volume-xmark text-zinc-400';
  }

  const tempBtn = document.getElementById('tempUnitToggleBtn');
  if (tempBtn) {
    tempBtn.textContent = `°${window.luminaState.settings.tempUnit}`;
  }

  initClock();
  renderRoomFilter();
  renderScenes();
  renderDeviceGrid();
  updateSummaryStats();
  updateAmbientGlow();

  window.switchTab('dashboard');
  if (window.initEnergyCharts) {
    window.initEnergyCharts();
  }
}

window.addEventListener('DOMContentLoaded', () => {
  initApp();
});

/**
 * Lumina Smart Home OS - Interactive Floor Plan Module
 * Configured for Glassmorphism UI
 */

function renderFloorPlan() {
  const container = document.getElementById('floorPlanContainer');
  if (!container) return;

  const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
  const isDark = currentTheme === 'dark';

  const strokeColor = isDark ? 'rgba(255, 255, 255, 0.18)' : 'rgba(0, 0, 0, 0.15)';
  const wallStroke = isDark ? '#38bdf8' : '#09090b';
  const textColor = isDark ? '#e2e8f0' : '#09090b';
  const subtextColor = isDark ? '#94a3b8' : '#64748b';

  // Check state of key devices
  const lrLight = window.luminaState.devices.find(d => d.id === 'lr_light_main');
  const brLight = window.luminaState.devices.find(d => d.id === 'br_light_main');
  const ktLight = window.luminaState.devices.find(d => d.id === 'kt_lights');
  const ofLight = window.luminaState.devices.find(d => d.id === 'of_desk_light');
  const odLight = window.luminaState.devices.find(d => d.id === 'od_porch_light');
  const lock = window.luminaState.devices.find(d => d.id === 'od_door_lock');
  const thermo = window.luminaState.devices.find(d => d.id === 'lr_thermostat');

  const lrGlow = lrLight && lrLight.isOn ? 'fill: rgba(245, 158, 11, 0.18); stroke: #d97706;' : '';
  const brGlow = brLight && brLight.isOn ? 'fill: rgba(245, 158, 11, 0.18); stroke: #d97706;' : '';
  const ktGlow = ktLight && ktLight.isOn ? 'fill: rgba(2, 132, 199, 0.18); stroke: #0284c7;' : '';
  const ofGlow = ofLight && ofLight.isOn ? 'fill: rgba(124, 58, 237, 0.18); stroke: #7c3aed;' : '';
  const odGlow = odLight && odLight.isOn ? 'fill: rgba(245, 158, 11, 0.22); stroke: #d97706;' : '';

  const lockColor = lock && lock.isLocked ? '#059669' : '#e11d48';
  const lockText = lock && lock.isLocked ? 'Locked' : 'Unlocked';

  const svgHtml = `
    <div class="relative w-full overflow-hidden flex flex-col items-center">
      <div class="w-full max-w-4xl glass-panel rounded-3xl p-5 shadow-xl border border-white/80">
        <!-- Floor Plan Header Controls -->
        <div class="flex flex-wrap items-center justify-between mb-4 text-xs text-zinc-500 gap-2">
          <div class="flex items-center gap-3">
            <span class="inline-flex items-center gap-1.5 font-bold text-zinc-900">
              <span class="w-2.5 h-2.5 rounded-full bg-black animate-pulse"></span>
              Spatial Architectural Blueprint
            </span>
            <span class="hidden sm:inline text-zinc-400">| Ground Floor • 185 m²</span>
          </div>
          <div class="flex items-center gap-2">
            <button onclick="window.filterByRoom('all')" class="px-3.5 py-1.5 rounded-xl bg-black text-white hover:bg-zinc-800 text-xs font-semibold shadow-md transition">View All</button>
            <span class="text-xs text-zinc-500">Click room to focus</span>
          </div>
        </div>

        <svg viewBox="0 0 900 520" class="w-full h-auto select-none rounded-2xl border border-black/10 shadow-inner" style="background: ${isDark ? '#090d16' : 'rgba(255, 255, 255, 0.85)'};">
          <defs>
            <pattern id="grid" width="24" height="24" patternUnits="userSpaceOnUse">
              <path d="M 24 0 L 0 0 0 24" fill="none" stroke="${isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)'}" stroke-width="1"/>
            </pattern>
            <filter id="glow-light" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="6" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          <rect width="900" height="520" fill="url(#grid)" />

          <!-- Exterior Walls / Boundary (Black Framing) -->
          <rect x="40" y="40" width="820" height="440" rx="16" fill="none" stroke="${wallStroke}" stroke-width="3" />

          <!-- ROOM 1: PATIO & GARDEN (Top Left) -->
          <g class="room-group cursor-pointer" onclick="window.filterByRoom('outdoor')">
            <rect x="50" y="50" width="250" height="150" rx="8" class="room-path" style="${odGlow}" />
            <text x="70" y="80" fill="${textColor}" font-size="14" font-weight="700">Patio & Garden</text>
            <text x="70" y="100" fill="${subtextColor}" font-size="11">Outdoor • 35 m²</text>
            <g class="device-node" onclick="event.stopPropagation(); window.toggleDevice('od_porch_light');">
              <circle cx="100" cy="140" r="16" fill="${odLight && odLight.isOn ? '#d97706' : '#09090b'}" filter="${odLight && odLight.isOn ? 'url(#glow-light)' : ''}" />
              <text x="100" y="144" fill="#fff" font-size="11" text-anchor="middle" font-family="FontAwesome">&#xf185;</text>
            </g>
            <text x="125" y="144" fill="${textColor}" font-size="11" font-weight="600">Pathway Glow</text>
          </g>

          <!-- ROOM 2: KITCHEN & DINING (Top Center) -->
          <g class="room-group cursor-pointer" onclick="window.filterByRoom('kitchen')">
            <rect x="310" y="50" width="280" height="180" rx="8" class="room-path" style="${ktGlow}" />
            <text x="330" y="80" fill="${textColor}" font-size="14" font-weight="700">Kitchen & Pantry</text>
            <text x="330" y="100" fill="${subtextColor}" font-size="11">Active • Fridge 3°C</text>
            <rect x="380" y="120" width="140" height="60" rx="6" fill="${isDark ? '#1e293b' : 'rgba(244, 244, 245, 0.8)'}" stroke="${strokeColor}" />
            <g class="device-node" onclick="event.stopPropagation(); window.toggleDevice('kt_lights');">
              <circle cx="450" cy="150" r="15" fill="${ktLight && ktLight.isOn ? '#0284c7' : '#09090b'}" filter="${ktLight && ktLight.isOn ? 'url(#glow-light)' : ''}" />
              <text x="450" y="154" fill="#fff" font-size="11" text-anchor="middle" font-family="FontAwesome">&#xf0eb;</text>
            </g>
          </g>

          <!-- ROOM 3: HOME OFFICE (Top Right) -->
          <g class="room-group cursor-pointer" onclick="window.filterByRoom('office')">
            <rect x="600" y="50" width="250" height="180" rx="8" class="room-path" style="${ofGlow}" />
            <text x="620" y="80" fill="${textColor}" font-size="14" font-weight="700">Home Office</text>
            <text x="620" y="100" fill="${subtextColor}" font-size="11">2 Devices Online</text>
            <rect x="670" y="110" width="110" height="50" rx="4" fill="${isDark ? '#1e293b' : 'rgba(244, 244, 245, 0.8)'}" stroke="${strokeColor}" />
            <g class="device-node" onclick="event.stopPropagation(); window.toggleDevice('of_desk_light');">
              <circle cx="725" cy="135" r="14" fill="${ofLight && ofLight.isOn ? '#7c3aed' : '#09090b'}" filter="${ofLight && ofLight.isOn ? 'url(#glow-light)' : ''}" />
              <text x="725" y="139" fill="#fff" font-size="10" text-anchor="middle" font-family="FontAwesome">&#xf0eb;</text>
            </g>
          </g>

          <!-- ROOM 4: MAIN LIVING ROOM & THEATER (Bottom Left to Center) -->
          <g class="room-group cursor-pointer" onclick="window.filterByRoom('living')">
            <rect x="50" y="240" width="450" height="230" rx="8" class="room-path" style="${lrGlow}" />
            <text x="70" y="270" fill="${textColor}" font-size="16" font-weight="700">Grand Living Room & Theater</text>
            <text x="70" y="290" fill="${subtextColor}" font-size="12">Climate: ${thermo ? (window.luminaState.settings.tempUnit === 'F' ? thermo.currentTempF + '°F' : thermo.currentTempC + '°C') : '22°C'} • Audio Active</text>
            
            <rect x="150" y="340" width="160" height="55" rx="8" fill="${isDark ? '#1e293b' : 'rgba(244, 244, 245, 0.8)'}" stroke="${strokeColor}" />
            <rect x="170" y="445" width="120" height="8" rx="2" fill="#09090b" />
            
            <g class="device-node" onclick="event.stopPropagation(); window.toggleDevice('lr_light_main');">
              <circle cx="230" cy="305" r="18" fill="${lrLight && lrLight.isOn ? '#d97706' : '#09090b'}" filter="${lrLight && lrLight.isOn ? 'url(#glow-light)' : ''}" />
              <text x="230" y="310" fill="#fff" font-size="13" text-anchor="middle" font-family="FontAwesome">&#xf0eb;</text>
            </g>
            <text x="230" y="333" fill="${textColor}" font-size="11" font-weight="600" text-anchor="middle">Main Light</text>

            <g class="device-node" onclick="event.stopPropagation(); window.filterByRoom('living');">
              <circle cx="85" cy="380" r="14" fill="#09090b" />
              <text x="85" y="384" fill="#fff" font-size="10" text-anchor="middle" font-family="FontAwesome">&#xf2c9;</text>
            </g>
            <text x="105" y="384" fill="${textColor}" font-size="11" font-weight="600">HVAC</text>
          </g>

          <!-- ROOM 5: MASTER BEDROOM (Bottom Right) -->
          <g class="room-group cursor-pointer" onclick="window.filterByRoom('bedroom')">
            <rect x="510" y="240" width="340" height="230" rx="8" class="room-path" style="${brGlow}" />
            <text x="530" y="270" fill="${textColor}" font-size="15" font-weight="700">Master Bedroom</text>
            <text x="530" y="290" fill="${subtextColor}" font-size="12">Air Purifier: AQI 14 (Optimal)</text>
            <rect x="650" y="330" width="120" height="100" rx="6" fill="${isDark ? '#1e293b' : 'rgba(244, 244, 245, 0.8)'}" stroke="${strokeColor}" />
            
            <g class="device-node" onclick="event.stopPropagation(); window.toggleDevice('br_light_main');">
              <circle cx="590" cy="360" r="16" fill="${brLight && brLight.isOn ? '#d97706' : '#09090b'}" filter="${brLight && brLight.isOn ? 'url(#glow-light)' : ''}" />
              <text x="590" y="365" fill="#fff" font-size="11" text-anchor="middle" font-family="FontAwesome">&#xf0eb;</text>
            </g>
            <text x="590" y="388" fill="${textColor}" font-size="11" font-weight="600" text-anchor="middle">Pendant</text>
          </g>

          <!-- ENTRANCE / FRONT DOOR LOCK HOTSPOT -->
          <g class="device-node" onclick="event.stopPropagation(); window.toggleLock('od_door_lock');">
            <rect x="235" y="35" width="75" height="26" rx="13" fill="${lockColor}" />
            <text x="272" y="52" fill="#fff" font-size="10" font-weight="bold" text-anchor="middle">${lockText}</text>
          </g>
        </svg>

        <div class="mt-4 flex flex-wrap items-center justify-between text-xs text-zinc-500 border-t border-black/10 pt-3">
          <div class="flex items-center gap-4">
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-amber-500"></span> Lighting (Click to toggle)</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-sky-600"></span> Climate / Appliance</span>
            <span class="flex items-center gap-1.5"><span class="w-3 h-3 rounded-full bg-emerald-600"></span> Security / Lock</span>
          </div>
          <span class="text-zinc-600 font-medium">Real-time bi-directional sync enabled</span>
        </div>
      </div>
    </div>
  `;

  container.innerHTML = svgHtml;
}

window.renderFloorPlan = renderFloorPlan;

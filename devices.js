/**
 * Lumina Smart Home OS - Devices & Rooms Database
 * Classic Monochrome Glassmorphism Edition
 */

const INITIAL_STATE = {
  settings: {
    tempUnit: 'C', // 'C' or 'F'
    soundEnabled: true,
    theme: 'light', // 'light' (classic white with black accents)
    homeMode: 'Home',
    ambientGlow: true
  },
  weather: {
    tempC: 22,
    tempF: 72,
    condition: 'Partly Cloudy',
    humidity: 48,
    airQuality: 'Good (AQI 28)',
    windSpeed: '12 km/h',
    icon: 'fa-cloud-sun'
  },
  rooms: [
    { id: 'all', name: 'All Rooms', icon: 'fa-house', deviceCount: 14 },
    { id: 'living', name: 'Living Room', icon: 'fa-couch', deviceCount: 5 },
    { id: 'bedroom', name: 'Master Bedroom', icon: 'fa-bed', deviceCount: 4 },
    { id: 'kitchen', name: 'Kitchen', icon: 'fa-kitchen-set', deviceCount: 3 },
    { id: 'office', name: 'Home Office', icon: 'fa-laptop-code', deviceCount: 2 },
    { id: 'outdoor', name: 'Patio & Garden', icon: 'fa-tree', deviceCount: 2 }
  ],
  devices: [
    // Living Room
    {
      id: 'lr_light_main',
      room: 'living',
      name: 'Ceiling Chandelier',
      type: 'light',
      icon: 'fa-lightbulb',
      isOn: true,
      brightness: 85,
      color: '#ffb347',
      colorTemp: 3200,
      powerWatts: 45
    },
    {
      id: 'lr_light_strip',
      room: 'living',
      name: 'TV Ambient Backlight',
      type: 'light',
      icon: 'fa-wand-magic-sparkles',
      isOn: true,
      brightness: 70,
      color: '#06b6d4',
      powerWatts: 18
    },
    {
      id: 'lr_thermostat',
      room: 'living',
      name: 'Main Climate Unit',
      type: 'climate',
      icon: 'fa-temperature-half',
      isOn: true,
      currentTempC: 22.5,
      targetTempC: 21.0,
      currentTempF: 72.5,
      targetTempF: 70.0,
      humidity: 48,
      mode: 'cool', // 'cool', 'heat', 'auto', 'eco'
      fanSpeed: 'auto',
      powerWatts: 620
    },
    {
      id: 'lr_tv',
      room: 'living',
      name: 'Sony 4K OLED TV',
      type: 'media',
      icon: 'fa-tv',
      isOn: true,
      source: 'Apple TV',
      volume: 35,
      nowPlaying: {
        title: 'Interstellar: Main Theme',
        artist: 'Hans Zimmer',
        isPlaying: true,
        progress: 42
      },
      powerWatts: 120
    },
    {
      id: 'lr_camera',
      room: 'living',
      name: 'Living Room Cam',
      type: 'camera',
      icon: 'fa-video',
      isOn: true,
      isStreaming: true,
      battery: 98,
      hasMotion: false,
      powerWatts: 5
    },

    // Master Bedroom
    {
      id: 'br_light_main',
      room: 'bedroom',
      name: 'Pendant Lamp',
      type: 'light',
      icon: 'fa-lightbulb',
      isOn: false,
      brightness: 40,
      color: '#ffe4b5',
      powerWatts: 25
    },
    {
      id: 'br_blinds',
      room: 'bedroom',
      name: 'Smart Blackout Blinds',
      type: 'blinds',
      icon: 'fa-blinds',
      position: 80,
      isOpen: false,
      powerWatts: 0
    },
    {
      id: 'br_ac',
      room: 'bedroom',
      name: 'Dual Inverter AC',
      type: 'climate',
      icon: 'fa-snowflake',
      isOn: false,
      currentTempC: 23.0,
      targetTempC: 20.0,
      currentTempF: 73.4,
      targetTempF: 68.0,
      humidity: 52,
      mode: 'cool',
      fanSpeed: 'low',
      powerWatts: 0
    },
    {
      id: 'br_air_purifier',
      room: 'bedroom',
      name: 'HEPA Air Purifier',
      type: 'purifier',
      icon: 'fa-wind',
      isOn: true,
      aqi: 14,
      fanSpeed: 'auto',
      filterLife: 82,
      powerWatts: 28
    },

    // Kitchen
    {
      id: 'kt_lights',
      room: 'kitchen',
      name: 'Cabinet Spotlights',
      type: 'light',
      icon: 'fa-lightbulb',
      isOn: true,
      brightness: 90,
      color: '#ffffff',
      powerWatts: 35
    },
    {
      id: 'kt_fridge',
      room: 'kitchen',
      name: 'Smart Family Hub Fridge',
      type: 'appliance',
      icon: 'fa-box-archive',
      isOn: true,
      fridgeTemp: 3,
      freezerTemp: -18,
      doorClosed: true,
      powerWatts: 85
    },

    // Home Office
    {
      id: 'of_desk_light',
      room: 'office',
      name: 'Monitor Lightbar & Lamp',
      type: 'light',
      icon: 'fa-lamp-desk',
      isOn: true,
      brightness: 100,
      color: '#ffffff',
      powerWatts: 20
    },
    {
      id: 'of_vacuum',
      room: 'office',
      name: 'Roborock Vacuum S8',
      type: 'vacuum',
      icon: 'fa-robot',
      status: 'docked',
      battery: 100,
      areaCleaned: '48 m²',
      cleanTime: '36 min',
      powerWatts: 15
    },

    // Outdoor & Security
    {
      id: 'od_porch_light',
      room: 'outdoor',
      name: 'Garden Pathway Glow',
      type: 'light',
      icon: 'fa-sun',
      isOn: true,
      brightness: 60,
      color: '#ffc107',
      powerWatts: 30
    },
    {
      id: 'od_door_lock',
      room: 'outdoor',
      name: 'Front Door Ultra Lock',
      type: 'lock',
      icon: 'fa-lock',
      isLocked: true,
      battery: 92,
      lastEvent: 'Auto-locked at 18:00',
      powerWatts: 2
    }
  ],
  scenes: [
    {
      id: 'scene_movie',
      name: 'Movie Night',
      icon: 'fa-film',
      description: 'Dims lights to 15%, TV backlight cyan, blinds closed',
      active: false
    },
    {
      id: 'scene_morning',
      name: 'Good Morning',
      icon: 'fa-sun',
      description: 'Open blinds, pleasant 22°C, warm daylight lights',
      active: true
    },
    {
      id: 'scene_sleep',
      name: 'Bedtime',
      icon: 'fa-moon',
      description: 'Turn off all main lights, lock all doors, AC to 20°C',
      active: false
    },
    {
      id: 'scene_away',
      name: 'Leaving Home',
      icon: 'fa-person-walking-dashed-line-arrow-right',
      description: 'Eco climate mode, vacuum starts cleaning, security armed',
      active: false
    },
    {
      id: 'scene_party',
      name: 'Party Mood',
      icon: 'fa-champagne-glasses',
      description: 'RGB lights cycling, audio at 65%, vibrant ambiance',
      active: false
    }
  ],
  security: {
    systemState: 'Armed (Home)',
    alarmTriggered: false,
    sensors: [
      { name: 'Front Entrance Door Sensor', status: 'Closed', ok: true },
      { name: 'Living Room Glass Break Sensor', status: 'Clear', ok: true },
      { name: 'Master Bedroom Window Sensor', status: 'Closed', ok: true },
      { name: 'Backyard Motion Detector', status: 'Clear', ok: true },
      { name: 'Kitchen Smoke & CO Detector', status: 'Safe (0 ppm)', ok: true }
    ],
    recentLogs: [
      { time: '18:45', event: 'Front Door verified locked', type: 'info' },
      { time: '18:15', event: 'Living room temperature reached target 21°C', type: 'info' },
      { time: '17:30', event: 'Patio pathway glow turned ON (Sunset Routine)', type: 'routine' },
      { time: '16:02', event: 'Roborock S8 completed cleaning session and docked', type: 'success' },
      { time: '14:20', event: 'Armed mode set to Armed (Home)', type: 'security' }
    ]
  },
  routines: [
    {
      id: 'rt_1',
      name: 'Sunset Ambient Illumination',
      trigger: 'At Sunset (17:30)',
      action: 'Turn on Garden Lights & Living Room Lamps at 60%',
      enabled: true
    },
    {
      id: 'rt_2',
      name: 'Bedtime Security Lockdown',
      trigger: 'Everyday at 23:00',
      action: 'Lock all doors, arm exterior motion sensors, turn off interior lights',
      enabled: true
    },
    {
      id: 'rt_3',
      name: 'High Heat Eco Guard',
      trigger: 'When outside temp > 30°C',
      action: 'Lower blinds by 60% and set AC to Eco Mode',
      enabled: true
    }
  ]
};

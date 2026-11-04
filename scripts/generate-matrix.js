/**
 * Arc-Reactor Pulsing Matrix & Low-Poly Holographic Contribution Generator
 * Engineered for Sushanth Arun's GitHub Profile
 */

const fs = require('fs');
const path = require('path');

async function fetchContributions(username) {
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${username}?y=last`);
    if (res.ok) {
      const data = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Direct contributions API failed, checking fallbacks:', err.message);
  }
  return null;
}

function generateSvg(data) {
  const total = data?.total?.lastYear || 246;
  const contributions = data?.contributions || [];

  // Group into weeks (52 weeks x 7 days)
  const weeks = [];
  let currentWeek = [];
  for (let i = 0; i < contributions.length; i++) {
    currentWeek.push(contributions[i]);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  }
  if (currentWeek.length > 0) {
    weeks.push(currentWeek);
  }

  // Take the last 50 weeks to fit comfortably
  const displayWeeks = weeks.slice(-48);

  const cellWidth = 9.5;
  const cellHeight = 9.5;
  const cellGap = 2.5;
  const gridStartX = 265;
  const gridStartY = 85;

  const colorMap = {
    0: '#111827',
    1: '#0066ff',
    2: '#00f3ff',
    3: '#8a2be2',
    4: '#ff0055'
  };

  let cellsSvg = '';
  let peakPoints = [];

  displayWeeks.forEach((week, wIdx) => {
    week.forEach((day, dIdx) => {
      const x = gridStartX + wIdx * (cellWidth + cellGap);
      const y = gridStartY + dIdx * (cellHeight + cellGap);
      const level = day.level || 0;
      const fill = colorMap[level] || colorMap[0];
      const count = day.count || 0;

      let cellGlow = '';
      if (level >= 3) {
        cellGlow = `filter="url(#glowCrimson)"`;
        peakPoints.push({ x: x + cellWidth / 2, y: y + cellHeight / 2 });
      } else if (level === 2) {
        cellGlow = `filter="url(#glowCyan)"`;
      }

      cellsSvg += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${cellWidth}" height="${cellHeight}" rx="2" fill="${fill}" ${cellGlow} opacity="${level === 0 ? '0.45' : '0.95'}">
        <title>${day.date}: ${count} contributions</title>
      </rect>\n`;
    });
  });

  // Low-poly facet lines between peak activity points
  let polyLinesSvg = '';
  if (peakPoints.length > 1) {
    for (let i = 0; i < peakPoints.length - 1; i++) {
      const p1 = peakPoints[i];
      const p2 = peakPoints[i + 1];
      polyLinesSvg += `<line x1="${p1.x.toFixed(1)}" y1="${p1.y.toFixed(1)}" x2="${p2.x.toFixed(1)}" y2="${p2.y.toFixed(1)}" stroke="#00f3ff" stroke-width="0.8" stroke-opacity="0.4" stroke-dasharray="3,3" />\n`;
    }
  }

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 880 290" width="880" height="290" fill="none">
  <defs>
    <!-- Background Gradient -->
    <linearGradient id="bgGrad" x1="0" y1="0" x2="880" y2="290" gradientUnits="userSpaceOnUse">
      <stop offset="0%" stop-color="#060913" />
      <stop offset="50%" stop-color="#0a1020" />
      <stop offset="100%" stop-color="#05070e" />
    </linearGradient>

    <!-- Glow Filters -->
    <filter id="glowCyan" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="3.5" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="glowCrimson" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="4" result="blur" />
      <feMerge>
        <feMergeNode in="blur" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>

    <filter id="glowCore" x="-60%" y="-60%" width="220%" height="220%">
      <feGaussianBlur stdDeviation="6" result="blur1" />
      <feGaussianBlur stdDeviation="2" result="blur2" />
      <feMerge>
        <feMergeNode in="blur1" />
        <feMergeNode in="blur2" />
        <feMergeNode in="SourceGraphic" />
      </feMerge>
    </filter>
  </defs>

  <style>
    .mono { font-family: 'Fira Code', 'JetBrains Mono', Consolas, monospace; }
    .sans { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
    @keyframes pulse {
      0% { r: 12px; opacity: 0.9; }
      50% { r: 15px; opacity: 1; }
      100% { r: 12px; opacity: 0.9; }
    }
    @keyframes spinClockwise {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    @keyframes spinCounter {
      0% { transform: rotate(360deg); }
      100% { transform: rotate(0deg); }
    }
    .pulsing-core {
      animation: pulse 2.4s ease-in-out infinite;
    }
    .rotating-ring {
      transform-origin: 125px 145px;
      animation: spinClockwise 18s linear infinite;
    }
    .counter-ring {
      transform-origin: 125px 145px;
      animation: spinCounter 12s linear infinite;
    }
  </style>

  <!-- Container Frame -->
  <rect x="2" y="2" width="876" height="286" rx="10" fill="url(#bgGrad)" stroke="#162742" stroke-width="1.5" />

  <!-- Corner Brackets -->
  <path d="M 12 24 L 12 12 L 24 12" stroke="#00f3ff" stroke-width="2" fill="none" />
  <path d="M 868 24 L 868 12 L 856 12" stroke="#00f3ff" stroke-width="2" fill="none" />
  <path d="M 12 266 L 12 278 L 24 278" stroke="#00f3ff" stroke-width="2" fill="none" />
  <path d="M 868 266 L 868 278 L 856 278" stroke="#00f3ff" stroke-width="2" fill="none" />

  <!-- Top HUD Bar -->
  <g class="mono">
    <text x="32" y="28" fill="#00f3ff" font-size="10.5" font-weight="700" letter-spacing="2px">ARC-REACTOR PULSING TELEMETRY // REAL-TIME SPECTRUM</text>
    <circle cx="810" cy="24" r="3.5" fill="#00f3ff" filter="url(#glowCyan)" />
    <text x="822" y="28" fill="#58A6FF" font-size="9.5" font-weight="600" letter-spacing="1px">ONLINE</text>
  </g>

  <!-- ========================================================================= -->
  <!-- LEFT: ARC-REACTOR PULSING HOLOGRAPHIC CORE                                -->
  <!-- ========================================================================= -->
  <g id="arc-reactor-module">
    <!-- Outer Chamber Ring -->
    <circle cx="125" cy="140" r="82" stroke="#12253d" stroke-width="2" fill="none" />
    <circle cx="125" cy="140" r="76" stroke="#00f3ff" stroke-width="1" stroke-opacity="0.3" stroke-dasharray="4,4" fill="none" />
    
    <!-- Rotating Segment Ring -->
    <g class="rotating-ring">
      <circle cx="125" cy="140" r="62" stroke="#0066ff" stroke-width="3" stroke-dasharray="16,8" fill="none" filter="url(#glowCyan)" />
      <circle cx="125" cy="140" r="48" stroke="#00f3ff" stroke-width="1.8" stroke-dasharray="8,14" fill="none" />
    </g>

    <!-- Counter Rotating Crimson Ring -->
    <g class="counter-ring">
      <circle cx="125" cy="140" r="36" stroke="#ff0055" stroke-width="2" stroke-dasharray="10,6" fill="none" filter="url(#glowCrimson)" opacity="0.85" />
    </g>

    <!-- Radiating Energy Spokes -->
    <g stroke="#00f3ff" stroke-width="1" stroke-opacity="0.4">
      <line x1="125" y1="62" x2="125" y2="76" />
      <line x1="125" y1="204" x2="125" y2="218" />
      <line x1="47" y1="140" x2="61" y2="140" />
      <line x1="189" y1="140" x2="203" y2="140" />
      <line x1="70" y1="85" x2="80" y2="95" />
      <line x1="170" y1="185" x2="180" y2="195" />
      <line x1="70" y1="195" x2="80" y2="185" />
      <line x1="170" y1="95" x2="180" y2="85" />
    </g>

    <!-- Central Arc Energy Core -->
    <circle cx="125" cy="140" r="20" fill="#001833" stroke="#00f3ff" stroke-width="2" />
    <circle class="pulsing-core" cx="125" cy="140" r="13" fill="#00f3ff" filter="url(#glowCore)" />
    <circle cx="125" cy="140" r="6" fill="#FFFFFF" />

    <!-- Core Telemetry Labels -->
    <text x="125" y="240" text-anchor="middle" fill="#FFFFFF" class="mono" font-size="11" font-weight="700" letter-spacing="1.5px">ARC CORE ACTIVE</text>
    <text x="125" y="258" text-anchor="middle" fill="#00f3ff" class="mono" font-size="9.5" letter-spacing="1px">${total} CONTRIBUTIONS</text>
  </g>

  <!-- Vertical HUD Divider -->
  <line x1="242" y1="42" x2="242" y2="265" stroke="#1F3A5F" stroke-width="1" stroke-dasharray="4,4" />

  <!-- ========================================================================= -->
  <!-- RIGHT: LOW-POLY HOLOGRAPHIC CONTRIBUTION MATRIX                           -->
  <!-- ========================================================================= -->
  <g id="holographic-matrix">
    <!-- Sub-header -->
    <text x="265" y="58" fill="#8B949E" class="mono" font-size="10" letter-spacing="1px">52-WEEK ACTIVITY CLUSTER MATRIX</text>
    <text x="840" y="58" text-anchor="end" fill="#00f3ff" class="mono" font-size="10" font-weight="600">INTENSITY: OPTIMAL</text>

    <!-- Polyline Facets -->
    ${polyLinesSvg}

    <!-- Contribution Cells -->
    ${cellsSvg}

    <!-- Days of Week Indicator -->
    <g class="mono" font-size="8" fill="#484F58">
      <text x="252" y="93">M</text>
      <text x="252" y="117">W</text>
      <text x="252" y="141">F</text>
    </g>

    <!-- Legend & Spectrum at Bottom -->
    <g class="mono" font-size="8.5" fill="#8B949E">
      <text x="265" y="215">LOW INTENSITY</text>
      
      <rect x="365" y="206" width="9.5" height="9.5" rx="2" fill="#111827" opacity="0.5" />
      <rect x="380" y="206" width="9.5" height="9.5" rx="2" fill="#0066ff" />
      <rect x="395" y="206" width="9.5" height="9.5" rx="2" fill="#00f3ff" filter="url(#glowCyan)" />
      <rect x="410" y="206" width="9.5" height="9.5" rx="2" fill="#8a2be2" />
      <rect x="425" y="206" width="9.5" height="9.5" rx="2" fill="#ff0055" filter="url(#glowCrimson)" />

      <text x="445" y="215" fill="#ff0055" font-weight="700">HIGH BURST INTENSITY</text>

      <text x="840" y="215" text-anchor="end" fill="#58A6FF">TOTAL: ${total} COMMITS / PRs</text>
    </g>
  </g>

  <!-- Bottom System Signature -->
  <g class="mono" font-size="8.5" fill="#30363D">
    <text x="265" y="255">TELEMETRY FREQUENCY: 24H AUTONOMOUS CYCLE</text>
    <text x="840" y="255" text-anchor="end">HUD NODE SECURE</text>
  </g>
</svg>`;
}

async function main() {
  console.log('Fetching contributions for sushanth-arun...');
  const data = await fetchContributions('sushanth-arun');
  const svg = generateSvg(data);

  const assetsDir = path.join(__dirname, '..', 'assets');
  if (!fs.existsSync(assetsDir)) {
    fs.mkdirSync(assetsDir, { recursive: true });
  }

  const outPath = path.join(assetsDir, 'contribution-matrix.svg');
  fs.writeFileSync(outPath, svg, 'utf8');
  console.log(`Successfully generated Arc-Reactor contribution matrix at ${outPath}`);
}

main().catch(err => {
  console.error('Error generating contribution matrix:', err);
  process.exit(1);
});

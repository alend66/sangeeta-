const fs = require('fs');

let html = fs.readFileSync('index.html', 'utf8');

// 1. Replace brand names
html = html.replace(/SANJANA/g, 'SANGEETHA');
html = html.replace(/Sanjana/g, 'Sangeetha');
html = html.replace(/sanjana/g, 'sangeetha');

// 2. Add rain overlay after progress bar if not already present
if (!html.includes('id="rain"')) {
  html = html.replace('<div id="progress"></div>', '<div id="progress"></div>\n<!-- MONSOON RAIN ATMOSPHERIC EFFECT -->\n<div id="rain" class="rain-overlay" aria-hidden="true"><canvas id="rainCanvas"></canvas></div>');
}

// 3. Replace lorry & customer-house section inside .scene
const sceneStart = '<div class="road" id="road"></div>';
const sceneEnd = '</div>\n\n<main>';
const newSceneContent = `<div class="road" id="road"></div>
  <!-- THE REAL PHOTO SANGEETHA FURNITURE DELIVERY LORRY -->
  <div class="lorry real-lorry" id="lorry">
    <div class="beam" id="beam"></div>
    <div class="puffs"><i></i><i></i><i></i></div>
    <div class="spray" id="spray"><i></i><i></i><i></i></div>
    <canvas id="lorryimg" role="img" aria-label="Real SANGEETHA Furniture Delivery Lorry"></canvas>
    <!-- Rotating Wheel Rim Overlays (Rear: 29.8%, Front: 78.2%) -->
    <div class="rim" id="w1" style="left:29.8%;top:75.8%"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#181b1e"/><circle cx="50" cy="50" r="44" fill="#2d3238"/><circle cx="50" cy="50" r="34" fill="#a4aab2"/><circle cx="50" cy="50" r="26" fill="#697078"/><g fill="#181b1e"><circle cx="50" cy="50" r="10"/><circle cx="50" cy="32" r="4"/><circle cx="68" cy="50" r="4"/><circle cx="50" cy="68" r="4"/><circle cx="32" cy="50" r="4"/><circle cx="63" cy="37" r="4"/><circle cx="37" cy="63" r="4"/><circle cx="63" cy="63" r="4"/><circle cx="37" cy="37" r="4"/></g></svg></div>
    <div class="rim" id="w2" style="left:78.2%;top:75.8%"><svg viewBox="0 0 100 100"><circle cx="50" cy="50" r="48" fill="#181b1e"/><circle cx="50" cy="50" r="44" fill="#2d3238"/><circle cx="50" cy="50" r="34" fill="#a4aab2"/><circle cx="50" cy="50" r="26" fill="#697078"/><g fill="#181b1e"><circle cx="50" cy="50" r="10"/><circle cx="50" cy="32" r="4"/><circle cx="68" cy="50" r="4"/><circle cx="50" cy="68" r="4"/><circle cx="32" cy="50" r="4"/><circle cx="63" cy="37" r="4"/><circle cx="37" cy="63" r="4"/><circle cx="63" cy="63" r="4"/><circle cx="37" cy="37" r="4"/></g></svg></div>
  </div>

  <!-- THE CUSTOMER'S DESTINATION HOUSE & DELIGHTED HOMEOWNERS -->
  <div class="customer-house real-house" id="customer-house">
    <div class="celebration-burst" aria-hidden="true">
      <span class="burst b1">❤️</span>
      <span class="burst b2">✨</span>
      <span class="burst b3">💖</span>
      <span class="burst b4">🛋️</span>
      <span class="burst b5">🎉</span>
    </div>

    <div class="delight-bubble" id="delight-bubble">
      <b>SANGEETHA Teak Arrived!</b>
      <span>Delighted &amp; Happy Customers ✨</span>
    </div>

    <div class="house-frame">
      <img src="customer-house.jpg" alt="Delighted Customer House with Handcrafted Sangeetha Furniture" class="house-photo">
      <div class="house-porch-glow"></div>
    </div>
  </div>`;

const startIdx = html.indexOf(sceneStart);
const endIdx = html.indexOf(sceneEnd);
if (startIdx !== -1 && endIdx !== -1) {
  html = html.substring(0, startIdx) + newSceneContent + '\n' + html.substring(endIdx);
  fs.writeFileSync('index.html', html, 'utf8');
  console.log('SUCCESS: index.html updated successfully!');
} else {
  console.log('FAILED to find bounds:', startIdx, endIdx);
}

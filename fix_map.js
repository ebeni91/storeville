const fs = require('fs');
let content = fs.readFileSync('mobile/src/screens/buyer/ExploreScreen.tsx', 'utf8');

// 1. Marker Typography
const oldIconDefinition = `    var h = '<div class="store-pin" style="position:relative;width:46px;height:54px;cursor:pointer;">'
      + '<div style="width:46px;height:46px;border-radius:50%;background:#fff;border:2.5px solid '+col+';display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.15);position:relative;z-index:1;">'
      + '<div style="width:32px;height:32px;border-radius:50%;background:'+col+';display:flex;align-items:center;justify-content:center;">'+svg+'</div>'
      + '</div>'
      + '<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:10px;height:10px;background:'+col+';clip-path:polygon(50% 100%,0% 0%,100% 0%);"></div>'
      + '</div>';`;

const newIconDefinition = `    var t = '<div style="position:absolute;top:56px;left:50%;transform:translateX(-50%);background:rgba(255,255,255,0.95);padding:4px 10px;border-radius:12px;box-shadow:0 3px 12px rgba(0,0,0,0.12);white-space:nowrap;font-family:-apple-system, BlinkMacSystemFont, sans-serif;font-weight:800;font-size:12px;color:#111827;letter-spacing:-0.3px;pointer-events:none;">' + (s.name || 'Store') + '</div>';
    var h = '<div class="store-pin" style="position:relative;width:46px;height:54px;cursor:pointer;">'
      + '<div style="width:46px;height:46px;border-radius:50%;background:#fff;border:2.5px solid '+col+';display:flex;align-items:center;justify-content:center;box-shadow:0 4px 20px rgba(0,0,0,0.15);position:relative;z-index:1;">'
      + '<div style="width:32px;height:32px;border-radius:50%;background:'+col+';display:flex;align-items:center;justify-content:center;">'+svg+'</div>'
      + '</div>'
      + '<div style="position:absolute;bottom:0;left:50%;transform:translateX(-50%);width:10px;height:10px;background:'+col+';clip-path:polygon(50% 100%,0% 0%,100% 0%);"></div>'
      + t + '</div>';`;

content = content.replace(oldIconDefinition, newIconDefinition);


// 2. Dynamic Zoom logic
const oldZoomLogic = `  // Because React Native guards the WebView until location is resolved, we always have location natively.
  // Smoothly zoom in to the user.
  if (!window.hasAutoLocated) {
    window.map.flyTo([lat, lng], 13, { animate: true, duration: 1.5 });
    window.hasAutoLocated = true;
  }`;

const newZoomLogic = `  // 1. Dynamically calculate population density to adjust zoom level
  var nearbyCount = 0;
  stores.forEach(function(s) {
    if (!s.latitude) return;
    var d = window.map.distance([lat, lng], [parseFloat(s.latitude), parseFloat(s.longitude)]);
    if (d < 15000) nearbyCount++; // count stores within 15km
  });
  
  var targetZoom = 13;
  if (nearbyCount > 15) targetZoom = 15; // highly populated, zoom deeply to separate pins
  else if (nearbyCount > 5) targetZoom = 14;

  // 2. Seamless mapping zoom override on first hit
  if (!window.hasAutoLocated) {
    window.map.flyTo([lat, lng], targetZoom, { animate: true, duration: 1.5 });
    window.hasAutoLocated = true;
  }`;

content = content.replace(oldZoomLogic, newZoomLogic);

fs.writeFileSync('mobile/src/screens/buyer/ExploreScreen.tsx', content);
console.log('Successfully embedded store titles and dynamic densities!');

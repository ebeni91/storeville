const fs = require('fs');
let content = fs.readFileSync('mobile/src/screens/buyer/ExploreScreen.tsx', 'utf8');

const oldZoomLogic = `  // 1. Dynamically calculate population density to adjust zoom level
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

const newZoomLogic = `  // 1. Dynamically compute the closest cluster bounds to guarantee ideal pin separation
  var distances = [];
  stores.forEach(function(s) {
    if (!s.latitude) return;
    var storeLat = parseFloat(s.latitude);
    var storeLng = parseFloat(s.longitude);
    distances.push([storeLat, storeLng, window.map.distance([lat, lng], [storeLat, storeLng])]);
  });
  
  distances.sort(function(a, b) { return a[2] - b[2]; });
  var closest = distances.slice(0, 5); // Take the top 5 closest stores
  
  var dynamicBounds = L.latLngBounds([[lat, lng]]);
  // Ensure we include at least a 1km radius visually even if stores are extremely close
  // 1 degree is roughly 111km, so 0.009 is about 1km
  dynamicBounds.extend([lat + 0.009, lng + 0.009]);
  dynamicBounds.extend([lat - 0.009, lng - 0.009]);
  
  closest.forEach(function(c) {
    dynamicBounds.extend([c[0], c[1]]);
  });

  // 2. Seamless mapping zoom override on first hit
  if (!window.hasAutoLocated) {
    if (closest.length > 0) {
      // Automatically calculates the perfect optical zoom stretching the nearest coordinates across the screen
      window.map.flyToBounds(dynamicBounds, { padding: [60, 60], maxZoom: 17, animate: true, duration: 1.5 });
    } else {
      window.map.flyTo([lat, lng], 16, { animate: true, duration: 1.5 });
    }
    window.hasAutoLocated = true;
  }`;

content = content.replace(oldZoomLogic, newZoomLogic);
fs.writeFileSync('mobile/src/screens/buyer/ExploreScreen.tsx', content);
console.log('Replaced map zoom logic successfully!');

const fs = require('fs');
let content = fs.readFileSync('mobile/src/screens/buyer/ExploreScreen.tsx', 'utf8');

// 1. Move leafletHTML and mapSource outside of component
const leafletHtmlMatch = content.match(/const leafletHTML = `([\s\S]*?)`;/);
if (leafletHtmlMatch) {
  let oldHtml = leafletHtmlMatch[0];
  let newHtml = "const MAP_SOURCE = {\n  html: `" + leafletHtmlMatch[1] + "`\n};\n";
  // Add clearance logic inside the HTML
  newHtml = newHtml.replace("var stores = data.stores;", 
`var stores = data.stores;
  if(window.userMarker) window.map.removeLayer(window.userMarker);
  if(window.storeMarkers) window.storeMarkers.forEach(function(m){window.map.removeLayer(m);});
  window.storeMarkers = [];`);

  newHtml = newHtml.replace("L.marker([lat,lng],", "window.userMarker = L.marker([lat,lng],");
  newHtml = newHtml.replace("L.marker(coord, {icon:ic}).addTo(window.map)", "var m = L.marker(coord, {icon:ic}).addTo(window.map);\n    window.storeMarkers.push(m);\n    m");

  content = content.replace(oldHtml, '');
  content = content.replace("import React, { useEffect, useState, useRef } from 'react';", "import React, { useEffect, useState, useRef } from 'react';\n" + newHtml);
}

// 2. Wrap source={} in MAP_SOURCE
content = content.replace(/source={{ html: leafletHTML }}/g, "source={MAP_SOURCE}");

// 3. ReactQuery performance (staleTime)
content = content.replace("enabled: true,", "enabled: true,\n    staleTime: 1000 * 60 * 5,\n    gcTime: 1000 * 60 * 10,");

// 4. Update dynamic ingestion
const oldInject = "const injectStoreData = () => {";
const newInject = `const injectStoreData = () => {
    if (!webviewRef.current || !stores) return;
    const payload = JSON.stringify({ stores: stores || [], lat, lng });
    webviewRef.current.injectJavaScript(\`
      (function() {
        try { window.dispatchEvent(new CustomEvent('initMap', { detail: \${payload} })); } catch(e){}
        true;
      })();
    \`);
  };
  useEffect(() => { injectStoreData(); }, [stores, activeGateway, location]); // dynamic updates
  
  // replace me dummy text to match regex`;
content = content.replace("const injectStoreData = () => {", newInject);
content = content.replace("  // replace me dummy text to match regex", "");

// 5. Drawer CTA fix, don't closeDrawer to freeze animation, set it instantly
content = content.replace("onPress={() => { closeDrawer(); navigation.navigate('StoreGateway', { store: selectedStore }); }}", 
"onPress={() => { drawerAnim.setValue(0); setSelectedStore(null); navigation.navigate('StoreGateway', { store: selectedStore }); }}");

fs.writeFileSync('mobile/src/screens/buyer/ExploreScreen.tsx', content);
console.log('Fixed explorer screen successfully!');

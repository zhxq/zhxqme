var map_template = {};
var map_color = {};
var shared_path_by_all = [];
var map_jsons = {};
var map_counter = 0;
var rawBaseColors = ["#F05E84","#D57B00","#BDAA00","#47D600","#00D688","#00B1BF","#009CF1","#AF73F8","#EB51CF", "#C4372D", "#0066B3", "#007C65", "#A64F93", "#B4A76C", "#E37D28","#009E50", "#84C6E4", "#6EB0C9", "#F2C62F","#D9A6C2", "#6E276C", "#006633", "#9B5D25", "#F6BA00", "#D12D48", "#C6A05D", "#D9C755", "#0072BD", "#F36C21", "#E23A2E", "#A8CF38", "#B4D44E"];

var baseColors = [];
var allColors = [];

var colorLen = rawBaseColors.length + 1;
for (var i = 0; i < colorLen; i++) {
 tinyColor = tinycolor(rawBaseColors[i]) 
 baseColors.push(eval(tinyColor))
}

for (i = 0; i < colorLen; i++) {
  var color = baseColors[i].toString()
  allColors.push(color)
}

for (i = 0; i < colorLen; i++) {
  var color = baseColors[i].clone().desaturate(40).toString()
  allColors.push(color)
}

for (i = 0; i < colorLen; i++) {
  var color = baseColors[i].clone().desaturate(60).lighten(5).toString()
  allColors.push(color)
}

for (i = 0; i < colorLen; i++) {
  var color = baseColors[i].clone().desaturate(70).lighten(5).toString()
  allColors.push(color)
}

var futureColors = []
for (i = 0; i < colorLen; i++) {
  var color = baseColors[i].clone().desaturate(70).lighten(10).toString()
  allColors.push(color)
}


var prefersDarkSystem = window.matchMedia("(prefers-color-scheme: dark)");


var prefersDark = $("html").attr("data-bs-theme") == "dark" ? true : false;


var bounds = [
    [-124.77, 24.52], // Southwest coordinates
    [-66.95, 49.38]  // Northeast coordinates
];


function buildMapOptions(containerId) {
    return {
        container: containerId, // container ID
        style: {
            version: 8,
            sources: {
            osmLight: {
                type: "raster",
                tiles: ["https://tile.openstreetmap.org/{z}/{x}/{y}.png"],
                tileSize: 256,
                attribution:
                'Map tiles by <a target="_top" rel="noopener" href="https://tile.openstreetmap.org/">OpenStreetMap tile servers</a>, under the <a target="_top" rel="noopener" href="https://operations.osmfoundation.org/policies/tiles/">tile usage policy</a>. Data by <a target="_top" rel="noopener" href="http://openstreetmap.org">OpenStreetMap</a>'
            },
            osmDark: {
                type: "raster",
                tiles: ["https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"],
                tileSize: 256
            }
            },
            layers: [
                { id: "osmLightLayer", type: "raster", source: "osmLight", layout: { visibility: "none" } },
                { id: "osmDarkLayer", type: "raster", source: "osmDark", layout: { visibility: "none" } }
            ]
        },
        
        //   center: [-98.583333, 39.833333],
        zoom: 2.75,
        maxBounds: bounds,
        maxZoom: 12,
        minZoom: 2.5,
        dragRotate: false,
        touchZoomRotate: false,
        pitchWithRotate: false,
        touchPitch: false,
        logoPosition: 'bottom-right',
        attributionControl: false,
        renderWorldCopies: false,
        maxTileCacheSize: 16
    }
}



function getOSMStyle() {
  return prefersDark
    ? "https://tiles.stadiamaps.com/styles/alidade_smooth_dark.json"
    : "https://tiles.stadiamaps.com/styles/alidade_smooth.json";
}


function applyTheme(target, theme) {
  var dark = prefersDark;
  if (theme !== undefined){
      if (theme !== "dark"){
        dark = false;
      }else{
        dark = true;
      }
  }
  console.log("Applied!", target);
  
  target.setLayoutProperty("osmLightLayer", "visibility", dark ? "none" : "visible");
  target.setLayoutProperty("osmDarkLayer", "visibility", dark ? "visible" : "none");
}

var mapTripIndices = {};
var totalTripCount = 0;


function waitForVisibleSize(el, cb) {
  if (el.clientWidth > 0 && el.clientHeight > 0) {
    cb();
    return;
  }

  const ro = new ResizeObserver(() => {
    if (el.clientWidth > 0 && el.clientHeight > 0) {
      ro.disconnect();
      cb();
    }
  });

  ro.observe(el);
}


function drawPath(trips, map, main_opacity, others_opacity, alternate_opacity, trip_color_id){
    if (trips.length == 0) return;
    console.log(trips[trip_color_id]);
    console.log(trips);
    if (trips[trip_color_id][0] == ''){
        others_opacity = alternate_opacity;
    }
    trips.forEach((trip, tripIndex) => {
        if (trip.length == 0) return;
        trip.forEach((element, index) => {
            if (element == "") return;
            fetch(element)
                .then(r => r.json())
                .then(route => {
                    map.addSource(element, { type: "geojson", data: route });
                    map.addLayer(
                        {
                            id: element, 
                            type:"line", 
                            source: element,
                            'layout': {
                                'line-join': 'round',
                                'line-cap': 'round'
                            },
                            'paint': {
                                'line-color': allColors[tripIndex],
                                'line-width': 2.5,
                                "line-opacity": trip_color_id == tripIndex ? main_opacity : others_opacity
                            }
                        }
                    );
                });
        });
});
}

function createLazyMap(
  mapOptions,
  onMapReady,
  original_map_count,
  main_opacity,
  others_opacity
) {
  var container = mapOptions["container"];
  var map = null;
  var containerElement = document.getElementById(container);
  const alternate_opacity = 0.75;
  console.log("original_map_count:" + original_map_count);

  var observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!map) {
            
            waitForVisibleSize(entry.target, () => {
                map = new maplibregl.Map(mapOptions);
                map_template[original_map_count] = map;
                map.once("load", () => {
                    map.resize(); // 🔑 fixes top-left bug
                    applyTheme(map);
                    onMapReady?.(map);

                    drawPath(shared_path_by_all, map, main_opacity, others_opacity, alternate_opacity, original_map_count);
                    
                });
                
            });
        }
      } else {
        if (map) {
            delete map_template[original_map_count];
            map.off();     // remove all listeners
            map.stop();
            map.remove();        // 🔥 releases WebGL context
            console.log("Map removed");
            map = null;
        }
      }
    },
    {
      root: null,
      threshold: 0.1,
    }
  );
  console.log(containerElement);
  observer.observe(containerElement);

  return {
    getMap() {
      return map;        // may be null
    },
    destroy() {
      observer.disconnect();
      if (map) {
        map.remove();
        map = null;
        console.log("Map removed");
      }
    },
  };
}


var htmlEl = document.documentElement;

var mutObserver = new MutationObserver((mutations) => {
  for (var m of mutations) {
    if (
      m.type === "attributes" &&
      m.attributeName === "data-bs-theme"
    ) {
      var newTheme = htmlEl.getAttribute("data-bs-theme");
      onThemeChanged(newTheme);
    }
  }
});

mutObserver.observe(htmlEl, {
  attributes: true,
  attributeFilter: ["data-bs-theme"],
});

function onThemeChanged(theme) {
    console.log("theme changed!");
    for (var val of Object.values(map_template)) {
        if (val){
            applyTheme(val, theme);
        }
    }
}


var previousUrl = '';
var observer = new MutationObserver(function (mutations) {
    if (location.href !== previousUrl) {
        previousUrl = location.href;
        map_template = {};
    }
});

var config = {attributes: true, childList: true, subtree: true};
observer.observe(document, config);



function splitJson(fileString, map_counter){
    var files = fileString.split(",");
    if (files.length == 0) return;
    shared_path_by_all.push(files);
    map_jsons[map_counter] = files;
}
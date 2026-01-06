var map_template = {};
var map_color = {};
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

var mapAttr = {
  container: "map", // container ID
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
  maxZoom: 15,
  minZoom: 2.5,
  dragRotate: false,
  touchZoomRotate: false,
  pitchWithRotate: false,
  touchPitch: false,
  logoPosition: 'bottom-right',
  attributionControl: false,
  renderWorldCopies: false,
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

function loadMultipleJsons(ids, jsons, opacity){
    if (jsons.length == 0){
        return;
    }
    var id_array = ids.split(",");
    var main_target = id_array[0];
    map_color[id_array[0]] = totalTripCount;
    id_array = [...new Set(id_array)];
    id_array.forEach(element => {
        if (element === "") return;
        loadJson(map_template[element], jsons, totalTripCount, main_target, opacity);
        totalTripCount += 1;
    });
}



function createLazyMap(
  container,
  mapOptions,
  onMapReady,
) {
  var map = null;

  var observer = new IntersectionObserver(
    ([entry]) => {
      if (entry.isIntersecting) {
        if (!map) {
          map = new maplibregl.Map(mapOptions);

          map.once("load", () => {
            onMapReady?.(map);
          });
        }
      } else {
        if (map) {
          map.remove();        // 🔥 releases WebGL context
          map = null;
        }
      }
    },
    {
      root: document,
      threshold: 0.01,
    }
  );
  console.log(document.getElementById(container))
  observer.observe(document.getElementById(container));

  return {
    getMap() {
      return map;        // may be null
    },
    destroy() {
      observer.disconnect();
      if (map) {
        map.remove();
        map = null;
      }
    },
  };
}



function loadJson(map, jsons, count, original_map_id, opacity){
    var files = [jsons.split(",")];
    map.on('load', () => {
        files.forEach((trip, tripIndex) => {
            trip.forEach((element, index) => {
                fetch(element)
                    .then(r => r.json())
                    .then(route => {
                        console.log(opacity);
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
                                    'line-color': allColors[map_color[original_map_id]],
                                    'line-width': 2.5,
                                    "line-opacity": opacity
                                }
                            }
                        );
                    });
            });
        });
        // Call fitBounds() on the map instance
        map.fitBounds(bounds, {
            padding: 20, // Optional: add some padding around the bounds in pixels
            maxZoom: 16  // Optional: prevent zooming past this level
        });
    });
    map.on("resize", () => {
        map.fitBounds(bounds, {
            padding: 20, // Optional: add some padding around the bounds in pixels
            maxZoom: 16  // Optional: prevent zooming past this level
        });
    })
    
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
    for (var val of Object.values(map_template)) {
        applyTheme(val, theme);
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




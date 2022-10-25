var points = [];
var map;

function applyFilter(value) {
  // Filter visible features that don't match the input value.
  var filtered = points.filter(function (feature) {
    var name = normalize(feature.properties.nome);

    //---------------------
    //non penso serva nel filtro l'indirizzo

    //---------------------
    //ne tantomeno il codice
    var code = normalize(feature.properties.codice);
    //---------------------
    //o l'associazione
    return name.indexOf(value) > -1 || code.indexOf(value) > -1;
  });

  // Set the filter to populate features into the layer.
  if (filtered.length == 0) {
    return map.setFilter("points", ["==", ["get", "hash"], 0]);
  }
  if (filtered.length < points.length && filtered > 0) {
    map.setFilter("points", [
      "match",
      ["get", "hash"],
      filtered.map(function (feature) {
        return feature.properties.hash;
      }),
      true,
      false,
    ]);
  } else {
    map.setFilter("points", null);
  }
}

function normalize(string) {
  return string.trim().toLowerCase();
}

$(document).ready(function () {
  mapboxgl.accessToken =
    "pk.eyJ1IjoiYW1vc2dpdG8iLCJhIjoiY2tmNzlpNmJjMDBhNzJxbzl6dnNibW1vayJ9.YjOVYS060osnxKTXpR-6uA";
  map = new mapboxgl.Map({
    container: "map", // container id
    style: "mapbox://styles/mapbox/streets-v10", // style URL
    center: [7.6, 45.05], // starting position [lng, lat]
    zoom: 10, // starting zoom
  });
  //https://docs.mapbox.com/mapbox-gl-js/example/filter-features-within-map-view/

  //qua sotto mette l'array vuoto se si vuole far vedere tutto e crea il popup nascosto da far vedere in seguito con mousemove "popup" e mouseleave "popup.remove" --------->

  /*

    // Holds visible airport features for filtering

    var  airports= [];

    // Create a popup, but don't add it to the map yet.

    var popup = new mapboxgl.Popup({
        closeButton: false
    }); */

  $("#filter").on("keyup", function (event) {
    var value = normalize(event.target.value);
    applyFilter(value);
  });

  map.on("load", async function () {
    var response = await fetch(
      "https://raw.githubusercontent.com/xrmx/medici-asl-torino/master/medici.geojson"
    );
    var source = await response.json();
    source.features = source.features.map((x, i) => {
      // x.properties.hash = md5(`${x.properties.nome}-${x.properties.circoscrizione}`)
      x.properties.hash = `${x.properties.nome}-${i}`;
      return x;
    });
    points = source.features;

    // Add an image to use as a custom marker
    map.loadImage("/geolocation-icon-png-5.png", function (error, image) {
      if (error) throw error;
      map.addImage("custom-marker", image);
      // Add a GeoJSON source with 1 points
      map.addSource("points", {
        type: "geojson",
        data: source,
      });

      // Add a symbol layer
      map.addLayer({
        id: "points",
        type: "symbol",
        source: "points",
        layout: {
          "icon-image": "custom-marker",
          // get the title name from the source's "title" property
          "text-field": ["get", "nome"],
          "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
          "text-offset": [-1, 1.25],
          "text-anchor": "top",
        },
      });
    });
  });
});

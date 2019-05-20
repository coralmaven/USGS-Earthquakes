function createFeatures(earthquakeData, layertype) {
  
    // Define a function we want to run once for each feature in the features array
    // Give each feature a popup describing the place and time of the earthquake
    function onEachFeature(feature, layer) {
        L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], {
            fillOpacity: 0.75,
            fillColor: "#fdbb84",
            color: "#e34a33",
            // Setting our circle's radius equal to the output of our markerSize function
            // This will make our marker's size proportionate to its magnitude
            radius: isNaN(feature.mag) ? 1 : feature.mag 
        }).bindPopup("<h3>" + feature.properties.place + "</h3><hr><p>" + new Date(feature.properties.time) + "</p>")
          .addTo(layers[layertype]);

        earthquakeCount[layertype]++; 
    }
   // Create a GeoJSON layer containing the features array on the earthquakeData object
    // Run the onEachFeature function once for each piece of data in the array
    const earthquakes = L.geoJSON(earthquakeData, {
        onEachFeature: onEachFeature
    });
}


// Initialize all of the LayerGroups we'll be using
const layers = {
    PAST_HOUR: new L.LayerGroup(),
    PAST_DAY: new L.LayerGroup(),
    PAST_WEEK: new L.LayerGroup(),
    PAST_MONTH: new L.LayerGroup(),
};


// Create an overlays object to add to the layer control
const overlays = {
    "Past Hour": layers.PAST_HOUR,
    "Past Day": layers.PAST_DAY,
    "Past Week": layers.PAST_WEEK,
    "Past Month": layers.PAST_MONTH
};

// Create the map with our layers
const map = L.map("map-id", {
    center: [30.25, -97.76],
    zoom: 2,
    layers: [
        layers.PAST_HOUR,
        layers.PAST_DAY,
        layers.PAST_WEEK,
        layers.PAST_MONTH
    ]
});

   // Define streetmap and darkmap layers
const streetmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.streets",
    accessToken: API_KEY
});

const darkmap = L.tileLayer("https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}", {
    attribution: "Map data &copy; <a href=\"https://www.openstreetmap.org/\">OpenStreetMap</a> contributors, <a href=\"https://creativecommons.org/licenses/by-sa/2.0/\">CC-BY-SA</a>, Imagery © <a href=\"https://www.mapbox.com/\">Mapbox</a>",
    maxZoom: 18,
    id: "mapbox.dark",
    accessToken: API_KEY
});

// Define a baseMaps object to hold our base layers
const baseMaps = {
        "Street Map": streetmap,
        "Dark Map": darkmap
};

// Add our 'lightmap' tile layer to the map
streetmap.addTo(map);

// Create an object to keep of the number of markers in each layer
const earthquakeCount = {
    PAST_HOUR: 0,
    PAST_DAY: 0,
    PAST_WEEK: 0,
    PAST_MONTH: 0
};

// Create a control for our layers, add our overlay layers to it
L.control.layers(baseMaps, overlays).addTo(map);

// Create a legend to display information about our map
const info = L.control({
    position: "bottomright"
});

// When the layer control is added, insert a div with the class of "legend"
info.onAdd = function() {
    const div = L.DomUtil.create("div", "legend");
    return div;
};
// Add the info legend to the map
info.addTo(map);

(async function(){
    const
        past_hour_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_hour.geojson",
        past_day_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_day.geojson",
        past_week_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson",
        past_month_url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson";

    const pasthourRes = await d3.json(past_hour_url),
        pastdayRes = await d3.json(past_day_url),
        pastweekRes = await d3.json(past_week_url),
        pastmonthRes = await d3.json(past_month_url);

    createFeatures(pasthourRes.features, "PAST_HOUR"),
    createFeatures(pastdayRes.features, "PAST_DAY"),
    createFeatures(pastweekRes.features, "PAST_WEEK"),
    createFeatures(pastmonthRes.features, "PAST_MONTH");

    console.log(overlays)

    // Call the updateLegend function, which will... update the legend!
    updateLegend(earthquakeCount);
})()

// Update the legend's innerHTML with the last earthquake count
function updateLegend(earthquakeCount) {
    var today = new Date(); 
    var time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds(); 
    document.querySelector(".legend").innerHTML = [
    "<p>Updated: " + today.toUTCString() + "</p>",
    "<p class='past-hour'>Past Hour: " + earthquakeCount.PAST_HOUR + "</p>",
    "<p class='past-day'>Past Day: " + earthquakeCount.PAST_DAY + "</p>",
    "<p class='past-week'>Past Week: " + earthquakeCount.PAST_WEEK + "</p>",
    "<p class='past-month'>Past Month: " + earthquakeCount.PAST_MONTH + "</p>",
  ].join("");
}

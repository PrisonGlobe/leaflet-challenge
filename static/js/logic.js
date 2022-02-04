// create tile layers 


// gray scale layer
var grayscale = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
	maxZoom: 16
});

var darkscale = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
	subdomains: 'abcd',
	maxZoom: 20
});

var landSea = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryOnly/MapServer/tile/{z}/{y}/{x}', {
	maxZoom: 20,
	attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
});

var natGeo = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}', {
	attribution: 'Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC',
	maxZoom: 16
});

var defMap = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
	maxZoom: 19,
	attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
});

// make basemaps object
let basemaps = {
    "Dark" : darkscale,
    "Nature": landSea,
    "NatGeo": natGeo,
    GrayScale: grayscale,
    Default: defMap
}
// make map
var myMap = L.map("map", {
    center: [19.4326, -99.1332],
    zoom: 6,
    layers: [ grayscale, darkscale,natGeo, landSea, defMap]
});

//add default map to map

defMap.addTo(myMap);




// get the data for the tectonic plates and draw on the map 
// variable to hold the tec platers layer


let tectonicplates = new L.layerGroup();

// call the api to get the infor for tect plates

d3.json("https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json")
.then(function(plateData){
    // load data using geoJson and add to tect plates layer group
    L.geoJson(plateData,{
        // style it
        color: "yellow",
        weight: 1
    }).addTo(tectonicplates);
});

//add tect plates to map
tectonicplates.addTo(myMap);



//variable to hold eathquakes
let earthquakes = new L.layerGroup();

// get the data for earthquakes and pop layergroup
//call usgs geojson api

d3.json("https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson")
.then(
    function(earthquakeData){
    //  
    //console.log(earthquakeData)  

    // make function that chooses the color of the data point
    function dataColor(depth){
        if (depth > 90)
        return "red";
        else if (depth > 70)
            return "#fc4903";
        else if (depth > 50)
            return "#fc8403";
        else if (depth > 30)
            return "#fcad03";
        else if (depth > 10)
            return "#cafc03";
        else
            return "green";
    }

    function radiusSize(mag){

        if (mag == 0)
             return 1;
        else return mag*5;
    }

    function dataStyle(feature){
        return {
            opacity: 0.5,
            fillOpacity: 0.5,
            fillColor: dataColor(feature.geometry.coordinates[2]),
            color: "000000",
            radius: radiusSize(feature.properties.mag), 
            weight: 0.5,
            stroke: true
        }
    }


    L.geoJson(earthquakeData, {
        // make each feature a marker on map
        pointToLayer: function(feature, latLng){
            return L.circleMarker(latLng);
        },

        style: dataStyle,
        // add popups
        onEachFeature: function(feature, layer){
            layer.bindPopup(`Magnitude: <b>${feature.properties.mag}</b><br>
                            Depth: <b>${feature.geometry.coordinates[2]}</b><br>
                            Location: <b>${feature.properties.place}</b>
                            `);

        }
    }).addTo(earthquakes);


  }
);

earthquakes.addTo(myMap);




let overlays = {
    "Tectonic Plates" : tectonicplates,
    "Earthquake Data" : earthquakes
};


L.control
    .layers(basemaps, overlays)
    .addTo(myMap);

// add the legend to the map
let legend = L.control({
    position: "bottomright"
});

// add the properties for the legend 
legend.onAdd = function() {
	// make a div for the legend to appear on the page
	let div = L.DomUtil.create("div", "info legend");

	// set up the intervals
	let intervals = [-10, 10, 30, 50, 70, 90];
	//set the colors for the intervals
	let colors = [
		"green",
		"#cafc03",
		"#fcad03",
		"#fc8403",
		"#fc4903",
		"red"
	];

	// loop through the intervals and the colors to generate a label
	// with a colored square for each interval
	for(var i = 0; i < intervals.length; i++)
	{
		// inner html that sets the square for each interval and label
		div.innerHTML += "<i style='background: "
		+ colors[i]
		+ "'></i> "
		+ intervals[i]
		+ (intervals[i + 1] ? "km - " + intervals[i + 1] + "km<br>" : "+km");
	}

	return div;

};

// add the legend to the map
legend.addTo(myMap);
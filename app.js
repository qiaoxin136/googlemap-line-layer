/* global document, google */
import { GoogleMapsOverlay } from "@deck.gl/google-maps";
import {
  ScatterplotLayer,
  ArcLayer,
  TripsLayer,
  GeoJsonLayer,
} from "@deck.gl/layers";
import { map_styles } from "./styles";

/* DATASOURCES */

// sources:
// Chicago Data Portal https://data.cityofchicago.org/Transportation/Taxi-Trips/wrvz-psew
// source: NYC Open Data https://data.cityofnewyork.us/Environment/2015-Street-Tree-Census-Tree-Data/pi5s-9p35
// const DATASOURCES = {
//   chicago_taxis:
//     "https://data.cityofchicago.org/resource/wrvz-psew.json?$limit=25000",
//   nyc_trees:
//     "https://data.cityofnewyork.us/resource/5rq2-4hqu.json?$limit=65000&&boroname=Manhattan",
//   nyc_meters:
//     "https://data.cityofnewyork.us/resource/92q3-8jse.json?$limit=15000",
// };

const Gravity = "https://hollywood-google-map.s3.amazonaws.com/Gravity.json";

let map;
let overlay;
let data;

function loadMapsScript() {
  const GOOGLE_MAPS_API_KEY = "AIzaSyBsntctk2YsoHxr_PeyfjeNhzbQZ_d4gsw"; // eslint-disable-line
  const GOOGLE_MAPS_API_URL = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=visualization&v=3.34`;
  const script = document.createElement("script");
  const head = document.querySelector("head");
  script.type = "text/javascript";
  script.src = GOOGLE_MAPS_API_URL;
  head.appendChild(script);
  return new Promise((resolve) => {
    script.onload = resolve;
  });
}

async function initMap() {
  const MAP_CENTER = {
    nyc: { lat: 40.760306, lng: -73.982302 },
    chicago: { lat: 41.975997, lng: -87.905111 },
    cary: { lat: 35.7915, lng: -78.7811 },
    hollywood: { lat: 26.0112, lng: -80.1495 },
  };
  const MAP_ZOOM = 14;
  await loadMapsScript();
  map = new google.maps.Map(document.getElementById("map"), {
    center: MAP_CENTER.hollywood,
    zoom: MAP_ZOOM,
    styles: map_styles,
    // mapID: "basemap",
    mapTypeId: google.maps.MapTypeId.ROADMAP,
  });
  return map;
}

function render() {
  // const infowindow = new google.maps.InfoWindow({
  //   content: info.object.properties.FACILITYID,
  // });
  let layers = [
    new GeoJsonLayer({
      id: "gravity",
      data: Gravity,
      // Styles
      filled: true,
      pointRadiusMinPixels: 2,
      pointRadiusScale: 5,
      lineWidthScale: 1,
      lineWidthMinPixels: 2, //(f) => (f.properties.DIAMETER > 15 ? 6 : 2),
      // getPointRadius: (f) => 11 - f.properties.scalerank,
      getFillColor: [170, 255, 0, 255],
      getLineColor: [207, 159, 255, 255], //(f) => (f.properties.DIAMETER > 15 ? [207, 159, 255, 255] : [128, 154, 26, 255]),
      // Interactive props
      pickable: true,
      autoHighlight: true,
      // onClick: (info) =>
      //   // eslint-disable-next-line
      //   info.object &&
      //   alert(
      //     `Diameter (in): ${info.object.properties.DIAMETER} \nMaterial: ${info.object.properties.MATERIAL}\nFacility ID: ${info.object.properties.FACILITYID}`
      //   ),
    }),
  ];
  overlay.setProps({ layers: layers });
}

// Create an infowindow and listen for clicks on the deck.gl Layer
function createInfowindow(overlay) {
  var infowindow = new google.maps.InfoWindow({ content: "" });
  // var infowindow = $(".gm-style-iw");

  // Change the cursor to a pointer on mouseover

  // Check for clicks and open or close the infowindow.
  map.addListener("click", function (event) {
    var picked = overlay._deck.pickObject({
      x: event.pixel.x,
      y: event.pixel.y,
      radius: 4,
      layerIds: ["mh", "fm", "gravity", "liftstation"],
    });

    console.log(picked);

    if (picked) {
      if (picked.layer.id == "mh") {
        infowindow.setContent(
          "<div>" +
            '<h3 style="color: blue">Manhole</h3>' +
            "Facility ID: " +
            picked.object.properties.FACILITYID +
            "<br />" +
            "Invert: " +
            picked.object.properties.NAVD88ELEV +
            "<br />" +
            "RIM: " +
            picked.object.properties.RIMNAVD88 +
            "</div>"
        );
      } else if (picked.layer.id == "fm") {
        infowindow.setContent(
          "<div>" +
            '<h3 style="color: blue">Force Main</h3>' +
            "Diameter: " +
            picked.object.properties.DIAMETER +
            "<br />" +
            "Facility ID: " +
            picked.object.properties.FACILITYID +
            "<br />" +
            "Material: " +
            picked.object.properties.MATERIAL +
            "<br />" +
            "Install Year: " +
            picked.object.properties.INSTALLYR +
            "</div>"
        );
      } else if (picked.layer.id == "gravity") {
        infowindow.setContent(
          "<div>" +
            '<h3 style="color: blue">Gravity Sewer</h3>' +
            "Diameter: " +
            picked.object.properties.DIAMETER +
            "<br />" +
            "Facility ID: " +
            picked.object.properties.FACILITYID +
            "<br />" +
            "Material: " +
            picked.object.properties.MATERIAL +
            "<br />" +
            "Liner Type: " +
            picked.object.properties.LINERTYPE +
            "</div>"
        );
      } else {
        infowindow.setContent(
          "<div>" +
            '<h3 style="color: blue">Lift Station</h3>' +
            "Facility ID: " +
            picked.object.properties.FACILITYID +
            "<br />" +
            "Capacity: " +
            picked.object.properties.CAPACITY +
            "<br />" +
            "Wet Well Size: " +
            picked.object.properties.WWSIZE +
            "<br />" +
            "Drawing: " +
            "<a href='https://hollywood-google-map.s3.amazonaws.com/drawing/" +
            picked.object.properties.FACILITYID +
            ".pdf" +
            "'" +
            " target='_blank'>" +
            picked.object.properties.FACILITYID +
            "</a>" +
            "<br />" +
            "Pump Curve: " +
            "<a href='https://hollywood-google-map.s3.amazonaws.com/pumpcurve/" +
            picked.object.properties.FACILITYID +
            ".pdf" +
            "'" +
            " target='_blank'>" +
            picked.object.properties.FACILITYID +
            "</a>" +
            "</div>"
        );
      }

      infowindow.setPosition({
        lng: picked.coordinate[0],
        lat: picked.coordinate[1],
      });
      infowindow.open(map);
    } else {
      infowindow.close();
    }
  });
}

(async () => {
  map = await initMap();
  overlay = new GoogleMapsOverlay();
  overlay.setMap(map);
  render();
  createInfowindow(overlay);
})();

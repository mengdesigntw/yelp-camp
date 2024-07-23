mapboxgl.accessToken = mapboxToken;
const map = new mapboxgl.Map({
  container: 'map', // container ID
  style: 'mapbox://styles/mapbox/streets-v12', // style URL
  center: geometry.coordinates, // starting position [lng, lat]
  zoom: 9, // starting zoom
});

const popup = new mapboxgl.Popup({ offset: 25, focusAfterOpen: false }).setHTML(
  `<h6>${title}</h6><p>${campLocation}</p>`);

const marker1 = new mapboxgl.Marker()
        .setLngLat(geometry.coordinates)
        .setPopup(popup)
        .addTo(map);

map.addControl(new mapboxgl.NavigationControl({ visualizePitch: true }));

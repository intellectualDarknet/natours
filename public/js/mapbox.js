// to integrate on the client side
console.log('hello from the client side')

const displayMap = locations => {
// access token for mapbox
  mapboxgl.accessToken = 'pk.eyJ1IjoiZGVhbXN0YXIiLCJhIjoiY2xlOHFla2RpMGN2ejNubHJwaDRrNWdvOSJ9.K6TeUGIPnXkZZpHgrdQYRw';

var map = new mapboxgl.Map({
  // container here has map value so 
  // so this map will be connected to div id='map'
  container: 'map',
  style: 'mapbox://styles/mapbox/streets-v11',
  // we can define the center of the map 
  // center: [-118.1, 34],
  // zoom: 10,
  // remove zoom
  scrollZoom: false
  // interactive: false
})
// the area that will be showed
const bounds = new mapboxgl.LngLatBounds();

locations.forEach(loc => {
  // Create marker
  const el = document.createElement('div');
  el.className = 'marker'

  // add marker
  new mapboxgl.Marker({
    element: el,
    // bottom of the pin will be located in exact GPS location
    // possibly center
    anchor: 'bottom'
    // setLngLat setting coordinates to marker
    // attack marker to map
  })
    .setLngLat(loc.coordinates)
    .addTo(map)
  
  // Add popup
  new mapboxgl.Popup({
    // will leave writing upper on 30px on image
    offset: 30
  })
    .setLngLat(loc.coordinates)
    // add html mark 
    .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    .addTo(map)

  //Extend bounds to include current location
  bounds.extend(loc.coordinates)
})

// apply bounds to the map
map.fitBounds(bounds, {
  padding: {
    top: 200,
    bottom: 150,
    left: 100,
    right: 100
  }
});
}

module.exports = displayMap
mapboxgl.accessToken = 'pk.eyJ1IjoicGl5dXNoa2h1cmFuYTIwMTkiLCJhIjoiY2xtajJqNTFsMDBmYjJpbzFvYTc3dGdjeSJ9.Q1I5rjTzgDJec3f7IrI7Ew';
const map = new mapboxgl.Map({
container: 'map', // container ID
style: 'mapbox://styles/mapbox/streets-v12', // style URL
center: [-74.5, 40], // starting position [lng, lat]
zoom: 9, // starting zoom
});
import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, signup } from './login';
import { bookTour } from './stripe';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('#login');
const signupForm = document.querySelector('#signupBtn');
const bookBtn = document.getElementById('book-tour');

//VALUES

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm) {
  loginForm.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
    signup(email, password);
  });
}
if (signupForm) {
  signupForm.addEventListener('click', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    signup(name, email, password, passwordConfirm);
  });
}

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset; //this simply means const tourId = e.target.dataset.tour-id which is in tour.pug this is bcz of JS ES6 syntax which converts tour-id to tourId i.e. in camel case
    bookTour(tourId);
  });

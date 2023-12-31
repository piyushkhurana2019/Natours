import '@babel/polyfill';
import { displayMap } from './mapbox';
import { login, signup, logout } from './login';
import { bookTour } from './stripe';
import { updateSettings } from './updateSettings';

// DOM ELEMENTS
const mapBox = document.getElementById('map');
const loginForm = document.querySelector('.form--login');
const logOutBtn = document.querySelector('.nav__el--logout');
const signupForm = document.querySelector('.signup-form');
const bookBtn = document.getElementById('book-tour');
const userDataForm = document.querySelector('.form-user-data');

//VALUES

//DELEGATION
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

if (loginForm)
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });

if (logOutBtn) logOutBtn.addEventListener('click', logout);

if (signupForm) {
  signupForm.addEventListener('submit', (ele) => {
    ele.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const name = document.getElementById('name').value;
    const passwordConfirm = document.getElementById('passwordConfirm').value;

    signup(name, email, password, passwordConfirm);
  });
}
if (userDataForm)
  userDataForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const form = new FormData();
    form.append('name', document.getElementById('name').value);
    form.append('email', document.getElementById('email').value);
    form.append('photo', document.getElementById('photo').files[0]);
    console.log(form);

    updateSettings(form, 'data');
  });

if (bookBtn)
  bookBtn.addEventListener('click', (e) => {
    e.target.textContent = 'Processing...';
    const { tourId } = e.target.dataset; //this simply means const tourId = e.target.dataset.tour-id which is in tour.pug this is bcz of JS ES6 syntax which converts tour-id to tourId i.e. in camel case
    bookTour(tourId);
  });

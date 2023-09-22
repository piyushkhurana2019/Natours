/* eslint-disable */
import axios from 'axios';
import { showAlert } from './alert';


export const bookTour = async tourId => {
    const stripe = Stripe('pk_test_51NrdQXSCadBcM6pEp1OZeSUqu2x0JiDN179jYCH5k7gOKPWPJW8u5tZJ8XFuEPBn20XChbJ5wHayNrW8u6DJmF6i004jArzIUl');
    try {
      // 1) Get checkout session from API
      const session = await axios(
        `http://localhost:9000/api/v1/bookings/checkout-session/${tourId}`
      );
      console.log(session);
  
      // 2) Create checkout form + chanre credit card
      await stripe.redirectToCheckout({
        sessionId: session.data.session.id
      });
    } catch (err) {
      console.log(err);
      showAlert('error', err);
    }
  };
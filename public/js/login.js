import axios from 'axios';
import { showAlert } from './alert';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://localhost:9000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if(res.data.status === 'success'){
      showAlert('success','Logged In Successfully')
      window.setTimeout(()=>{
        location.assign('/');
      }, 1000);
    }

  } catch (err) {
    showAlert('error',err.response.data.message);
  }
};

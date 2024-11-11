// import axios from 'axios';

// const API_URL = 'https://localhost:30013/api/login'; // Puedes mantener esto, pero no lo usaremos en la simulación

class AuthService {


  async login(username, password) {
    return fetch('http://localhost:30013/api/login',{
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
          usuario: username,
          pass: password
      })
    }).then(response => {
      if (!response.ok) {
        // throw new Error('Error en la respuesta de la API: ERROR ' + response.status + ' : ' + response.body);
        throw new Error('Error en la respuesta de la API: ERROR ',response)
      }
      return response.json();
    }).then(data => {
      // console.log('Datos recibidos:', data);
      // console.log(typeof data);
      localStorage.setItem('user', JSON.stringify(data.vendedor));
      return data;
    }).catch(err => {
      console.error('ERROR:',err)
      throw err;
    })
  }


  logout() {
    localStorage.clear(); // Limpia el localStorage
  }

  clearStorage() {
    localStorage.clear(); // Método para limpiar el localStorage
  }

  getCurrentUser() {
    const user = JSON.parse(localStorage.getItem('user'));
    return user ? user : null; // Asegúrate de devolver null si no hay usuario
  }
}

const authServiceInstance = new AuthService();
export default authServiceInstance;

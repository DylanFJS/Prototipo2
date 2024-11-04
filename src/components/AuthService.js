import axios from 'axios';

const API_URL = 'http://localhost:3000/api/auth'; // Puedes mantener esto, pero no lo usaremos en la simulación

class AuthService {
  // Simulamos un usuario para propósitos de prueba
  simulateUser = {
    username: 'us',
    password: 'pass123',
  };

  async login(username, password) {
    // Comparamos las credenciales ingresadas con las simuladas
    if (username === this.simulateUser.username && password === this.simulateUser.password) {
      const user = { username: this.simulateUser.username }; // Simula un objeto de usuario
      localStorage.setItem('user', JSON.stringify(user)); // Guardamos el usuario en localStorage
      return { success: true, user }; // Retornamos un objeto que simula la respuesta exitosa
    } else {
      throw new Error('Usuario incorrecto'); // Lanza un error si las credenciales no coinciden
    }
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

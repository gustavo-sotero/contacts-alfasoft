import axios from 'axios'

// Configuração base do Axios
const api = axios.create({
  baseURL: '/api', // Proxy configurado no Vite para localhost:3000
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Interceptor para requisições
api.interceptors.request.use(
  (config) => {
    // Aqui podemos adicionar tokens de autenticação no futuro
    // const token = localStorage.getItem('token')
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`
    // }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Interceptor para respostas
api.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    // Tratamento global de erros
    if (error.response?.status === 401) {
      // Redirecionar para login se não autenticado
      console.error('Não autorizado')
    }
    return Promise.reject(error)
  },
)

export { api }
export default api

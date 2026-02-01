import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { auth, getAccessToken } from '../utils/osmAuth'
import { parseOsmUserXml } from '../utils/parseOsmUser'
import { OSM_USER_URL } from '../constants'
import './LoginPage.css'

const LoginPage = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { login, isAuthenticated } = useAuth()

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/search', { replace: true })
      return
    }

    const code = searchParams.get('code')
    if (code) {
      handleOAuthCallback()
    }
  }, [searchParams, isAuthenticated, navigate])

  const handleOAuthCallback = async () => {
    try {
      await auth.authenticateAsync()

      if (!auth.authenticated()) {
        throw new Error('Authentication failed')
      }

      const userResponse = await auth.fetch(OSM_USER_URL, {
        method: 'GET',
      })

      if (!userResponse.ok) {
        throw new Error('Failed to get user info')
      }

      const userXml = await userResponse.text()
      const user = parseOsmUserXml(userXml)

      const token = getAccessToken()
      if (!token) {
        throw new Error('Access token not found')
      }

      login(user, token)
      navigate('/search', { replace: true })
    } catch (error) {
      console.error('OAuth callback error:', error)
      alert('Ошибка авторизации. Попробуйте еще раз.')
    }
  }

  const handleLogin = async () => {
    try {
      await auth.authenticateAsync()
    } catch (error) {
      console.error('Login error:', error)
    }
  }

  return (
    <div className="login-page">
      <div className="login-container">
        <h1>OSM Sport Tag Editor</h1>
        <p>Приложение для уточнения тега sport для объектов leisure=pitch</p>
        <button onClick={handleLogin} className="login-button">
          Войти через OpenStreetMap
        </button>
        <div className="login-info">
          <p>Для работы приложения необходимо:</p>
          <ol>
            <li>Зарегистрировать OAuth приложение на <a href="https://www.openstreetmap.org/user/your_username/oauth_clients" target="_blank" rel="noopener noreferrer">OpenStreetMap</a></li>
            <li>Указать Client ID в файле .env</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

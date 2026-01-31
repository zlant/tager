import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import './LoginPage.css'

const OSM_OAUTH_CLIENT_ID = import.meta.env.VITE_OSM_OAUTH_CLIENT_ID || 'your_client_id'
const OSM_OAUTH_REDIRECT_URI = import.meta.env.VITE_OSM_OAUTH_REDIRECT_URI || 
  `${window.location.origin}/login`
const OSM_OAUTH_URL = 'https://www.openstreetmap.org/oauth2/authorize'
const OSM_TOKEN_URL = 'https://www.openstreetmap.org/oauth2/token'
const OSM_USER_URL = 'https://api.openstreetmap.org/api/0.6/user/details'

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
      handleOAuthCallback(code)
    }
  }, [searchParams, isAuthenticated, navigate])

  const handleOAuthCallback = async (code: string) => {
    try {
      const tokenResponse = await fetch(OSM_TOKEN_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          code,
          redirect_uri: OSM_OAUTH_REDIRECT_URI,
          client_id: OSM_OAUTH_CLIENT_ID,
          client_secret: import.meta.env.VITE_OSM_OAUTH_CLIENT_SECRET || '',
        }),
      })

      if (!tokenResponse.ok) {
        throw new Error('Failed to get access token')
      }

      const tokenData = await tokenResponse.json()
      const accessToken = tokenData.access_token

      const userResponse = await fetch(OSM_USER_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      if (!userResponse.ok) {
        throw new Error('Failed to get user info')
      }

      const userXml = await userResponse.text()
      const parser = new DOMParser()
      const doc = parser.parseFromString(userXml, 'text/xml')
      const userElement = doc.querySelector('user')

      if (!userElement) {
        throw new Error('User data not found')
      }

      const user = {
        id: parseInt(userElement.getAttribute('id') || '0'),
        username: userElement.getAttribute('display_name') || '',
        displayName: userElement.getAttribute('display_name') || '',
      }

      login(user, accessToken)
      navigate('/search', { replace: true })
    } catch (error) {
      console.error('OAuth callback error:', error)
      alert('Ошибка авторизации. Попробуйте еще раз.')
    }
  }

  const handleLogin = () => {
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: OSM_OAUTH_CLIENT_ID,
      redirect_uri: OSM_OAUTH_REDIRECT_URI,
      scope: 'read_prefs write_api',
    })

    window.location.href = `${OSM_OAUTH_URL}?${params.toString()}`
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
            <li>Указать Client ID и Client Secret в файле .env</li>
          </ol>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Provider from './pages/Provider'
import Consumer from './pages/Consumer'
import Visualization from './pages/Visualization'

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/provider" element={<Provider />} />
        <Route path="/consumer" element={<Consumer />} />
        <Route path="/visualization" element={<Visualization />} />
      </Routes>
    </Layout>
  )
}

export default App
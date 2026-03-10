import { Routes, Route } from 'react-router-dom'
import { AppProvider } from './context/AppContext'
import Layout from './components/Layout'
import Home from './pages/Home'
import UploadAssess from './pages/UploadAssess'
import GenerateBrainstorm from './pages/GenerateBrainstorm'
import LiteraryDevices from './pages/LiteraryDevices'
import Comprehension from './pages/Comprehension'
import Badges from './pages/Badges'

export default function App() {
  return (
    <AppProvider>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="upload-assess" element={<UploadAssess />} />
          <Route path="generate" element={<GenerateBrainstorm />} />
          <Route path="literary-devices" element={<LiteraryDevices />} />
          <Route path="comprehension" element={<Comprehension />} />
          <Route path="badges" element={<Badges />} />
        </Route>
      </Routes>
    </AppProvider>
  )
}

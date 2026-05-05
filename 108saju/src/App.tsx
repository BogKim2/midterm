import { Route, Routes } from 'react-router-dom'
import { AppShell } from './components/layout/AppShell'
import { Analysis } from './pages/Analysis'
import { CalendarPage } from './pages/CalendarPage'
import { Compatibility } from './pages/Compatibility'
import { InputPage } from './pages/Input'
import { Landing } from './pages/Landing'
import { Login } from './pages/Login'
import { Mypage } from './pages/Mypage'
import { NotFound } from './pages/NotFound'
import { Premium } from './pages/Premium'
import { Result } from './pages/Result'
import { Signup } from './pages/Signup'
import { Timeline } from './pages/Timeline'

function App() {
  return (
    <Routes>
      <Route element={<AppShell />}>
        <Route path="/" element={<Landing />} />
        <Route path="/input" element={<InputPage />} />
        <Route path="/result" element={<Result />} />
        <Route path="/analysis" element={<Analysis />} />
        <Route path="/compatibility" element={<Compatibility />} />
        <Route path="/calendar" element={<CalendarPage />} />
        <Route path="/timeline" element={<Timeline />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/mypage" element={<Mypage />} />
        <Route path="/premium" element={<Premium />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}

export default App

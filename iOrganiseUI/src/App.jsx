import { Routes, Route } from 'react-router-dom';

// MUI Theme
import { CssBaseline, ThemeProvider } from '@mui/material';
import { ColourModeContext, useMode } from './themes/MyTheme.js';

// React Components
import Topbar from './components/Topbar.jsx';
import Sidebar from './components/Sidebar.jsx';

// Pages
import Home from './pages/Home.jsx';
import Dashboard from './pages/Dashboard.jsx';
import TranscribeAudio from './pages/TranscribeAudio.jsx';
import ApiDocs from './pages/ApiDocs.jsx';
import CategoriseText from './pages/CategoriseText.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';

function App() {
  const [theme, colourMode] = useMode();

  return (
    <ColourModeContext.Provider value={colourMode}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="app">
          <Sidebar />
          <main className="content">
            <Topbar />
            <Routes>
              <Route path="/home" element={<Home />} />
              <Route path="/transcribeaudio" element={<TranscribeAudio />} />
              <Route path="/apidocs" element={<ApiDocs />} />
              <Route path="/categorisetext" element={<CategoriseText />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Routes>
          </main>
        </div>
      </ThemeProvider>
    </ColourModeContext.Provider>
  )
}
export default App;

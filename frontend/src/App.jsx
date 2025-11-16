import { useState, useEffect } from 'react';
import Home from './pages/Home';
import Fusion from './pages/Fusion';

function App() {
  const [darkMode, setDarkMode] = useState(() => {
    const saved = localStorage.getItem('darkMode');
    return saved ? JSON.parse(saved) : false;
  });
  const [currentPage, setCurrentPage] = useState('home');

  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(darkMode));
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className={`min-h-screen transition-colors duration-300 ${
        darkMode 
          ? 'bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900' 
          : 'bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50'
      }`}>
        {/* Navigation Bar */}
        <nav className={`sticky top-0 z-50 backdrop-blur-md border-b transition-all duration-300 ${
          darkMode 
            ? 'bg-gray-900/80 border-gray-700' 
            : 'bg-white/80 border-gray-200'
        }`}>
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <h1 className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${
                darkMode 
                  ? 'from-blue-400 to-purple-400' 
                  : 'from-blue-600 to-purple-600'
              }`}>
                Cognitive Map Generator
              </h1>
              <div className="flex items-center gap-4">
                <button
                  onClick={() => setCurrentPage(currentPage === 'home' ? 'fusion' : 'home')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 ${
                    darkMode
                      ? 'bg-gray-800 text-gray-200 hover:bg-gray-700'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {currentPage === 'home' ? 'Fusion Mode' : 'Home'}
                </button>
                <button
                  onClick={() => setDarkMode(!darkMode)}
                  className={`p-2 rounded-lg transition-all duration-300 transform hover:scale-110 ${
                    darkMode
                      ? 'bg-gray-800 text-yellow-400 hover:bg-gray-700'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                  title="Toggle Dark Mode"
                >
                  {darkMode ? '☀️' : '🌙'}
                </button>
              </div>
            </div>
          </div>
        </nav>

        {currentPage === 'home' ? (
          <Home darkMode={darkMode} />
        ) : (
          <Fusion darkMode={darkMode} />
        )}
      </div>
    </div>
  );
}

export default App;


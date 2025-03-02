import React, { useState, useEffect } from 'react';
import { Moon, Sun, Play, Download, Share2, History, Users, Settings, Code2, RefreshCw } from 'lucide-react';
import CodeEditor from './components/CodeEditor';
import Preview from './components/Preview';
import Console from './components/Console';
import CollaborationPanel from './components/CollaborationPanel';
import { useCodeStore } from './store/codeStore';
import { useThemeStore } from './store/themeStore';
import { useCollaborationStore } from './store/collaborationStore';

function App() {
  const { html, css, js, updateCode, formatCode } = useCodeStore();
  const { theme, toggleTheme } = useThemeStore();
  const { isCollaborationPanelOpen, toggleCollaborationPanel, collaborators } = useCollaborationStore();
  const [consoleOutput, setConsoleOutput] = useState<string[]>([]);
  const [isConsoleOpen, setIsConsoleOpen] = useState(false);

  // Initialize theme from localStorage
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      if (savedTheme !== theme) {
        toggleTheme();
      }
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches && theme !== 'dark') {
      toggleTheme();
    }
  }, []);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const runCode = () => {
    // Clear previous console output
    setConsoleOutput([]);
    
    // Force preview refresh
    const previewFrame = document.getElementById('preview-frame') as HTMLIFrameElement;
    if (previewFrame) {
      previewFrame.src = 'about:blank';
      setTimeout(() => {
        previewFrame.src = '';
      }, 10);
    }
  };

  const handleConsoleOutput = (message: string) => {
    setConsoleOutput(prev => [...prev, message]);
  };

  const downloadCode = () => {
    // Create HTML file with embedded CSS and JS
    const fullHtml = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Code Playground Export</title>
  <style>
${css}
  </style>
</head>
<body>
${html}
  <script>
${js}
  </script>
</body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'playground-export.html';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const shareCode = () => {
    // Encode the current code state in the URL
    const codeState = {
      html,
      css,
      js
    };
    
    const encodedState = encodeURIComponent(btoa(JSON.stringify(codeState)));
    const shareUrl = `${window.location.origin}${window.location.pathname}?code=${encodedState}`;
    
    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        alert('Share link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy share link:', err);
      });
  };

  return (
    <div className={`min-h-screen flex flex-col ${theme === 'dark' ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>
      {/* Header */}
      <header className={`p-4 border-b ${theme === 'dark' ? 'border-gray-700' : 'border-gray-200'} flex justify-between items-center`}>
        <div className="flex items-center space-x-2">
          <Code2 className="h-6 w-6" />
          <h1 className="text-xl font-bold">Code Playground</h1> <h3>by Hassam</h3>
        </div>
        
        <div className="flex items-center space-x-4">
          <button 
            onClick={runCode}
            className="flex items-center space-x-1 px-4 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white transition-colors"
          >
            <Play className="h-4 w-4" />
            <span>Run</span>
          </button>
          
          <button 
            onClick={formatCode}
            className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
            title="Format Code"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
          
          <button 
            onClick={downloadCode}
            className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
            title="Download Code"
          >
            <Download className="h-5 w-5" />
          </button>
          
          <button 
            onClick={shareCode}
            className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
            title="Share Code"
          >
            <Share2 className="h-5 w-5" />
          </button>
          
          <button 
            onClick={toggleCollaborationPanel}
            className={`p-2 rounded-md ${isCollaborationPanelOpen ? 'bg-blue-600 text-white' : theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors relative`}
            title="Collaborators"
          >
            <Users className="h-5 w-5" />
            {collaborators.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {collaborators.length}
              </span>
            )}
          </button>
          
          <button 
            onClick={toggleTheme}
            className={`p-2 rounded-md ${theme === 'dark' ? 'hover:bg-gray-700' : 'hover:bg-gray-200'} transition-colors`}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editors and Preview */}
        <div className="flex-1 flex flex-row">
          {/* Code Editors */}
          <div className="w-1/2 flex flex-col">
            <div className="h-1/3 flex flex-col">
              <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`px-4 py-2 font-medium ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  HTML
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodeEditor 
                    language="html" 
                    value={html} 
                    onChange={(value) => updateCode('html', value || '')} 
                  />
                </div>
              </div>
            </div>
            
            <div className={`h-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} hover:bg-blue-500 transition-colors`} />
            
            <div className="h-1/3 flex flex-col">
              <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`px-4 py-2 font-medium ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  CSS
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodeEditor 
                    language="css" 
                    value={css} 
                    onChange={(value) => updateCode('css', value || '')} 
                  />
                </div>
              </div>
            </div>
            
            <div className={`h-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} hover:bg-blue-500 transition-colors`} />
            
            <div className="h-1/3 flex flex-col">
              <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`px-4 py-2 font-medium ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  JavaScript
                </div>
                <div className="flex-1 overflow-hidden">
                  <CodeEditor 
                    language="javascript" 
                    value={js} 
                    onChange={(value) => updateCode('js', value || '')} 
                  />
                </div>
              </div>
            </div>
          </div>
          
          <div className={`w-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} hover:bg-blue-500 transition-colors`} />
          
          {/* Preview and Console */}
          <div className="w-1/2 flex flex-col">
            <div className="h-2/3 flex flex-col">
              <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`px-4 py-2 font-medium flex justify-between items-center ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <span>Preview</span>
                  <button 
                    onClick={runCode}
                    className="flex items-center space-x-1 px-2 py-1 rounded-md bg-green-600 hover:bg-green-700 text-white text-sm transition-colors"
                  >
                    <Play className="h-3 w-3" />
                    <span>Run</span>
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <Preview html={html} css={css} js={js} onConsoleOutput={handleConsoleOutput} />
                </div>
              </div>
            </div>
            
            <div className={`h-1 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-300'} hover:bg-blue-500 transition-colors`} />
            
            <div className="h-1/3 flex flex-col">
              <div className={`h-full flex flex-col ${theme === 'dark' ? 'bg-gray-800' : 'bg-gray-50'}`}>
                <div className={`px-4 py-2 font-medium ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  Console
                </div>
                <div className="flex-1 overflow-auto">
                  <Console messages={consoleOutput} theme={theme} />
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Collaboration Panel */}
        {isCollaborationPanelOpen && (
          <div className={`w-64 border-l ${theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
            <CollaborationPanel />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
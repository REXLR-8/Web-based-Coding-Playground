import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import * as prettier from 'prettier';

interface CodeState {
  html: string;
  css: string;
  js: string;
  updateCode: (language: 'html' | 'css' | 'js', code: string) => void;
  formatCode: () => void;
  resetCode: () => void;
}

// Default starter code
const defaultHtml = `<div class="container">
  <h1>Welcome to Code Playground</h1>
  <p>Edit the HTML, CSS, and JavaScript to see your changes in real-time!</p>
  <button id="demo-button">Click Me!</button>
  <div id="output"></div>
</div>`;

const defaultCss = `body {
  font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  line-height: 1.6;
  margin: 0;
  padding: 20px;
  background-color: #f5f5f5;
}

.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #333;
  border-bottom: 2px solid #eee;
  padding-bottom: 10px;
}

button {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 10px 15px;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

button:hover {
  background-color: #45a049;
}

#output {
  margin-top: 20px;
  padding: 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 50px;
}`;

const defaultJs = `// Get references to DOM elements
const button = document.getElementById('demo-button');
const output = document.getElementById('output');

// Add click event listener to the button
button.addEventListener('click', () => {
  // Log to console
  console.log('Button clicked!');
  
  // Update the output div
  output.innerHTML = '<p>Button was clicked at: ' + new Date().toLocaleTimeString() + '</p>';
  
  // Change button color randomly
  const randomColor = '#' + Math.floor(Math.random()*16777215).toString(16);
  button.style.backgroundColor = randomColor;
});

// Log when the page loads
console.log('Page loaded successfully!');`;

// Load code from URL if available
const loadCodeFromUrl = () => {
  try {
    const urlParams = new URLSearchParams(window.location.search);
    const codeParam = urlParams.get('code');
    
    if (codeParam) {
      const decodedState = JSON.parse(atob(decodeURIComponent(codeParam)));
      return {
        html: decodedState.html || defaultHtml,
        css: decodedState.css || defaultCss,
        js: decodedState.js || defaultJs
      };
    }
  } catch (error) {
    console.error('Failed to load code from URL:', error);
  }
  
  return {
    html: defaultHtml,
    css: defaultCss,
    js: defaultJs
  };
};

const initialState = loadCodeFromUrl();

export const useCodeStore = create<CodeState>()(
  persist(
    (set, get) => ({
      html: initialState.html,
      css: initialState.css,
      js: initialState.js,
      
      updateCode: (language, code) => {
        set({ [language]: code });
      },
      
      formatCode: async () => {
        const { html, css, js } = get();
        
        try {
          const formattedHtml = await prettier.format(html, { parser: 'html', printWidth: 80 });
          const formattedCss = await prettier.format(css, { parser: 'css', printWidth: 80 });
          const formattedJs = await prettier.format(js, { parser: 'babel', printWidth: 80 });
          
          set({
            html: formattedHtml,
            css: formattedCss,
            js: formattedJs
          });
        } catch (error) {
          console.error('Error formatting code:', error);
        }
      },
      
      resetCode: () => {
        set({
          html: defaultHtml,
          css: defaultCss,
          js: defaultJs
        });
      }
    }),
    {
      name: 'code-playground-storage',
      partialize: (state) => ({ 
        html: state.html, 
        css: state.css, 
        js: state.js 
      }),
    }
  )
);
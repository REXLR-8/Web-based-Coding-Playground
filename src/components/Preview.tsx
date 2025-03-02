import React, { useEffect, useRef } from 'react';

interface PreviewProps {
  html: string;
  css: string;
  js: string;
  onConsoleOutput: (message: string) => void;
}

const Preview: React.FC<PreviewProps> = ({ html, css, js, onConsoleOutput }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const updatePreview = () => {
      if (!iframeRef.current) return;
      
      const iframe = iframeRef.current;
      const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
      
      if (!iframeDoc) return;
      
      // Create a new document with the user's code
      const htmlWithConsoleCapture = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>${css}</style>
          <script>
            // Capture console methods
            const originalConsole = console;
            console = {
              log: function(...args) {
                originalConsole.log(...args);
                window.parent.postMessage({
                  type: 'console',
                  method: 'log',
                  args: args.map(arg => String(arg))
                }, '*');
              },
              error: function(...args) {
                originalConsole.error(...args);
                window.parent.postMessage({
                  type: 'console',
                  method: 'error',
                  args: args.map(arg => String(arg))
                }, '*');
              },
              warn: function(...args) {
                originalConsole.warn(...args);
                window.parent.postMessage({
                  type: 'console',
                  method: 'warn',
                  args: args.map(arg => String(arg))
                }, '*');
              },
              info: function(...args) {
                originalConsole.info(...args);
                window.parent.postMessage({
                  type: 'console',
                  method: 'info',
                  args: args.map(arg => String(arg))
                }, '*');
              }
            };
            
            // Capture errors
            window.onerror = function(message, source, lineno, colno, error) {
              window.parent.postMessage({
                type: 'console',
                method: 'error',
                args: ["Error: " + message + " (line " + lineno + ", column " + colno + ")"]
              }, '*');
              return true;
            };
          </script>
        </head>
        <body>
          ${html}
          <script>
            try {
              ${js}
            } catch (error) {
              console.error(error.message);
            }
          </script>
        </body>
        </html>
      `;
      
      // Write to the iframe
      iframeDoc.open();
      iframeDoc.write(htmlWithConsoleCapture);
      iframeDoc.close();
    };
    
    // Update the preview with a small delay to avoid too frequent updates
    const debounceTimeout = setTimeout(updatePreview, 300);
    
    return () => {
      clearTimeout(debounceTimeout);
    };
  }, [html, css, js]);
  
  // Listen for console messages from the iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === 'console') {
        const { method, args } = event.data;
        const message = `[${method}] ${args.join(' ')}`;
        onConsoleOutput(message);
      }
    };
    
    window.addEventListener('message', handleMessage);
    
    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, [onConsoleOutput]);

  return (
    <iframe
      id="preview-frame"
      ref={iframeRef}
      title="Code Preview"
      sandbox="allow-scripts allow-modals allow-same-origin"
      className="w-full h-full bg-white"
    />
  );
};

export default Preview;
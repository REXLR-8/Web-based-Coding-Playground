import React, { useEffect, useRef } from 'react';
import Editor, { Monaco } from '@monaco-editor/react';
import { useThemeStore } from '../store/themeStore';
import { editor } from 'monaco-editor';
import * as Y from 'yjs';
import { WebsocketProvider } from 'y-websocket';
import { MonacoBinding } from 'y-monaco';
import { useCollaborationStore } from '../store/collaborationStore';

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string | undefined) => void;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ language, value, onChange }) => {
  const { theme } = useThemeStore();
  const editorRef = useRef<editor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const { addCollaborator, removeCollaborator } = useCollaborationStore();
  
  // Setup collaborative editing
  useEffect(() => {
    if (!editorRef.current || !monacoRef.current) return;
    
    // Generate a unique document ID based on the current URL and language
    const docId = `${window.location.pathname}-${language}`;
    
    // Initialize Yjs document
    const doc = new Y.Doc();
    
    // Define text type as shared data structure
    const yText = doc.getText('monaco');
    
    // Connect to WebSocket server (would need to be implemented)
    const wsProvider = new WebsocketProvider(
      'wss://demos.yjs.dev', // Replace with your WebSocket server
      docId,
      doc
    );
    
    // Random color for user cursor
    const userColor = '#' + Math.floor(Math.random() * 16777215).toString(16);
    
    // Set user name and color
    wsProvider.awareness.setLocalStateField('user', {
      name: 'User ' + Math.floor(Math.random() * 100),
      color: userColor
    });
    
    // Bind Monaco editor to Yjs
    const binding = new MonacoBinding(
      yText,
      editorRef.current.getModel()!,
      new Set([editorRef.current]),
      wsProvider.awareness
    );
    
    // Update collaborators list when awareness changes
    wsProvider.awareness.on('change', () => {
      const states = wsProvider.awareness.getStates();
      const collaborators = Array.from(states.entries())
        .filter(([clientId]) => clientId !== wsProvider.awareness.clientID)
        .map(([clientId, state]) => ({
          id: clientId.toString(),
          name: (state.user?.name as string) || `User ${clientId}`,
          color: (state.user?.color as string) || '#ccc',
          language
        }));
      
      addCollaborator(collaborators);
    });
    
    return () => {
      binding.destroy();
      wsProvider.disconnect();
      doc.destroy();
      
      // Remove all collaborators for this language when unmounting
      removeCollaborator(language);
    };
  }, [language, addCollaborator, removeCollaborator]);
  
  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
    
    // Set editor options
    editor.updateOptions({
      minimap: { enabled: false },
      scrollBeyondLastLine: false,
      fontFamily: 'JetBrains Mono, Menlo, Monaco, Consolas, monospace',
      fontSize: 14,
      lineNumbers: 'on',
      folding: true,
      glyphMargin: true,
      renderLineHighlight: 'all',
    });
  };

  return (
    <Editor
      height="100%"
      language={language}
      value={value}
      onChange={onChange}
      theme={theme === 'dark' ? 'vs-dark' : 'vs-light'}
      options={{
        automaticLayout: true,
        wordWrap: 'on',
        tabSize: 2,
      }}
      onMount={handleEditorDidMount}
    />
  );
};

export default CodeEditor;
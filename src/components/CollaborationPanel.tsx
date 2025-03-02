import React from 'react';
import { useCollaborationStore } from '../store/collaborationStore';
import { useThemeStore } from '../store/themeStore';

const CollaborationPanel: React.FC = () => {
  const { collaborators } = useCollaborationStore();
  const { theme } = useThemeStore();
  
  // Group collaborators by language
  const collaboratorsByLanguage = collaborators.reduce((acc, collaborator) => {
    const { language } = collaborator;
    if (!acc[language]) {
      acc[language] = [];
    }
    acc[language].push(collaborator);
    return acc;
  }, {} as Record<string, typeof collaborators>);

  return (
    <div className="p-4">
      <h2 className="text-lg font-semibold mb-4">Collaborators</h2>
      
      {Object.keys(collaboratorsByLanguage).length === 0 ? (
        <p className="text-gray-500 italic">No active collaborators</p>
      ) : (
        Object.entries(collaboratorsByLanguage).map(([language, users]) => (
          <div key={language} className="mb-4">
            <h3 className="text-md font-medium mb-2 capitalize">{language} Editor</h3>
            <ul className={`space-y-2 ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'} rounded-md p-2`}>
              {users.map(user => (
                <li 
                  key={`${language}-${user.id}`} 
                  className="flex items-center space-x-2"
                >
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: user.color }}
                  />
                  <span>{user.name}</span>
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
      
      <div className={`mt-6 p-3 rounded-md ${theme === 'dark' ? 'bg-gray-700' : 'bg-gray-200'}`}>
        <h3 className="text-md font-medium mb-2">Collaboration Info</h3>
        <p className="text-sm">
          Changes are synced in real-time with all connected users. You can see their cursors in the editor.
        </p>
      </div>
    </div>
  );
};

export default CollaborationPanel;
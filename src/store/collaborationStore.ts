import { create } from 'zustand';

interface Collaborator {
  id: string;
  name: string;
  color: string;
  language: string;
}

interface CollaborationState {
  collaborators: Collaborator[];
  isCollaborationPanelOpen: boolean;
  addCollaborator: (newCollaborators: Collaborator[]) => void;
  removeCollaborator: (language: string) => void;
  toggleCollaborationPanel: () => void;
}

export const useCollaborationStore = create<CollaborationState>((set) => ({
  collaborators: [],
  isCollaborationPanelOpen: false,
  
  addCollaborator: (newCollaborators) => set((state) => {
    // Filter out existing collaborators with the same IDs
    const existingIds = new Set(state.collaborators.map(c => c.id));
    const filteredNewCollaborators = newCollaborators.filter(c => !existingIds.has(c.id));
    
    return {
      collaborators: [...state.collaborators, ...filteredNewCollaborators]
    };
  }),
  
  removeCollaborator: (language) => set((state) => ({
    collaborators: state.collaborators.filter(c => c.language !== language)
  })),
  
  toggleCollaborationPanel: () => set((state) => ({
    isCollaborationPanelOpen: !state.isCollaborationPanelOpen
  })),
}));
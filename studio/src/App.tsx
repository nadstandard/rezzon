import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { Statusbar } from './components/layout/Statusbar';
import { VariablesView } from './views/Variables';
import { AliasesView } from './views/Aliases';
import { SnapshotsView } from './views/Snapshots';
import { useAppStore } from './stores/appStore';
import './styles/index.css';

function AppLayout({ children, variant }: { children: React.ReactNode; variant: string }) {
  const detailsPanelOpen = useAppStore((state) => state.ui.detailsPanelOpen);
  const libraries = useAppStore((state) => state.libraries);
  
  // Ostrzeżenie przed zamknięciem/odświeżeniem gdy są dane
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (libraries.length > 0) {
        e.preventDefault();
        // Standardowy sposób na pokazanie dialogu
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
      }
    };
    
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [libraries.length]);
  
  const panelClass = variant === 'variables' && !detailsPanelOpen ? 'panel-closed' : '';
  
  return (
    <div className={`app app--${variant} ${panelClass}`}>
      <Header />
      {children}
      <Statusbar />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route 
          path="/" 
          element={
            <AppLayout variant="variables">
              <VariablesView />
            </AppLayout>
          } 
        />
        <Route 
          path="/aliases" 
          element={
            <AppLayout variant="aliases">
              <AliasesView />
            </AppLayout>
          } 
        />
        <Route 
          path="/snapshots" 
          element={
            <AppLayout variant="snapshots">
              <SnapshotsView />
            </AppLayout>
          } 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App

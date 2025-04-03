import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import './utils/setupSchema' // Importar o script de configuração do schema

// A configuração do banco agora será feita automaticamente via setupSchema.ts
createRoot(document.getElementById("root")!).render(<App />);

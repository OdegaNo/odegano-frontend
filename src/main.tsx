import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import GlobalStyle from '@/styles/GlobalStyle'
import Router from '@/routes/Router'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <GlobalStyle />
    <Router />
  </StrictMode>,
)

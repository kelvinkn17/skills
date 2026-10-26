import '@fontsource-variable/geist'
import '@fontsource-variable/geist-mono'
import { createRoot } from 'react-dom/client'
import { inject } from '@vercel/analytics'
import { injectSpeedInsights } from '@vercel/speed-insights'
import Page from './site/Page'

// Production only, so dev and local previews stay quiet. Both scripts are served by Vercel at /_vercel
if (import.meta.env.PROD) {
  inject({ mode: 'production' })
  injectSpeedInsights()
}

createRoot(document.getElementById('root')!).render(<Page />)

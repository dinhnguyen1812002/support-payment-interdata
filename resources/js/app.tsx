import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { RouteContext } from '@/Hooks/useRoute';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ScrollProgress from "@/Components/ui/scroll-progress";
import {ThemeProvider} from "@/Components/theme-provider";
import { Toaster } from "@/Components/ui/sonner"
const appName =
  window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';


createInertiaApp({
  title: title => `${title}`,
  // progress: {
  //   color: '#4B5563',
  // },
  resolve: name =>
    resolvePageComponent(
      `./Pages/${name}.tsx`,
      import.meta.glob('./Pages/**/*.tsx'),
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);
    return root.render(
      <RouteContext.Provider value={(window as any).route}>

        <ThemeProvider>
              <ScrollProgress  />
              <App {...props} />
              <Toaster />
        </ThemeProvider>

      </RouteContext.Provider>,
    );
  },
});

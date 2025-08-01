import './bootstrap';
import '../css/app.css';

import React from 'react';
import { createRoot } from 'react-dom/client';
import { createInertiaApp } from '@inertiajs/react';
import { RouteContext } from './Hooks/useRoute';
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers';
import ScrollProgress from "./Components/ui/scroll-progress";
import { ThemeProvider } from "./Components/theme-provider";
import { Toaster } from "./Components/ui/sonner";
import AbilityProvider from './Context/AbilityProvider';
import { User } from './types/Role';

const appName = window.document.getElementsByTagName('title')[0]?.innerText || 'Laravel';

// Type for the auth user
interface AuthUser extends User {
  roles: Array<{ id: number; name: string; permissions: Array<{ id: number; name: string }> }>;
  permissions: Array<{ id: number; name: string }>;
}

// Type for the page props from Inertia
interface PageProps {
  auth?: {
    user?: AuthUser | null;
  };
  [key: string]: any;
}

// Type for the Inertia page props
interface InertiaPageProps {
  component: string;
  props: PageProps & {
    errors?: Record<string, string>;
  };
  url: string;
  version: string | null;
}

createInertiaApp({
  title: title => `${title}`,
  resolve: name =>
    resolvePageComponent(
      `./Pages/${name}.tsx`,
      import.meta.glob('./Pages/**/*.tsx'),
    ),
  setup({ el, App, props }) {
    const root = createRoot(el);
    const pageProps = (props.initialPage as unknown as InertiaPageProps).props;
    const user = pageProps.auth?.user || null;
    
    return root.render(
      <RouteContext.Provider value={(window as any).route}>
        <AbilityProvider initialUser={user}>
          <ThemeProvider>
            <ScrollProgress />
            <App {...props} />
            <Toaster />
          </ThemeProvider>
        </AbilityProvider>
      </RouteContext.Provider>,
    );
  },
});

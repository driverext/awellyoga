import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig)
  .catch((err) => console.error(err));

if (isSanityPreviewMode()) {
  // Visual editing is only loaded when preview mode is actually in play.
  // Keeping it lazy avoids shipping the editor overlay to every normal visitor.
  void import('@sanity/visual-editing')
    .then(({ enableVisualEditing }) => {
      enableVisualEditing({
        history: {
          subscribe: (navigate) => {
            const handler = () => {
              navigate({
                type: 'push',
                url: `${window.location.pathname}${window.location.search}${window.location.hash}`
              });
            };

            window.addEventListener('popstate', handler);
            return () => window.removeEventListener('popstate', handler);
          },
          update: (update) => {
            switch (update.type) {
              case 'push':
                window.history.pushState(null, '', update.url);
                break;
              case 'replace':
                window.history.replaceState(null, '', update.url);
                break;
              case 'pop':
                window.history.back();
                break;
            }
          }
        },
        zIndex: 2000
      });
    })
    .catch((error) => {
      console.error('Sanity visual editing failed to initialize:', error);
    });
}

function isSanityPreviewMode(): boolean {
  const search = new URLSearchParams(window.location.search);
  const hasPreviewParams =
    search.has('preview') ||
    search.has('perspective') ||
    search.has('sanity-preview-perspective') ||
    search.has('sanity-preview-secret') ||
    search.has('sanity-preview-pathname');

  if (hasPreviewParams) {
    return true;
  }

  // Presentation mode sometimes loads the site in an iframe without forwarding the
  // normal preview params, so referrer is the last fallback.
  if (window.self !== window.top) {
    try {
      const referrer = document.referrer ? new URL(document.referrer) : null;
      if (referrer && referrer.pathname.includes('/studio')) {
        return true;
      }
    } catch {
      return true;
    }
  }

  return false;
}

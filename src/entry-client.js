import { hydrateRoot } from 'react-dom/client';

let currentPathname = window.location.pathname;

const routerCache = new Map();
routerCache.set(currentPathname, JSON.parse(window.__JSX__, revive));

const root = hydrateRoot(document, routerCache.get(currentPathname));

function revive(_, value) {
  if (value === '$') {
    return Symbol.for('react.element');
  } else {
    return value;
  }
}

async function navigate(pathname) {
  currentPathname = pathname;

  if (routerCache.has(pathname)) {
    root.render(routerCache.get(pathname));
    return;
  } else {
    const response = await fetch(`${pathname}?jsx`);
    const jsx = await response.text();

    routerCache.set(pathname, JSON.parse(jsx, revive));

    if (pathname === currentPathname) {
      root.render(routerCache.get(pathname));
    }
  }
}

window.addEventListener('click', (e) => {
  if (e.target.tagName !== 'A') {
    return;
  }

  if (e.metaKey || e.ctrlKey || e.shiftKey) {
    return;
  }

  const href = e.target.getAttribute('href');

  if (!href.startsWith('/')) {
    return;
  }

  e.preventDefault();
  window.history.pushState(null, null, href);
  navigate(href);
});

window.addEventListener('popstate', () => {
  navigate(window.location.pathname);
});

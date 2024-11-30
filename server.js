import fs from 'node:fs/promises';
import express from 'express';
import { renderToString } from 'react-dom/server';

// constants
const isProduction = process.env.NODE_ENV === 'production';
const port = process.env.PORT || 5173;
const base = process.env.NODE_ENV || '/';

// cached production assets
const templateHtml = isProduction ? await fs.readFile('./dist/client/index.html', 'utf-8') : '';

// create http server
const app = express();

let vite;

if (!isProduction) {
  const { createServer } = await import('vite');

  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base,
  });

  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;

  app.use(compression());
  app.use(base, sirv('./dist/client', { extensions: [] }));
}

app.use('*all', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '/');

    let template;
    let render;

    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile('./index.html', 'utf-8');
      render = (await vite.ssrLoadModule('/src/entry-server.jsx')).render;
    } else {
      template = templateHtml;
      render = (await import('./dist/server/entry-server.js')).render;
    }

    const rendered = await render({ url });
    const jsx = JSON.stringify(rendered.jsx, escape);

    if (url.endsWith('?jsx')) {
      res.status(200).set({ 'Content-Type': 'application/json' }).end(jsx);
    } else {
      const html = template
        .replace('<!--app-html-->', renderToString(rendered.jsx) ?? '')
        .replace('<!--app-rsc-->', () => `<script>window.__JSX__ = \`${jsx}\`</script>`);

      res.status(200).set({ 'Content-Type': 'text/html' }).end(html);
    }
  } catch (e) {
    vite?.ssrFixStacktrace(e);
    console.error(e);
    res.status(500).end(e.stack);
  }
});

// start http server
app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});

function escape(_, value) {
  if (value === Symbol.for('react.element')) {
    return '$';
  } else {
    return value;
  }
}

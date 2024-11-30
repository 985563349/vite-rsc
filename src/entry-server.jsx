import { matchRoutes } from 'react-router-dom';

import { createReactTree } from './next';
import routes from './routes';
import Layout from './layout';

export async function render({ url }) {
  const [route] = matchRoutes(routes, url);
  const { component: Component } = route.route;

  const jsx = await createReactTree(
    <Layout>
      <Component />
    </Layout>
  );

  return { jsx };
}

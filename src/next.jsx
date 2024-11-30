export function getPageRoutes(importMap) {
  return (
    Object.keys(importMap)
      // Ensure that static routes have
      // precedence over the dynamic ones
      .sort((a, b) => (a > b ? -1 : 1))
      .map((path) => ({
        // Remove /src/pages and .jsx extension
        path: path
          .slice(10, -4)
          // Replace [id] with :id
          .replace(/\[(\w+)\]/, (_, m) => `:${m}`)
          // Replace '/page' with '/'
          .replace(/\/page$/, '/'),
        // The React component (default export)
        component: importMap[path].default,
      }))
  );
}

export async function createReactTree(jsx) {
  if (!jsx) {
    return;
  }

  if (['string', 'boolean', 'number'].includes(typeof jsx)) {
    return jsx;
  }

  if (Array.isArray(jsx)) {
    return await Promise.all(jsx.map(createReactTree));
  }

  if (typeof jsx === 'object' && jsx !== null) {
    if (jsx.$$typeof === Symbol.for('react.element')) {
      if (typeof jsx.type === 'string') {
        return { ...jsx, props: await createReactTree(jsx.props) };
      }

      if (typeof jsx.type === 'function') {
        const Component = jsx.type;
        const props = jsx.props;
        const renderedComponent = await Component(props);
        return await createReactTree(renderedComponent);
      }
    }

    return Object.fromEntries(
      await Promise.all(Object.entries(jsx).map(async ([key, value]) => [key, await createReactTree(value)]))
    );
  }
}

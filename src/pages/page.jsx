export default async function Index() {
  const hobby = await new Promise((resolve) => setTimeout(() => resolve(['eat', 'play', 'sleep']), 1000));

  return (
    <div>
      <h1>Hello React Server Component</h1>
      <p>
        <a href="/other">Go to another page</a>
      </p>
      <p>Hobby</p>
      <ul>
        {hobby.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

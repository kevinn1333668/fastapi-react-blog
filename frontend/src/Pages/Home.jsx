import CardContent from "../Components/CardContent";
import { useMemo } from "react";
import { useLoaderData } from "react-router-dom";

function Home() {
  const posts = useLoaderData();
  const sortedPosts = useMemo(
    () =>
      [...posts].sort(
        (a, b) =>
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
      ),
    [posts],
  );

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-center">Посты</h1>
      <div>
        {sortedPosts.map((post) => (
          <CardContent
            key={post.id}
            content={post.content || "Описание отсутствует"}
            images={post.images}
            date={post.created_at}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;

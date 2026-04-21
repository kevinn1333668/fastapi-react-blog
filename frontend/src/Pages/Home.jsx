import CardContent from "../Components/CardContent";
import { useEffect, useState } from "react";

const fetchData = async () => {
  const res = await fetch("http://127.0.0.1:8000/posts");
  if (!res.ok) {
    throw new Error("Failed to fetch posts");
  }
  return res.json();
};

function Home() {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPosts() {
      try {
        const data = await fetchData();
        setPosts(data.items);
      } catch (err) {
        setError(err);
      } finally {
        setIsLoading(false);
      }
    }
    loadPosts();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Loading</p>
      </div>
    );
  }
  if (error) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Error: {error.message}</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold text-center">Посты</h1>
      <div>
        {posts.map((post) => (
          <CardContent
            key={post.id}
            title={post.content}
            description={post.description || "Описание отсутствует"}
            images={post.images}
            date={post.created_at}
          />
        ))}
      </div>
    </div>
  );
}

export default Home;

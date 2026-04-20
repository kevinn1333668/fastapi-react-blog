import CardContent from "../Components/CardContent";
import { useEffect } from "react";

function Home() {
  useEffect(() => {
    fetch("http://localhost:8000/api/posts")
      .then((res) => res.json())
      .then((data) => console.log(data));
  }, []);
  return (
    <div>
      <h1>welcome to my blog</h1>
      <CardContent
        title="Post 1"
        description="Description 1"
        image="/favicon.svg"
        date="2021-01-01"
      />
    </div>
  );
}

export default Home;

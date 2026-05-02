// AdminPosts.jsx
import CardContent from "../Components/CardContent";
import { useMemo } from "react";
import { useLoaderData, Form } from "react-router-dom";

function AdminPosts() {
  const posts = useLoaderData();
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => b.id - a.id),
    [posts]
  );

  return (
    <div>
      {sortedPosts.map((post) => (
        <div key={post.id}>
          <CardContent
            content={post.content || "Описание отсутствует"}
            images={post.images}
            date={post.created_at}
            isAdmin={true}
            onDelete={() => {
              const form = document.getElementById(`delete-form-${post.id}`);
              form?.requestSubmit();
            }}
          />

          {/* Скрытая форма для отправки DELETE запроса */}
          <Form
            method="post"
            id={`delete-form-${post.id}`}
            style={{ display: "none" }}
          >
            <input type="hidden" name="post_id" value={post.id} />
          </Form>
        </div>
      ))}
    </div>
  );
}

export default AdminPosts;

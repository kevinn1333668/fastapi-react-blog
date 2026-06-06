import CardContent from "../Components/CardContent";
import PostComposer from "../Components/PostComposer";
import { useMemo } from "react";
import { useLoaderData, Form, useNavigate } from "react-router-dom";

function AdminPosts() {
  const posts = useLoaderData();
  const navigate = useNavigate();
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => b.id - a.id),
    [posts],
  );

  return (
    <>
      <div className="pb-28">
        {sortedPosts.map((post) => (
          <div key={post.id}>
            <CardContent
              postId={post.id}
              content={post.content || "Описание отсутствует"}
              images={post.images}
              date={post.created_at}
              isAdmin={true}
              onDelete={() => {
                const form = document.getElementById(`delete-form-${post.id}`);
                form?.requestSubmit();
              }}
              onEdit={() => navigate(`/settings/change?postId=${post.id}`)}
            />

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

      <PostComposer />
    </>
  );
}

export default AdminPosts;

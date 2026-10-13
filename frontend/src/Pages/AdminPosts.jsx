import CardContent from "../Components/CardContent";
import PostComposer from "../Components/PostComposer";
import PostSearchBar from "../Components/PostSearchBar";
import PostSearchResults from "../Components/PostSearchResults";
import { useMemo } from "react";
import { useLoaderData, Form, useNavigate } from "react-router-dom";
import { useHybridPostSearch } from "../hooks/useHybridPostSearch";

function AdminPosts() {
  const posts = useLoaderData();
  const navigate = useNavigate();
  const sortedPosts = useMemo(
    () => [...posts].sort((a, b) => b.id - a.id),
    [posts],
  );

  const search = useHybridPostSearch(sortedPosts);

  const renderPost = (post, highlightQuery) => (
    <div key={post.id}>
      <CardContent
        postId={post.id}
        content={post.content || "Описание отсутствует"}
        images={post.images}
        date={post.created_at}
        isAdmin={true}
        highlightQuery={highlightQuery}
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
  );

  return (
    <>
      <h1 className="mb-4 text-3xl font-bold text-center">Посты</h1>

      <div className="sticky top-0 z-20 mb-6 bg-gradient-to-b from-white via-white to-transparent px-2 py-3">
        <PostSearchBar
          value={search.query}
          onChange={search.setQuery}
          onClear={search.clearQuery}
        />
      </div>

      <div className="pb-28">
        {search.isActive ? (
          <PostSearchResults search={search} renderPost={renderPost} />
        ) : (
          sortedPosts.map((post) => renderPost(post, ""))
        )}
      </div>

      <PostComposer />
    </>
  );
}

export default AdminPosts;

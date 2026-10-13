import CardContent from "../Components/CardContent";
import PostSearchBar from "../Components/PostSearchBar";
import PostSearchResults from "../Components/PostSearchResults";
import { useCallback, useEffect, useRef, useState } from "react";
import { useLoaderData } from "react-router-dom";
import { fetchPostsPage } from "../api/posts";
import { useHybridPostSearch } from "../hooks/useHybridPostSearch";

function Home() {
  const initial = useLoaderData();
  const initialItems = initial?.items ?? [];
  const initialTotal = initial?.total ?? initialItems.length;
  const pageLimit = initial?.limit ?? 10;

  const [items, setItems] = useState(initialItems);
  const [total, setTotal] = useState(initialTotal);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadMoreError, setLoadMoreError] = useState(null);

  const search = useHybridPostSearch(items);

  const hasMore = items.length < total;
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (search.isActive) return;
    if (isLoadingMore) return;
    if (!hasMore) return;

    setIsLoadingMore(true);
    setLoadMoreError(null);
    try {
      const data = await fetchPostsPage({
        limit: pageLimit,
        offset: items.length,
      });
      const nextItems = data?.items ?? [];
      setItems((prev) => [...prev, ...nextItems]);
      setTotal(data?.total ?? total);
    } catch (e) {
      setLoadMoreError(e?.message ?? "Failed to load more posts");
    } finally {
      setIsLoadingMore(false);
    }
  }, [hasMore, isLoadingMore, items.length, pageLimit, search.isActive, total]);

  useEffect(() => {
    if (search.isActive) return;
    if (!sentinelRef.current) return;

    const el = sentinelRef.current;
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (first?.isIntersecting) {
          loadMore();
        }
      },
      { root: null, rootMargin: "400px 0px", threshold: 0 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [loadMore, search.isActive]);

  const renderPost = (post, highlightQuery) => (
    <CardContent
      key={post.id}
      postId={post.id}
      content={post.content || "Описание отсутствует"}
      images={post.images}
      date={post.created_at}
      isAdmin={false}
      highlightQuery={highlightQuery}
    />
  );

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold text-center">Посты</h1>

      <div className="sticky top-0 z-20 mb-6 bg-gradient-to-b from-white via-white to-transparent px-2 py-3">
        <PostSearchBar
          value={search.query}
          onChange={search.setQuery}
          onClear={search.clearQuery}
        />
      </div>

      {search.isActive ? (
        <PostSearchResults search={search} renderPost={renderPost} />
      ) : (
        <>
          <div>{items.map((post) => renderPost(post, ""))}</div>

          <div className="flex flex-col gap-2 items-center py-6">
            {isLoadingMore && <p className="text-gray-500">Загрузка...</p>}
            {loadMoreError && (
              <p className="text-red-600">Ошибка подгрузки: {loadMoreError}</p>
            )}
            {!hasMore && items.length > 0 && (
              <p className="text-gray-400">Больше постов нет</p>
            )}
            <div ref={sentinelRef} className="w-full h-1" />
          </div>
        </>
      )}
    </div>
  );
}

export default Home;

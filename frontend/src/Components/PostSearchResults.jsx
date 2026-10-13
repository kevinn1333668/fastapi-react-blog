export default function PostSearchResults({
  search,
  renderPost,
}) {
  const {
    debouncedQuery,
    localMatches,
    remoteMatches,
    remoteLoading,
    remoteLoadingMore,
    remoteError,
    hasMoreRemote,
    loadMoreRemote,
  } = search;

  const nothingFound =
    !remoteLoading &&
    localMatches.length === 0 &&
    remoteMatches.length === 0;

  return (
    <div className="flex flex-col gap-2">
      {localMatches.length > 0 && (
        <section aria-label="Совпадения в загруженной ленте">
          <p className="mb-3 text-center text-sm font-medium text-gray-500">
            В загруженной ленте
          </p>
          {localMatches.map((post) => renderPost(post, debouncedQuery))}
        </section>
      )}

      {(remoteLoading || remoteMatches.length > 0 || remoteError) && (
        <section
          className={localMatches.length > 0 ? "mt-4" : ""}
          aria-label="Совпадения в остальных постах"
        >
          <p className="mb-3 text-center text-sm font-medium text-gray-500">
            В остальных постах
          </p>
          {remoteLoading && localMatches.length === 0 && (
            <p className="py-4 text-center text-gray-500">Ищем…</p>
          )}
          {remoteLoading && localMatches.length > 0 && (
            <p className="pb-2 text-center text-sm text-gray-400">Ищем…</p>
          )}
          {remoteError && (
            <p className="py-2 text-center text-red-600">{remoteError}</p>
          )}
          {remoteMatches.map((post) => renderPost(post, debouncedQuery))}
        </section>
      )}

      {nothingFound && (
        <p className="py-10 text-center text-gray-500">
          По запросу «{debouncedQuery}» ничего не найдено
        </p>
      )}

      {hasMoreRemote && remoteMatches.length > 0 && (
        <div className="flex justify-center py-4">
          <button
            type="button"
            onClick={loadMoreRemote}
            disabled={remoteLoadingMore}
            className="rounded-xl bg-blue-100 px-5 py-2 text-sm font-medium text-blue-900 transition hover:bg-blue-200 disabled:opacity-60"
          >
            {remoteLoadingMore ? "Загрузка…" : "Ещё результаты поиска"}
          </button>
        </div>
      )}
    </div>
  );
}

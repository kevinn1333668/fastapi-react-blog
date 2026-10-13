import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { fetchPostsPage } from "../api/posts";
import { normalizePostSearchQuery, postMatchesQuery } from "../utils/postSearch";

const SCAN_PAGE_LIMIT = 50;
const REMOTE_BATCH_SIZE = 10;

const EMPTY_SCAN_STATE = {
  offset: 0,
  total: null,
  excludeIds: new Set(),
  activeQuery: "",
};

/**
 * Client filter on loaded posts + debounced scan of all pages via existing list API.
 */
export function useHybridPostSearch(loadedItems, { debounceMs = 400 } = {}) {
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");

  const [remoteMatches, setRemoteMatches] = useState([]);
  const [remoteLoading, setRemoteLoading] = useState(false);
  const [remoteLoadingMore, setRemoteLoadingMore] = useState(false);
  const [remoteError, setRemoteError] = useState(null);
  const [remoteExhausted, setRemoteExhausted] = useState(false);

  const scanStateRef = useRef({ ...EMPTY_SCAN_STATE, excludeIds: new Set() });
  const abortRef = useRef(null);
  const loadedItemsRef = useRef(loadedItems);

  useEffect(() => {
    loadedItemsRef.current = loadedItems;
  }, [loadedItems]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query.trim());
    }, debounceMs);
    return () => window.clearTimeout(timer);
  }, [query, debounceMs]);

  const isActive = Boolean(normalizePostSearchQuery(debouncedQuery));

  const localMatches = useMemo(() => {
    if (!isActive) return [];
    return loadedItems.filter((post) =>
      postMatchesQuery(post, debouncedQuery),
    );
  }, [loadedItems, debouncedQuery, isActive]);

  const abortRemoteScan = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const scanRemoteBatch = useCallback(
    async ({ query: searchQuery, excludeIds, append, signal }) => {
      const needle = normalizePostSearchQuery(searchQuery);
      if (!needle) return;

      const state = scanStateRef.current;
      if (state.activeQuery !== needle) {
        state.activeQuery = needle;
        state.offset = 0;
        state.total = null;
        state.excludeIds = new Set(excludeIds);
      } else if (!append) {
        state.offset = 0;
        state.total = null;
        state.excludeIds = new Set(excludeIds);
      }

      const found = [];
      let offset = state.offset;
      let total = state.total ?? Number.POSITIVE_INFINITY;

      while (found.length < REMOTE_BATCH_SIZE && offset < total) {
        if (signal.aborted) return;

        const data = await fetchPostsPage({
          limit: SCAN_PAGE_LIMIT,
          offset,
        });
        if (signal.aborted) return;

        const batch = data?.items ?? [];
        total = data?.total ?? total;
        state.total = total;

        for (const post of batch) {
          if (state.excludeIds.has(post.id)) continue;
          if (!postMatchesQuery(post, needle)) continue;
          state.excludeIds.add(post.id);
          found.push(post);
          if (found.length >= REMOTE_BATCH_SIZE) break;
        }

        offset += batch.length;
        if (batch.length === 0) break;
      }

      state.offset = offset;
      const exhausted = offset >= total;

      if (signal.aborted) return;

      setRemoteMatches((prev) => (append ? [...prev, ...found] : found));
      setRemoteExhausted(exhausted);
    },
    [],
  );

  useEffect(() => {
    if (!isActive) {
      abortRemoteScan();
      scanStateRef.current = {
        ...EMPTY_SCAN_STATE,
        excludeIds: new Set(),
      };
      return;
    }

    abortRemoteScan();
    const controller = new AbortController();
    abortRef.current = controller;

    const excludeIds = new Set(
      loadedItemsRef.current
        .filter((post) => postMatchesQuery(post, debouncedQuery))
        .map((post) => post.id),
    );

    scanStateRef.current = {
      offset: 0,
      total: null,
      excludeIds,
      activeQuery: normalizePostSearchQuery(debouncedQuery),
    };

    let cancelled = false;

    void (async () => {
      setRemoteLoading(true);
      setRemoteError(null);
      setRemoteExhausted(false);
      setRemoteMatches([]);

      try {
        await scanRemoteBatch({
          query: debouncedQuery,
          excludeIds,
          append: false,
          signal: controller.signal,
        });
      } catch (e) {
        if (controller.signal.aborted || cancelled) return;
        setRemoteError(e?.message ?? "Не удалось выполнить поиск");
      } finally {
        if (!controller.signal.aborted && !cancelled) {
          setRemoteLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [debouncedQuery, isActive, abortRemoteScan, scanRemoteBatch]);

  const loadMoreRemote = useCallback(async () => {
    if (!isActive || remoteLoading || remoteLoadingMore || remoteExhausted) {
      return;
    }

    abortRemoteScan();
    const controller = new AbortController();
    abortRef.current = controller;

    setRemoteLoadingMore(true);
    setRemoteError(null);

    try {
      await scanRemoteBatch({
        query: debouncedQuery,
        excludeIds: scanStateRef.current.excludeIds,
        append: true,
        signal: controller.signal,
      });
    } catch (e) {
      if (!controller.signal.aborted) {
        setRemoteError(e?.message ?? "Не удалось загрузить ещё");
      }
    } finally {
      if (!controller.signal.aborted) setRemoteLoadingMore(false);
    }
  }, [
    debouncedQuery,
    isActive,
    remoteExhausted,
    remoteLoading,
    remoteLoadingMore,
    abortRemoteScan,
    scanRemoteBatch,
  ]);

  const clearQuery = useCallback(() => {
    setQuery("");
    abortRemoteScan();
    scanStateRef.current = {
      ...EMPTY_SCAN_STATE,
      excludeIds: new Set(),
    };
    setRemoteMatches([]);
    setRemoteLoading(false);
    setRemoteLoadingMore(false);
    setRemoteError(null);
    setRemoteExhausted(false);
  }, [abortRemoteScan]);

  return {
    query,
    setQuery,
    clearQuery,
    debouncedQuery,
    isActive,
    localMatches,
    remoteMatches: isActive ? remoteMatches : [],
    remoteLoading: isActive && remoteLoading,
    remoteLoadingMore: isActive && remoteLoadingMore,
    remoteError: isActive ? remoteError : null,
    remoteExhausted: isActive && remoteExhausted,
    loadMoreRemote,
    hasMoreRemote: isActive && !remoteExhausted,
  };
}

/**
 * Query options, key factory and hooks for the paintings feature.
 *
 * Deliberately NOT marked "use client": server components import the key
 * factory and the options to prefetch with exactly the keys the hooks below
 * read, and the hooks themselves only ever run inside components that already
 * carry the directive.
 */
import {
  queryOptions,
  useMutation,
  useQueryClient,
  useSuspenseQuery,
} from "@tanstack/react-query";

import {
  createEnquiry,
  createPainting,
  deleteEnquiry,
  deletePainting,
  fetchEnquiries,
  fetchHeroSlides,
  fetchPainting,
  fetchPaintings,
  reorderPaintings,
  saveHeroSlides,
  updatePainting,
  updatePaintingStock,
} from "@/features/paintings/api";
import type {
  CreateEnquiryInput,
  HeroSlidesInput,
  Painting,
  PaintingInput,
  PaintingList,
} from "@/features/paintings/types";

/**
 * The key factory. Every read and every invalidation goes through it, so there
 * is exactly one spelling of each key and a prefix invalidation always catches
 * the queries it means to.
 */
export const paintingKeys = {
  all: ["paintings"] as const,
  lists: () => [...paintingKeys.all, "list"] as const,
  list: () => [...paintingKeys.lists()] as const,
  details: () => [...paintingKeys.all, "detail"] as const,
  detail: (slug: string) => [...paintingKeys.details(), slug] as const,
  hero: () => ["hero-slides"] as const,
  enquiries: () => ["enquiries"] as const,
};

export const paintingListOptions = () =>
  queryOptions({
    queryKey: paintingKeys.list(),
    queryFn: fetchPaintings,
  });

export const paintingOptions = (slug: string) =>
  queryOptions({
    queryKey: paintingKeys.detail(slug),
    queryFn: () => fetchPainting(slug),
  });

export const heroSlidesOptions = () =>
  queryOptions({
    queryKey: paintingKeys.hero(),
    queryFn: fetchHeroSlides,
  });

export function usePaintings() {
  return useSuspenseQuery(paintingListOptions());
}

export function usePainting(slug: string) {
  return useSuspenseQuery(paintingOptions(slug));
}

export function useHeroSlides() {
  return useSuspenseQuery(heroSlidesOptions());
}

/**
 * Marking a work sold is the one thing a visitor watches happen, so the cache
 * is patched first and rolled back if the server disagrees.
 */
export function useSetPaintingStock(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (inStock: boolean) => updatePaintingStock(slug, inStock),
    onMutate: async (inStock) => {
      await queryClient.cancelQueries({ queryKey: paintingKeys.all });

      const previousList = queryClient.getQueryData<PaintingList>(
        paintingKeys.list(),
      );
      const previousDetail = queryClient.getQueryData<Painting>(
        paintingKeys.detail(slug),
      );

      queryClient.setQueryData<PaintingList>(paintingKeys.list(), (old) =>
        old
          ? {
              ...old,
              paintings: old.paintings.map((p) =>
                p.slug === slug ? { ...p, inStock } : p,
              ),
            }
          : old,
      );
      queryClient.setQueryData<Painting>(paintingKeys.detail(slug), (old) =>
        old ? { ...old, inStock } : old,
      );

      return { previousList, previousDetail };
    },
    onError: (_error, _inStock, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(paintingKeys.list(), context.previousList);
      }
      if (context?.previousDetail) {
        queryClient.setQueryData(
          paintingKeys.detail(slug),
          context.previousDetail,
        );
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: paintingKeys.all });
    },
  });
}

export function useCreateEnquiry(slug: string) {
  return useMutation({
    mutationFn: (input: CreateEnquiryInput) => createEnquiry(slug, input),
  });
}

export function useDeleteEnquiry() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteEnquiry(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: paintingKeys.enquiries() });
    },
  });
}

// --- the studio desk ---------------------------------------------------------

export const enquiriesOptions = () =>
  queryOptions({
    queryKey: paintingKeys.enquiries(),
    queryFn: fetchEnquiries,
  });

export function useEnquiries() {
  return useSuspenseQuery(enquiriesOptions());
}

export function useCreatePainting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PaintingInput) => createPainting(input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: paintingKeys.all }),
  });
}

export function useUpdatePainting(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: PaintingInput) => updatePainting(id, input),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: paintingKeys.all }),
  });
}

export function useDeletePainting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deletePainting(id),
    onSuccess: () => {
      // The work's enquiries went with it.
      void queryClient.invalidateQueries({ queryKey: paintingKeys.enquiries() });
      return queryClient.invalidateQueries({ queryKey: paintingKeys.all });
    },
  });
}

/**
 * Re-hanging the wall is something the studio watches happen, so the list is
 * reordered in the cache first and put back if the server refuses.
 */
export function useReorderPaintings() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (ids: string[]) => reorderPaintings(ids),
    onMutate: async (ids) => {
      await queryClient.cancelQueries({ queryKey: paintingKeys.list() });
      const previous = queryClient.getQueryData<PaintingList>(
        paintingKeys.list(),
      );

      queryClient.setQueryData<PaintingList>(paintingKeys.list(), (old) => {
        if (!old) return old;
        const byId = new Map(old.paintings.map((p) => [p.id, p]));
        const paintings = ids.flatMap((id, position) => {
          const painting = byId.get(id);
          return painting ? [{ ...painting, position }] : [];
        });
        return { ...old, paintings };
      });

      return { previous };
    },
    onError: (_error, _ids, context) => {
      if (context?.previous) {
        queryClient.setQueryData(paintingKeys.list(), context.previous);
      }
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: paintingKeys.all });
    },
  });
}

export function useSaveHeroSlides() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: HeroSlidesInput) => saveHeroSlides(input),
    onSuccess: (list) => {
      queryClient.setQueryData(paintingKeys.hero(), list);
    },
  });
}

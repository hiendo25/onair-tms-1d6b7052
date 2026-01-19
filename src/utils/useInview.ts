import { RefObject, useEffect, useRef, useState } from "react";

type UseInViewOptions = {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number | number[];
};

const useInView = (el: RefObject<HTMLElement | null>, options?: UseInViewOptions) => {
  const [isInView, setIsInView] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    const node = el.current;
    if (!node) return;

    if (observerRef.current) observerRef.current.disconnect();

    observerRef.current = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry?.isIntersecting || false);
      },
      {
        root: options?.root ?? null,
        threshold: options?.threshold ?? 0.1,
        rootMargin: options?.rootMargin ?? "0px",
      },
    );

    observerRef.current.observe(node);

    return () => {
      observerRef.current?.disconnect();
    };
  }, [el, options?.root, options?.rootMargin, options?.threshold]);

  return isInView;
};
export default useInView;

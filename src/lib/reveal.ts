// One shared IntersectionObserver for all scroll-reveal elements.
let observer: IntersectionObserver | null = null;

function getObserver(): IntersectionObserver {
  observer ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          observer?.unobserve(entry.target);
        }
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.05 },
  );
  return observer;
}

export function observeReveal(el: Element | null): () => void {
  if (!el) return () => {};
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce || typeof IntersectionObserver === "undefined") {
    el.classList.add("is-visible");
    return () => {};
  }
  const io = getObserver();
  io.observe(el);
  return () => io.unobserve(el);
}

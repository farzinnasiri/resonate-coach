import { useEffect, useRef } from 'react';

export const useFooterHeightVar = () => {
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const setVar = () => {
      const h = el.getBoundingClientRect().height;
      document.documentElement.style.setProperty('--footer-height', `${Math.round(h)}px`);
    };

    setVar();
    const ro = new ResizeObserver(setVar);
    ro.observe(el);
    return () => {
      ro.disconnect();
    };
  }, []);

  return ref;
};

export const useFooterOverlayHeightVar = () => {
  const footerRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLTextAreaElement | null>(null);

  useEffect(() => {
    const f = footerRef.current;
    const i = inputRef.current;
    if (!f || !i) return;

    const setVar = () => {
      const ft = f.getBoundingClientRect().top;
      const it = i.getBoundingClientRect().top;
      const h = Math.max(0, Math.round(it - ft));
      document.documentElement.style.setProperty('--footer-overlay-height', `${h}px`);
    };

    setVar();
    const roF = new ResizeObserver(setVar);
    const roI = new ResizeObserver(setVar);
    roF.observe(f);
    roI.observe(i);
    window.addEventListener('resize', setVar);
    return () => {
      roF.disconnect();
      roI.disconnect();
      window.removeEventListener('resize', setVar);
    };
  }, []);

  return { footerRef, inputRef };
};

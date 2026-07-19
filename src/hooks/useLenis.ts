import { useEffect } from "react";
import Lenis from "lenis";

/** Altura del navbar fijo, para compensar el scroll a anclas. */
const ANCHOR_OFFSET = -88;

/**
 * Scroll suave con inercia para toda la página (Lenis) + navegación
 * por anclas interceptada para que use la misma curva de desplazamiento.
 * Se desactiva por completo si el usuario prefiere movimiento reducido.
 */
export default function useLenis(): void {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const lenis = new Lenis({
      // Respuesta al doble de velocidad: curva corta + más distancia por giro de rueda.
      duration: 0.55,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      wheelMultiplier: 1.6,
    });

    let rafId = 0;
    const raf = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest<HTMLAnchorElement>('a[href^="#"]');
      if (!link) return;

      const hash = link.getAttribute("href");
      if (!hash || hash === "#") return;

      const destination = document.querySelector<HTMLElement>(hash);
      if (!destination) return;

      event.preventDefault();
      lenis.scrollTo(destination, { offset: ANCHOR_OFFSET });
      history.replaceState(null, "", hash);
    };

    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("click", onClick);
      cancelAnimationFrame(rafId);
      lenis.destroy();
    };
  }, []);
}

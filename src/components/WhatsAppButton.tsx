import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const PHONE = "525588000698";
const DEFAULT_MESSAGE = "¡Hola! Me interesa obtener más información sobre un crédito";

const TIPS = [
  "¿Tienes dudas? ¡Contáctanos!",
  "Estamos para atenderte 💬",
  "Escríbenos por WhatsApp",
  "Resolvemos tus dudas al instante",
];

const WA_URL = `https://wa.me/${PHONE}?text=${encodeURIComponent(DEFAULT_MESSAGE)}`;

/* ---------- SVG icon ---------- */
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 32 32" fill="none" className="w-8 h-8">
      <path
        d="M16.004 2.002C8.28 2.002 2.004 8.278 2.004 15.998c0 2.464.644 4.87 1.868 6.99L2 30l7.188-1.884A13.94 13.94 0 0 0 16.004 30c7.72 0 13.996-6.278 13.996-13.998S23.724 2.002 16.004 2.002Zm0 25.604a11.56 11.56 0 0 1-5.896-1.614l-.422-.252-4.376 1.148 1.168-4.268-.276-.44a11.49 11.49 0 0 1-1.768-6.182c0-6.388 5.2-11.588 11.592-11.588 6.388 0 11.588 5.2 11.588 11.588-.004 6.392-5.2 11.608-11.61 11.608Z"
        fill="#fff"
      />
      <path
        d="M23.338 19.19c-.39-.194-2.306-1.138-2.664-1.268-.36-.13-.622-.196-.884.194-.26.39-1.014 1.268-1.244 1.53-.228.26-.458.292-.848.098-.39-.196-1.646-.608-3.136-1.936-1.158-1.032-1.942-2.31-2.17-2.7-.228-.39-.024-.6.172-.794.176-.176.39-.458.586-.688.194-.228.26-.39.39-.65.13-.26.066-.488-.032-.684-.098-.194-.884-2.132-1.212-2.918-.32-.766-.644-.662-.884-.674-.228-.012-.49-.014-.752-.014s-.684.098-1.044.488c-.358.39-1.37 1.34-1.37 3.27 0 1.928 1.402 3.792 1.598 4.052.194.26 2.76 4.214 6.688 5.91.934.404 1.664.646 2.232.826.938.298 1.792.256 2.468.156.752-.114 2.306-.942 2.632-1.852.326-.912.326-1.692.228-1.854-.098-.164-.358-.262-.748-.456Z"
        fill="#fff"
      />
    </svg>
  );
}

export default function WhatsAppButton() {
  const [tipIndex, setTipIndex] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);

  /* Cycle tooltip tips every 4 s */
  useEffect(() => {
    const id = setInterval(() => setTipIndex((i) => (i + 1) % TIPS.length), 4000);
    return () => clearInterval(id);
  }, []);

  /* Auto-show tooltip after 3 s, then auto-hide after 6 s */
  useEffect(() => {
    const show = setTimeout(() => setShowTooltip(true), 3000);
    const hide = setTimeout(() => {
      setShowTooltip(false);
      setHasInteracted(true);
    }, 9000);
    return () => {
      clearTimeout(show);
      clearTimeout(hide);
    };
  }, []);

  /* Re-show tooltip every 25 s if user hasn't hovered */
  useEffect(() => {
    if (!hasInteracted) return;
    const id = setInterval(() => {
      setShowTooltip(true);
      setTimeout(() => setShowTooltip(false), 5000);
    }, 25000);
    return () => clearInterval(id);
  }, [hasInteracted]);

  return (
    <div
      className="fixed bottom-6 right-6 z-50 flex items-end gap-3"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => {
        setShowTooltip(false);
        setHasInteracted(true);
      }}
    >
      {/* ---- Tooltip bubble ---- */}
      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, x: 20, scale: 0.85 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 20, scale: 0.85 }}
            transition={{ type: "spring", stiffness: 360, damping: 26 }}
            className="wa-tooltip"
          >
            <AnimatePresence mode="wait">
              <motion.span
                key={tipIndex}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="block whitespace-nowrap text-sm font-semibold"
              >
                {TIPS[tipIndex]}
              </motion.span>
            </AnimatePresence>
            {/* small arrow */}
            <div className="wa-tooltip-arrow" />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---- Button ---- */}
      <a
        href={WA_URL}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Contáctanos por WhatsApp"
        className="wa-fab"
      >
        {/* Pulse rings */}
        <span className="wa-pulse-ring wa-pulse-ring--1" />
        <span className="wa-pulse-ring wa-pulse-ring--2" />

        <motion.span
          className="wa-fab-inner"
          whileHover={{ scale: 1.12 }}
          whileTap={{ scale: 0.92 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <WhatsAppIcon />
        </motion.span>
      </a>
    </div>
  );
}

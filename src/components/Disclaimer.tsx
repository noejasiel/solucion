import { disclaimer } from "../data/content.ts";

/**
 * Aviso legal breve antes del footer: primera oración en negritas,
 * resto en texto normal, centrado sobre superficie marfil.
 */
export default function Disclaimer() {
  const splitIndex = disclaimer.indexOf(". ") + 1;
  const lead = disclaimer.slice(0, splitIndex);
  const rest = disclaimer.slice(splitIndex).trim();

  return (
    <section aria-label="Aviso legal" className="bg-ivory py-12 border-t border-navy/10">
      <div className="mx-auto w-full max-w-[1280px] px-5 sm:px-8">
        <p className="mx-auto max-w-4xl text-center text-sm text-muted">
          <strong className="font-semibold text-navy">{lead}</strong> {rest}
        </p>
      </div>
    </section>
  );
}

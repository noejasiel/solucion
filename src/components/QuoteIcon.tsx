export default function QuoteIcon({ kind, className = "" }: { kind: "download" | "document" | "close" | "loading"; className?: string }) {
  const paths = {
    download: <><path d="M12 3v12m-5-5 5 5 5-5" /><path d="M4 15v5a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-5" /></>,
    document: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><path d="M14 2v6h6M8 13h8m-8 4h8" /></>,
    close: <path d="m6 6 12 12M6 18 18 6" />,
    loading: <><path d="M12 3a9 9 0 1 1-9 9" /><path d="M12 7v5l3 2" /></>,
  };
  return <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`}>{paths[kind]}</svg>;
}

export default function SpottingLayout({ children }: { children: React.ReactNode }) {
  // Intentionally bare — the (site) group layout already provides the header/footer.
  // Do NOT add any extra wrapper here or lessons will render inside a double-header.
  return <>{children}</>;
}



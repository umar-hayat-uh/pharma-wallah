"use client";

import { useEffect } from "react";

export default function ScrollToTop() {
  useEffect(() => {
    // Force scroll to top on every page load / refresh
    window.scrollTo(0, 0);
  }, []);

  return null;
}
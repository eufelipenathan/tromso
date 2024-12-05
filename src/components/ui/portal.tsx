"use client";

import { useEffect, useState, useRef } from "react";
import { createPortal } from "react-dom";

interface PortalProps {
  children: React.ReactNode;
  rootId?: string;
}

export function Portal({ children, rootId = "portal-root" }: PortalProps) {
  const [mounted, setMounted] = useState(false);
  const portalRootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    // Criar ou obter o elemento root do portal
    let portalRoot = document.getElementById(rootId);
    if (!portalRoot) {
      portalRoot = document.createElement("div");
      portalRoot.id = rootId;
      document.body.appendChild(portalRoot);
    }

    portalRootRef.current = portalRoot as HTMLDivElement;
    setMounted(true);

    // Cleanup
    return () => {
      if (portalRoot?.childNodes.length === 0) {
        portalRoot.remove();
      }
    };
  }, [rootId]);

  if (!mounted || !portalRootRef.current) return null;

  return createPortal(
    <div className="portal-content" onClick={(e) => e.stopPropagation()}>
      {children}
    </div>,
    portalRootRef.current
  );
}
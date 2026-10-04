import type { ReactNode } from "react";

interface RootProps {
  children: ReactNode;
  onClick?: () => void;
}

function Root({ children, onClick }: RootProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-40 h-40 bg-[#FFF8E1] text-[#4A5546] rounded-4xl shadow-lg flex flex-col items-center justify-center gap-2 cursor-pointer hover:scale-105 transition-transform"
    >
      {children}
    </button>
  );
}

function Texto({ children }: { children: ReactNode }) {
  return (
    <span className="ont-serif italic font-semibold text-sm">{children}</span>
  );
}

export const CardIcone = { Root, Texto };

import type { ReactNode } from "react";

function Root({ children }: { children: ReactNode }) {
  return (
    <div className="w-40 h-40 bg-[#FFF8E1] text-[#4A5546] rounded-4x1 shadow-lg flex flex-col items-center justify-center gap-2">
      {children}
    </div>
  );
}

function Texto({ children }: { children: ReactNode }) {
  return;
  <span className="ont-serif italic font-semibold text-sm">{children}</span>;
}

export const CardIcone = { Root, Texto };

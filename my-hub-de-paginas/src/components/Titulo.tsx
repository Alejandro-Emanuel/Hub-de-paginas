import type { ReactNode } from "react";

export function Titulo({ children }: { children: ReactNode }) {
  return (
    <h1 className="w-full bg-[#FFF8E1] text-[#4A5546] rounded-full py-3 text-center font-serif italic font-bold tracking-[0.3em] shadow-md">
      {children}
    </h1>
  );
}

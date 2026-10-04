import type { ReactNode } from "react";

function Root({children}: {children: ReactNode}) {
  return(
    <aside className="w-40 bg-[#FFF8E1] text-[#4A5546] rounded-[30px] shadow-lg p-4 flex flex-col gap-4">
      {children}
    </aside>
  );
}

function Item({children, onClick}: {children: ReactNode; onClick?: () => void }) {
  return (
    <button 
      type="button"
      onClick={onClick}
      className="flex items-center gap-3 font-serif italic font-bold text-xs cursor-pointer"
    >
      {children}
    </button>
  );
}

export const BarraLateral = {Root, Item}
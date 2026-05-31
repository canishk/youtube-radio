import React from "react";

export default function FormControl({ as = "input", className = "", ...props }) {
  const base =
    "w-full p-2 mt-1 rounded bg-white text-slate-900 border border-slate-300";

  const cls = `${base} ${className}`.trim();

  if (as === "select") {
    return <select className={cls} {...props} />;
  }

  if (as === "textarea") {
    return <textarea className={cls} {...props} />;
  }

  return <input className={cls} {...props} />;
}

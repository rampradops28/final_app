import React from "react";

export const Input = React.forwardRef(function Input(
  { className = "", type = "text", ...props },
  ref
) {
  const base =
    "block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-offset-0 outline-none";
  return <input ref={ref} type={type} className={`${base} ${className}`} {...props} />;
});

import React from "react";

export const Label = React.forwardRef(function Label(
  { className = "", children, htmlFor, ...props },
  ref
) {
  return (
    <label
      ref={ref}
      htmlFor={htmlFor}
      className={`block text-sm font-medium text-gray-700 ${className}`}
      {...props}
    >
      {children}
    </label>
  );
});

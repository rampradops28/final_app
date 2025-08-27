import React from "react";

// Minimal accessible switch built on checkbox
export const Switch = React.forwardRef(function Switch(
  { checked, onCheckedChange, className = "", disabled = false, ...props },
  ref
) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={!!checked}
      aria-disabled={disabled}
      onClick={() => !disabled && onCheckedChange && onCheckedChange(!checked)}
      className={
        `inline-flex h-6 w-11 items-center rounded-full transition-colors ` +
        (checked ? "bg-blue-600" : "bg-gray-300") +
        (disabled ? " opacity-50 cursor-not-allowed" : " cursor-pointer") +
        (className ? ` ${className}` : "")
      }
      ref={ref}
      {...props}
    >
      <span
        className={
          `inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ` +
          (checked ? "translate-x-5" : "translate-x-1")
        }
      />
    </button>
  );
});

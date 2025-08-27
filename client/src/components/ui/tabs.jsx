import React, { createContext, useContext, useMemo, useState } from "react";

const TabsCtx = createContext(null);

export function Tabs({ value, defaultValue, onValueChange, children, className = "" }) {
  const isControlled = value !== undefined;
  const [internal, setInternal] = useState(defaultValue);
  const current = isControlled ? value : internal;

  const setValue = (v) => {
    if (!isControlled) setInternal(v);
    if (onValueChange) onValueChange(v);
  };

  const ctx = useMemo(() => ({ value: current, setValue }), [current]);

  return (
    <TabsCtx.Provider value={ctx}>
      <div className={className}>{children}</div>
    </TabsCtx.Provider>
  );
}

export function TabsList({ className = "", children, ...props }) {
  return (
    <div
      role="tablist"
      className={`inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 text-gray-600 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, className = "", children, ...props }) {
  const ctx = useContext(TabsCtx);
  const active = ctx?.value === value;
  return (
    <button
      type="button"
      role="tab"
      aria-selected={active}
      onClick={() => ctx?.setValue?.(value)}
      className={
        `inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:pointer-events-none disabled:opacity-50 ` +
        (active ? "bg-white text-gray-900 shadow" : "bg-transparent text-gray-600 hover:text-gray-900") +
        (className ? ` ${className}` : "")
      }
      {...props}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, className = "", children, ...props }) {
  const ctx = useContext(TabsCtx);
  const active = ctx?.value === value;
  if (!active) return null;
  return (
    <div
      role="tabpanel"
      className={`mt-2 border border-gray-200 rounded-md p-4 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}

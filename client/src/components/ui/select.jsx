import React, { createContext, useContext } from "react";

// Minimal Select components compatible with common shadcn usage
const SelectCtx = createContext({ value: undefined, onValueChange: undefined, items: [] });

export function Select({ value, onValueChange, children }) {
  // Collect SelectItem children (even if wrapped in Trigger/Content) to populate native select
  const items = [];
  function collectItems(nodes) {
    React.Children.forEach(nodes, (child) => {
      if (!child) return;
      if (child.type === SelectItem) {
        items.push({ value: child.props.value, label: child.props.children });
      } else if (child.props && child.props.children) {
        collectItems(child.props.children);
      }
    });
  }
  collectItems(children);

  return (
    <SelectCtx.Provider value={{ value, onValueChange, items }}>
      {/* Render a native select for functionality */}
      <select
        className="block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
        value={value ?? ""}
        onChange={(e) => onValueChange && onValueChange(e.target.value)}
      >
        {items.map((it) => (
          <option key={it.value} value={it.value}>
            {it.label}
          </option>
        ))}
      </select>
      {/* Keep children in tree for compatibility, but they don't render UI here */}
      <div style={{ display: "none" }}>{children}</div>
    </SelectCtx.Provider>
  );
}

export function SelectTrigger({ className = "", children, ...props }) {
  // Presentational stub; actual control is the native select rendered by Select
  return (
    <div className={"hidden " + className} {...props}>
      {children}
    </div>
  );
}

export function SelectContent({ className = "", children, ...props }) {
  return (
    <div className={"hidden " + className} {...props}>
      {children}
    </div>
  );
}

export function SelectItem({ value, children }) {
  // Descriptor only; real options built by <Select/>
  return null;
}

export function SelectValue({ placeholder }) {
  const ctx = useContext(SelectCtx);
  const items = ctx.items || [];
  const current = items.find((i) => i.value === ctx.value);
  return <span>{current ? current.label : placeholder ?? ""}</span>;
}

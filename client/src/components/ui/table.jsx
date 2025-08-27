import React from "react";

export function Table({ className = "", children, ...props }) {
  return (
    <div className={`w-full overflow-x-auto ${className}`}>
      <table className="w-full caption-bottom text-sm" {...props}>{children}</table>
    </div>
  );
}

export function TableCaption({ className = "", children, ...props }) {
  return (
    <caption className={`mt-4 text-sm text-gray-500 ${className}`} {...props}>
      {children}
    </caption>
  );
}

export function TableHeader({ className = "", children, ...props }) {
  return (
    <thead className={`${className}`} {...props}>{children}</thead>
  );
}

export function TableBody({ className = "", children, ...props }) {
  return (
    <tbody className={`${className}`} {...props}>{children}</tbody>
  );
}

export function TableFooter({ className = "", children, ...props }) {
  return (
    <tfoot className={`bg-gray-50 font-medium ${className}`} {...props}>
      {children}
    </tfoot>
  );
}

export function TableRow({ className = "", children, ...props }) {
  return (
    <tr className={`border-b last:border-0 hover:bg-gray-50 ${className}`} {...props}>
      {children}
    </tr>
  );
}

export function TableHead({ className = "", children, ...props }) {
  return (
    <th
      className={`h-10 px-4 text-left align-middle font-medium text-gray-600 ${className}`}
      {...props}
    >
      {children}
    </th>
  );
}

export function TableCell({ className = "", children, ...props }) {
  return (
    <td className={`p-4 align-middle ${className}`} {...props}>{children}</td>
  );
}

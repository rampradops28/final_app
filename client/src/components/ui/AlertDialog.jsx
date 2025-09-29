import React, { createContext, forwardRef, useContext } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";

const DialogContext = createContext({ open: false, onOpenChange: () => {} });

const AlertDialog = ({ open, onOpenChange, children }) => (
  <DialogContext.Provider value={{ open: !!open, onOpenChange: onOpenChange || (() => {}) }}>
    {children}
  </DialogContext.Provider>
);

const AlertDialogPortal = ({ children }) => {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
};

const AlertDialogOverlay = forwardRef(({ className, ...props }, ref) => {
  const { open } = useContext(DialogContext);
  if (!open) return null;
  return (
    <div
      ref={ref}
      className={cn(
        "fixed inset-0 z-50 bg-black/80",
        className
      )}
      {...props}
    />
  );
});
AlertDialogOverlay.displayName = "AlertDialogOverlay";

const AlertDialogContent = forwardRef(({ className, ...props }, ref) => {
  const { open } = useContext(DialogContext);
  if (!open) return null;
  return (
    <AlertDialogPortal>
      <AlertDialogOverlay />
      <div
        ref={ref}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg sm:rounded-lg",
          className
        )}
        {...props}
      />
    </AlertDialogPortal>
  );
});
AlertDialogContent.displayName = "AlertDialogContent";

const AlertDialogHeader = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col space-y-2 text-center sm:text-left", className)}
    {...props}
  />
);
AlertDialogHeader.displayName = "AlertDialogHeader";

const AlertDialogFooter = ({ className, ...props }) => (
  <div
    className={cn(
      "flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2",
      className
    )}
    {...props}
  />
);
AlertDialogFooter.displayName = "AlertDialogFooter";

const AlertDialogTitle = forwardRef(({ className, ...props }, ref) => (
  <h2
    ref={ref}
    className={cn("text-lg font-semibold", className)}
    {...props}
  />
));
AlertDialogTitle.displayName = "AlertDialogTitle";

const AlertDialogDescription = forwardRef(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
AlertDialogDescription.displayName = "AlertDialogDescription";

const AlertDialogAction = forwardRef(({ className, onClick, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(buttonVariants(), className)}
    onClick={onClick}
    {...props}
  />
));
AlertDialogAction.displayName = "AlertDialogAction";

const AlertDialogCancel = forwardRef(({ className, onClick, ...props }, ref) => {
  const { onOpenChange } = useContext(DialogContext);
  return (
    <button
      ref={ref}
      className={cn(buttonVariants({ variant: "outline" }), "mt-2 sm:mt-0", className)}
      onClick={(e) => {
        onOpenChange?.(false);
        onClick?.(e);
      }}
      {...props}
    />
  );
});
AlertDialogCancel.displayName = "AlertDialogCancel";

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};

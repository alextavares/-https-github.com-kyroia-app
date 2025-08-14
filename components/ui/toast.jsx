"use client";
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import * as ToastPrimitives from "@radix-ui/react-toast";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
const ToastProvider = ToastPrimitives.Provider;
const ToastViewport = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ToastPrimitives.Viewport ref={ref} className={cn("fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]", className)} {...props}/>);
});
ToastViewport.displayName = ToastPrimitives.Viewport.displayName;
const toastVariants = cva("group pointer-events-auto relative flex w-full items-center justify-between space-x-2 overflow-hidden rounded-md border p-4 pr-6 shadow-lg transition-all data-[swipe=cancel]:translate-x-0 data-[swipe=end]:translate-x-[var(--radix-toast-swipe-end-x)] data-[swipe=move]:translate-x-[var(--radix-toast-swipe-move-x)] data-[swipe=move]:transition-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[swipe=end]:animate-out data-[state=closed]:fade-out-80 data-[state=closed]:slide-out-to-right-full data-[state=open]:slide-in-from-top-full data-[state=open]:sm:slide-in-from-bottom-full", {
    variants: {
        variant: {
            default: "border bg-background text-foreground",
            destructive: "destructive group border-destructive bg-destructive text-destructive-foreground",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
const Toast = React.forwardRef((_a, ref) => {
    var { className, variant } = _a, props = __rest(_a, ["className", "variant"]);
    return (<ToastPrimitives.Root ref={ref} className={cn(toastVariants({ variant }), className)} {...props}/>);
});
Toast.displayName = ToastPrimitives.Root.displayName;
const ToastAction = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ToastPrimitives.Action ref={ref} className={cn("inline-flex h-8 shrink-0 items-center justify-center rounded-md border bg-transparent px-3 text-sm font-medium transition-colors hover:bg-secondary focus:outline-none focus:ring-1 focus:ring-ring disabled:pointer-events-none disabled:opacity-50 group-[.destructive]:border-muted/40 group-[.destructive]:hover:border-destructive/30 group-[.destructive]:hover:bg-destructive group-[.destructive]:hover:text-destructive-foreground group-[.destructive]:focus:ring-destructive", className)} {...props}/>);
});
ToastAction.displayName = ToastPrimitives.Action.displayName;
const ToastClose = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ToastPrimitives.Close ref={ref} className={cn("absolute right-1 top-1 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-1 group-hover:opacity-100 group-[.destructive]:text-red-300 group-[.destructive]:hover:text-red-50 group-[.destructive]:focus:ring-red-400 group-[.destructive]:focus:ring-offset-red-600", className)} toast-close="" {...props}>
    <Cross2Icon className="h-4 w-4"/>
  </ToastPrimitives.Close>);
});
ToastClose.displayName = ToastPrimitives.Close.displayName;
const ToastTitle = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ToastPrimitives.Title ref={ref} className={cn("text-sm font-semibold [&+div]:text-xs", className)} {...props}/>);
});
ToastTitle.displayName = ToastPrimitives.Title.displayName;
const ToastDescription = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ToastPrimitives.Description ref={ref} className={cn("text-sm opacity-90", className)} {...props}/>);
});
ToastDescription.displayName = ToastPrimitives.Description.displayName;
export { ToastProvider, ToastViewport, Toast, ToastTitle, ToastDescription, ToastClose, ToastAction, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3QuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidG9hc3QudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7Ozs7Ozs7Ozs7O0FBRVosT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLGVBQWUsTUFBTSx1QkFBdUIsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsR0FBRyxFQUFxQixNQUFNLDBCQUEwQixDQUFBO0FBQ2pFLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDaEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRWxELE1BQU0sYUFBYSxHQUFHLGVBQWUsQ0FBQyxRQUFRLENBQUE7QUFFOUMsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHcEMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQ3ZCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCxtSUFBbUksRUFDbkksU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLGFBQWEsQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUE7QUFFaEUsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUN2QiwybEJBQTJsQixFQUMzbEI7SUFDRSxRQUFRLEVBQUU7UUFDUixPQUFPLEVBQUU7WUFDUCxPQUFPLEVBQUUsc0NBQXNDO1lBQy9DLFdBQVcsRUFDVCxpRkFBaUY7U0FDcEY7S0FDRjtJQUNELGVBQWUsRUFBRTtRQUNmLE9BQU8sRUFBRSxTQUFTO0tBQ25CO0NBQ0YsQ0FDRixD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
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
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
const Dialog = DialogPrimitive.Root;
const DialogTrigger = DialogPrimitive.Trigger;
const DialogPortal = DialogPrimitive.Portal;
const DialogClose = DialogPrimitive.Close;
const DialogOverlay = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<DialogPrimitive.Overlay ref={ref} className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props}/>);
});
DialogOverlay.displayName = DialogPrimitive.Overlay.displayName;
const DialogContent = React.forwardRef((_a, ref) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<DialogPortal>
    <DialogOverlay />
    <DialogPrimitive.Content ref={ref} className={cn("fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-lg", className)} {...props}>
      {children}
      <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
        <Cross2Icon className="h-4 w-4"/>
        <span className="sr-only">Close</span>
      </DialogPrimitive.Close>
    </DialogPrimitive.Content>
  </DialogPortal>);
});
DialogContent.displayName = DialogPrimitive.Content.displayName;
const DialogHeader = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)} {...props}/>);
};
DialogHeader.displayName = "DialogHeader";
const DialogFooter = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props}/>);
};
DialogFooter.displayName = "DialogFooter";
const DialogTitle = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<DialogPrimitive.Title ref={ref} className={cn("text-lg font-semibold leading-none tracking-tight", className)} {...props}/>);
});
DialogTitle.displayName = DialogPrimitive.Title.displayName;
const DialogDescription = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<DialogPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}/>);
});
DialogDescription.displayName = DialogPrimitive.Description.displayName;
export { Dialog, DialogPortal, DialogOverlay, DialogTrigger, DialogClose, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZGlhbG9nLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImRpYWxvZy50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7Ozs7Ozs7Ozs7QUFFWixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEtBQUssZUFBZSxNQUFNLHdCQUF3QixDQUFBO0FBQ3pELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDaEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRWxELE1BQU0sTUFBTSxHQUFHLGVBQWUsQ0FBQyxJQUFJLENBQUE7QUFFbkMsTUFBTSxhQUFhLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQTtBQUU3QyxNQUFNLFlBQVksR0FBRyxlQUFlLENBQUMsTUFBTSxDQUFBO0FBRTNDLE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUE7QUFFekMsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHcEMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLGVBQWUsQ0FBQyxPQUFPLENBQ3RCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCx5SkFBeUosRUFDekosU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLGFBQWEsQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUE7QUFFL0QsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHcEMsQ0FBQyxFQUFpQyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQTFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsT0FBWSxF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
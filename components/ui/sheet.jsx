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
import * as SheetPrimitive from "@radix-ui/react-dialog";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Cross2Icon } from "@radix-ui/react-icons";
const Sheet = SheetPrimitive.Root;
const SheetTrigger = SheetPrimitive.Trigger;
const SheetClose = SheetPrimitive.Close;
const SheetPortal = SheetPrimitive.Portal;
const SheetOverlay = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SheetPrimitive.Overlay className={cn("fixed inset-0 z-50 bg-black/80  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0", className)} {...props} ref={ref}/>);
});
SheetOverlay.displayName = SheetPrimitive.Overlay.displayName;
const sheetVariants = cva("fixed z-50 gap-4 bg-background p-6 shadow-lg transition ease-in-out data-[state=closed]:duration-300 data-[state=open]:duration-500 data-[state=open]:animate-in data-[state=closed]:animate-out", {
    variants: {
        side: {
            top: "inset-x-0 top-0 border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top",
            bottom: "inset-x-0 bottom-0 border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom",
            left: "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm",
            right: "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm",
        },
    },
    defaultVariants: {
        side: "right",
    },
});
const SheetContent = React.forwardRef((_a, ref) => {
    var { side = "right", className, children } = _a, props = __rest(_a, ["side", "className", "children"]);
    return (<SheetPortal>
    <SheetOverlay />
    <SheetPrimitive.Content ref={ref} className={cn(sheetVariants({ side }), className)} {...props}>
      <SheetPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
        <Cross2Icon className="h-4 w-4"/>
        <span className="sr-only">Close</span>
      </SheetPrimitive.Close>
      {children}
    </SheetPrimitive.Content>
  </SheetPortal>);
});
SheetContent.displayName = SheetPrimitive.Content.displayName;
const SheetHeader = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props}/>);
};
SheetHeader.displayName = "SheetHeader";
const SheetFooter = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)} {...props}/>);
};
SheetFooter.displayName = "SheetFooter";
const SheetTitle = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SheetPrimitive.Title ref={ref} className={cn("text-lg font-semibold text-foreground", className)} {...props}/>);
});
SheetTitle.displayName = SheetPrimitive.Title.displayName;
const SheetDescription = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SheetPrimitive.Description ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}/>);
});
SheetDescription.displayName = SheetPrimitive.Description.displayName;
export { Sheet, SheetPortal, SheetOverlay, SheetTrigger, SheetClose, SheetContent, SheetHeader, SheetFooter, SheetTitle, SheetDescription, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hlZXQuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2hlZXQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7Ozs7Ozs7Ozs7O0FBRVosT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLGNBQWMsTUFBTSx3QkFBd0IsQ0FBQTtBQUN4RCxPQUFPLEVBQUUsR0FBRyxFQUFxQixNQUFNLDBCQUEwQixDQUFBO0FBQ2pFLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDaEMsT0FBTyxFQUFFLFVBQVUsRUFBRSxNQUFNLHVCQUF1QixDQUFBO0FBRWxELE1BQU0sS0FBSyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUE7QUFFakMsTUFBTSxZQUFZLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQTtBQUUzQyxNQUFNLFVBQVUsR0FBRyxjQUFjLENBQUMsS0FBSyxDQUFBO0FBRXZDLE1BQU0sV0FBVyxHQUFHLGNBQWMsQ0FBQyxNQUFNLENBQUE7QUFFekMsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHbkMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQ3JCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCx5SkFBeUosRUFDekosU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxDQUNWLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxFQUNULENBQ0gsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLFlBQVksQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUE7QUFFN0QsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUN2QixrTUFBa00sRUFDbE07SUFDRSxRQUFRLEVBQUU7UUFD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
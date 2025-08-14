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
import * as PopoverPrimitive from "@radix-ui/react-popover";
import { cn } from "@/lib/utils";
const Popover = PopoverPrimitive.Root;
const PopoverTrigger = PopoverPrimitive.Trigger;
const PopoverAnchor = PopoverPrimitive.Anchor;
const PopoverContent = React.forwardRef((_a, ref) => {
    var { className, align = "center", sideOffset = 4 } = _a, props = __rest(_a, ["className", "align", "sideOffset"]);
    return (<PopoverPrimitive.Portal>
    <PopoverPrimitive.Content ref={ref} align={align} sideOffset={sideOffset} className={cn("z-50 w-72 rounded-md border bg-popover p-4 text-popover-foreground shadow-md outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-popover-content-transform-origin]", className)} {...props}/>
  </PopoverPrimitive.Portal>);
});
PopoverContent.displayName = PopoverPrimitive.Content.displayName;
export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicG9wb3Zlci5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJwb3BvdmVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7Ozs7Ozs7Ozs7OztBQUVaLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sS0FBSyxnQkFBZ0IsTUFBTSx5QkFBeUIsQ0FBQTtBQUUzRCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBRWhDLE1BQU0sT0FBTyxHQUFHLGdCQUFnQixDQUFDLElBQUksQ0FBQTtBQUVyQyxNQUFNLGNBQWMsR0FBRyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUE7QUFFL0MsTUFBTSxhQUFhLEdBQUcsZ0JBQWdCLENBQUMsTUFBTSxDQUFBO0FBRTdDLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR3JDLENBQUMsRUFBeUQsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFsRSxFQUFFLFNBQVMsRUFBRSxLQUFLLEdBQUcsUUFBUSxFQUFFLFVBQVUsR0FBRyxDQUFDLE9BQVksRUFBUCxLQUFLLGNBQXZELG9DQUF5RCxDQUFGO0lBQVksT0FBQSxDQUNwRSxDQUFDLGdCQUFnQixDQUFDLE1BQU0sQ0FDdEI7SUFBQSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FDdkIsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsS0FBSyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQ2IsVUFBVSxDQUFDLENBQUMsVUFBVSxDQUFDLENBQ3ZCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCw4ZEFBOGQsRUFDOWQsU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUVkO0VBQUEsRUFBRSxnQkFBZ0IsQ0FBQyxNQUFNLENBQUMsQ0FDM0IsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLGNBQWMsQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFDLFdBQVcsQ0FBQTtBQUVqRSxPQUFPLEVBQUUsT0FBTyxFQUFFLGNBQWMsRUFBRSxjQUFjLEVBQUUsYUFBYSxFQUFFLENBQUEifQ==
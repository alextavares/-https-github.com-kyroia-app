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
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { cn } from "@/lib/utils";
const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;
const TooltipContent = React.forwardRef((_a, ref) => {
    var { className, sideOffset = 4 } = _a, props = __rest(_a, ["className", "sideOffset"]);
    return (<TooltipPrimitive.Portal>
    <TooltipPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 overflow-hidden rounded-md bg-primary px-3 py-1.5 text-xs text-primary-foreground animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-tooltip-content-transform-origin]", className)} {...props}/>
  </TooltipPrimitive.Portal>);
});
TooltipContent.displayName = TooltipPrimitive.Content.displayName;
export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9vbHRpcC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0b29sdGlwLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7Ozs7Ozs7Ozs7OztBQUVaLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sS0FBSyxnQkFBZ0IsTUFBTSx5QkFBeUIsQ0FBQTtBQUUzRCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBRWhDLE1BQU0sZUFBZSxHQUFHLGdCQUFnQixDQUFDLFFBQVEsQ0FBQTtBQUVqRCxNQUFNLE9BQU8sR0FBRyxnQkFBZ0IsQ0FBQyxJQUFJLENBQUE7QUFFckMsTUFBTSxjQUFjLEdBQUcsZ0JBQWdCLENBQUMsT0FBTyxDQUFBO0FBRS9DLE1BQU0sY0FBYyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR3JDLENBQUMsRUFBdUMsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoRCxFQUFFLFNBQVMsRUFBRSxVQUFVLEdBQUcsQ0FBQyxPQUFZLEVBQVAsS0FBSyxjQUFyQywyQkFBdUMsQ0FBRjtJQUFZLE9BQUEsQ0FDbEQsQ0FBQyxnQkFBZ0IsQ0FBQyxNQUFNLENBQ3RCO0lBQUEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQ3ZCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFVBQVUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUN2QixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gscWFBQXFhLEVBQ3JhLFNBQVMsQ0FDVixDQUFDLENBQ0YsSUFBSSxLQUFLLENBQUMsRUFFZDtFQUFBLEVBQUUsZ0JBQWdCLENBQUMsTUFBTSxDQUFDLENBQzNCLENBQUE7Q0FBQSxDQUFDLENBQUE7QUFDRixjQUFjLENBQUMsV0FBVyxHQUFHLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxXQUFXLENBQUE7QUFFakUsT0FBTyxFQUFFLE9BQU8sRUFBRSxjQUFjLEVBQUUsY0FBYyxFQUFFLGVBQWUsRUFBRSxDQUFBIn0=
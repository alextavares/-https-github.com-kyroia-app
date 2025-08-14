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
import * as ScrollAreaPrimitive from "@radix-ui/react-scroll-area";
import { cn } from "@/lib/utils";
const ScrollArea = React.forwardRef((_a, ref) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<ScrollAreaPrimitive.Root ref={ref} className={cn("relative overflow-hidden", className)} {...props}>
    <ScrollAreaPrimitive.Viewport className="h-full w-full rounded-[inherit]">
      {children}
    </ScrollAreaPrimitive.Viewport>
    <ScrollBar />
    <ScrollAreaPrimitive.Corner />
  </ScrollAreaPrimitive.Root>);
});
ScrollArea.displayName = ScrollAreaPrimitive.Root.displayName;
const ScrollBar = React.forwardRef((_a, ref) => {
    var { className, orientation = "vertical" } = _a, props = __rest(_a, ["className", "orientation"]);
    return (<ScrollAreaPrimitive.ScrollAreaScrollbar ref={ref} orientation={orientation} className={cn("flex touch-none select-none transition-colors", orientation === "vertical" &&
            "h-full w-2.5 border-l border-l-transparent p-[1px]", orientation === "horizontal" &&
            "h-2.5 flex-col border-t border-t-transparent p-[1px]", className)} {...props}>
    <ScrollAreaPrimitive.ScrollAreaThumb className="relative flex-1 rounded-full bg-border"/>
  </ScrollAreaPrimitive.ScrollAreaScrollbar>);
});
ScrollBar.displayName = ScrollAreaPrimitive.ScrollAreaScrollbar.displayName;
export { ScrollArea, ScrollBar };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2Nyb2xsLWFyZWEuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsic2Nyb2xsLWFyZWEudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7Ozs7Ozs7Ozs7O0FBRVosT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLG1CQUFtQixNQUFNLDZCQUE2QixDQUFBO0FBRWxFLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFFaEMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHakMsQ0FBQyxFQUFpQyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQTFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsT0FBWSxFQUFQLEtBQUssY0FBL0IseUJBQWlDLENBQUY7SUFBWSxPQUFBLENBQzVDLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUN2QixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsMEJBQTBCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDckQsSUFBSSxLQUFLLENBQUMsQ0FFVjtJQUFBLENBQUMsbUJBQW1CLENBQUMsUUFBUSxDQUFDLFNBQVMsQ0FBQyxpQ0FBaUMsQ0FDdkU7TUFBQSxDQUFDLFFBQVEsQ0FDWDtJQUFBLEVBQUUsbUJBQW1CLENBQUMsUUFBUSxDQUM5QjtJQUFBLENBQUMsU0FBUyxDQUFDLEFBQUQsRUFDVjtJQUFBLENBQUMsbUJBQW1CLENBQUMsTUFBTSxDQUFDLEFBQUQsRUFDN0I7RUFBQSxFQUFFLG1CQUFtQixDQUFDLElBQUksQ0FBQyxDQUM1QixDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsVUFBVSxDQUFDLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFBO0FBRTdELE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR2hDLENBQUMsRUFBaUQsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUExRCxFQUFFLFNBQVMsRUFBRSxXQUFXLEdBQUcsVUFBVSxPQUFZLEVBQVAsS0FBSyxjQUEvQyw0QkFBaUQsQ0FBRjtJQUFZLE9BQUEsQ0FDNUQsQ0FBQyxtQkFBbUIsQ0FBQyxtQkFBbUIsQ0FDdEMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsV0FBVyxDQUFDLENBQUMsV0FBVyxDQUFDLENBQ3pCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCwrQ0FBK0MsRUFDL0MsV0FBVyxLQUFLLFVBQVU7WUFDeEIsb0RBQW9ELEVBQ3RELFdBQVcsS0FBSyxZQUFZO1lBQzFCLHNEQUFzRCxFQUN4RCxTQUFTLENBQ1YsQ0FBQyxDQUNGLElBQUksS0FBSyxDQUFDLENBRVY7SUFBQSxDQUFDLG1CQUFtQixDQUFDLGVBQWUsQ0FBQyxTQUFTLENBQUMsd0NBQXdDLEVBQ3pGO0VBQUEsRUFBRSxtQkFBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxDQUMzQyxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsU0FBUyxDQUFDLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQyxtQkFBbUIsQ0FBQyxXQUFXLENBQUE7QUFFM0UsT0FBTyxFQUFFLFVBQVUsRUFBRSxTQUFTLEVBQUUsQ0FBQSJ9
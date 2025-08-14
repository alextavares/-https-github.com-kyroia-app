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
import * as SeparatorPrimitive from "@radix-ui/react-separator";
import { cn } from "@/lib/utils";
const Separator = React.forwardRef((_a, ref) => {
    var { className, orientation = "horizontal", decorative = true } = _a, props = __rest(_a, ["className", "orientation", "decorative"]);
    return (<SeparatorPrimitive.Root ref={ref} decorative={decorative} orientation={orientation} className={cn("shrink-0 bg-border", orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]", className)} {...props}/>);
});
Separator.displayName = SeparatorPrimitive.Root.displayName;
export { Separator };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VwYXJhdG9yLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlcGFyYXRvci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7Ozs7Ozs7Ozs7QUFFWixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEtBQUssa0JBQWtCLE1BQU0sMkJBQTJCLENBQUE7QUFFL0QsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUVoQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUloQyxDQUNFLEVBQXNFLEVBQ3RFLEdBQUcsRUFDSCxFQUFFO1FBRkYsRUFBRSxTQUFTLEVBQUUsV0FBVyxHQUFHLFlBQVksRUFBRSxVQUFVLEdBQUcsSUFBSSxPQUFZLEVBQVAsS0FBSyxjQUFwRSwwQ0FBc0UsQ0FBRjtJQUVqRSxPQUFBLENBQ0gsQ0FBQyxrQkFBa0IsQ0FBQyxJQUFJLENBQ3RCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFVBQVUsQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUN2QixXQUFXLENBQUMsQ0FBQyxXQUFXLENBQUMsQ0FDekIsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUNYLG9CQUFvQixFQUNwQixXQUFXLEtBQUssWUFBWSxDQUFDLENBQUMsQ0FBQyxnQkFBZ0IsQ0FBQyxDQUFDLENBQUMsZ0JBQWdCLEVBQ2xFLFNBQVMsQ0FDVixDQUFDLENBQ0YsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7Q0FBQSxDQUNGLENBQUE7QUFDRCxTQUFTLENBQUMsV0FBVyxHQUFHLGtCQUFrQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUE7QUFFM0QsT0FBTyxFQUFFLFNBQVMsRUFBRSxDQUFBIn0=
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
import * as LabelPrimitive from "@radix-ui/react-label";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const labelVariants = cva("text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70");
const Label = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<LabelPrimitive.Root ref={ref} className={cn(labelVariants(), className)} {...props}/>);
});
Label.displayName = LabelPrimitive.Root.displayName;
export { Label };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibGFiZWwuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsibGFiZWwudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7Ozs7Ozs7Ozs7O0FBRVosT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLGNBQWMsTUFBTSx1QkFBdUIsQ0FBQTtBQUN2RCxPQUFPLEVBQUUsR0FBRyxFQUFxQixNQUFNLDBCQUEwQixDQUFBO0FBRWpFLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFFaEMsTUFBTSxhQUFhLEdBQUcsR0FBRyxDQUN2Qiw0RkFBNEYsQ0FDN0YsQ0FBQTtBQUVELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBSTVCLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUFZLE9BQUEsQ0FDbEMsQ0FBQyxjQUFjLENBQUMsSUFBSSxDQUNsQixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsYUFBYSxFQUFFLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDMUMsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7Q0FBQSxDQUFDLENBQUE7QUFDRixLQUFLLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQyxJQUFJLENBQUMsV0FBVyxDQUFBO0FBRW5ELE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQSJ9
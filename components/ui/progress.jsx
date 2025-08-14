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
import * as ProgressPrimitive from "@radix-ui/react-progress";
import { cn } from "@/lib/utils";
const Progress = React.forwardRef((_a, ref) => {
    var { className, value } = _a, props = __rest(_a, ["className", "value"]);
    return (<ProgressPrimitive.Root ref={ref} className={cn("relative h-2 w-full overflow-hidden rounded-full bg-primary/20", className)} {...props}>
    <ProgressPrimitive.Indicator className="h-full w-full flex-1 bg-primary transition-all" style={{ transform: `translateX(-${100 - (value || 0)}%)` }}/>
  </ProgressPrimitive.Root>);
});
Progress.displayName = ProgressPrimitive.Root.displayName;
export { Progress };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHJvZ3Jlc3MuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicHJvZ3Jlc3MudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7Ozs7Ozs7Ozs7O0FBRVosT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLGlCQUFpQixNQUFNLDBCQUEwQixDQUFBO0FBRTdELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFFaEMsTUFBTSxRQUFRLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHL0IsQ0FBQyxFQUE4QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQXZDLEVBQUUsU0FBUyxFQUFFLEtBQUssT0FBWSxFQUFQLEtBQUssY0FBNUIsc0JBQThCLENBQUY7SUFBWSxPQUFBLENBQ3pDLENBQUMsaUJBQWlCLENBQUMsSUFBSSxDQUNyQixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsZ0VBQWdFLEVBQ2hFLFNBQVMsQ0FDVixDQUFDLENBQ0YsSUFBSSxLQUFLLENBQUMsQ0FFVjtJQUFBLENBQUMsaUJBQWlCLENBQUMsU0FBUyxDQUMxQixTQUFTLENBQUMsZ0RBQWdELENBQzFELEtBQUssQ0FBQyxDQUFDLEVBQUUsU0FBUyxFQUFFLGVBQWUsR0FBRyxHQUFHLENBQUMsS0FBSyxJQUFJLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxFQUVoRTtFQUFBLEVBQUUsaUJBQWlCLENBQUMsSUFBSSxDQUFDLENBQzFCLENBQUE7Q0FBQSxDQUFDLENBQUE7QUFDRixRQUFRLENBQUMsV0FBVyxHQUFHLGlCQUFpQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUE7QUFFekQsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFBIn0=
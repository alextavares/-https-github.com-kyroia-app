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
import * as AvatarPrimitive from "@radix-ui/react-avatar";
import { cn } from "@/lib/utils";
const Avatar = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Root ref={ref} className={cn("relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full", className)} {...props}/>);
});
Avatar.displayName = AvatarPrimitive.Root.displayName;
const AvatarImage = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Image ref={ref} className={cn("aspect-square h-full w-full", className)} {...props}/>);
});
AvatarImage.displayName = AvatarPrimitive.Image.displayName;
const AvatarFallback = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<AvatarPrimitive.Fallback ref={ref} className={cn("flex h-full w-full items-center justify-center rounded-full bg-muted", className)} {...props}/>);
});
AvatarFallback.displayName = AvatarPrimitive.Fallback.displayName;
export { Avatar, AvatarImage, AvatarFallback };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYXZhdGFyLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImF2YXRhci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7Ozs7Ozs7Ozs7QUFFWixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEtBQUssZUFBZSxNQUFNLHdCQUF3QixDQUFBO0FBRXpELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFFaEMsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHN0IsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLGVBQWUsQ0FBQyxJQUFJLENBQ25CLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCwrREFBK0QsRUFDL0QsU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLE1BQU0sQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUE7QUFFckQsTUFBTSxXQUFXLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHbEMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLGVBQWUsQ0FBQyxLQUFLLENBQ3BCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyw2QkFBNkIsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUN4RCxJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLFdBQVcsQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDLEtBQUssQ0FBQyxXQUFXLENBQUE7QUFFM0QsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHckMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLGVBQWUsQ0FBQyxRQUFRLENBQ3ZCLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCxzRUFBc0UsRUFDdEUsU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLGNBQWMsQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUE7QUFFakUsT0FBTyxFQUFFLE1BQU0sRUFBRSxXQUFXLEVBQUUsY0FBYyxFQUFFLENBQUEifQ==
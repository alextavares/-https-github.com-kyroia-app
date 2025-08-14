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
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", {
    variants: {
        variant: {
            default: "bg-primary text-primary-foreground shadow hover:bg-primary/90",
            destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
            outline: "border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground",
            secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary/80",
            ghost: "hover:bg-accent hover:text-accent-foreground",
            link: "text-primary underline-offset-4 hover:underline",
        },
        size: {
            default: "h-9 px-4 py-2",
            sm: "h-8 rounded-md px-3 text-xs",
            lg: "h-10 rounded-md px-8",
            icon: "h-9 w-9",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const Button = React.forwardRef((_a, ref) => {
    var { className, variant, size, asChild = false } = _a, props = __rest(_a, ["className", "variant", "size", "asChild"]);
    const Comp = asChild ? Slot : "button";
    return (<Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props}/>);
});
Button.displayName = "Button";
export { Button, buttonVariants };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYnV0dG9uLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImJ1dHRvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7Ozs7QUFBQSxPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEVBQUUsSUFBSSxFQUFFLE1BQU0sc0JBQXNCLENBQUE7QUFDM0MsT0FBTyxFQUFFLEdBQUcsRUFBcUIsTUFBTSwwQkFBMEIsQ0FBQTtBQUVqRSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBRWhDLE1BQU0sY0FBYyxHQUFHLEdBQUcsQ0FDeEIsdVNBQXVTLEVBQ3ZTO0lBQ0UsUUFBUSxFQUFFO1FBQ1IsT0FBTyxFQUFFO1lBQ1AsT0FBTyxFQUNMLCtEQUErRDtZQUNqRSxXQUFXLEVBQ1QsOEVBQThFO1lBQ2hGLE9BQU8sRUFDTCwwRkFBMEY7WUFDNUYsU0FBUyxFQUNQLHdFQUF3RTtZQUMxRSxLQUFLLEVBQUUsOENBQThDO1lBQ3JELElBQUksRUFBRSxpREFBaUQ7U0FDeEQ7UUFDRCxJQUFJLEVBQUU7WUFDSixPQUFPLEVBQUUsZUFBZTtZQUN4QixFQUFFLEVBQUUsNkJBQTZCO1lBQ2pDLEVBQUUsRUFBRSxzQkFBc0I7WUFDMUIsSUFBSSxFQUFFLFNBQVM7U0FDaEI7S0FDRjtJQUNELGVBQWUsRUFBRTtRQUNmLE9BQU8sRUFBRSxTQUFTO1FBQ2xCLElBQUksRUFBRSxTQUFTO0tBQ2hCO0NBQ0YsQ0FDRixDQUFBO0FBUUQsTUFBTSxNQUFNLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FDN0IsQ0FBQyxFQUF1RCxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhFLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsT0FBTyxHQUFHLEtBQUssT0FBWSxFQUFQLEtBQUssY0FBckQsMkNBQXVELENBQUY7SUFDcEQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtJQUN0QyxPQUFPLENBQ0wsQ0FBQyxJQUFJLENBQ0gsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLE9BQU8sRUFBRSxJQUFJLEVBQUUsU0FBUyxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQzVELEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUNGLENBQUE7QUFDRCxNQUFNLENBQUMsV0FBVyxHQUFHLFFBQVEsQ0FBQTtBQUU3QixPQUFPLEVBQUUsTUFBTSxFQUFFLGNBQWMsRUFBRSxDQUFBIn0=
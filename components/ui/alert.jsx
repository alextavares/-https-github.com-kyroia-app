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
import { cva } from "class-variance-authority";
import { cn } from "@/lib/utils";
const alertVariants = cva("relative w-full rounded-lg border px-4 py-3 text-sm [&>svg+div]:translate-y-[-3px] [&>svg]:absolute [&>svg]:left-4 [&>svg]:top-4 [&>svg]:text-foreground [&>svg~*]:pl-7", {
    variants: {
        variant: {
            default: "bg-background text-foreground",
            destructive: "border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive",
        },
    },
    defaultVariants: {
        variant: "default",
    },
});
const Alert = React.forwardRef((_a, ref) => {
    var { className, variant } = _a, props = __rest(_a, ["className", "variant"]);
    return (<div ref={ref} role="alert" className={cn(alertVariants({ variant }), className)} {...props}/>);
});
Alert.displayName = "Alert";
const AlertTitle = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<h5 ref={ref} className={cn("mb-1 font-medium leading-none tracking-tight", className)} {...props}/>);
});
AlertTitle.displayName = "AlertTitle";
const AlertDescription = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("text-sm [&_p]:leading-relaxed", className)} {...props}/>);
});
AlertDescription.displayName = "AlertDescription";
export { Alert, AlertTitle, AlertDescription };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWxlcnQuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiYWxlcnQudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxFQUFFLEdBQUcsRUFBcUIsTUFBTSwwQkFBMEIsQ0FBQTtBQUVqRSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBRWhDLE1BQU0sYUFBYSxHQUFHLEdBQUcsQ0FDdkIseUtBQXlLLEVBQ3pLO0lBQ0UsUUFBUSxFQUFFO1FBQ1IsT0FBTyxFQUFFO1lBQ1AsT0FBTyxFQUFFLCtCQUErQjtZQUN4QyxXQUFXLEVBQ1QseUZBQXlGO1NBQzVGO0tBQ0Y7SUFDRCxlQUFlLEVBQUU7UUFDZixPQUFPLEVBQUUsU0FBUztLQUNuQjtDQUNGLENBQ0YsQ0FBQTtBQUVELE1BQU0sS0FBSyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBRzVCLENBQUMsRUFBZ0MsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUF6QyxFQUFFLFNBQVMsRUFBRSxPQUFPLE9BQVksRUFBUCxLQUFLLGNBQTlCLHdCQUFnQyxDQUFGO0lBQVksT0FBQSxDQUMzQyxDQUFDLEdBQUcsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxJQUFJLENBQUMsT0FBTyxDQUNaLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQ3JELElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsS0FBSyxDQUFDLFdBQVcsR0FBRyxPQUFPLENBQUE7QUFFM0IsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHakMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLEVBQUUsQ0FDRCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsOENBQThDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDekUsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7Q0FBQSxDQUFDLENBQUE7QUFDRixVQUFVLENBQUMsV0FBVyxHQUFHLFlBQVksQ0FBQTtBQUVyQyxNQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxVQUFVLENBR3ZDLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUFZLE9BQUEsQ0FDbEMsQ0FBQyxHQUFHLENBQ0YsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLCtCQUErQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQzFELElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsZ0JBQWdCLENBQUMsV0FBVyxHQUFHLGtCQUFrQixDQUFBO0FBRWpELE9BQU8sRUFBRSxLQUFLLEVBQUUsVUFBVSxFQUFFLGdCQUFnQixFQUFFLENBQUEifQ==
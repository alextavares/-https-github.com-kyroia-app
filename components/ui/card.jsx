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
import { cn } from "@/lib/utils";
const Card = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("rounded-xl border bg-card text-card-foreground shadow", className)} {...props}/>);
});
Card.displayName = "Card";
const CardHeader = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props}/>);
});
CardHeader.displayName = "CardHeader";
const CardTitle = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props}/>);
});
CardTitle.displayName = "CardTitle";
const CardDescription = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("text-sm text-muted-foreground", className)} {...props}/>);
});
CardDescription.displayName = "CardDescription";
const CardContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("p-6 pt-0", className)} {...props}/>);
});
CardContent.displayName = "CardContent";
const CardFooter = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} className={cn("flex items-center p-6 pt-0", className)} {...props}/>);
});
CardFooter.displayName = "CardFooter";
export { Card, CardHeader, CardFooter, CardTitle, CardDescription, CardContent };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY2FyZC5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJjYXJkLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7Ozs7OztBQUFBLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBRTlCLE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFFaEMsTUFBTSxJQUFJLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHM0IsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLEdBQUcsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsdURBQXVELEVBQ3ZELFNBQVMsQ0FDVixDQUFDLENBQ0YsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7Q0FBQSxDQUFDLENBQUE7QUFDRixJQUFJLENBQUMsV0FBVyxHQUFHLE1BQU0sQ0FBQTtBQUV6QixNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUdqQyxDQUFDLEVBQXVCLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBaEMsRUFBRSxTQUFTLE9BQVksRUFBUCxLQUFLLGNBQXJCLGFBQXVCLENBQUY7SUFBWSxPQUFBLENBQ2xDLENBQUMsR0FBRyxDQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FBQywrQkFBK0IsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUMxRCxJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLFVBQVUsQ0FBQyxXQUFXLEdBQUcsWUFBWSxDQUFBO0FBRXJDLE1BQU0sU0FBUyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR2hDLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUFZLE9BQUEsQ0FDbEMsQ0FBQyxHQUFHLENBQ0YsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLDJDQUEyQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQ3RFLElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsU0FBUyxDQUFDLFdBQVcsR0FBRyxXQUFXLENBQUE7QUFFbkMsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHdEMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLEdBQUcsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsK0JBQStCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDMUQsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7Q0FBQSxDQUFDLENBQUE7QUFDRixlQUFlLENBQUMsV0FBVyxHQUFHLGlCQUFpQixDQUFBO0FBRS9DLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR2xDLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUFZLE9BQUEsQ0FDbEMsQ0FBQyxHQUFHLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLFVBQVUsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUcsQ0FDbkUsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLFdBQVcsQ0FBQyxXQUFXLEdBQUcsYUFBYSxDQUFBO0FBRXZDLE1BQU0sVUFBVSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR2pDLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUFZLE9BQUEsQ0FDbEMsQ0FBQyxHQUFHLENBQ0YsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLDRCQUE0QixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQ3ZELElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsVUFBVSxDQUFDLFdBQVcsR0FBRyxZQUFZLENBQUE7QUFFckMsT0FBTyxFQUFFLElBQUksRUFBRSxVQUFVLEVBQUUsVUFBVSxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsV0FBVyxFQUFFLENBQUEifQ==
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
import * as RadioGroupPrimitive from "@radix-ui/react-radio-group";
import { Circle } from "lucide-react";
import { cn } from "@/lib/utils";
const RadioGroup = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<RadioGroupPrimitive.Root className={cn("grid gap-2", className)} {...props} ref={ref}/>);
});
RadioGroup.displayName = RadioGroupPrimitive.Root.displayName;
const RadioGroupItem = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<RadioGroupPrimitive.Item ref={ref} className={cn("aspect-square h-4 w-4 rounded-full border border-primary text-primary ring-offset-background focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50", className)} {...props}>
      <RadioGroupPrimitive.Indicator className="flex items-center justify-center">
        <Circle className="h-2.5 w-2.5 fill-current text-current"/>
      </RadioGroupPrimitive.Indicator>
    </RadioGroupPrimitive.Item>);
});
RadioGroupItem.displayName = RadioGroupPrimitive.Item.displayName;
export { RadioGroup, RadioGroupItem };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW8tZ3JvdXAuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsicmFkaW8tZ3JvdXAudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7Ozs7Ozs7Ozs7O0FBRVosT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFDOUIsT0FBTyxLQUFLLG1CQUFtQixNQUFNLDZCQUE2QixDQUFBO0FBQ2xFLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSxjQUFjLENBQUE7QUFFckMsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUVoQyxNQUFNLFVBQVUsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUdqQyxDQUFDLEVBQXVCLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBaEMsRUFBRSxTQUFTLE9BQVksRUFBUCxLQUFLLGNBQXJCLGFBQXVCLENBQUY7SUFDdEIsT0FBTyxDQUNMLENBQUMsbUJBQW1CLENBQUMsSUFBSSxDQUN2QixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsWUFBWSxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQ3ZDLElBQUksS0FBSyxDQUFDLENBQ1YsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLEVBQ1QsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDRixVQUFVLENBQUMsV0FBVyxHQUFHLG1CQUFtQixDQUFDLElBQUksQ0FBQyxXQUFXLENBQUE7QUFFN0QsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHckMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQ3RCLE9BQU8sQ0FDTCxDQUFDLG1CQUFtQixDQUFDLElBQUksQ0FDdkIsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUNYLDBPQUEwTyxFQUMxTyxTQUFTLENBQ1YsQ0FBQyxDQUNGLElBQUksS0FBSyxDQUFDLENBRVY7TUFBQSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsQ0FBQyxTQUFTLENBQUMsa0NBQWtDLENBQ3pFO1FBQUEsQ0FBQyxNQUFNLENBQUMsU0FBUyxDQUFDLHVDQUF1QyxFQUMzRDtNQUFBLEVBQUUsbUJBQW1CLENBQUMsU0FBUyxDQUNqQztJQUFBLEVBQUUsbUJBQW1CLENBQUMsSUFBSSxDQUFDLENBQzVCLENBQUE7QUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNGLGNBQWMsQ0FBQyxXQUFXLEdBQUcsbUJBQW1CLENBQUMsSUFBSSxDQUFDLFdBQVcsQ0FBQTtBQUVqRSxPQUFPLEVBQUUsVUFBVSxFQUFFLGNBQWMsRUFBRSxDQUFBIn0=
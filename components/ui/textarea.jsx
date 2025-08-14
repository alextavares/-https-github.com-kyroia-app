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
const Textarea = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<textarea className={cn("flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-base shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm", className)} ref={ref} {...props}/>);
});
Textarea.displayName = "Textarea";
export { Textarea };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGV4dGFyZWEuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGV4dGFyZWEudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUVoQyxNQUFNLFFBQVEsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUcvQixDQUFDLEVBQXVCLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBaEMsRUFBRSxTQUFTLE9BQVksRUFBUCxLQUFLLGNBQXJCLGFBQXVCLENBQUY7SUFDdEIsT0FBTyxDQUNMLENBQUMsUUFBUSxDQUNQLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCwyUUFBMlEsRUFDM1EsU0FBUyxDQUNWLENBQUMsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtBQUNILENBQUMsQ0FBQyxDQUFBO0FBQ0YsUUFBUSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUE7QUFFakMsT0FBTyxFQUFFLFFBQVEsRUFBRSxDQUFBIn0=
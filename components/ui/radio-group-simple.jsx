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
const RadioGroup = ({ value, onValueChange, children, className }) => {
    return (<div className={`grid gap-2 ${className || ""}`} role="radiogroup">
      {React.Children.map(children, (child) => {
            if (React.isValidElement(child)) {
                const childProps = child.props;
                return React.cloneElement(child, Object.assign(Object.assign({}, childProps), { checked: childProps.value === value, onChange: () => onValueChange === null || onValueChange === void 0 ? void 0 : onValueChange(childProps.value) }));
            }
            return child;
        })}
    </div>);
};
const RadioGroupItem = (_a) => {
    var { value, id, className, children } = _a, props = __rest(_a, ["value", "id", "className", "children"]);
    return (<div className="flex items-center space-x-2">
      <input type="radio" id={id} value={value} className={`h-4 w-4 rounded-full border border-primary text-primary focus:ring-2 focus:ring-primary ${className || ""}`} {...props}/>
      {children}
    </div>);
};
export { RadioGroup, RadioGroupItem };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicmFkaW8tZ3JvdXAtc2ltcGxlLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInJhZGlvLWdyb3VwLXNpbXBsZS50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7Ozs7Ozs7Ozs7QUFFWixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQWdCOUIsTUFBTSxVQUFVLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFBRSxhQUFhLEVBQUUsUUFBUSxFQUFFLFNBQVMsRUFBbUIsRUFBRSxFQUFFO0lBQ3BGLE9BQU8sQ0FDTCxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsQ0FBQyxjQUFjLFNBQVMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxZQUFZLENBQ2hFO01BQUEsQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxRQUFRLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRTtZQUN0QyxJQUFJLEtBQUssQ0FBQyxjQUFjLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQztnQkFDaEMsTUFBTSxVQUFVLEdBQUcsS0FBSyxDQUFDLEtBQVksQ0FBQTtnQkFDckMsT0FBTyxLQUFLLENBQUMsWUFBWSxDQUFDLEtBQWdDLGtDQUNyRCxVQUFVLEtBQ2IsT0FBTyxFQUFFLFVBQVUsQ0FBQyxLQUFLLEtBQUssS0FBSyxFQUNuQyxRQUFRLEVBQUUsR0FBRyxFQUFFLENBQUMsYUFBYSxhQUFiLGFBQWEsdUJBQWIsYUFBYSxDQUFHLFVBQVUsQ0FBQyxLQUFLLENBQUMsSUFDakQsQ0FBQTtZQUNKLENBQUM7WUFDRCxPQUFPLEtBQUssQ0FBQTtRQUNkLENBQUMsQ0FBQyxDQUNKO0lBQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsTUFBTSxjQUFjLEdBQUcsQ0FBQyxFQUF1RSxFQUFFLEVBQUU7UUFBM0UsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLFNBQVMsRUFBRSxRQUFRLE9BQXVDLEVBQWxDLEtBQUssY0FBMUMsd0NBQTRDLENBQUY7SUFDaEUsT0FBTyxDQUNMLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQyw2QkFBNkIsQ0FDMUM7TUFBQSxDQUFDLEtBQUssQ0FDSixJQUFJLENBQUMsT0FBTyxDQUNaLEVBQUUsQ0FBQyxDQUFDLEVBQUUsQ0FBQyxDQUNQLEtBQUssQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUNiLFNBQVMsQ0FBQyxDQUFDLDJGQUEyRixTQUFTLElBQUksRUFBRSxFQUFFLENBQUMsQ0FDeEgsSUFBSSxLQUFLLENBQUMsRUFFWjtNQUFBLENBQUMsUUFBUSxDQUNYO0lBQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFBO0FBRUQsT0FBTyxFQUFFLFVBQVUsRUFBRSxjQUFjLEVBQUUsQ0FBQSJ9
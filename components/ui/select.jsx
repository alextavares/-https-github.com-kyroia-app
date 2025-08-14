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
import * as SelectPrimitive from "@radix-ui/react-select";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronDownIcon, ChevronUpIcon } from "@radix-ui/react-icons";
const Select = SelectPrimitive.Root;
const SelectGroup = SelectPrimitive.Group;
const SelectValue = SelectPrimitive.Value;
const SelectTrigger = React.forwardRef((_a, ref) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<SelectPrimitive.Trigger ref={ref} className={cn("flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background data-[placeholder]:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1", className)} {...props}>
    {children}
    <SelectPrimitive.Icon asChild>
      <ChevronDownIcon className="h-4 w-4 opacity-50"/>
    </SelectPrimitive.Icon>
  </SelectPrimitive.Trigger>);
});
SelectTrigger.displayName = SelectPrimitive.Trigger.displayName;
const SelectScrollUpButton = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SelectPrimitive.ScrollUpButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronUpIcon className="h-4 w-4"/>
  </SelectPrimitive.ScrollUpButton>);
});
SelectScrollUpButton.displayName = SelectPrimitive.ScrollUpButton.displayName;
const SelectScrollDownButton = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SelectPrimitive.ScrollDownButton ref={ref} className={cn("flex cursor-default items-center justify-center py-1", className)} {...props}>
    <ChevronDownIcon className="h-4 w-4"/>
  </SelectPrimitive.ScrollDownButton>);
});
SelectScrollDownButton.displayName =
    SelectPrimitive.ScrollDownButton.displayName;
const SelectContent = React.forwardRef((_a, ref) => {
    var { className, children, position = "popper" } = _a, props = __rest(_a, ["className", "children", "position"]);
    return (<SelectPrimitive.Portal>
    <SelectPrimitive.Content ref={ref} className={cn("relative z-50 max-h-[--radix-select-content-available-height] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-select-content-transform-origin]", position === "popper" &&
            "data-[side=bottom]:translate-y-1 data-[side=left]:-translate-x-1 data-[side=right]:translate-x-1 data-[side=top]:-translate-y-1", className)} position={position} {...props}>
      <SelectScrollUpButton />
      <SelectPrimitive.Viewport className={cn("p-1", position === "popper" &&
            "h-[var(--radix-select-trigger-height)] w-full min-w-[var(--radix-select-trigger-width)]")}>
        {children}
      </SelectPrimitive.Viewport>
      <SelectScrollDownButton />
    </SelectPrimitive.Content>
  </SelectPrimitive.Portal>);
});
SelectContent.displayName = SelectPrimitive.Content.displayName;
const SelectLabel = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SelectPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", className)} {...props}/>);
});
SelectLabel.displayName = SelectPrimitive.Label.displayName;
const SelectItem = React.forwardRef((_a, ref) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<SelectPrimitive.Item ref={ref} className={cn("relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute right-2 flex h-3.5 w-3.5 items-center justify-center">
      <SelectPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4"/>
      </SelectPrimitive.ItemIndicator>
    </span>
    <SelectPrimitive.ItemText>{children}</SelectPrimitive.ItemText>
  </SelectPrimitive.Item>);
});
SelectItem.displayName = SelectPrimitive.Item.displayName;
const SelectSeparator = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<SelectPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props}/>);
});
SelectSeparator.displayName = SelectPrimitive.Separator.displayName;
export { Select, SelectGroup, SelectValue, SelectTrigger, SelectContent, SelectLabel, SelectItem, SelectSeparator, SelectScrollUpButton, SelectScrollDownButton, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VsZWN0LmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbInNlbGVjdC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBOzs7Ozs7Ozs7Ozs7QUFFWixPQUFPLEtBQUssS0FBSyxNQUFNLE9BQU8sQ0FBQTtBQUM5QixPQUFPLEtBQUssZUFBZSxNQUFNLHdCQUF3QixDQUFBO0FBQ3pELE9BQU8sRUFBRSxFQUFFLEVBQUUsTUFBTSxhQUFhLENBQUE7QUFDaEMsT0FBTyxFQUFFLFNBQVMsRUFBRSxlQUFlLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFFakYsTUFBTSxNQUFNLEdBQUcsZUFBZSxDQUFDLElBQUksQ0FBQTtBQUVuQyxNQUFNLFdBQVcsR0FBRyxlQUFlLENBQUMsS0FBSyxDQUFBO0FBRXpDLE1BQU0sV0FBVyxHQUFHLGVBQWUsQ0FBQyxLQUFLLENBQUE7QUFFekMsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHcEMsQ0FBQyxFQUFpQyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQTFDLEVBQUUsU0FBUyxFQUFFLFFBQVEsT0FBWSxFQUFQLEtBQUssY0FBL0IseUJBQWlDLENBQUY7SUFBWSxPQUFBLENBQzVDLENBQUMsZUFBZSxDQUFDLE9BQU8sQ0FDdEIsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUNYLGdVQUFnVSxFQUNoVSxTQUFTLENBQ1YsQ0FBQyxDQUNGLElBQUksS0FBSyxDQUFDLENBRVY7SUFBQSxDQUFDLFFBQVEsQ0FDVDtJQUFBLENBQUMsZUFBZSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQzNCO01BQUEsQ0FBQyxlQUFlLENBQUMsU0FBUyxDQUFDLG9CQUFvQixFQUNqRDtJQUFBLEVBQUUsZUFBZSxDQUFDLElBQUksQ0FDeEI7RUFBQSxFQUFFLGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FDM0IsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNG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
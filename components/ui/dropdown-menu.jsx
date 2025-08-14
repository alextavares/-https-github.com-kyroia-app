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
import * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";
import { CheckIcon, ChevronRightIcon, DotFilledIcon } from "@radix-ui/react-icons";
const DropdownMenu = DropdownMenuPrimitive.Root;
const DropdownMenuTrigger = DropdownMenuPrimitive.Trigger;
const DropdownMenuGroup = DropdownMenuPrimitive.Group;
const DropdownMenuPortal = DropdownMenuPrimitive.Portal;
const DropdownMenuSub = DropdownMenuPrimitive.Sub;
const DropdownMenuRadioGroup = DropdownMenuPrimitive.RadioGroup;
const DropdownMenuSubTrigger = React.forwardRef((_a, ref) => {
    var { className, inset, children } = _a, props = __rest(_a, ["className", "inset", "children"]);
    return (<DropdownMenuPrimitive.SubTrigger ref={ref} className={cn("flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none focus:bg-accent data-[state=open]:bg-accent [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0", inset && "pl-8", className)} {...props}>
    {children}
    <ChevronRightIcon className="ml-auto"/>
  </DropdownMenuPrimitive.SubTrigger>);
});
DropdownMenuSubTrigger.displayName =
    DropdownMenuPrimitive.SubTrigger.displayName;
const DropdownMenuSubContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<DropdownMenuPrimitive.SubContent ref={ref} className={cn("z-50 min-w-[8rem] overflow-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]", className)} {...props}/>);
});
DropdownMenuSubContent.displayName =
    DropdownMenuPrimitive.SubContent.displayName;
const DropdownMenuContent = React.forwardRef((_a, ref) => {
    var { className, sideOffset = 4 } = _a, props = __rest(_a, ["className", "sideOffset"]);
    return (<DropdownMenuPrimitive.Portal>
    <DropdownMenuPrimitive.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 max-h-[var(--radix-dropdown-menu-content-available-height)] min-w-[8rem] overflow-y-auto overflow-x-hidden rounded-md border bg-popover p-1 text-popover-foreground shadow-md", "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2 origin-[--radix-dropdown-menu-content-transform-origin]", className)} {...props}/>
  </DropdownMenuPrimitive.Portal>);
});
DropdownMenuContent.displayName = DropdownMenuPrimitive.Content.displayName;
const DropdownMenuItem = React.forwardRef((_a, ref) => {
    var { className, inset } = _a, props = __rest(_a, ["className", "inset"]);
    return (<DropdownMenuPrimitive.Item ref={ref} className={cn("relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 [&>svg]:size-4 [&>svg]:shrink-0", inset && "pl-8", className)} {...props}/>);
});
DropdownMenuItem.displayName = DropdownMenuPrimitive.Item.displayName;
const DropdownMenuCheckboxItem = React.forwardRef((_a, ref) => {
    var { className, children, checked } = _a, props = __rest(_a, ["className", "children", "checked"]);
    return (<DropdownMenuPrimitive.CheckboxItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} checked={checked} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <CheckIcon className="h-4 w-4"/>
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.CheckboxItem>);
});
DropdownMenuCheckboxItem.displayName =
    DropdownMenuPrimitive.CheckboxItem.displayName;
const DropdownMenuRadioItem = React.forwardRef((_a, ref) => {
    var { className, children } = _a, props = __rest(_a, ["className", "children"]);
    return (<DropdownMenuPrimitive.RadioItem ref={ref} className={cn("relative flex cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50", className)} {...props}>
    <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
      <DropdownMenuPrimitive.ItemIndicator>
        <DotFilledIcon className="h-2 w-2 fill-current"/>
      </DropdownMenuPrimitive.ItemIndicator>
    </span>
    {children}
  </DropdownMenuPrimitive.RadioItem>);
});
DropdownMenuRadioItem.displayName = DropdownMenuPrimitive.RadioItem.displayName;
const DropdownMenuLabel = React.forwardRef((_a, ref) => {
    var { className, inset } = _a, props = __rest(_a, ["className", "inset"]);
    return (<DropdownMenuPrimitive.Label ref={ref} className={cn("px-2 py-1.5 text-sm font-semibold", inset && "pl-8", className)} {...props}/>);
});
DropdownMenuLabel.displayName = DropdownMenuPrimitive.Label.displayName;
const DropdownMenuSeparator = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<DropdownMenuPrimitive.Separator ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props}/>);
});
DropdownMenuSeparator.displayName = DropdownMenuPrimitive.Separator.displayName;
const DropdownMenuShortcut = (_a) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<span className={cn("ml-auto text-xs tracking-widest opacity-60", className)} {...props}/>);
};
DropdownMenuShortcut.displayName = "DropdownMenuShortcut";
export { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem, DropdownMenuCheckboxItem, DropdownMenuRadioItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuGroup, DropdownMenuPortal, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuRadioGroup, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZHJvcGRvd24tbWVudS5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJkcm9wZG93bi1tZW51LnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7Ozs7Ozs7Ozs7OztBQUVaLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sS0FBSyxxQkFBcUIsTUFBTSwrQkFBK0IsQ0FBQTtBQUN0RSxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQ2hDLE9BQU8sRUFBRSxTQUFTLEVBQUUsZ0JBQWdCLEVBQUUsYUFBYSxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFFbEYsTUFBTSxZQUFZLEdBQUcscUJBQXFCLENBQUMsSUFBSSxDQUFBO0FBRS9DLE1BQU0sbUJBQW1CLEdBQUcscUJBQXFCLENBQUMsT0FBTyxDQUFBO0FBRXpELE1BQU0saUJBQWlCLEdBQUcscUJBQXFCLENBQUMsS0FBSyxDQUFBO0FBRXJELE1BQU0sa0JBQWtCLEdBQUcscUJBQXFCLENBQUMsTUFBTSxDQUFBO0FBRXZELE1BQU0sZUFBZSxHQUFHLHFCQUFxQixDQUFDLEdBQUcsQ0FBQTtBQUVqRCxNQUFNLHNCQUFzQixHQUFHLHFCQUFxQixDQUFDLFVBQVUsQ0FBQTtBQUUvRCxNQUFNLHNCQUFzQixHQUFHLEtBQUssQ0FBQyxVQUFVLENBSzdDLENBQUMsRUFBd0MsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFqRCxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsUUFBUSxPQUFZLEVBQVAsS0FBSyxjQUF0QyxrQ0FBd0MsQ0FBRjtJQUFZLE9BQUEsQ0FDbkQsQ0FBQyxxQkFBcUIsQ0FBQyxVQUFVLENBQy9CLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCx3TUFBd00sRUFDeE0sS0FBSyxJQUFJLE1BQU0sRUFDZixTQUFTLENBQ1YsQ0FBQyxDQUNGLElBQUksS0FBSyxDQUFDLENBRVY7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
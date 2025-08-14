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
import { Slot } from "@radix-ui/react-slot";
import { cva } from "class-variance-authority";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger, } from "@/components/ui/tooltip";
import { ViewVerticalIcon } from "@radix-ui/react-icons";
const SIDEBAR_COOKIE_NAME = "sidebar_state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;
const SIDEBAR_WIDTH = "16rem";
const SIDEBAR_WIDTH_MOBILE = "18rem";
const SIDEBAR_WIDTH_ICON = "3rem";
const SIDEBAR_KEYBOARD_SHORTCUT = "b";
const SidebarContext = React.createContext(null);
function useSidebar() {
    const context = React.useContext(SidebarContext);
    if (!context) {
        throw new Error("useSidebar must be used within a SidebarProvider.");
    }
    return context;
}
const SidebarProvider = React.forwardRef((_a, ref) => {
    var { defaultOpen = true, open: openProp, onOpenChange: setOpenProp, className, style, children } = _a, props = __rest(_a, ["defaultOpen", "open", "onOpenChange", "className", "style", "children"]);
    const isMobile = useIsMobile();
    const [openMobile, setOpenMobile] = React.useState(false);
    // This is the internal state of the sidebar.
    // We use openProp and setOpenProp for control from outside the component.
    const [_open, _setOpen] = React.useState(defaultOpen);
    const open = openProp !== null && openProp !== void 0 ? openProp : _open;
    const setOpen = React.useCallback((value) => {
        const openState = typeof value === "function" ? value(open) : value;
        if (setOpenProp) {
            setOpenProp(openState);
        }
        else {
            _setOpen(openState);
        }
        // This sets the cookie to keep the sidebar state.
        document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    }, [setOpenProp, open]);
    // Helper to toggle the sidebar.
    const toggleSidebar = React.useCallback(() => {
        return isMobile
            ? setOpenMobile((open) => !open)
            : setOpen((open) => !open);
    }, [isMobile, setOpen, setOpenMobile]);
    // Adds a keyboard shortcut to toggle the sidebar.
    React.useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
                (event.metaKey || event.ctrlKey)) {
                event.preventDefault();
                toggleSidebar();
            }
        };
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [toggleSidebar]);
    // We add a state so that we can do data-state="expanded" or "collapsed".
    // This makes it easier to style the sidebar with Tailwind classes.
    const state = open ? "expanded" : "collapsed";
    const contextValue = React.useMemo(() => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
    }), [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]);
    return (<SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div style={Object.assign({ "--sidebar-width": SIDEBAR_WIDTH, "--sidebar-width-icon": SIDEBAR_WIDTH_ICON }, style)} className={cn("group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar", className)} ref={ref} {...props}>
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>);
});
SidebarProvider.displayName = "SidebarProvider";
const Sidebar = React.forwardRef((_a, ref) => {
    var { side = "left", variant = "sidebar", collapsible = "offcanvas", className, children } = _a, props = __rest(_a, ["side", "variant", "collapsible", "className", "children"]);
    const { isMobile, state, openMobile, setOpenMobile } = useSidebar();
    if (collapsible === "none") {
        return (<div className={cn("flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground", className)} ref={ref} {...props}>
          {children}
        </div>);
    }
    if (isMobile) {
        return (<Sheet open={openMobile} onOpenChange={setOpenMobile} {...props}>
          <SheetContent data-sidebar="sidebar" data-mobile="true" className="w-[--sidebar-width] bg-sidebar p-0 text-sidebar-foreground [&>button]:hidden" style={{
                "--sidebar-width": SIDEBAR_WIDTH_MOBILE,
            }} side={side}>
            <SheetHeader className="sr-only">
              <SheetTitle>Sidebar</SheetTitle>
              <SheetDescription>Displays the mobile sidebar.</SheetDescription>
            </SheetHeader>
            <div className="flex h-full w-full flex-col">{children}</div>
          </SheetContent>
        </Sheet>);
    }
    return (<div ref={ref} className="group peer hidden text-sidebar-foreground md:block" data-state={state} data-collapsible={state === "collapsed" ? collapsible : ""} data-variant={variant} data-side={side}>
        {/* This is what handles the sidebar gap on desktop */}
        <div className={cn("relative w-[--sidebar-width] bg-transparent transition-[width] duration-200 ease-linear", "group-data-[collapsible=offcanvas]:w-0", "group-data-[side=right]:rotate-180", variant === "floating" || variant === "inset"
            ? "group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4))]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon]")}/>
        <div className={cn("fixed inset-y-0 z-10 hidden h-svh w-[--sidebar-width] transition-[left,right,width] duration-200 ease-linear md:flex", side === "left"
            ? "left-0 group-data-[collapsible=offcanvas]:left-[calc(var(--sidebar-width)*-1)]"
            : "right-0 group-data-[collapsible=offcanvas]:right-[calc(var(--sidebar-width)*-1)]", 
        // Adjust the padding for floating and inset variants.
        variant === "floating" || variant === "inset"
            ? "p-2 group-data-[collapsible=icon]:w-[calc(var(--sidebar-width-icon)_+_theme(spacing.4)_+2px)]"
            : "group-data-[collapsible=icon]:w-[--sidebar-width-icon] group-data-[side=left]:border-r group-data-[side=right]:border-l", className)} {...props}>
          <div data-sidebar="sidebar" className="flex h-full w-full flex-col bg-sidebar group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow">
            {children}
          </div>
        </div>
      </div>);
});
Sidebar.displayName = "Sidebar";
const SidebarTrigger = React.forwardRef((_a, ref) => {
    var { className, onClick } = _a, props = __rest(_a, ["className", "onClick"]);
    const { toggleSidebar } = useSidebar();
    return (<Button ref={ref} data-sidebar="trigger" variant="ghost" size="icon" className={cn("h-7 w-7", className)} onClick={(event) => {
            onClick === null || onClick === void 0 ? void 0 : onClick(event);
            toggleSidebar();
        }} {...props}>
      <ViewVerticalIcon />
      <span className="sr-only">Toggle Sidebar</span>
    </Button>);
});
SidebarTrigger.displayName = "SidebarTrigger";
const SidebarRail = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    const { toggleSidebar } = useSidebar();
    return (<button ref={ref} data-sidebar="rail" aria-label="Toggle Sidebar" tabIndex={-1} onClick={toggleSidebar} title="Toggle Sidebar" className={cn("absolute inset-y-0 z-20 hidden w-4 -translate-x-1/2 transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px] hover:after:bg-sidebar-border group-data-[side=left]:-right-4 group-data-[side=right]:left-0 sm:flex", "[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize", "[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize", "group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:after:left-full group-data-[collapsible=offcanvas]:hover:bg-sidebar", "[[data-side=left][data-collapsible=offcanvas]_&]:-right-2", "[[data-side=right][data-collapsible=offcanvas]_&]:-left-2", className)} {...props}/>);
});
SidebarRail.displayName = "SidebarRail";
const SidebarInset = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<main ref={ref} className={cn("relative flex w-full flex-1 flex-col bg-background", "md:peer-data-[variant=inset]:m-2 md:peer-data-[state=collapsed]:peer-data-[variant=inset]:ml-2 md:peer-data-[variant=inset]:ml-0 md:peer-data-[variant=inset]:rounded-xl md:peer-data-[variant=inset]:shadow", className)} {...props}/>);
});
SidebarInset.displayName = "SidebarInset";
const SidebarInput = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<Input ref={ref} data-sidebar="input" className={cn("h-8 w-full bg-background shadow-none focus-visible:ring-2 focus-visible:ring-sidebar-ring", className)} {...props}/>);
});
SidebarInput.displayName = "SidebarInput";
const SidebarHeader = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="header" className={cn("flex flex-col gap-2 p-2", className)} {...props}/>);
});
SidebarHeader.displayName = "SidebarHeader";
const SidebarFooter = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="footer" className={cn("flex flex-col gap-2 p-2", className)} {...props}/>);
});
SidebarFooter.displayName = "SidebarFooter";
const SidebarSeparator = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<Separator ref={ref} data-sidebar="separator" className={cn("mx-2 w-auto bg-sidebar-border", className)} {...props}/>);
});
SidebarSeparator.displayName = "SidebarSeparator";
const SidebarContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="content" className={cn("flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden", className)} {...props}/>);
});
SidebarContent.displayName = "SidebarContent";
const SidebarGroup = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="group" className={cn("relative flex w-full min-w-0 flex-col p-2", className)} {...props}/>);
});
SidebarGroup.displayName = "SidebarGroup";
const SidebarGroupLabel = React.forwardRef((_a, ref) => {
    var { className, asChild = false } = _a, props = __rest(_a, ["className", "asChild"]);
    const Comp = asChild ? Slot : "div";
    return (<Comp ref={ref} data-sidebar="group-label" className={cn("flex h-8 shrink-0 items-center rounded-md px-2 text-xs font-medium text-sidebar-foreground/70 outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", "group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0", className)} {...props}/>);
});
SidebarGroupLabel.displayName = "SidebarGroupLabel";
const SidebarGroupAction = React.forwardRef((_a, ref) => {
    var { className, asChild = false } = _a, props = __rest(_a, ["className", "asChild"]);
    const Comp = asChild ? Slot : "button";
    return (<Comp ref={ref} data-sidebar="group-action" className={cn("absolute right-3 top-3.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 [&>svg]:size-4 [&>svg]:shrink-0", 
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden", "group-data-[collapsible=icon]:hidden", className)} {...props}/>);
});
SidebarGroupAction.displayName = "SidebarGroupAction";
const SidebarGroupContent = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="group-content" className={cn("w-full text-sm", className)} {...props}/>);
});
SidebarGroupContent.displayName = "SidebarGroupContent";
const SidebarMenu = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ul ref={ref} data-sidebar="menu" className={cn("flex w-full min-w-0 flex-col gap-1", className)} {...props}/>);
});
SidebarMenu.displayName = "SidebarMenu";
const SidebarMenuItem = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<li ref={ref} data-sidebar="menu-item" className={cn("group/menu-item relative", className)} {...props}/>);
});
SidebarMenuItem.displayName = "SidebarMenuItem";
const sidebarMenuButtonVariants = cva("peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-[width,height,padding] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0", {
    variants: {
        variant: {
            default: "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
            outline: "bg-background shadow-[0_0_0_1px_hsl(var(--sidebar-border))] hover:bg-sidebar-accent hover:text-sidebar-accent-foreground hover:shadow-[0_0_0_1px_hsl(var(--sidebar-accent))]",
        },
        size: {
            default: "h-8 text-sm",
            sm: "h-7 text-xs",
            lg: "h-12 text-sm group-data-[collapsible=icon]:!p-0",
        },
    },
    defaultVariants: {
        variant: "default",
        size: "default",
    },
});
const SidebarMenuButton = React.forwardRef((_a, ref) => {
    var { asChild = false, isActive = false, variant = "default", size = "default", tooltip, className } = _a, props = __rest(_a, ["asChild", "isActive", "variant", "size", "tooltip", "className"]);
    const Comp = asChild ? Slot : "button";
    const { isMobile, state } = useSidebar();
    const button = (<Comp ref={ref} data-sidebar="menu-button" data-size={size} data-active={isActive} className={cn(sidebarMenuButtonVariants({ variant, size }), className)} {...props}/>);
    if (!tooltip) {
        return button;
    }
    if (typeof tooltip === "string") {
        tooltip = {
            children: tooltip,
        };
    }
    return (<Tooltip>
        <TooltipTrigger asChild>{button}</TooltipTrigger>
        <TooltipContent side="right" align="center" hidden={state !== "collapsed" || isMobile} {...tooltip}/>
      </Tooltip>);
});
SidebarMenuButton.displayName = "SidebarMenuButton";
const SidebarMenuAction = React.forwardRef((_a, ref) => {
    var { className, asChild = false, showOnHover = false } = _a, props = __rest(_a, ["className", "asChild", "showOnHover"]);
    const Comp = asChild ? Slot : "button";
    return (<Comp ref={ref} data-sidebar="menu-action" className={cn("absolute right-1 top-1.5 flex aspect-square w-5 items-center justify-center rounded-md p-0 text-sidebar-foreground outline-none ring-sidebar-ring transition-transform hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0", 
        // Increases the hit area of the button on mobile.
        "after:absolute after:-inset-2 after:md:hidden", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", showOnHover &&
            "group-focus-within/menu-item:opacity-100 group-hover/menu-item:opacity-100 data-[state=open]:opacity-100 peer-data-[active=true]/menu-button:text-sidebar-accent-foreground md:opacity-0", className)} {...props}/>);
});
SidebarMenuAction.displayName = "SidebarMenuAction";
const SidebarMenuBadge = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div ref={ref} data-sidebar="menu-badge" className={cn("pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center justify-center rounded-md px-1 text-xs font-medium tabular-nums text-sidebar-foreground", "peer-hover/menu-button:text-sidebar-accent-foreground peer-data-[active=true]/menu-button:text-sidebar-accent-foreground", "peer-data-[size=sm]/menu-button:top-1", "peer-data-[size=default]/menu-button:top-1.5", "peer-data-[size=lg]/menu-button:top-2.5", "group-data-[collapsible=icon]:hidden", className)} {...props}/>);
});
SidebarMenuBadge.displayName = "SidebarMenuBadge";
const SidebarMenuSkeleton = React.forwardRef((_a, ref) => {
    var { className, showIcon = false } = _a, props = __rest(_a, ["className", "showIcon"]);
    // Random width between 50 to 90%.
    const width = React.useMemo(() => {
        return `${Math.floor(Math.random() * 40) + 50}%`;
    }, []);
    return (<div ref={ref} data-sidebar="menu-skeleton" className={cn("flex h-8 items-center gap-2 rounded-md px-2", className)} {...props}>
      {showIcon && (<Skeleton className="size-4 rounded-md" data-sidebar="menu-skeleton-icon"/>)}
      <Skeleton className="h-4 max-w-[--skeleton-width] flex-1" data-sidebar="menu-skeleton-text" style={{
            "--skeleton-width": width,
        }}/>
    </div>);
});
SidebarMenuSkeleton.displayName = "SidebarMenuSkeleton";
const SidebarMenuSub = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<ul ref={ref} data-sidebar="menu-sub" className={cn("mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-l border-sidebar-border px-2.5 py-0.5", "group-data-[collapsible=icon]:hidden", className)} {...props}/>);
});
SidebarMenuSub.displayName = "SidebarMenuSub";
const SidebarMenuSubItem = React.forwardRef((_a, ref) => {
    var props = __rest(_a, []);
    return <li ref={ref} {...props}/>;
});
SidebarMenuSubItem.displayName = "SidebarMenuSubItem";
const SidebarMenuSubButton = React.forwardRef((_a, ref) => {
    var { asChild = false, size = "md", isActive, className } = _a, props = __rest(_a, ["asChild", "size", "isActive", "className"]);
    const Comp = asChild ? Slot : "a";
    return (<Comp ref={ref} data-sidebar="menu-sub-button" data-size={size} data-active={isActive} className={cn("flex h-7 min-w-0 -translate-x-px items-center gap-2 overflow-hidden rounded-md px-2 text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground", "data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground", size === "sm" && "text-xs", size === "md" && "text-sm", "group-data-[collapsible=icon]:hidden", className)} {...props}/>);
});
SidebarMenuSubButton.displayName = "SidebarMenuSubButton";
export { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupAction, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarInput, SidebarInset, SidebarMenu, SidebarMenuAction, SidebarMenuBadge, SidebarMenuButton, SidebarMenuItem, SidebarMenuSkeleton, SidebarMenuSub, SidebarMenuSubButton, SidebarMenuSubItem, SidebarProvider, SidebarRail, SidebarSeparator, SidebarTrigger, useSidebar, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJzaWRlYmFyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7Ozs7Ozs7Ozs7OztBQUVaLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBQzlCLE9BQU8sRUFBRSxJQUFJLEVBQUUsTUFBTSxzQkFBc0IsQ0FBQTtBQUMzQyxPQUFPLEVBQWdCLEdBQUcsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQzVELE9BQU8sRUFBRSxXQUFXLEVBQUUsTUFBTSxvQkFBb0IsQ0FBQTtBQUNoRCxPQUFPLEVBQUUsRUFBRSxFQUFFLE1BQU0sYUFBYSxDQUFBO0FBQ2hDLE9BQU8sRUFBRSxNQUFNLEVBQUUsTUFBTSx3QkFBd0IsQ0FBQTtBQUMvQyxPQUFPLEVBQUUsS0FBSyxFQUFFLE1BQU0sdUJBQXVCLENBQUE7QUFDN0MsT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLDJCQUEyQixDQUFBO0FBQ3JELE9BQU8sRUFDTCxLQUFLLEVBQ0wsWUFBWSxFQUNaLGdCQUFnQixFQUNoQixXQUFXLEVBQ1gsVUFBVSxHQUNYLE1BQU0sdUJBQXVCLENBQUE7QUFDOUIsT0FBTyxFQUFFLFFBQVEsRUFBRSxNQUFNLDBCQUEwQixDQUFBO0FBQ25ELE9BQU8sRUFDTCxPQUFPLEVBQ1AsY0FBYyxFQUNkLGVBQWUsRUFDZixjQUFjLEdBQ2YsTUFBTSx5QkFBeUIsQ0FBQTtBQUNoQyxPQUFPLEVBQUUsZ0JBQWdCLEVBQUUsTUFBTSx1QkFBdUIsQ0FBQTtBQUV4RCxNQUFNLG1CQUFtQixHQUFHLGVBQWUsQ0FBQTtBQUMzQyxNQUFNLHNCQUFzQixHQUFHLEVBQUUsR0FBRyxFQUFFLEdBQUcsRUFBRSxHQUFHLENBQUMsQ0FBQTtBQUMvQyxNQUFNLGFBQWEsR0FBRyxPQUFPLENBQUE7QUFDN0IsTUFBTSxvQkFBb0IsR0FBRyxPQUFPLENBQUE7QUFDcEMsTUFBTSxrQkFBa0IsR0FBRyxNQUFNLENBQUE7QUFDakMsTUFBTSx5QkFBeUIsR0FBRyxHQUFHLENBQUE7QUFZckMsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLGFBQWEsQ0FBNkIsSUFBSSxDQUFDLENBQUE7QUFFNUUsU0FBUyxVQUFVO0lBQ2pCLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBQUMsY0FBYyxDQUFDLENBQUE7SUFDaEQsSUFBSSxDQUFDLE9BQU8sRUFBRSxDQUFDO1FBQ2IsTUFBTSxJQUFJLEtBQUssQ0FBQyxtREFBbUQsQ0FBQyxDQUFBO0lBQ3RFLENBQUM7SUFFRCxPQUFPLE9BQU8sQ0FBQTtBQUNoQixDQUFDO0FBRUQsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FRdEMsQ0FDRSxFQVFDLEVBQ0QsR0FBRyxFQUNILEVBQUU7UUFWRixFQUNFLFdBQVcsR0FBRyxJQUFJLEVBQ2xCLElBQUksRUFBRSxRQUFRLEVBQ2QsWUFBWSxFQUFFLFdBQVcsRUFDekIsU0FBUyxFQUNULEtBQUssRUFDTCxRQUFRLE9BRVQsRUFESSxLQUFLLGNBUFYseUVBUUMsQ0FEUztJQUlWLE1BQU0sUUFBUSxHQUFHLFdBQVcsRUFBRSxDQUFBO0lBQzlCLE1BQU0sQ0FBQyxVQUFVLEVBQUUsYUFBYSxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUV6RCw2Q0FBNkM7SUFDN0MsMEVBQTBFO0lBQzFFLE1BQU0sQ0FBQyxLQUFLLEVBQUUsUUFBUSxDQUFDLEdBQUcsS0FBSyxDQUFDLFFBQVEsQ0FBQyxXQUFXLENBQUMsQ0FBQTtJQUNyRCxNQUFNLElBQUksR0FBRyxRQUFRLGFBQVIsUUFBUSxjQUFSLFFBQVEsR0FBSSxLQUFLLENBQUE7SUFDOUIsTUFBTSxPQUFPLEdBQUcsS0FBSyxDQUFDLFdBQVcsQ0FDL0IsQ0FBQyxLQUE4QyxFQUFFLEVBQUU7UUFDakQsTUFBTSxTQUFTLEdBQUcsT0FBTyxLQUFLLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTtRQUNuRSxJQUFJLFdBQVcsRUFBRSxDQUFDO1lBQ2hCLFdBQVcsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUN4QixDQUFDO2FBQU0sQ0FBQztZQUNOLFFBQVEsQ0FBQyxTQUFTLENBQUMsQ0FBQTtRQUNyQixDQUFDO1FBRUQsa0RBQWtEO1FBQ2xELFFBQVEsQ0FBQyxNQUFNLEdBQUcsR0FBRyxtQkFBbUIsSUFBSSxTQUFTLHFCQUFxQixzQkFBc0IsRUFBRSxDQUFBO0lBQ3BHLENBQUMsRUFDRCxDQUFDLFdBQVcsRUFBRSxJQUFJLENBQUMsQ0FDcEIsQ0FBQTtJQUVELGdDQUFnQztJQUNoQyxNQUFNLGFBQWEsR0FBRyxLQUFLLENBQUMsV0FBVyxDQUFDLEdBQUcsRUFBRTtRQUMzQyxPQUFPLFFBQVE7WUFDYixDQUFDLENBQUMsYUFBYSxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQztZQUNoQyxDQUFDLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxFQUFFLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBQzlCLENBQUMsRUFBRSxDQUFDLFFBQVEsRUFBRSxPQUFPLEVBQUUsYUFBYSxDQUFDLENBQUMsQ0FBQTtJQUV0QyxrREFBa0Q7SUFDbEQsS0FBSyxDQUFDLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDbkIsTUFBTSxhQUFhLEdBQUcsQ0FBQyxLQUFvQixFQUFFLEVBQUU7WUFDN0MsSUFDRSxLQUFLLENBQUMsR0FBRyxLQUFLLHlCQUF5QjtnQkFDdkMsQ0FBQyxLQUFLLENBQUMsT0FBTyxJQUFJLEtBQUssQ0FBQyxPQUFPLENBQUMsRUFDaEMsQ0FBQztnQkFDRCxLQUFLLENBQUMsY0FBYyxFQUFFLENBQUE7Z0JBQ3RCLGFBQWEsRUFBRSxDQUFBO1lBQ2pCLENBQUM7UUFDSCxDQUFDLENBQUE7UUFFRCxNQUFNLENBQUMsZ0JBQWdCLENBQUMsU0FBUyxFQUFFLGFBQWEsQ0FBQyxDQUFBO1FBQ2pELE9BQU8sR0FBRyxFQUFFLENBQUMsTUFBTSxDQUFDLG1CQUFtQixDQUFDLFNBQVMsRUFBRSxhQUFhLENBQUMsQ0FBQTtJQUNuRSxDQUFDLEVBQUUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFBO0lBRW5CLHlFQUF5RTtJQUN6RSxtRUFBbUU7SUFDbkUsTUFBTSxLQUFLLEdBQUcsSUFBSSxDQUFDLENBQUMsQ0FBQyxVQUFVLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQTtJQUU3QyxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsT0FBTyxDQUNoQyxHQUFHLEVBQUUsQ0FBQyxDQUFDO1FBQ0wsS0FBSztRQUNMLElBQUk7UUFDSixPQUFPO1FBQ1AsUUFBUTtRQUNSLFVBQVU7UUFDVixhQUFhO1FBQ2IsYUFBYTtLQUNkLENBQUMsRUFDRixDQUFDLEtBQUssRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLFFBQVEsRUFBRSxVQUFVLEVBQUUsYUFBYSxFQUFFLGFBQWEsQ0FBQyxDQUMzRSxDQUFBO0lBRUQsT0FBTyxDQUNMLENBQUMsY0FBYyxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsQ0FBQyxZQUFZLENBQUMsQ0FDM0M7UUFBQSxDQUFDLGVBQWUsQ0FBQyxhQUFhLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDaEM7VUFBQSxDQUFDLEdBQUcsQ0FDRixLQUFLLENBQUMsQ0FDSixnQkFDRSxpQkFBaUIsRUFBRSxhQUFhLEVBQ2hDLHNCQUFzQixFQUFFLGtCQUFrQixJQUN2QyxLQUFLLENBRVosQ0FBQyxDQUNELFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCxtRkFBbUYsRUFDbkYsU0FBUyxDQUNWLENBQUMsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxJQUFJLEtBQUssQ0FBQyxDQUVWO1lBQUEsQ0FBQyxRQUFRLENBQ1g7VUFBQSxFQUFFLEdBQUcsQ0FDUDtRQUFBLEVBQUUsZUFBZSxDQUNuQjtNQUFBLEVBQUUsY0FBYyxDQUFDLFFBQVEsQ0FBQyxDQUMzQixDQUFBO0FBQ0gsQ0FBQyxDQUNGLENBQUE7QUFDRCxlQUFlLENBQUMsV0FBVyxHQUFHLGlCQUFpQixDQUFBO0FBRS9DLE1BQU0sT0FBTyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBUTlCLENBQ0UsRUFPQyxFQUNELEdBQUcsRUFDSCxFQUFFO1FBVEYsRUFDRSxJQUFJLEdBQUcsTUFBTSxFQUNiLE9BQU8sR0FBRyxTQUFTLEVBQ25CLFdBQVcsR0FBRyxXQUFXLEVBQ3pCLFNBQVMsRUFDVCxRQUFRLE9BRVQsRUFESSxLQUFLLGNBTlYsMkRBT0MsQ0FEUztJQUlWLE1BQU0sRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFVBQVUsRUFBRSxhQUFhLEVBQUUsR0FBRyxVQUFVLEVBQUUsQ0FBQTtJQUVuRSxJQUFJLFdBQVcsS0FBSyxNQUFNLEVBQUUsQ0FBQztRQUMzQixPQUFPLENBQ0wsQ0FBQyxHQUFHLENBQ0YsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUNYLDZFQUE2RSxFQUM3RSxTQUFTLENBQ1YsQ0FBQyxDQUNGLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULElBQUksS0FBSyxDQUFDLENBRVY7VUFBQSxDQUFDLFFBQVEsQ0FDWDtRQUFBLEVBQUUsR0FBRyxDQUFDLENBQ1AsQ0FBQTtJQUNILENBQUM7SUFFRCxJQUFJLFFBQVEsRUFBRSxDQUFDO1FBQ2IsT0FBTyxDQUNMLENBQUMsS0FBSyxDQUFDLElBQUksQ0FBQyxDQUFDLFVBQVUsQ0FBQyxDQUFDLFlBQVksQ0FBQyxDQUFDLGFBQWEsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLENBQzlEO1VBQUEsQ0FBQyxZQUFZLENBQ1gsWUFBWSxDQUFDLFNBQVMsQ0FDdEIsV0FBVyxDQUFDLE1BQU0sQ0FDbEIsU0FBUyxDQUFDLDhFQUE4RSxDQUN4RixLQUFLLENBQUMsQ0FDSjtnQkFDRSxpQkFBaUIsRUFBRSxvQkFBb0I7YUFFM0MsQ0FBQyxDQUNELElBQUksQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUVYO1lBQUEsQ0FBQyxXQUFXLENBQUMsU0FBUyxDQUFDLFNBQVMsQ0FDOUI7Y0FBQSxDQUFDLFVBQVUsQ0FBQyxPQUFPLEVBQUUsVUFBVSxDQUMvQjtjQUFBLENBQUMsZ0JBQWdCLENBQUMsNEJBQTRCLEVBQUUsZ0JBQWdCLENBQ2xFO1lBQUEsRUFBRSxXQUFXLENBQ2I7WUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsNkJBQTZCLENBQUMsQ0FBQyxRQUFRLENBQUMsRUFBRSxHQUFHLENBQzlEO1VBQUEsRUFBRSxZQUFZLENBQ2hCO1FBQUEsRUFBRSxLQUFLLENBQUMsQ0FDVCxDQUFBO0lBQ0gsQ0FBQztJQUVELE9BQU8sQ0FDTCxDQUFDLEdBQUcsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsb0RBQW9ELENBQzlELFVBQVUsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUNsQixnQkFBZ0IsQ0FBQyxDQUFDLEtBQUssS0FBSyxXQUFXLENBQUMsQ0FBQyxDQUFDLFdBQVcsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQzNELFlBQVksQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUN0QixTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FFaEI7UUFBQSxDQUFDLHFEQUFxRCxDQUN0RDtRQUFBLENBQUMsR0FBRyxDQUNGLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCx5RkFBeUYsRUFDekYsd0NBQXdDLEVBQ3hDLG9DQUFvQyxFQUNwQyxPQUFPLEtBQUssVUFBVSxJQUFJLE9BQU8sS0FBSyxPQUFPO1lBQzNDLENBQUMsQ0FBQyxzRkFBc0Y7WUFDeEYsQ0FBQyxDQUFDLHdEQUF3RCxDQUM3RCxDQUFDLEVBRUo7UUFBQSxDQUFDLEdBQUcsQ0FDRixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsc0hBQXNILEVBQ3RILElBQUksS0FBSyxNQUFNO1lBQ2IsQ0FBQyxDQUFDLGdGQUFnRjtZQUNsRixDQUFDLENBQUMsa0ZBQWtGO1FBQ3RGLHNEQUFzRDtRQUN0RCxPQUFPLEtBQUssVUFBVSxJQUFJLE9BQU8sS0FBSyxPQUFPO1lBQzNDLENBQUMsQ0FBQywrRkFBK0Y7WUFDakcsQ0FBQyxDQUFDLHlIQUF5SCxFQUM3SCxTQUFTLENBQ1YsQ0FBQyxDQUNGLElBQUksS0FBSyxDQUFDLENBRVY7VUFBQSxDQUFDLEdBQUcsQ0FDRixZQUFZLENBQUMsU0FBUyxDQUN0QixTQUFTLENBQUMsK01BQStNLENBRXpOO1lBQUEsQ0FBQyxRQUFRLENBQ1g7VUFBQSxFQUFFLEdBQUcsQ0FDUDtRQUFBLEVBQUUsR0FBRyxDQUNQO01BQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUNGLENBQUE7QUFDRCxPQUFPLENBQUMsV0FBVyxHQUFHLFNBQVMsQ0FBQTtBQUUvQixNQUFNLGNBQWMsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUdyQyxDQUFDLEVBQWdDLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBekMsRUFBRSxTQUFTLEVBQUUsT0FBTyxPQUFZLEVBQVAsS0FBSyxjQUE5Qix3QkFBZ0MsQ0FBRjtJQUMvQixNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsVUFBVSxFQUFFLENBQUE7SUFFdEMsT0FBTyxDQUNMLENBQUMsTUFBTSxDQUNMLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFlBQVksQ0FBQyxTQUFTLENBQ3RCLE9BQU8sQ0FBQyxPQUFPLENBQ2YsSUFBSSxDQUFDLE1BQU0sQ0FDWCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsU0FBUyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQ3BDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxFQUFFLEVBQUU7WUFDakIsT0FBTyxhQUFQLE9BQU8sdUJBQVAsT0FBTyxDQUFHLEtBQUssQ0FBQyxDQUFBO1lBQ2hCLGFBQWEsRUFBRSxDQUFBO1FBQ2pCLENBQUMsQ0FBQyxDQUNGLElBQUksS0FBSyxDQUFDLENBRVY7TUFBQSxDQUFDLGdCQUFnQixDQUFDLEFBQUQsRUFDakI7TUFBQSxDQUFDLElBQUksQ0FBQyxTQUFTLENBQUMsU0FBUyxDQUFDLGNBQWMsRUFBRSxJQUFJLENBQ2hEO0lBQUEsRUFBRSxNQUFNLENBQUMsQ0FDVixDQUFBO0FBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDRixjQUFjLENBQUMsV0FBVyxHQUFHLGdCQUFnQixDQUFBO0FBRTdDLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR2xDLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUN0QixNQUFNLEVBQUUsYUFBYSxFQUFFLEdBQUcsVUFBVSxFQUFFLENBQUE7SUFFdEMsT0FBTyxDQUNMLENBQUMsTUFBTSxDQUNMLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFlBQVksQ0FBQyxNQUFNLENBQ25CLFVBQVUsQ0FBQyxnQkFBZ0IsQ0FDM0IsUUFBUSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FDYixPQUFPLENBQUMsQ0FBQyxhQUFhLENBQUMsQ0FDdkIsS0FBSyxDQUFDLGdCQUFnQixDQUN0QixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsaVBBQWlQLEVBQ2pQLDRFQUE0RSxFQUM1RSx3SEFBd0gsRUFDeEgseUpBQXlKLEVBQ3pKLDJEQUEyRCxFQUMzRCwyREFBMkQsRUFDM0QsU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtBQUNILENBQUMsQ0FBQyxDQUFBO0FBQ0YsV0FBVyxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUE7QUFFdkMsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHbkMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQ3RCLE9BQU8sQ0FDTCxDQUFDLElBQUksQ0FDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsb0RBQW9ELEVBQ3BELDhNQUE4TSxFQUM5TSxTQUFTLENBQ1YsQ0FBQyxDQUNGLElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDRixZQUFZLENBQUMsV0FBVyxHQUFHLGNBQWMsQ0FBQTtBQUV6QyxNQUFNLFlBQVksR0FBRyxLQUFLLENBQUMsVUFBVSxDQUduQyxDQUFDLEVBQXVCLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBaEMsRUFBRSxTQUFTLE9BQVksRUFBUCxLQUFLLGNBQXJCLGFBQXVCLENBQUY7SUFDdEIsT0FBTyxDQUNMLENBQUMsS0FBSyxDQUNKLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFlBQVksQ0FBQyxPQUFPLENBQ3BCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCwyRkFBMkYsRUFDM0YsU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtBQUNILENBQUMsQ0FBQyxDQUFBO0FBQ0YsWUFBWSxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUE7QUFFekMsTUFBTSxhQUFhLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHcEMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQ3RCLE9BQU8sQ0FDTCxDQUFDLEdBQUcsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxZQUFZLENBQUMsUUFBUSxDQUNyQixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMseUJBQXlCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDcEQsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7QUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNGLGFBQWEsQ0FBQyxXQUFXLEdBQUcsZUFBZSxDQUFBO0FBRTNDLE1BQU0sYUFBYSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR3BDLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUN0QixPQUFPLENBQ0wsQ0FBQyxHQUFHLENBQ0YsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsWUFBWSxDQUFDLFFBQVEsQ0FDckIsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLHlCQUF5QixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQ3BELElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDRixhQUFhLENBQUMsV0FBVyxHQUFHLGVBQWUsQ0FBQTtBQUUzQyxNQUFNLGdCQUFnQixHQUFHLEtBQUssQ0FBQyxVQUFVLENBR3ZDLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUN0QixPQUFPLENBQ0wsQ0FBQyxTQUFTLENBQ1IsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsWUFBWSxDQUFDLFdBQVcsQ0FDeEIsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLCtCQUErQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQzFELElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0FBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDRixnQkFBZ0IsQ0FBQyxXQUFXLEdBQUcsa0JBQWtCLENBQUE7QUFFakQsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHckMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQ3RCLE9BQU8sQ0FDTCxDQUFDLEdBQUcsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxZQUFZLENBQUMsU0FBUyxDQUN0QixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsZ0dBQWdHLEVBQ2hHLFNBQVMsQ0FDVixDQUFDLENBQ0YsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7QUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNGLGNBQWMsQ0FBQyxXQUFXLEdBQUcsZ0JBQWdCLENBQUE7QUFFN0MsTUFBTSxZQUFZLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHbkMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQ3RCLE9BQU8sQ0FDTCxDQUFDLEdBQUcsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxZQUFZLENBQUMsT0FBTyxDQUNwQixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsMkNBQTJDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDdEUsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7QUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNGLFlBQVksQ0FBQyxXQUFXLEdBQUcsY0FBYyxDQUFBO0FBRXpDLE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHeEMsQ0FBQyxFQUF3QyxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWpELEVBQUUsU0FBUyxFQUFFLE9BQU8sR0FBRyxLQUFLLE9BQVksRUFBUCxLQUFLLGNBQXRDLHdCQUF3QyxDQUFGO0lBQ3ZDLE1BQU0sSUFBSSxHQUFHLE9BQU8sQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUE7SUFFbkMsT0FBTyxDQUNMLENBQUMsSUFBSSxDQUNILEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFlBQVksQ0FBQyxhQUFhLENBQzFCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCx3T0FBd08sRUFDeE8sNkVBQTZFLEVBQzdFLFNBQVMsQ0FDVixDQUFDLENBQ0YsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7QUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNGLGlCQUFpQixDQUFDLFdBQVcsR0FBRyxtQkFBbUIsQ0FBQTtBQUVuRCxNQUFNLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxVQUFVLENBR3pDLENBQUMsRUFBd0MsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFqRCxFQUFFLFNBQVMsRUFBRSxPQUFPLEdBQUcsS0FBSyxPQUFZLEVBQVAsS0FBSyxjQUF0Qyx3QkFBd0MsQ0FBRjtJQUN2QyxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFBO0lBRXRDLE9BQU8sQ0FDTCxDQUFDLElBQUksQ0FDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxZQUFZLENBQUMsY0FBYyxDQUMzQixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsMFJBQTBSO1FBQzFSLGtEQUFrRDtRQUNsRCwrQ0FBK0MsRUFDL0Msc0NBQXNDLEVBQ3RDLFNBQVMsQ0FDVixDQUFDLENBQ0YsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7QUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNGLGtCQUFrQixDQUFDLFdBQVcsR0FBRyxvQkFBb0IsQ0FBQTtBQUVyRCxNQUFNLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxVQUFVLENBRzFDLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUFZLE9BQUEsQ0FDbEMsQ0FBQyxHQUFHLENBQ0YsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsWUFBWSxDQUFDLGVBQWUsQ0FDNUIsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLGdCQUFnQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQzNDLElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsbUJBQW1CLENBQUMsV0FBVyxHQUFHLHFCQUFxQixDQUFBO0FBRXZELE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR2xDLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUFZLE9BQUEsQ0FDbEMsQ0FBQyxFQUFFLENBQ0QsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsWUFBWSxDQUFDLE1BQU0sQ0FDbkIsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQy9ELElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsV0FBVyxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUE7QUFFdkMsTUFBTSxlQUFlLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHdEMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLEVBQUUsQ0FDRCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxZQUFZLENBQUMsV0FBVyxDQUN4QixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsMEJBQTBCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDckQsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7Q0FBQSxDQUFDLENBQUE7QUFDRixlQUFlLENBQUMsV0FBVyxHQUFHLGlCQUFpQixDQUFBO0FBRS9DLE1BQU0seUJBQXlCLEdBQUcsR0FBRyxDQUNuQyxtekJBQW16QixFQUNuekI7SUFDRSxRQUFRLEVBQUU7UUFDUixPQUFPLEVBQUU7WUFDUCxPQUFPLEVBQUUsOERBQThEO1lBQ3ZFLE9BQU8sRUFDTCw4S0FBOEs7U0FDakw7UUFDRCxJQUFJLEVBQUU7WUFDSixPQUFPLEVBQUUsYUFBYTtZQUN0QixFQUFFLEVBQUUsYUFBYTtZQUNqQixFQUFFLEVBQUUsaURBQWlEO1NBQ3REO0tBQ0Y7SUFDRCxlQUFlLEVBQUU7UUFDZixPQUFPLEVBQUUsU0FBUztRQUNsQixJQUFJLEVBQUUsU0FBUztLQUNoQjtDQUNGLENBQ0YsQ0FBQTtBQUVELE1BQU0saUJBQWlCLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FReEMsQ0FDRSxFQVFDLEVBQ0QsR0FBRyxFQUNILEVBQUU7UUFWRixFQUNFLE9BQU8sR0FBRyxLQUFLLEVBQ2YsUUFBUSxHQUFHLEtBQUssRUFDaEIsT0FBTyxHQUFHLFNBQVMsRUFDbkIsSUFBSSxHQUFHLFNBQVMsRUFDaEIsT0FBTyxFQUNQLFNBQVMsT0FFVixFQURJLEtBQUssY0FQVixrRUFRQyxDQURTO0lBSVYsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQTtJQUN0QyxNQUFNLEVBQUUsUUFBUSxFQUFFLEtBQUssRUFBRSxHQUFHLFVBQVUsRUFBRSxDQUFBO0lBRXhDLE1BQU0sTUFBTSxHQUFHLENBQ2IsQ0FBQyxJQUFJLENBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsWUFBWSxDQUFDLGFBQWEsQ0FDMUIsU0FBUyxDQUFDLENBQUMsSUFBSSxDQUFDLENBQ2hCLFdBQVcsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUN0QixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMseUJBQXlCLENBQUMsRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRSxTQUFTLENBQUMsQ0FBQyxDQUN2RSxJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtJQUVELElBQUksQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUNiLE9BQU8sTUFBTSxDQUFBO0lBQ2YsQ0FBQztJQUVELElBQUksT0FBTyxPQUFPLEtBQUssUUFBUSxFQUFFLENBQUM7UUFDaEMsT0FBTyxHQUFHO1lBQ1IsUUFBUSxFQUFFLE9BQU87U0FDbEIsQ0FBQTtJQUNILENBQUM7SUFFRCxPQUFPLENBQ0wsQ0FBQyxPQUFPLENBQ047UUFBQSxDQUFDLGNBQWMsQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsRUFBRSxjQUFjLENBQ2hEO1FBQUEsQ0FBQyxjQUFjLENBQ2IsSUFBSSxDQUFDLE9BQU8sQ0FDWixLQUFLLENBQUMsUUFBUSxDQUNkLE1BQU0sQ0FBQyxDQUFDLEtBQUssS0FBSyxXQUFXLElBQUksUUFBUSxDQUFDLENBQzFDLElBQUksT0FBTyxDQUFDLEVBRWhCO01BQUEsRUFBRSxPQUFPLENBQUMsQ0FDWCxDQUFBO0FBQ0gsQ0FBQyxDQUNGLENBQUE7QUFDRCxpQkFBaUIsQ0FBQyxXQUFXLEdBQUcsbUJBQW1CLENBQUE7QUFFbkQsTUFBTSxpQkFBaUIsR0FBRyxLQUFLLENBQUMsVUFBVSxDQU14QyxDQUFDLEVBQTZELEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBdEUsRUFBRSxTQUFTLEVBQUUsT0FBTyxHQUFHLEtBQUssRUFBRSxXQUFXLEdBQUcsS0FBSyxPQUFZLEVBQVAsS0FBSyxjQUEzRCx1Q0FBNkQsQ0FBRjtJQUM1RCxNQUFNLElBQUksR0FBRyxPQUFPLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsUUFBUSxDQUFBO0lBRXRDLE9BQU8sQ0FDTCxDQUFDLElBQUksQ0FDSCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxZQUFZLENBQUMsYUFBYSxDQUMxQixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsZ1ZBQWdWO1FBQ2hWLGtEQUFrRDtRQUNsRCwrQ0FBK0MsRUFDL0MsdUNBQXVDLEVBQ3ZDLDhDQUE4QyxFQUM5Qyx5Q0FBeUMsRUFDekMsc0NBQXNDLEVBQ3RDLFdBQVc7WUFDVCwwTEFBMEwsRUFDNUwsU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtBQUNILENBQUMsQ0FBQyxDQUFBO0FBQ0YsaUJBQWlCLENBQUMsV0FBVyxHQUFHLG1CQUFtQixDQUFBO0FBRW5ELE1BQU0sZ0JBQWdCLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHdkMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLEdBQUcsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxZQUFZLENBQUMsWUFBWSxDQUN6QixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsd0tBQXdLLEVBQ3hLLDBIQUEwSCxFQUMxSCx1Q0FBdUMsRUFDdkMsOENBQThDLEVBQzlDLHlDQUF5QyxFQUN6QyxzQ0FBc0MsRUFDdEMsU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLGdCQUFnQixDQUFDLFdBQVcsR0FBRyxrQkFBa0IsQ0FBQTtBQUVqRCxNQUFNLG1CQUFtQixHQUFHLEtBQUssQ0FBQyxVQUFVLENBSzFDLENBQUMsRUFBeUMsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFsRCxFQUFFLFNBQVMsRUFBRSxRQUFRLEdBQUcsS0FBSyxPQUFZLEVBQVAsS0FBSyxjQUF2Qyx5QkFBeUMsQ0FBRjtJQUN4QyxrQ0FBa0M7SUFDbEMsTUFBTSxLQUFLLEdBQUcsS0FBSyxDQUFDLE9BQU8sQ0FBQyxHQUFHLEVBQUU7UUFDL0IsT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLE1BQU0sRUFBRSxHQUFHLEVBQUUsQ0FBQyxHQUFHLEVBQUUsR0FBRyxDQUFBO0lBQ2xELENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQTtJQUVOLE9BQU8sQ0FDTCxDQUFDLEdBQUcsQ0FDRixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxZQUFZLENBQUMsZUFBZSxDQUM1QixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsNkNBQTZDLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDeEUsSUFBSSxLQUFLLENBQUMsQ0FFVjtNQUFBLENBQUMsUUFBUSxJQUFJLENBQ1gsQ0FBQyxRQUFRLENBQ1AsU0FBUyxDQUFDLG1CQUFtQixDQUM3QixZQUFZLENBQUMsb0JBQW9CLEVBQ2pDLENBQ0gsQ0FDRDtNQUFBLENBQUMsUUFBUSxDQUNQLFNBQVMsQ0FBQyxxQ0FBcUMsQ0FDL0MsWUFBWSxDQUFDLG9CQUFvQixDQUNqQyxLQUFLLENBQUMsQ0FDSjtZQUNFLGtCQUFrQixFQUFFLEtBQUs7U0FFN0IsQ0FBQyxFQUVMO0lBQUEsRUFBRSxHQUFHLENBQUMsQ0FDUCxDQUFBO0FBQ0gsQ0FBQyxDQUFDLENBQUE7QUFDRixtQkFBbUIsQ0FBQyxXQUFXLEdBQUcscUJBQXFCLENBQUE7QUFFdkQsTUFBTSxjQUFjLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHckMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLEVBQUUsQ0FDRCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxZQUFZLENBQUMsVUFBVSxDQUN2QixTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsZ0dBQWdHLEVBQ2hHLHNDQUFzQyxFQUN0QyxTQUFTLENBQ1YsQ0FBQyxDQUNGLElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsY0FBYyxDQUFDLFdBQVcsR0FBRyxnQkFBZ0IsQ0FBQTtBQUU3QyxNQUFNLGtCQUFrQixHQUFHLEtBQUssQ0FBQyxVQUFVLENBR3pDLENBQUMsRUFBWSxFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhCLEtBQUssY0FBVixFQUFZLENBQUY7SUFBWSxPQUFBLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQUksS0FBSyxDQUFDLEVBQUcsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNyRCxrQkFBa0IsQ0FBQyxXQUFXLEdBQUcsb0JBQW9CLENBQUE7QUFFckQsTUFBTSxvQkFBb0IsR0FBRyxLQUFLLENBQUMsVUFBVSxDQU8zQyxDQUFDLEVBQStELEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBeEUsRUFBRSxPQUFPLEdBQUcsS0FBSyxFQUFFLElBQUksR0FBRyxJQUFJLEVBQUUsUUFBUSxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBN0QsNENBQStELENBQUY7SUFDOUQsTUFBTSxJQUFJLEdBQUcsT0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtJQUVqQyxPQUFPLENBQ0wsQ0FBQyxJQUFJLENBQ0gsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsWUFBWSxDQUFDLGlCQUFpQixDQUM5QixTQUFTLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FDaEIsV0FBVyxDQUFDLENBQUMsUUFBUSxDQUFDLENBQ3RCLFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCw2ZUFBNmUsRUFDN2Usd0ZBQXdGLEVBQ3hGLElBQUksS0FBSyxJQUFJLElBQUksU0FBUyxFQUMxQixJQUFJLEtBQUssSUFBSSxJQUFJLFNBQVMsRUFDMUIsc0NBQXNDLEVBQ3RDLFNBQVMsQ0FDVixDQUFDLENBQ0YsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7QUFDSCxDQUFDLENBQUMsQ0FBQTtBQUNGLG9CQUFvQixDQUFDLFdBQVcsR0FBRyxzQkFBc0IsQ0FBQTtBQUV6RCxPQUFPLEVBQ0wsT0FBTyxFQUNQLGNBQWMsRUFDZCxhQUFhLEVBQ2IsWUFBWSxFQUNaLGtCQUFrQixFQUNsQixtQkFBbUIsRUFDbkIsaUJBQWlCLEVBQ2pCLGFBQWEsRUFDYixZQUFZLEVBQ1osWUFBWSxFQUNaLFdBQVcsRUFDWCxpQkFBaUIsRUFDakIsZ0JBQWdCLEVBQ2hCLGlCQUFpQixFQUNqQixlQUFlLEVBQ2YsbUJBQW1CLEVBQ25CLGNBQWMsRUFDZCxvQkFBb0IsRUFDcEIsa0JBQWtCLEVBQ2xCLGVBQWUsRUFDZixXQUFXLEVBQ1gsZ0JBQWdCLEVBQ2hCLGNBQWMsRUFDZCxVQUFVLEdBQ1gsQ0FBQSJ9
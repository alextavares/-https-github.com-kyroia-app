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
const Table = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<div className="relative w-full overflow-auto">
    <table ref={ref} className={cn("w-full caption-bottom text-sm", className)} {...props}/>
  </div>);
});
Table.displayName = "Table";
const TableHeader = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<thead ref={ref} className={cn("[&_tr]:border-b", className)} {...props}/>);
});
TableHeader.displayName = "TableHeader";
const TableBody = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<tbody ref={ref} className={cn("[&_tr:last-child]:border-0", className)} {...props}/>);
});
TableBody.displayName = "TableBody";
const TableFooter = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<tfoot ref={ref} className={cn("border-t bg-muted/50 font-medium [&>tr]:last:border-b-0", className)} {...props}/>);
});
TableFooter.displayName = "TableFooter";
const TableRow = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<tr ref={ref} className={cn("border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted", className)} {...props}/>);
});
TableRow.displayName = "TableRow";
const TableHead = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<th ref={ref} className={cn("h-10 px-2 text-left align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)} {...props}/>);
});
TableHead.displayName = "TableHead";
const TableCell = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<td ref={ref} className={cn("p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]", className)} {...props}/>);
});
TableCell.displayName = "TableCell";
const TableCaption = React.forwardRef((_a, ref) => {
    var { className } = _a, props = __rest(_a, ["className"]);
    return (<caption ref={ref} className={cn("mt-4 text-sm text-muted-foreground", className)} {...props}/>);
});
TableCaption.displayName = "TableCaption";
export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption, };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidGFibGUuanN4Iiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidGFibGUudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7O0FBQUEsT0FBTyxLQUFLLEtBQUssTUFBTSxPQUFPLENBQUE7QUFFOUIsT0FBTyxFQUFFLEVBQUUsRUFBRSxNQUFNLGFBQWEsQ0FBQTtBQUVoQyxNQUFNLEtBQUssR0FBRyxLQUFLLENBQUMsVUFBVSxDQUc1QixDQUFDLEVBQXVCLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBaEMsRUFBRSxTQUFTLE9BQVksRUFBUCxLQUFLLGNBQXJCLGFBQXVCLENBQUY7SUFBWSxPQUFBLENBQ2xDLENBQUMsR0FBRyxDQUFDLFNBQVMsQ0FBQywrQkFBK0IsQ0FDNUM7SUFBQSxDQUFDLEtBQUssQ0FDSixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsK0JBQStCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDMUQsSUFBSSxLQUFLLENBQUMsRUFFZDtFQUFBLEVBQUUsR0FBRyxDQUFDLENBQ1AsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLEtBQUssQ0FBQyxXQUFXLEdBQUcsT0FBTyxDQUFBO0FBRTNCLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR2xDLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUFZLE9BQUEsQ0FDbEMsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUMsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLGlCQUFpQixFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsRUFBRyxDQUM1RSxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsV0FBVyxDQUFDLFdBQVcsR0FBRyxhQUFhLENBQUE7QUFFdkMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHaEMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLEtBQUssQ0FDSixHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQUMsNEJBQTRCLEVBQUUsU0FBUyxDQUFDLENBQUMsQ0FDdkQsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7Q0FBQSxDQUFDLENBQUE7QUFDRixTQUFTLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQTtBQUVuQyxNQUFNLFdBQVcsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUdsQyxDQUFDLEVBQXVCLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBaEMsRUFBRSxTQUFTLE9BQVksRUFBUCxLQUFLLGNBQXJCLGFBQXVCLENBQUY7SUFBWSxPQUFBLENBQ2xDLENBQUMsS0FBSyxDQUNKLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCx5REFBeUQsRUFDekQsU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLFdBQVcsQ0FBQyxXQUFXLEdBQUcsYUFBYSxDQUFBO0FBRXZDLE1BQU0sUUFBUSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBRy9CLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUFZLE9BQUEsQ0FDbEMsQ0FBQyxFQUFFLENBQ0QsR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUNYLDZFQUE2RSxFQUM3RSxTQUFTLENBQ1YsQ0FBQyxDQUNGLElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsUUFBUSxDQUFDLFdBQVcsR0FBRyxVQUFVLENBQUE7QUFFakMsTUFBTSxTQUFTLEdBQUcsS0FBSyxDQUFDLFVBQVUsQ0FHaEMsQ0FBQyxFQUF1QixFQUFFLEdBQUcsRUFBRSxFQUFFO1FBQWhDLEVBQUUsU0FBUyxPQUFZLEVBQVAsS0FBSyxjQUFyQixhQUF1QixDQUFGO0lBQVksT0FBQSxDQUNsQyxDQUFDLEVBQUUsQ0FDRCxHQUFHLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FDVCxTQUFTLENBQUMsQ0FBQyxFQUFFLENBQ1gsd0lBQXdJLEVBQ3hJLFNBQVMsQ0FDVixDQUFDLENBQ0YsSUFBSSxLQUFLLENBQUMsRUFDVixDQUNILENBQUE7Q0FBQSxDQUFDLENBQUE7QUFDRixTQUFTLENBQUMsV0FBVyxHQUFHLFdBQVcsQ0FBQTtBQUVuQyxNQUFNLFNBQVMsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUdoQyxDQUFDLEVBQXVCLEVBQUUsR0FBRyxFQUFFLEVBQUU7UUFBaEMsRUFBRSxTQUFTLE9BQVksRUFBUCxLQUFLLGNBQXJCLGFBQXVCLENBQUY7SUFBWSxPQUFBLENBQ2xDLENBQUMsRUFBRSxDQUNELEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxDQUNULFNBQVMsQ0FBQyxDQUFDLEVBQUUsQ0FDWCxzRkFBc0YsRUFDdEYsU0FBUyxDQUNWLENBQUMsQ0FDRixJQUFJLEtBQUssQ0FBQyxFQUNWLENBQ0gsQ0FBQTtDQUFBLENBQUMsQ0FBQTtBQUNGLFNBQVMsQ0FBQyxXQUFXLEdBQUcsV0FBVyxDQUFBO0FBRW5DLE1BQU0sWUFBWSxHQUFHLEtBQUssQ0FBQyxVQUFVLENBR25DLENBQUMsRUFBdUIsRUFBRSxHQUFHLEVBQUUsRUFBRTtRQUFoQyxFQUFFLFNBQVMsT0FBWSxFQUFQLEtBQUssY0FBckIsYUFBdUIsQ0FBRjtJQUFZLE9BQUEsQ0FDbEMsQ0FBQyxPQUFPLENBQ04sR0FBRyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQ1QsU0FBUyxDQUFDLENBQUMsRUFBRSxDQUFDLG9DQUFvQyxFQUFFLFNBQVMsQ0FBQyxDQUFDLENBQy9ELElBQUksS0FBSyxDQUFDLEVBQ1YsQ0FDSCxDQUFBO0NBQUEsQ0FBQyxDQUFBO0FBQ0YsWUFBWSxDQUFDLFdBQVcsR0FBRyxjQUFjLENBQUE7QUFFekMsT0FBTyxFQUNMLEtBQUssRUFDTCxXQUFXLEVBQ1gsU0FBUyxFQUNULFdBQVcsRUFDWCxTQUFTLEVBQ1QsUUFBUSxFQUNSLFNBQVMsRUFDVCxZQUFZLEdBQ2IsQ0FBQSJ9
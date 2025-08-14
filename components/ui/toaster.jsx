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
import { useToast } from "@/hooks/use-toast";
import { Toast, ToastClose, ToastDescription, ToastProvider, ToastTitle, ToastViewport, } from "@/components/ui/toast";
export function Toaster() {
    const { toasts } = useToast();
    return (<ToastProvider>
      {toasts.map(function (_a) {
            var { id, title, description, action } = _a, props = __rest(_a, ["id", "title", "description", "action"]);
            return (<Toast key={id} {...props}>
            <div className="grid gap-1">
              {title && <ToastTitle>{title}</ToastTitle>}
              {description && (<ToastDescription>{description}</ToastDescription>)}
            </div>
            {action}
            <ToastClose />
          </Toast>);
        })}
      <ToastViewport />
    </ToastProvider>);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidG9hc3Rlci5qc3giLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyJ0b2FzdGVyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7Ozs7Ozs7Ozs7OztBQUVaLE9BQU8sRUFBRSxRQUFRLEVBQUUsTUFBTSxtQkFBbUIsQ0FBQTtBQUM1QyxPQUFPLEVBQ0wsS0FBSyxFQUNMLFVBQVUsRUFDVixnQkFBZ0IsRUFDaEIsYUFBYSxFQUNiLFVBQVUsRUFDVixhQUFhLEdBQ2QsTUFBTSx1QkFBdUIsQ0FBQTtBQUU5QixNQUFNLFVBQVUsT0FBTztJQUNyQixNQUFNLEVBQUUsTUFBTSxFQUFFLEdBQUcsUUFBUSxFQUFFLENBQUE7SUFFN0IsT0FBTyxDQUNMLENBQUMsYUFBYSxDQUNaO01BQUEsQ0FBQyxNQUFNLENBQUMsR0FBRyxDQUFDLFVBQVUsRUFBNEM7Z0JBQTVDLEVBQUUsRUFBRSxFQUFFLEtBQUssRUFBRSxXQUFXLEVBQUUsTUFBTSxPQUFZLEVBQVAsS0FBSyxjQUExQyx3Q0FBNEMsQ0FBRjtZQUM5RCxPQUFPLENBQ0wsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsSUFBSSxLQUFLLENBQUMsQ0FDeEI7WUFBQSxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsWUFBWSxDQUN6QjtjQUFBLENBQUMsS0FBSyxJQUFJLENBQUMsVUFBVSxDQUFDLENBQUMsS0FBSyxDQUFDLEVBQUUsVUFBVSxDQUFDLENBQzFDO2NBQUEsQ0FBQyxXQUFXLElBQUksQ0FDZCxDQUFDLGdCQUFnQixDQUFDLENBQUMsV0FBVyxDQUFDLEVBQUUsZ0JBQWdCLENBQUMsQ0FDbkQsQ0FDSDtZQUFBLEVBQUUsR0FBRyxDQUNMO1lBQUEsQ0FBQyxNQUFNLENBQ1A7WUFBQSxDQUFDLFVBQVUsQ0FBQyxBQUFELEVBQ2I7VUFBQSxFQUFFLEtBQUssQ0FBQyxDQUNULENBQUE7UUFDSCxDQUFDLENBQUMsQ0FDRjtNQUFBLENBQUMsYUFBYSxDQUFDLEFBQUQsRUFDaEI7SUFBQSxFQUFFLGFBQWEsQ0FBQyxDQUNqQixDQUFBO0FBQ0gsQ0FBQyJ9
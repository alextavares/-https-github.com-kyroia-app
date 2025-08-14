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
// Inspired by react-hot-toast library
import * as React from "react";
const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;
const actionTypes = {
    ADD_TOAST: "ADD_TOAST",
    UPDATE_TOAST: "UPDATE_TOAST",
    DISMISS_TOAST: "DISMISS_TOAST",
    REMOVE_TOAST: "REMOVE_TOAST",
};
let count = 0;
function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER;
    return count.toString();
}
const toastTimeouts = new Map();
const addToRemoveQueue = (toastId) => {
    if (toastTimeouts.has(toastId)) {
        return;
    }
    const timeout = setTimeout(() => {
        toastTimeouts.delete(toastId);
        dispatch({
            type: "REMOVE_TOAST",
            toastId: toastId,
        });
    }, TOAST_REMOVE_DELAY);
    toastTimeouts.set(toastId, timeout);
};
export const reducer = (state, action) => {
    switch (action.type) {
        case "ADD_TOAST":
            return Object.assign(Object.assign({}, state), { toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) });
        case "UPDATE_TOAST":
            return Object.assign(Object.assign({}, state), { toasts: state.toasts.map((t) => t.id === action.toast.id ? Object.assign(Object.assign({}, t), action.toast) : t) });
        case "DISMISS_TOAST": {
            const { toastId } = action;
            // ! Side effects ! - This could be extracted into a dismissToast() action,
            // but I'll keep it here for simplicity
            if (toastId) {
                addToRemoveQueue(toastId);
            }
            else {
                state.toasts.forEach((toast) => {
                    addToRemoveQueue(toast.id);
                });
            }
            return Object.assign(Object.assign({}, state), { toasts: state.toasts.map((t) => t.id === toastId || toastId === undefined
                    ? Object.assign(Object.assign({}, t), { open: false }) : t) });
        }
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                return Object.assign(Object.assign({}, state), { toasts: [] });
            }
            return Object.assign(Object.assign({}, state), { toasts: state.toasts.filter((t) => t.id !== action.toastId) });
    }
};
const listeners = [];
let memoryState = { toasts: [] };
function dispatch(action) {
    memoryState = reducer(memoryState, action);
    listeners.forEach((listener) => {
        listener(memoryState);
    });
}
function toast(_a) {
    var props = __rest(_a, []);
    const id = genId();
    const update = (props) => dispatch({
        type: "UPDATE_TOAST",
        toast: Object.assign(Object.assign({}, props), { id }),
    });
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id });
    dispatch({
        type: "ADD_TOAST",
        toast: Object.assign(Object.assign({}, props), { id, open: true, onOpenChange: (open) => {
                if (!open)
                    dismiss();
            } }),
    });
    return {
        id: id,
        dismiss,
        update,
    };
}
function useToast() {
    const [state, setState] = React.useState(memoryState);
    React.useEffect(() => {
        listeners.push(setState);
        return () => {
            const index = listeners.indexOf(setState);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }, [state]);
    return Object.assign(Object.assign({}, state), { toast, dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }) });
}
export { useToast, toast };
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoidXNlLXRvYXN0LmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsidXNlLXRvYXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiJBQUFBLFlBQVksQ0FBQTs7Ozs7Ozs7Ozs7O0FBRVosc0NBQXNDO0FBQ3RDLE9BQU8sS0FBSyxLQUFLLE1BQU0sT0FBTyxDQUFBO0FBTzlCLE1BQU0sV0FBVyxHQUFHLENBQUMsQ0FBQTtBQUNyQixNQUFNLGtCQUFrQixHQUFHLE9BQU8sQ0FBQTtBQVNsQyxNQUFNLFdBQVcsR0FBRztJQUNsQixTQUFTLEVBQUUsV0FBVztJQUN0QixZQUFZLEVBQUUsY0FBYztJQUM1QixhQUFhLEVBQUUsZUFBZTtJQUM5QixZQUFZLEVBQUUsY0FBYztDQUNwQixDQUFBO0FBRVYsSUFBSSxLQUFLLEdBQUcsQ0FBQyxDQUFBO0FBRWIsU0FBUyxLQUFLO0lBQ1osS0FBSyxHQUFHLENBQUMsS0FBSyxHQUFHLENBQUMsQ0FBQyxHQUFHLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQTtJQUM3QyxPQUFPLEtBQUssQ0FBQyxRQUFRLEVBQUUsQ0FBQTtBQUN6QixDQUFDO0FBMEJELE1BQU0sYUFBYSxHQUFHLElBQUksR0FBRyxFQUF5QyxDQUFBO0FBRXRFLE1BQU0sZ0JBQWdCLEdBQUcsQ0FBQyxPQUFlLEVBQUUsRUFBRTtJQUMzQyxJQUFJLGFBQWEsQ0FBQyxHQUFHLENBQUMsT0FBTyxDQUFDLEVBQUUsQ0FBQztRQUMvQixPQUFNO0lBQ1IsQ0FBQztJQUVELE1BQU0sT0FBTyxHQUFHLFVBQVUsQ0FBQyxHQUFHLEVBQUU7UUFDOUIsYUFBYSxDQUFDLE1BQU0sQ0FBQyxPQUFPLENBQUMsQ0FBQTtRQUM3QixRQUFRLENBQUM7WUFDUCxJQUFJLEVBQUUsY0FBYztZQUNwQixPQUFPLEVBQUUsT0FBTztTQUNqQixDQUFDLENBQUE7SUFDSixDQUFDLEVBQUUsa0JBQWtCLENBQUMsQ0FBQTtJQUV0QixhQUFhLENBQUMsR0FBRyxDQUFDLE9BQU8sRUFBRSxPQUFPLENB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
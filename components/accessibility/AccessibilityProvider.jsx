'use client';
import { createContext, useContext, useEffect, useState } from 'react';
const AccessibilityContext = createContext(undefined);
export function useAccessibility() {
    const context = useContext(AccessibilityContext);
    if (context === undefined) {
        throw new Error('useAccessibility must be used within an AccessibilityProvider');
    }
    return context;
}
export function AccessibilityProvider({ children }) {
    const [highContrast, setHighContrast] = useState(false);
    const [reducedMotion, setReducedMotion] = useState(false);
    const [fontSize, setFontSize] = useState('medium');
    const [announcements, setAnnouncements] = useState([]);
    // Detect user preferences on mount
    useEffect(() => {
        // Check for prefers-reduced-motion
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReducedMotion(mediaQuery.matches);
        const handleChange = (e) => {
            setReducedMotion(e.matches);
        };
        mediaQuery.addEventListener('change', handleChange);
        return () => mediaQuery.removeEventListener('change', handleChange);
    }, []);
    // Apply accessibility styles
    useEffect(() => {
        const root = document.documentElement;
        if (highContrast) {
            root.classList.add('accessibility-high-contrast');
        }
        else {
            root.classList.remove('accessibility-high-contrast');
        }
        if (reducedMotion) {
            root.classList.add('accessibility-reduced-motion');
        }
        else {
            root.classList.remove('accessibility-reduced-motion');
        }
        root.classList.remove('accessibility-font-small', 'accessibility-font-medium', 'accessibility-font-large');
        root.classList.add(`accessibility-font-${fontSize}`);
    }, [highContrast, reducedMotion, fontSize]);
    const announce = (message) => {
        setAnnouncements(prev => [...prev, message]);
        // Remove announcement after a delay to keep the array manageable
        setTimeout(() => {
            setAnnouncements(prev => prev.slice(1));
        }, 1000);
    };
    const value = {
        highContrast,
        reducedMotion,
        fontSize,
        announcements,
        setHighContrast,
        setReducedMotion,
        setFontSize,
        announce,
    };
    return (<AccessibilityContext.Provider value={value}>
      {children}
      {/* Screen reader announcements */}
      <div aria-live="polite" aria-atomic="true" className="sr-only" data-testid="accessibility-announcer">
        {announcements.map((announcement, index) => (<div key={index}>{announcement}</div>))}
      </div>
    </AccessibilityContext.Provider>);
}
// Accessibility CSS classes to be added to globals.css
export const accessibilityStyles = `
/* High Contrast Mode */
.accessibility-high-contrast {
  --background: 0 0% 100%;
  --foreground: 0 0% 0%;
  --card: 0 0% 100%;
  --card-foreground: 0 0% 0%;
  --popover: 0 0% 100%;
  --popover-foreground: 0 0% 0%;
  --primary: 0 0% 0%;
  --primary-foreground: 0 0% 100%;
  --secondary: 0 0% 90%;
  --secondary-foreground: 0 0% 0%;
  --muted: 0 0% 90%;
  --muted-foreground: 0 0% 0%;
  --accent: 0 0% 90%;
  --accent-foreground: 0 0% 0%;
  --destructive: 0 84% 40%;
  --destructive-foreground: 0 0% 100%;
  --border: 0 0% 50%;
  --input: 0 0% 90%;
  --ring: 0 0% 0%;
}

.accessibility-high-contrast.dark {
  --background: 0 0% 0%;
  --foreground: 0 0% 100%;
  --card: 0 0% 0%;
  --card-foreground: 0 0% 100%;
  --popover: 0 0% 0%;
  --popover-foreground: 0 0% 100%;
  --primary: 0 0% 100%;
  --primary-foreground: 0 0% 0%;
  --secondary: 0 0% 20%;
  --secondary-foreground: 0 0% 100%;
  --muted: 0 0% 20%;
  --muted-foreground: 0 0% 100%;
  --accent: 0 0% 20%;
  --accent-foreground: 0 0% 100%;
  --border: 0 0% 50%;
  --input: 0 0% 20%;
  --ring: 0 0% 100%;
}

/* Reduced Motion */
.accessibility-reduced-motion *,
.accessibility-reduced-motion *::before,
.accessibility-reduced-motion *::after {
  animation-duration: 0.01ms !important;
  animation-iteration-count: 1 !important;
  transition-duration: 0.01ms !important;
}

/* Font Sizes */
.accessibility-font-small {
  font-size: 14px;
}

.accessibility-font-medium {
  font-size: 16px;
}

.accessibility-font-large {
  font-size: 18px;
}

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
`;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjZXNzaWJpbGl0eVByb3ZpZGVyLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIkFjY2Vzc2liaWxpdHlQcm92aWRlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLGFBQWEsRUFBRSxVQUFVLEVBQUUsU0FBUyxFQUFFLFFBQVEsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQWF0RSxNQUFNLG9CQUFvQixHQUFHLGFBQWEsQ0FBdUMsU0FBUyxDQUFDLENBQUE7QUFFM0YsTUFBTSxVQUFVLGdCQUFnQjtJQUM5QixNQUFNLE9BQU8sR0FBRyxVQUFVLENBQUMsb0JBQW9CLENBQUMsQ0FBQTtJQUNoRCxJQUFJLE9BQU8sS0FBSyxTQUFTLEVBQUUsQ0FBQztRQUMxQixNQUFNLElBQUksS0FBSyxDQUFDLCtEQUErRCxDQUFDLENBQUE7SUFDbEYsQ0FBQztJQUNELE9BQU8sT0FBTyxDQUFBO0FBQ2hCLENBQUM7QUFFRCxNQUFNLFVBQVUscUJBQXFCLENBQUMsRUFBRSxRQUFRLEVBQWlDO0lBQy9FLE1BQU0sQ0FBQyxZQUFZLEVBQUUsZUFBZSxDQUFDLEdBQUcsUUFBUSxDQUFDLEtBQUssQ0FBQyxDQUFBO0lBQ3ZELE1BQU0sQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxRQUFRLENBQUMsS0FBSyxDQUFDLENBQUE7SUFDekQsTUFBTSxDQUFDLFFBQVEsRUFBRSxXQUFXLENBQUMsR0FBRyxRQUFRLENBQStCLFFBQVEsQ0FBQyxDQUFBO0lBQ2hGLE1BQU0sQ0FBQyxhQUFhLEVBQUUsZ0JBQWdCLENBQUMsR0FBRyxRQUFRLENBQVcsRUFBRSxDQUFDLENBQUE7SUFFaEUsbUNBQW1DO0lBQ25DLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixtQ0FBbUM7UUFDbkMsTUFBTSxVQUFVLEdBQUcsTUFBTSxDQUFDLFVBQVUsQ0FBQyxrQ0FBa0MsQ0FBQyxDQUFBO1FBQ3hFLGdCQUFnQixDQUFDLFVBQVUsQ0FB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
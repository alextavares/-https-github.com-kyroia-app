"use client";
import { useEffect } from 'react';
export function AnchorHighlighter() {
    useEffect(() => {
        let timeout1 = null;
        let timeout2 = null;
        const run = () => {
            const raw = typeof window !== 'undefined' ? window.location.hash : '';
            const id = raw ? decodeURIComponent(raw.replace(/^#/, '')) : '';
            if (!id)
                return;
            const el = document.getElementById(id);
            if (!el)
                return;
            try {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                const classes = ['ring-2', 'ring-amber-400', 'animate-pulse'];
                el.classList.add(...classes);
                timeout1 = setTimeout(() => {
                    el.classList.remove('animate-pulse');
                }, 2000);
                timeout2 = setTimeout(() => {
                    el.classList.remove(...classes);
                }, 4000);
            }
            catch (_a) { }
        };
        run();
        const onHashChange = () => run();
        window.addEventListener('hashchange', onHashChange);
        return () => {
            window.removeEventListener('hashchange', onHashChange);
            if (timeout1)
                clearTimeout(timeout1);
            if (timeout2)
                clearTimeout(timeout2);
        };
    }, []);
    return null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYW5jaG9yLWhpZ2hsaWdodGVyLmpzeCIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbImFuY2hvci1oaWdobGlnaHRlci50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosT0FBTyxFQUFFLFNBQVMsRUFBRSxNQUFNLE9BQU8sQ0FBQTtBQUVqQyxNQUFNLFVBQVUsaUJBQWlCO0lBQy9CLFNBQVMsQ0FBQyxHQUFHLEVBQUU7UUFDYixJQUFJLFFBQVEsR0FBeUMsSUFBSSxDQUFBO1FBQ3pELElBQUksUUFBUSxHQUF5QyxJQUFJLENBQUE7UUFFekQsTUFBTSxHQUFHLEdBQUcsR0FBRyxFQUFFO1lBQ2YsTUFBTSxHQUFHLEdBQUcsT0FBTyxNQUFNLEtBQUssV0FBVyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsUUFBUSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO1lBQ3JFLE1BQU0sRUFBRSxHQUFHLEdBQUcsQ0FBQyxDQUFDLENBQUMsa0JBQWtCLENBQUMsR0FBRyxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUUsRUFBRSxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxDQUFBO1lBQy9ELElBQUksQ0FBQyxFQUFFO2dCQUFFLE9BQU07WUFDZixNQUFNLEVBQUUsR0FBRyxRQUFRLENBQUMsY0FBYyxDQUFDLEVBQUUsQ0FBQyxDQUFBO1lBQ3RDLElBQUksQ0FBQyxFQUFFO2dCQUFFLE9BQU07WUFFZixJQUFJLENBQUM7Z0JBQ0gsRUFBRSxDQUFDLGNBQWMsQ0FBQyxFQUFFLFFBQVEsRUFBRSxRQUFRLEVBQUUsS0FBSyxFQUFFLFFBQVEsRUFBRSxDQUFDLENBQUE7Z0JBQzFELE1BQU0sT0FBTyxHQUFHLENBQUMsUUFBUSxFQUFFLGdCQUFnQixFQUFFLGVBQWUsQ0FBQyxDQUFBO2dCQUM3RCxFQUFFLENBQUMsU0FBUyxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxDQUFBO2dCQUM1QixRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDekIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsZUFBZSxDQUFDLENBQUE7Z0JBQ3RDLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtnQkFDUixRQUFRLEdBQUcsVUFBVSxDQUFDLEdBQUcsRUFBRTtvQkFDekIsRUFBRSxDQUFDLFNBQVMsQ0FBQyxNQUFNLENBQUMsR0FBRyxPQUFPLENBQUMsQ0FBQTtnQkFDakMsQ0FBQyxFQUFFLElBQUksQ0FBQyxDQUFBO1lBQ1YsQ0FBQztZQUFDLFdBQU0sQ0FBQyxDQUFBLENBQUM7UUFDWixDQUFDLENBQUE7UUFFRCxHQUFHLEVBQUUsQ0FBQTtRQUNMLE1BQU0sWUFBWSxHQUFHLEdBQUcsRUFBRSxDQUFDLEdBQUcsRUFBRSxDQUFBO1FBQ2hDLE1BQU0sQ0FBQyxnQkFBZ0IsQ0FBQyxZQUFZLEVBQUUsWUFBWSxDQUFDLENBQUE7UUFFbkQsT0FBTyxHQUFHLEVBQUU7WUFDVixNQUFNLENBQUMsbUJBQW1CLENBQUMsWUFBWSxFQUFFLFlBQVksQ0FBQyxDQUFBO1lBQ3RELElBQUksUUFBUTtnQkFBRSxZQUFZLENBQUMsUUFBUSxDQUFDLENBQUE7WUFDcEMsSUFBSSxRQUFRO2dCQUFFLFlBQVksQ0FBQyxRQUFRLENBQUMsQ0FBQTtRQUN0QyxDQUFDLENBQUE7SUFDSCxDQUFDLEVBQUUsRUFBRSxDQUFDLENBQUE7SUFFTixPQUFPLElBQUksQ0FBQTtBQUNiLENBQUMifQ==
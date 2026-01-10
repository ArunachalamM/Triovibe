import { useEffect, useRef } from 'react';

export const useScrollAnimation = (threshold = 0.1) => {
    const elementRef = useRef(null);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('show');
                } else {
                    // Optional: remove 'show' if you want it to animate out when scrolling away
                    // entry.target.classList.remove('show'); 
                }
            });
        }, {
            threshold: threshold
        });

        const element = elementRef.current;
        if (element) {
            observer.observe(element);
        }

        return () => {
            if (element) {
                observer.unobserve(element);
            }
        };
    }, [threshold]);

    return elementRef;
};

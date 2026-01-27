import { useScrollAnimation } from '../../hooks/useScrollAnimation';

const ScrollReveal = ({ children, className = '', threshold = 0.1 }) => {
    const ref = useScrollAnimation(threshold);

    return (
        <div ref={ref} className={`fade-in-section ${className}`}>
            {children}
        </div>
    );
};

export default ScrollReveal;

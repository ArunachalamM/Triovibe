import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const Hero = () => {
    const [offset, setOffset] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setOffset(window.pageYOffset);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    return (
        <section className="hero" id="home">
            <div className="hero-background">
                <div
                    className="gradient-orb orb-1"
                    style={{ transform: `translate(${offset * 0.1}px, ${offset * 0.1}px)` }}
                ></div>
                <div
                    className="gradient-orb orb-2"
                    style={{ transform: `translate(${offset * 0.05}px, ${offset * 0.05}px)` }}
                ></div>
            </div>
            <div
                className="hero-content"
                style={{
                    transform: `translateY(${offset * 0.5}px)`,
                    opacity: 1 - (offset / 600)
                }}
            >
                <h1 className="hero-title">
                    <span className="title-line">Creative Tech</span>
                    <span className="title-line">Innovation Team</span>
                </h1>
                <p className="hero-subtitle">We build Micro SaaS applications, seamless UX/UI solutions, modern websites, and
                    intelligent workflow automations that transform your ideas into digital reality.</p>
                <div className="hero-buttons">
                    <a href="#services" className="btn btn-primary">View Our Work</a>
                    <a href="#contact" className="btn btn-secondary">Get in Touch</a>
                </div>
                <div className="scroll-indicator">
                    <div className="mouse">
                        <div className="wheel"></div>
                    </div>
                    <div className="arrow arrow1"></div>
                    <div className="arrow arrow2"></div>
                </div>
            </div>
        </section>
    );
};

export default Hero;

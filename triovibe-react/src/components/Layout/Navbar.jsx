import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import logo from '../../assets/triovibe_logo.jpg';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navbar = () => {
    const [scrolled, setScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setScrolled(window.scrollY > 50);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const toggleMenu = () => {
        setMobileMenuOpen(!mobileMenuOpen);
    };

    const closeMenu = () => {
        setMobileMenuOpen(false);
    };

    // Smooth scroll for hash links if on home page
    const handleHashLink = (e, targetId) => {
        if (location.pathname !== '/') return; // If not home, let standard navigation happen
        e.preventDefault();
        const element = document.getElementById(targetId);
        if (element) {
            const headerOffset = 80;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
            closeMenu();
        }
    };

    return (
        <nav className={`navbar ${scrolled ? 'scrolled' : ''}`} id="navbar">
            <div className="nav-container">
                <div className="nav-logo">
                    <Link to="/" onClick={() => window.scrollTo(0, 0)}>
                        <img src={logo} alt="TrioVibe Logo" className="logo-image" />
                    </Link>
                </div>
                
                <ul className={`nav-menu ${mobileMenuOpen ? 'active' : ''}`} id="nav-menu">
                    <li className="nav-item">
                        <Link to="/" className="nav-link" onClick={closeMenu}>Home</Link>
                    </li>
                    <li className="nav-item">
                        <a href="#services" className="nav-link" onClick={(e) => handleHashLink(e, 'services')}>Services</a>
                    </li>
                    <li className="nav-item dropdown-parent">
                        <a href="#" className="nav-link" onClick={(e) => e.preventDefault()}>
                            Products
                            <ChevronDown className="dropdown-icon" size={14} />
                        </a>
                        <ul className="dropdown-menu">
                            <li><Link to="/reviewflow" className="dropdown-item" onClick={closeMenu}>ReviewFlow</Link></li>
                            <li><a href="#" className="dropdown-item" onClick={closeMenu}>Product Two</a></li>
                        </ul>
                    </li>
                    <li className="nav-item">
                        <a href="#contact" className="nav-link" onClick={(e) => handleHashLink(e, 'contact')}>Contact</a>
                    </li>
                </ul>

                <button 
                    className={`nav-toggle ${mobileMenuOpen ? 'active' : ''}`} 
                    id="nav-toggle" 
                    aria-label="Toggle navigation"
                    onClick={toggleMenu}
                >
                    <span className="bar"></span>
                    <span className="bar"></span>
                    <span className="bar"></span>
                </button>
            </div>
        </nav>
    );
};

export default Navbar;

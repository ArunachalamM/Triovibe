import { Link } from 'react-router-dom';
import footerLogo from '../../assets/triovibe_footer_logo.png';

const Footer = () => {
    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-logo">
                        <img src={footerLogo} alt="TrioVibe Logo" className="logo-image" />
                        <p className="slogan">Imagine. <span style={{ color: '#F27B35' }}>Innovate.</span> <span style={{ color: '#A6D973' }}>Impact.</span></p>
                        <p>Building digital experiences with innovation and precision.</p>
                    </div>
                    <div className="footer-links">
                        <Link to="/">Home</Link>
                        <a href="/#services">Services</a>
                        <Link to="/contact">Contact</Link>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; {new Date().getFullYear()} TrioVibe. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;

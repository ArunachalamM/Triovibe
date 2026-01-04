import Hero from '../components/Sections/Home/Hero';
import Services from '../components/Sections/Home/Services';
import Contact from '../components/Sections/Home/Contact';

const Home = () => {
    return (
        <div className="home-page">
            <Hero />
            <Services />
            <Contact />
        </div>
    );
};

export default Home;

import { Monitor, Smartphone, Layout } from 'lucide-react';
import ScrollReveal from '../../UI/ScrollReveal';

const servicesData = [
    {
        title: "Micro SaaS",
        description: "Build scalable, focused software solutions that solve specific business problems with precision and efficiency.",
        tags: ["Scalable", "Focused"],
        icon: <Layout /> // Placeholder, adjusting below
    },
    {
        title: "UX/UI Design",
        description: "Create intuitive, beautiful interfaces that delight users and enhance their experience with thoughtful design.",
        tags: ["Intuitive", "Beautiful"],
        icon: <Smartphone />
    },
    {
        title: "Web Development",
        description: "Develop fast, responsive websites and web applications with modern frameworks and best practices.",
        tags: ["Fast", "Responsive"],
        icon: <Monitor />
    }
];

const Services = () => {
    return (
        <section className="services" id="services">
            <div className="container">
                <div className="section-header">
                    <span className="section-label">What We Do</span>
                    <h2 className="section-title">Our Services</h2>
                    <p className="section-description">Delivering cutting-edge solutions across the digital landscape</p>
                </div>
                <div className="services-grid">
                    {servicesData.map((service, index) => (
                        <ScrollReveal key={index} className="service-card" style={{ transitionDelay: `${index * 100}ms` }}>
                            <div className="service-icon">
                                {service.icon}
                            </div>
                            <h3 className="service-title">{service.title}</h3>
                            <p className="service-description">{service.description}</p>
                            <div className="service-tags">
                                {service.tags.map(tag => (
                                    <span key={tag} className="tag">{tag}</span>
                                ))}
                            </div>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default Services;

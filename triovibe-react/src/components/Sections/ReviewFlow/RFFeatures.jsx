import { MessageSquare, Bell, Sliders } from 'lucide-react';
import ScrollReveal from '../../UI/ScrollReveal';

const features = [
    {
        title: "AI Reply Generator",
        description: "Generate contextual, brand-aligned suggested replies instantly using advanced sentiment analysis.",
        icon: <MessageSquare size={24} />
    },
    {
        title: "Actionable Reminders",
        description: "Never miss a review with persistent notifications and \"Respond Now\" call-to-actions for unreplied reviews.",
        icon: <Bell size={24} />
    },
    {
        title: "Tone Selector",
        description: "Choose the perfect tone (Friendly, Formal, Empathetic) for every situation to match your brand voice.",
        icon: <Sliders size={24} />
    }
];

const RFFeatures = () => {
    return (
        <section className="rf-features" id="features">
            <div className="container">
                <div className="section-header">
                    <span className="section-label" style={{ color: 'var(--rf-primary)' }}>Features</span>
                    <h2 className="section-title">Everything you need to manage reviews</h2>
                    <p className="section-description">Powerful tools to maintain a 5-star reputation with minimal effort.</p>
                </div>

                <div className="services-grid">
                    {features.map((feature, index) => (
                        <ScrollReveal key={index} className="rf-feature-card" style={{ transitionDelay: `${index * 100}ms` }}>
                            <div className="rf-icon-wrapper">
                                {feature.icon}
                            </div>
                            <h3 className="service-title">{feature.title}</h3>
                            <p className="service-description">{feature.description}</p>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RFFeatures;

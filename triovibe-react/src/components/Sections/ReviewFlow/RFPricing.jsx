import { Link } from 'react-router-dom';
import { Check } from 'lucide-react';
import ScrollReveal from '../../UI/ScrollReveal';

const plans = [
    {
        name: "Starter",
        price: "Free",
        desc: "Perfect for trying out ReviewFlow.",
        features: ["50 AI Replies / mo", "Basic Tones", "Manual Posting"],
        cta: "Get Started Free",
        secondary: true
    },
    {
        name: "Pro",
        price: "$29",
        period: "/mo",
        desc: "For growing businesses needing efficiency.",
        features: ["Unlimited AI Replies", "All Tone Styles", "Sentiment Analysis", "Priority Support"],
        cta: "Start Free Trial",
        popular: true
    },
    {
        name: "Agency",
        price: "$99",
        period: "/mo",
        desc: "For agencies managing multiple locations.",
        features: ["Everything in Pro", "Up to 10 Locations", "Team Management", "API Access"],
        cta: "Contact Sales",
        secondary: true
    }
];

const RFPricing = () => {
    return (
        <section className="rf-pricing" id="pricing">
            <div className="container">
                <div className="section-header">
                    <span className="section-label" style={{ color: 'var(--rf-primary)' }}>Pricing</span>
                    <h2 className="section-title">Simple, transparent pricing</h2>
                    <p className="section-description">Choose the perfect plan for your business needs.</p>
                </div>

                <div className="pricing-grid">
                    {plans.map((plan, index) => (
                        <ScrollReveal
                            key={index}
                            className={`pricing-card ${plan.popular ? 'popular' : ''}`}
                            style={{ transitionDelay: `${index * 100}ms` }}
                        >
                            {plan.popular && <div className="popular-badge">Most Popular</div>}
                            <h3 className="plan-name">{plan.name}</h3>
                            <div className="plan-price">
                                {plan.price}
                                {plan.period && <span className="plan-period">{plan.period}</span>}
                            </div>
                            <p className="plan-desc">{plan.desc}</p>
                            <ul className="plan-features">
                                {plan.features.map((feature, i) => (
                                    <li key={i} className="plan-feature-item">
                                        <Check className="plan-feature-icon" size={20} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link
                                to="#"
                                className={`btn pricing-cta ${plan.secondary ? 'btn-secondary' : 'btn-primary rf-btn-primary'}`}
                            >
                                {plan.cta}
                            </Link>
                        </ScrollReveal>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default RFPricing;

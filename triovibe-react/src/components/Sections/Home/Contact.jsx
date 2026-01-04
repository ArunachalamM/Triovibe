import { useState } from 'react';
import { Mail, Twitter, Linkedin, Github, Dribbble } from 'lucide-react';
import Toaster from '../../UI/Toaster';
import ScrollReveal from '../../UI/ScrollReveal';

const Contact = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        service: '',
        message: ''
    });
    const [status, setStatus] = useState('idle'); // idle, submitting, success, error
    const [toast, setToast] = useState({ show: false, type: 'success', title: '', message: '' });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus('submitting');

        try {
            const response = await fetch("https://formsubmit.co/ajax/info@triovibe.tech", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify({
                    ...formData,
                    _subject: "New Submision from TrioVibe Web",
                    _captcha: "false"
                })
            });

            if (response.ok) {
                setStatus('success');
                setToast({
                    show: true,
                    type: 'success',
                    title: 'Message Sent!',
                    message: "Thank you for contacting us. We'll get back to you soon."
                });
                setFormData({ name: '', email: '', service: '', message: '' });
            } else {
                throw new Error('Form submission failed');
            }
        } catch (error) {
            setStatus('error');
            setToast({
                show: true,
                type: 'error',
                title: 'Send Failed',
                message: "Unable to send your message. Please try again later."
            });
        } finally {
            setStatus('idle');
        }
    };

    return (
        <section className="contact" id="contact">
            <Toaster
                {...toast}
                onClose={() => setToast({ ...toast, show: false })}
            />
            <div className="container">
                <div className="contact-wrapper">
                    <ScrollReveal className="contact-info">
                        <h2 className="contact-title">Let's Build Something Amazing</h2>
                        <p className="contact-description">Ready to transform your ideas into reality? Get in touch and let's
                            discuss how we can help you achieve your goals.</p>
                        <div className="contact-details">
                            <div className="contact-item">
                                <div className="contact-icon">
                                    <Mail />
                                </div>
                                <div>
                                    <h4>Email</h4>
                                    <p>info@triovibe.tech</p>
                                </div>
                            </div>
                        </div>
                        <div className="social-links">
                            <a href="#" className="social-link" aria-label="Twitter"><Twitter size={20} /></a>
                            <a href="#" className="social-link" aria-label="LinkedIn"><Linkedin size={20} /></a>
                            <a href="#" className="social-link" aria-label="GitHub"><Github size={20} /></a>
                            <a href="#" className="social-link" aria-label="Dribbble"><Dribbble size={20} /></a>
                        </div>
                    </ScrollReveal>
                    <ScrollReveal className="contact-form" threshold={0.2}>
                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label htmlFor="name">Name</label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    placeholder="Your name"
                                    required
                                    value={formData.name}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="email">Email</label>
                                <input
                                    type="email"
                                    id="email"
                                    name="email"
                                    placeholder="your.email@example.com"
                                    required
                                    value={formData.email}
                                    onChange={handleChange}
                                />
                            </div>
                            <div className="form-group">
                                <label htmlFor="service">Service</label>
                                <select
                                    id="service"
                                    name="service"
                                    required
                                    value={formData.service}
                                    onChange={handleChange}
                                >
                                    <option value="">Select a service</option>
                                    <option value="saas">Micro SaaS</option>
                                    <option value="design">UX/UI Design</option>
                                    <option value="development">Web Development</option>
                                    <option value="general">General Inquiry</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label htmlFor="message">Message</label>
                                <textarea
                                    id="message"
                                    name="message"
                                    rows="5"
                                    placeholder="Tell us about your project..."
                                    required
                                    value={formData.message}
                                    onChange={handleChange}
                                ></textarea>
                            </div>
                            <button type="submit" className="btn btn-primary" disabled={status === 'submitting'}>
                                {status === 'submitting' ? 'Sending...' : 'Send Message'}
                            </button>
                        </form>
                    </ScrollReveal>
                </div>
            </div>
        </section>
    );
};

export default Contact;

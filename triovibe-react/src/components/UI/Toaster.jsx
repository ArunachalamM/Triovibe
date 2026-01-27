import { useEffect } from 'react';
import { X, CheckCircle, AlertCircle } from 'lucide-react';

const Toaster = ({ show, type = 'success', title, message, onClose, duration = 5000 }) => {
    useEffect(() => {
        if (show && duration) {
            const timer = setTimeout(onClose, duration);
            return () => clearTimeout(timer);
        }
    }, [show, duration, onClose]);

    if (!show) return null;

    return (
        <div className="toaster-container">
            <div className={`toaster ${type} show`}>
                <div className="toaster-icon">
                    {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
                </div>
                <div className="toaster-content">
                    <div className="toaster-title">{title}</div>
                    <div className="toaster-message">{message}</div>
                </div>
                <button className="toaster-close" onClick={onClose}>
                    <X size={16} />
                </button>
            </div>
        </div>
    );
};

export default Toaster;

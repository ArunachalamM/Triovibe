import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { useOpenAI } from '../hooks/useOpenAI';
import { Loader2, Sparkles, Send, Copy, RotateCw, Check } from 'lucide-react';

const Dashboard = () => {
    const { token } = useAuth();
    const { signOut } = useGoogleAuth();
    const { fetchAccounts, fetchLocations, fetchReviews, loading: businessLoading, error: businessError } = useBusinessProfile();
    const { generateReply, loading: aiLoading } = useOpenAI();

    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [reviews, setReviews] = useState([]);
    const [accountId, setAccountId] = useState(null);

    // State management
    const [drafts, setDrafts] = useState({});
    const [tones, setTones] = useState({}); // Per-review tone
    const [lengths, setLengths] = useState({}); // Per-review length
    const [copiedStates, setCopiedStates] = useState({});

    // Initial Data Load
    useEffect(() => {
        const loadBusinessData = async () => {
            if (token) {
                const accounts = await fetchAccounts();
                if (accounts.length > 0) {
                    const accId = accounts[0].name;
                    setAccountId(accId);
                    const locs = await fetchLocations(accId);
                    setLocations(locs);
                }
            }
        };
        loadBusinessData();
    }, [token, fetchAccounts, fetchLocations]);

    // Cleanup toast timeouts
    useEffect(() => {
        return () => {
            // Clean up any pending timeouts if component unmounts
            Object.values(copiedStates).forEach(timeoutId => clearTimeout(timeoutId));
        };
    }, [copiedStates]);

    const handleLocationChange = async (e) => {
        const locationName = e.target.value;
        setSelectedLocation(locationName);
        if (locationName) {
            const fetchedReviews = await fetchReviews(locationName, accountId);
            setReviews(fetchedReviews);
        }
    };

    const handleGenerateReply = async (reviewId, comment, reviewerName) => {
        const tone = tones[reviewId] || 'Professional';
        const length = lengths[reviewId] || 'Short';

        const reply = await generateReply(comment, reviewerName, tone, length);
        if (reply) {
            setDrafts(prev => ({ ...prev, [reviewId]: reply }));
        }
    };

    const handleCopyToClipboard = (reviewId) => {
        const text = drafts[reviewId];
        if (text) {
            navigator.clipboard.writeText(text);
            const timeoutId = setTimeout(() => {
                setCopiedStates(prev => {
                    const newState = { ...prev };
                    delete newState[reviewId];
                    return newState;
                });
            }, 2000);

            setCopiedStates(prev => ({ ...prev, [reviewId]: timeoutId }));
        }
    };

    const handleDraftChange = (reviewId, text) => {
        setDrafts(prev => ({ ...prev, [reviewId]: text }));
    };

    const handlePostReply = async (reviewId) => {
        alert(`Posting reply for ${reviewId}: ${drafts[reviewId]}`);
        // Mock post call
    };

    if (!token) {
        return <div className="p-10 text-center">Please sign in to view the dashboard.</div>;
    }

    return (
        <div className="container" style={{ padding: '8rem 1rem' }}>
            <div className="dashboard-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2rem', fontWeight: '700' }}>Review Dashboard</h1>
                <button onClick={signOut} className="btn btn-secondary">Sign Out</button>
            </div>

            {businessError && <div className="rf-error-message" style={{ marginBottom: '1rem' }}>{businessError}</div>}

            {/* Location Selector */}
            <div className="locations-section" style={{ maxWidth: '400px', marginBottom: '2rem' }}>
                <label className="rf-label">Select Business Location</label>
                {businessLoading && locations.length === 0 ? (
                    <div className="rf-loading-spinner"><Loader2 className="spinner" /> Loading locations...</div>
                ) : (
                    <select
                        className="rf-select"
                        value={selectedLocation}
                        onChange={handleLocationChange}
                        disabled={locations.length === 0}
                    >
                        <option value="" disabled>Select a location</option>
                        {locations.map((loc) => (
                            <option key={loc.name} value={loc.name}>
                                {loc.title} {loc.storeCode ? `(${loc.storeCode})` : ''}
                            </option>
                        ))}
                    </select>
                )}
            </div>

            {/* Reviews List */}
            <div className="reviews-section">
                <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>Customer Reviews</h2>

                {businessLoading && selectedLocation ? (
                    <div className="rf-loading-spinner"><Loader2 className="spinner" /> Loading reviews...</div>
                ) : reviews.length > 0 ? (
                    <div className="reviews-grid" style={{ display: 'grid', gap: '1.5rem' }}>
                        {reviews.map((review) => (
                            <div key={review.reviewId} className="review-card" style={{
                                padding: '1.5rem',
                                background: 'white',
                                borderRadius: '1rem',
                                border: '1px solid #E2E8F0',
                                boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
                            }}>
                                <div className="review-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <img
                                            src={review.reviewer.profilePhotoUrl}
                                            alt={review.reviewer.displayName}
                                            style={{ width: '40px', height: '40px', borderRadius: '50%' }}
                                        />
                                        <div>
                                            <div style={{ fontWeight: '600' }}>{review.reviewer.displayName}</div>
                                            <div style={{ color: '#F59E0B' }}>{'★'.repeat(["FIVE", "FOUR", "THREE", "TWO", "ONE"].indexOf(review.starRating) > -1 ? 5 - ["FIVE", "FOUR", "THREE", "TWO", "ONE"].indexOf(review.starRating) : 0)}</div>
                                        </div>
                                    </div>
                                    <div style={{ fontSize: '0.875rem', color: '#64748B' }}>
                                        {new Date(review.createTime).toLocaleDateString()}
                                    </div>
                                </div>
                                <p style={{ color: '#334155', lineHeight: '1.6', marginBottom: '1.5rem' }}>{review.comment || '(No comment)'}</p>

                                {review.reviewReply ? (
                                    <div style={{
                                        marginTop: '1rem',
                                        padding: '1rem',
                                        background: '#F8FAFC',
                                        borderRadius: '0.5rem',
                                        borderLeft: '4px solid #3E8DE3'
                                    }}>
                                        <div style={{ fontSize: '0.875rem', fontWeight: '600', marginBottom: '0.5rem', color: '#3E8DE3' }}>
                                            Your Reply
                                        </div>
                                        <p style={{ fontSize: '0.95rem', color: '#475569' }}>{review.reviewReply.comment}</p>
                                    </div>
                                ) : (
                                    <div className="reply-area">
                                        {/* Controls Row */}
                                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '0.5rem' }}>
                                            <select
                                                className="rf-select"
                                                style={{ padding: '0.25rem', fontSize: '0.875rem' }}
                                                value={tones[review.reviewId] || 'Professional'}
                                                onChange={(e) => setTones(prev => ({ ...prev, [review.reviewId]: e.target.value }))}
                                            >
                                                <option value="Professional">Professional</option>
                                                <option value="Friendly">Friendly</option>
                                                <option value="Empathetic">Empathetic</option>
                                            </select>
                                            <select
                                                className="rf-select"
                                                style={{ padding: '0.25rem', fontSize: '0.875rem' }}
                                                value={lengths[review.reviewId] || 'Short'}
                                                onChange={(e) => setLengths(prev => ({ ...prev, [review.reviewId]: e.target.value }))}
                                            >
                                                <option value="Short">Short</option>
                                                <option value="Medium">Medium</option>
                                                <option value="Long">Long</option>
                                            </select>
                                        </div>

                                        <textarea
                                            className="rf-input"
                                            placeholder="Write a reply..."
                                            rows="3"
                                            value={drafts[review.reviewId] || ''}
                                            onChange={(e) => handleDraftChange(review.reviewId, e.target.value)}
                                            style={{ width: '100%', marginBottom: '0.5rem' }}
                                        />

                                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'space-between' }}>
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                <button
                                                    className="btn btn-secondary"
                                                    onClick={() => handleGenerateReply(review.reviewId, review.comment, review.reviewer.displayName)}
                                                    disabled={aiLoading}
                                                    title={drafts[review.reviewId] ? "Regenerate" : "Generate"}
                                                    style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                                >
                                                    {aiLoading ? <Loader2 size={16} className="spinner" /> : drafts[review.reviewId] ? <RotateCw size={16} /> : <Sparkles size={16} />}
                                                    {aiLoading ? 'Thinking...' : drafts[review.reviewId] ? 'Regenerate' : 'AI Suggest'}
                                                </button>

                                                {drafts[review.reviewId] && (
                                                    <button
                                                        className="btn btn-secondary"
                                                        onClick={() => handleCopyToClipboard(review.reviewId)}
                                                        title="Copy to Clipboard"
                                                    >
                                                        {copiedStates[review.reviewId] ? <Check size={16} /> : <Copy size={16} />}
                                                    </button>
                                                )}
                                            </div>

                                            <button
                                                className="btn btn-primary"
                                                onClick={() => handlePostReply(review.reviewId)}
                                                disabled={!drafts[review.reviewId]}
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                                            >
                                                <Send size={16} />
                                                Post Reply
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    selectedLocation ? <p>No reviews found for this location.</p> : <p>Please select a location to view reviews.</p>
                )}
            </div>
        </div>
    );
};
export default Dashboard;

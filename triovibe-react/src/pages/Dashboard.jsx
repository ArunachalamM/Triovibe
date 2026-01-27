import { useState, useEffect } from 'react';
import { useAuth } from '../hooks/AuthContext';
import { useGoogleAuth } from '../hooks/useGoogleAuth';
import { useBusinessProfile } from '../hooks/useBusinessProfile';
import { useOpenAI } from '../hooks/useOpenAI';
import { Loader2, Sparkles, Send, Copy, RotateCw, Check, Filter, ArrowUpDown, Calendar } from 'lucide-react';

const Dashboard = () => {
    const { token } = useAuth();
    const { signOut } = useGoogleAuth();
    const { fetchAccounts, fetchLocations, fetchReviews, loading: businessLoading, error: businessError } = useBusinessProfile();
    const { generateReply, loading: aiLoading } = useOpenAI();

    const [locations, setLocations] = useState([]);
    const [selectedLocation, setSelectedLocation] = useState('');
    const [reviews, setReviews] = useState([]);
    const [accountId, setAccountId] = useState(null);
    const [activeTab, setActiveTab] = useState('All');
    const [sortBy, setSortBy] = useState('newest');
    const [filterRating, setFilterRating] = useState('all');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

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
            console.log(fetchedReviews)
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

    const getStarValue = (rating) => {
        const map = { "FIVE": 5, "FOUR": 4, "THREE": 3, "TWO": 2, "ONE": 1 };
        return map[rating] || 0;
    };

    const filteredReviews = reviews.filter(review => {
        // Tab Filter
        if (activeTab === 'Replied' && !review.reviewReply) return false;
        if (activeTab === 'Unreplied' && review.reviewReply) return false;

        // Rating Filter
        if (filterRating !== 'all') {
            if (getStarValue(review.starRating) !== parseInt(filterRating)) return false;
        }

        // Date Filter
        if (startDate) {
            const reviewDate = new Date(review.createTime);
            if (reviewDate < new Date(startDate)) return false;
        }
        if (endDate) {
            const reviewDate = new Date(review.createTime);
            const endOfDay = new Date(endDate);
            endOfDay.setHours(23, 59, 59, 999);
            if (reviewDate > endOfDay) return false;
        }

        return true;
    }).sort((a, b) => {
        switch (sortBy) {
            case 'newest': return new Date(b.createTime) - new Date(a.createTime);
            case 'oldest': return new Date(a.createTime) - new Date(b.createTime);
            case 'highest': return getStarValue(b.starRating) - getStarValue(a.starRating);
            case 'lowest': return getStarValue(a.starRating) - getStarValue(b.starRating);
            default: return 0;
        }
    });

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
                    <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '1.5rem', borderBottom: '1px solid #E2E8F0' }}>
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                {['All', 'Replied', 'Unreplied'].map(tab => (
                                    <button
                                        key={tab}
                                        onClick={() => setActiveTab(tab)}
                                        style={{
                                            padding: '0.75rem 1rem',
                                            borderBottom: activeTab === tab ? '2px solid #3E8DE3' : '2px solid transparent',
                                            color: activeTab === tab ? '#3E8DE3' : '#64748B',
                                            fontWeight: activeTab === tab ? '600' : '500',
                                            background: 'none',
                                            borderTop: 'none',
                                            borderLeft: 'none',
                                            borderRight: 'none',
                                            cursor: 'pointer',
                                            marginBottom: '-1px'
                                        }}
                                    >
                                        {tab}
                                    </button>
                                ))}
                            </div>

                            <div style={{ display: 'flex', gap: '1rem', paddingBottom: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end', alignItems: 'center' }}>
                                {/* Date Filter */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Calendar size={16} color="#64748B" />
                                    <input
                                        type="date"
                                        className="rf-input"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', width: 'auto', marginBottom: '0px' }}
                                        title="Start Date"
                                    />
                                    <span style={{ color: '#64748B' }}>-</span>
                                    <input
                                        type="date"
                                        className="rf-input"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.875rem', width: 'auto', marginBottom: '0px' }}
                                        title="End Date"
                                    />
                                </div>

                                {/* Rating Filter */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <Filter size={16} color="#64748B" />
                                    <select
                                        className="rf-select"
                                        value={filterRating}
                                        onChange={(e) => setFilterRating(e.target.value)}
                                        style={{ padding: '0.25rem 2rem 0.25rem 0.5rem', fontSize: '0.875rem' }}
                                    >
                                        <option value="all">All Ratings</option>
                                        <option value="5">5 Stars</option>
                                        <option value="4">4 Stars</option>
                                        <option value="3">3 Stars</option>
                                        <option value="2">2 Stars</option>
                                        <option value="1">1 Star</option>
                                    </select>
                                </div>

                                {/* Sort */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                    <ArrowUpDown size={16} color="#64748B" />
                                    <select
                                        className="rf-select"
                                        value={sortBy}
                                        onChange={(e) => setSortBy(e.target.value)}
                                        style={{ padding: '0.25rem 2rem 0.25rem 0.5rem', fontSize: '0.875rem' }}
                                    >
                                        <option value="newest">Newest First</option>
                                        <option value="oldest">Oldest First</option>
                                        <option value="highest">Highest Rated</option>
                                        <option value="lowest">Lowest Rated</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {filteredReviews.length === 0 ? (
                            <p style={{ color: '#64748B', fontStyle: 'italic', padding: '2rem', textAlign: 'center' }}>No reviews found in this category.</p>
                        ) : (
                            <div className="reviews-grid" style={{ display: 'grid', gap: '1.5rem' }}>
                                {filteredReviews.map((review) => (
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
                                                        style={{ padding: '0.25rem 2rem 0.25rem 0.5rem', fontSize: '0.875rem' }}
                                                        value={tones[review.reviewId] || 'Professional'}
                                                        onChange={(e) => setTones(prev => ({ ...prev, [review.reviewId]: e.target.value }))}
                                                    >
                                                        <option value="Professional">Professional</option>
                                                        <option value="Friendly">Friendly</option>
                                                        <option value="Empathetic">Empathetic</option>
                                                    </select>
                                                    <select
                                                        className="rf-select"
                                                        style={{ padding: '0.25rem 2rem 0.25rem 0.5rem', fontSize: '0.875rem' }}
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
                        )}
                    </div>
                ) : (
                    selectedLocation ? <p>No reviews found for this location.</p> : <p>Please select a location to view reviews.</p>
                )}
            </div>
        </div>
    );
};
export default Dashboard;

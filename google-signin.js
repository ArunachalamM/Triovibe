console.log('google-signin.js loaded');

// Google Identity Services Configuration
const GOOGLE_CLIENT_ID = '37214632622-l5kh41kk01u3e4oom7mm2lbtsmvesbjb.apps.googleusercontent.com';

// Scopes required for Google Business Profile
const SCOPES = 'https://www.googleapis.com/auth/business.manage';

let tokenClient;
let accessToken = null;
let currentAccountName = null;

// Initialize the Google Identity Services Token Client
function initGoogleAuth() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                console.log('Granted Scopes:', tokenResponse.scope);
                accessToken = tokenResponse.access_token;

                sessionStorage.setItem('google_access_token', accessToken);

                if (!window.location.pathname.includes('dashboard')) {
                    window.location.href = 'dashboard.html';
                } else {
                    handleAuthSuccess();
                }
            } else {
                handleAuthError('Failed to retrieve access token.');
            }
        },
        error_callback: (error) => {
            handleAuthError(error);
        }
    });
}

function signInWithGoogle() {
    console.log('Sign In button clicked');
    if (!tokenClient) {
        console.error('Google Auth not initialized.');
        alert('Google Sign-In is still initializing. Please wait a moment and try again.');
        return;
    }
    tokenClient.requestAccessToken();
}

function handleSignOut() {
    sessionStorage.removeItem('google_access_token');
    window.location.href = 'index.html';
}

function checkSession() {
    const storedToken = sessionStorage.getItem('google_access_token');

    if (window.location.pathname.includes('dashboard')) {
        if (storedToken) {
            accessToken = storedToken;
            handleAuthSuccess();
        } else {
            console.warn('No session token found, redirecting to reviewflow...');
            window.location.href = 'reviewflow.html';
        }
    }
}

async function handleAuthSuccess() {
    showLoadingState(true);
    try {
        const accounts = await fetchAccounts();
        if (accounts && accounts.length > 0) {
            const accountId = accounts[0].name;
            currentAccountName = accountId;

            const locations = await fetchLocations(accountId);
            displayLocations(locations);
        } else {
            showNoLocationsError();
        }
    } catch (error) {
        console.error('Error fetching data:', error);
        if (error.message.includes('429')) {
            handleAuthError('Too many requests (Quota Exceeded). Please wait a while or check Google Cloud Console Quotas.');
        } else {
            handleAuthError(`Failed to fetch business profile data. ${error.message}`);
        }
    } finally {
        showLoadingState(false);
    }
}

async function fetchAccounts() {
    const response = await fetch('https://mybusinessaccountmanagement.googleapis.com/v1/accounts', {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        const errorBody = await response.text();
        console.error('Accounts API Error Body:', errorBody);

        if (response.status === 401) {
            sessionStorage.removeItem('google_access_token');
            if (window.location.pathname.includes('dashboard')) {
                alert('Session expired. Please sign in again.');
                window.location.href = 'reviewflow.html';
            }
        }

        throw new Error(`Accounts API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.accounts || [];
}

async function fetchLocations(accountName) {
    const response = await fetch(`https://mybusinessbusinessinformation.googleapis.com/v1/${accountName}/locations?readMask=name,title,storeCode`, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!response.ok) {
        throw new Error(`Locations API Error: ${response.statusText}`);
    }

    const data = await response.json();
    return data.locations || [];
}

async function fetchReviews(locationName) {
    showReviewsLoading(true);
    const reviewsContainer = document.getElementById('reviews-container');
    const statsSection = document.getElementById('dashboard-stats-section');
    const statsSkeleton = document.getElementById('stats-skeleton');
    const statsContent = document.getElementById('stats-content');

    if (reviewsContainer) reviewsContainer.style.display = 'block';
    if (statsSection) statsSection.style.display = 'block';
    if (statsSkeleton) statsSkeleton.style.display = 'flex';
    if (statsContent) statsContent.style.display = 'none';

    try {
        let resourceName = locationName;
        if (!resourceName.startsWith('accounts/') && currentAccountName) {
            resourceName = `${currentAccountName}/${locationName}`;
        }
        console.log(`Fetching reviews for: ${resourceName}`);

        // Fetch all reviews
        let allReviews = [];
        let nextPageToken = null;
        let pageCount = 0;
        // Limit to 5 pages (approx 250 reviews) to prevent infinite loops or long waits during demo
        const MAX_PAGES = 5;

        do {
            let url = `https://mybusiness.googleapis.com/v4/${resourceName}/reviews?pageSize=50`;
            if (nextPageToken) {
                url += `&pageToken=${nextPageToken}`;
            }

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${accessToken}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                const errText = await response.text();
                // If it's 404/400 maybe no reviews yet
                if (response.status === 404) break;
                throw new Error(`Reviews API Error: ${response.statusText}`);
            }

            const data = await response.json();
            if (data.reviews) {
                allReviews = allReviews.concat(data.reviews);
            }

            nextPageToken = data.nextPageToken;
            pageCount++;
        } while (nextPageToken && pageCount < MAX_PAGES);

        displayReviews(allReviews);
        updateDashboardStats(allReviews);

    } catch (error) {
        console.error('Error fetching reviews:', error);
        const list = document.getElementById('reviews-list');
        if (list) list.innerHTML = `<div class="rf-error-message">Error fetching reviews: ${error.message}</div>`;
    } finally {
        showReviewsLoading(false);
        if (statsSkeleton) statsSkeleton.style.display = 'none';
        if (statsContent) statsContent.style.display = 'flex';
    }
}

function showReviewsLoading(isLoading) {
    const loadingEl = document.getElementById('reviews-loading');
    if (loadingEl) loadingEl.style.display = isLoading ? 'flex' : 'none';
}

function displayReviews(reviews) {
    console.log('displayReviews called with', reviews.length, 'reviews');
    // Store reviews globally for filtering
    window.allReviews = reviews;

    // Use the displayFilteredReviews function from dashboard.html
    if (typeof window.displayFilteredReviews === 'function') {
        window.displayFilteredReviews();
    } else {
        console.error('displayFilteredReviews function not available');
    }
}

function updateDashboardStats(reviews) {
    if (!reviews || reviews.length === 0) {
        // Handle empty state
        const totalReviewsEl = document.getElementById('total-reviews-count');
        if (totalReviewsEl) totalReviewsEl.textContent = '0';

        const avgRatingEl = document.getElementById('average-rating-value');
        if (avgRatingEl) avgRatingEl.textContent = '0.0/5';

        const responseRateEl = document.getElementById('response-rate-value');
        if (responseRateEl) responseRateEl.textContent = '0%';

        return;
    }

    // 1. Calculate Overview Metrics
    const totalReviews = reviews.length;
    let totalScore = 0;
    let repliedCount = 0;
    const ratingCounts = { 'FIVE': 0, 'FOUR': 0, 'THREE': 0, 'TWO': 0, 'ONE': 0 };
    const ratingMap = { 'FIVE': 5, 'FOUR': 4, 'THREE': 3, 'TWO': 2, 'ONE': 1 };

    reviews.forEach(r => {
        const score = ratingMap[r.starRating] || 0;
        totalScore += score;
        if (r.starRating) ratingCounts[r.starRating] = (ratingCounts[r.starRating] || 0) + 1;
        if (r.reviewReply) repliedCount++;
    });

    const avgRating = (totalScore / totalReviews).toFixed(1);
    const responseRate = Math.round((repliedCount / totalReviews) * 100);

    // Update Overview UI
    const totalReviewsEl = document.getElementById('total-reviews-count');
    if (totalReviewsEl) totalReviewsEl.textContent = totalReviews;

    const avgRatingEl = document.getElementById('average-rating-value');
    if (avgRatingEl) avgRatingEl.textContent = `${avgRating}/5`;

    const responseRateEl = document.getElementById('response-rate-value');
    if (responseRateEl) responseRateEl.textContent = `${responseRate}%`;

    const repliedCountEl = document.getElementById('replied-count');
    if (repliedCountEl) repliedCountEl.textContent = repliedCount;

    // Update Stars
    const starContainer = document.getElementById('average-rating-stars');
    if (starContainer) {
        let starsHtml = '';
        const roundedRating = Math.round(avgRating);
        for (let i = 0; i < 5; i++) {
            const color = i < roundedRating ? '#fbbf24' : '#e5e7eb';
            starsHtml += `<svg width="24" height="24" fill="${color}" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
        }
        starContainer.innerHTML = starsHtml;
    }

    // Update Breakdown
    const breakdownContainer = document.getElementById('rating-breakdown');
    if (breakdownContainer) {
        breakdownContainer.innerHTML = '';
        ['FIVE', 'FOUR', 'THREE', 'TWO', 'ONE'].forEach((key, index) => {
            const count = ratingCounts[key];
            const percent = totalReviews > 0 ? (count / totalReviews) * 100 : 0;
            const starLabel = 5 - index;

            const item = document.createElement('div');
            item.style.display = 'flex';
            item.style.alignItems = 'center';
            item.style.gap = '0.5rem';
            item.style.marginBottom = '0.25rem';

            item.innerHTML = `
                <div style="width: 12px; font-weight: 600;">${starLabel}</div>
                <div style="flex: 1; height: 6px; background: #f3f4f6; border-radius: 3px; overflow: hidden;">
                    <div style="width: ${percent}%; height: 100%; background: #fbbf24; border-radius: 3px;"></div>
                </div>
                <div style="width: 20px; text-align: right; color: #6b7280;">${count}</div>
            `;
            breakdownContainer.appendChild(item);
        });
    }

    // 2. Render Growth Chart
    renderGrowthChart(reviews);
}

function renderGrowthChart(reviews) {
    const ctx = document.getElementById('reviewsGrowthChart');
    if (!ctx) return;

    // Group reviews by Month (Last 6 months + Current)
    const months = {};
    const today = new Date();

    // Initialize last 6 months with 0
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        months[key] = 0;
    }

    reviews.forEach(r => {
        const d = new Date(r.createTime); // createTime is ISO string
        const key = d.toLocaleString('default', { month: 'short', year: 'numeric' });
        if (months.hasOwnProperty(key)) {
            months[key]++;
        }
    });

    const labels = Object.keys(months);
    const dataPoints = Object.values(months);

    // Destroy existing chart if any (global check not shown, assuming fresh render or window property)
    if (window.growthChart instanceof Chart) {
        window.growthChart.destroy();
    }

    window.growthChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'New Reviews',
                data: dataPoints,
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                borderWidth: 2,
                tension: 0.4,
                fill: true,
                pointRadius: 4,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#3b82f6',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        stepSize: 1
                    },
                    grid: {
                        color: '#f3f4f6'
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}

async function handleReplySubmit(btn, reviewName) {
    const form = btn.closest('.reply-form');
    const textarea = form.querySelector('.reply-textarea');
    const statusEl = form.querySelector('.reply-status');
    const replyText = textarea.value.trim();

    if (!replyText) {
        alert('Please write a reply first.');
        return;
    }

    btn.disabled = true;
    btn.textContent = 'Posting...';
    statusEl.textContent = '';
    statusEl.className = 'reply-status';

    try {
        await postReply(reviewName, replyText);

        statusEl.textContent = 'Reply posted successfully!';
        statusEl.classList.add('success');

        setTimeout(() => {
            const card = form.parentElement;
            form.remove();

            const replyDiv = document.createElement('div');
            replyDiv.className = 'review-reply';
            replyDiv.innerHTML = `
               <div class="reply-label">Your Reply</div>
               <div class="review-comment">${replyText}</div>
           `;
            card.appendChild(replyDiv);
        }, 1500);

    } catch (error) {
        console.error('Reply Error:', error);
        statusEl.textContent = 'Failed to post reply.';
        statusEl.classList.add('error');
        btn.disabled = false;
        btn.textContent = 'Post Reply';
    }
}

async function postReply(reviewName, comment) {
    const response = await fetch(`https://mybusiness.googleapis.com/v4/${reviewName}/reply`, {
        method: 'PUT',
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            comment: comment
        })
    });

    if (!response.ok) {
        throw new Error(`Reply API Error: ${response.statusText}`);
    }

    return await response.json();
}

function showLoadingState(isLoading) {
    const container = document.getElementById('locations-container');
    const loadingEl = document.getElementById('locations-loading');

    if (isLoading) {
        if (loadingEl) loadingEl.style.display = 'flex';
    } else {
        if (loadingEl) loadingEl.style.display = 'none';
        if (container) container.style.display = 'block';
    }
}

function displayLocations(locations) {
    const listContainer = document.getElementById('locations-list');

    if (!listContainer) return;

    listContainer.innerHTML = '';

    if (locations.length === 0) {
        showNoLocationsError();
        return;
    }

    const label = document.createElement('label');
    label.innerText = 'Select your business location:';
    label.className = 'rf-label';
    label.style.marginBottom = '1rem';
    label.style.display = 'block';
    label.style.color = 'var(--text-primary)';
    label.style.fontWeight = '600';
    label.style.textAlign = 'center';
    label.style.fontSize = '1.125rem';
    listContainer.appendChild(label);

    const selectWrapper = document.createElement('div');
    selectWrapper.style.position = 'relative';

    const select = document.createElement('select');
    select.className = 'rf-select';
    select.id = 'location-select';
    select.style.width = '100%';
    select.style.padding = '12px 16px';
    select.style.borderRadius = '8px';
    select.style.border = '1px solid #E2E8F0';
    select.style.backgroundColor = '#FFFFFF';
    select.style.color = '#1E293B';
    select.style.fontSize = '1rem';
    select.style.transition = 'all 0.2s';

    const defaultOption = document.createElement('option');
    defaultOption.text = 'Select a location';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    locations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.name;
        option.text = loc.title + (loc.storeCode ? ` (${loc.storeCode})` : '') + ` (${loc.name.split('/').pop()})`;
        select.appendChild(option);
    });

    selectWrapper.appendChild(select);
    listContainer.appendChild(selectWrapper);

    select.addEventListener('change', (e) => {
        const locationName = e.target.value;
        if (locationName) {
            fetchReviews(locationName);
        }
    });
}

function showNoLocationsError() {
    const listContainer = document.getElementById('locations-list');
    if (listContainer) {
        listContainer.innerHTML = '<div class="rf-error-message">No business locations found.</div>';
    }
}

function handleAuthError(message) {
    console.error('Auth Error:', message);
    const container = document.getElementById('locations-container');
    const loadingEl = document.getElementById('locations-loading');
    const listContainer = document.getElementById('locations-list');

    if (loadingEl) loadingEl.style.display = 'none';
    if (container) container.style.display = 'block';
    if (listContainer) {
        listContainer.innerHTML = `<div class="rf-error-message">Error: ${message}</div>`;
    }
}

function checkGoogleLibrary() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        initGoogleAuth();
        checkSession();
    } else {
        setTimeout(checkGoogleLibrary, 100);
    }
}

window.addEventListener('load', checkGoogleLibrary);

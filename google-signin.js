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
    if (reviewsContainer) reviewsContainer.style.display = 'block';

    try {
        let resourceName = locationName;
        if (!resourceName.startsWith('accounts/') && currentAccountName) {
            resourceName = `${currentAccountName}/${locationName}`;
        }
        console.log(`Fetching reviews for: ${resourceName}`);

        const response = await fetch(`https://mybusiness.googleapis.com/v4/${resourceName}/reviews?pageSize=20`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error('Reviews API Error details:', errText);
            throw new Error(`Reviews API Error: ${response.statusText}`);
        }

        const data = await response.json();
        displayReviews(data.reviews || []);
    } catch (error) {
        console.error('Error fetching reviews:', error);
        const list = document.getElementById('reviews-list');
        if (list) list.innerHTML = `<div class="rf-error-message">Error fetching reviews: ${error.message}</div>`;
    } finally {
        showReviewsLoading(false);
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

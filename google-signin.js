console.log('google-signin.js loaded');

// Google Identity Services Configuration
const GOOGLE_CLIENT_ID = '37214632622-l5kh41kk01u3e4oom7mm2lbtsmvesbjb.apps.googleusercontent.com'; // Replace with your actual Client ID
const GOOGLE_API_KEY = 'AIzaSyCnXDCIinKriq2pFMX1rM9GG7_XwgfhWK8'; // Replace with your actual API Key (optional for some flows, but good practice)

// Scopes required for Google Business Profile
// https://www.googleapis.com/auth/business.manage
const SCOPES = 'https://www.googleapis.com/auth/business.manage';

let tokenClient;
let accessToken = null;

// Initialize the Google Identity Services Token Client
function initGoogleAuth() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                console.log('Granted Scopes:', tokenResponse.scope);
                accessToken = tokenResponse.access_token;
                handleAuthSuccess();
            } else {
                handleAuthError('Failed to retrieve access token.');
            }
        },
        error_callback: (error) => {
            handleAuthError(error);
        }
    });
}

// Trigger the Sign In flow
function signInWithGoogle() {
    console.log('Sign In button clicked');
    if (!tokenClient) {
        console.error('Google Auth not initialized.');
        alert('Google Sign-In is still initializing. Please wait a moment and try again.');
        return;
    }
    tokenClient.requestAccessToken();
}

// Handle successful authentication
async function handleAuthSuccess() {
    showLoadingState(true);
    try {
        const accounts = await fetchAccounts();
        if (accounts && accounts.length > 0) {
            // For simplicity, we'll fetch locations for the first account found
            // In a real app, you might let the user choose the account if there are multiple
            const accountId = accounts[0].name; // Format: accounts/{accountId}
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

// Fetch Accounts from Google Business Profile API
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
        throw new Error(`Accounts API Error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    return data.accounts || [];
}

// Fetch Locations for a specific Account
async function fetchLocations(accountName) {
    // Note: The API endpoint for locations is under mybusinessbusinessinformation
    // Endpoint: https://mybusinessbusinessinformation.googleapis.com/v1/{parent}/locations
    // accountName is already in format "accounts/{id}"
    // critical: readMask is often required to get fields
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

// Fetch Reviews for a specific Location
async function fetchReviews(locationName) {
    showReviewsLoading(true);
    const reviewsContainer = document.getElementById('reviews-container');
    if (reviewsContainer) reviewsContainer.style.display = 'block';

    try {
        // Endpoint: https://mybusiness.googleapis.com/v4/{name}/reviews
        // locationName is 'accounts/{accId}/locations/{locId}'
        // NOTE: Ensure the 'Business Profile' API is enabled in GCP.
        const response = await fetch(`https://mybusiness.googleapis.com/v4/${locationName}/reviews?pageSize=20`, {
            headers: {
                'Authorization': `Bearer ${accessToken}`,
                'Content-Type': 'application/json'
            }
        });

        if (!response.ok) {
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

// UI Updates
function showReviewsLoading(isLoading) {
    const loadingEl = document.getElementById('reviews-loading');
    if (loadingEl) loadingEl.style.display = isLoading ? 'flex' : 'none';
}

function displayReviews(reviews) {
    const list = document.getElementById('reviews-list');
    if (!list) return;

    list.innerHTML = '';

    if (reviews.length === 0) {
        list.innerHTML = '<div class="rf-error-message" style="background:var(--bg-secondary);color:var(--text-secondary);border:none;">No reviews found for this location.</div>';
        return;
    }

    reviews.forEach(review => {
        const card = document.createElement('div');
        card.className = 'review-card';

        // Star Rating Processing
        const starRating = review.starRating;
        let starsHtml = '';
        const ratingMap = { 'ONE': 1, 'TWO': 2, 'THREE': 3, 'FOUR': 4, 'FIVE': 5 };
        const numStars = ratingMap[starRating] || 0;

        for (let i = 0; i < 5; i++) {
            if (i < numStars) {
                starsHtml += `<svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
            } else {
                starsHtml += `<svg width="16" height="16" fill="#E5E7EB" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/></svg>`;
            }
        }

        const dateStr = new Date(review.createTime).toLocaleDateString();

        card.innerHTML = `
            <div class="review-header">
                <div class="reviewer-name">${review.reviewer.displayName}</div>
                <div class="review-time">${dateStr}</div>
            </div>
            <div class="review-stars" style="margin-bottom: 0.5rem;">${starsHtml}</div>
            <div class="review-comment">${review.comment || '(No comment provided)'}</div>
        `;

        // Check for reply
        if (review.reviewReply) {
            const replyDiv = document.createElement('div');
            replyDiv.className = 'review-reply';
            replyDiv.innerHTML = `
                <div class="reply-label">Your Reply</div>
                <div class="review-comment">${review.reviewReply.comment}</div>
            `;
            card.appendChild(replyDiv);
        } else {
            // Add Reply Form
            const replyForm = document.createElement('div');
            replyForm.className = 'reply-form';
            replyForm.innerHTML = `
                <textarea class="reply-textarea" placeholder="Write a response..."></textarea>
                <div class="reply-actions">
                    <span class="reply-status"></span>
                    <button class="btn btn-primary rf-btn-primary btn-sm" onclick="handleReplySubmit(this, '${review.name}')">Post Reply</button>
                </div>
            `;
            card.appendChild(replyForm);
        }

        list.appendChild(card);
    });
}

// Handle Reply Submission
async function handleReplySubmit(btn, reviewName) {
    const form = btn.closest('.reply-form');
    const textarea = form.querySelector('.reply-textarea');
    const statusEl = form.querySelector('.reply-status');
    const replyText = textarea.value.trim();

    if (!replyText) {
        alert('Please write a reply first.');
        return;
    }

    // UI Loading State
    btn.disabled = true;
    btn.textContent = 'Posting...';
    statusEl.textContent = '';
    statusEl.className = 'reply-status';

    try {
        // Endpoint: https://mybusiness.googleapis.com/v4/{name}/reply
        // reviewName is 'accounts/{acc}/locations/{loc}/reviews/{rev}'
        await postReply(reviewName, replyText);

        // Success UI
        statusEl.textContent = 'Reply posted successfully!';
        statusEl.classList.add('success');

        // Remove form and show static reply after a moment (optional, or just reload)
        setTimeout(() => {
            // Reload reviews to show standard "Your Reply" view
            // Or manipulate DOM to swap form for static view
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
        method: 'PUT', // or POST, usually PUT for reply updates/creation
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

// UI Updates
function showLoadingState(isLoading) {
    const container = document.getElementById('locations-container');
    const loadingEl = document.getElementById('locations-loading');

    if (isLoading) {
        if (container) container.style.display = 'block';
        if (loadingEl) loadingEl.style.display = 'flex';
    } else {
        if (loadingEl) loadingEl.style.display = 'none';
    }
}

function displayLocations(locations) {
    const container = document.getElementById('locations-container');
    const listContainer = document.getElementById('locations-list');

    if (!container || !listContainer) return;

    container.style.display = 'block';
    listContainer.innerHTML = ''; // Clear previous

    if (locations.length === 0) {
        showNoLocationsError();
        return;
    }

    // Create a dropdown or list
    const select = document.createElement('select');
    select.className = 'rf-select'; // styling class
    select.id = 'location-select';

    // Default option
    const defaultOption = document.createElement('option');
    defaultOption.text = 'Select a location';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    select.appendChild(defaultOption);

    locations.forEach(loc => {
        const option = document.createElement('option');
        option.value = loc.name; // locations/{locationId}
        option.text = loc.title + (loc.storeCode ? ` (${loc.storeCode})` : '');
        select.appendChild(option);
    });

    listContainer.appendChild(select);

    // Event Listener for selection
    select.addEventListener('change', (e) => {
        const locationName = e.target.value;
        if (locationName) {
            fetchReviews(locationName);
        }
    });

    // Add a label
    const label = document.createElement('label');
    label.innerText = 'Select your business location:';
    label.className = 'rf-label';
    label.setAttribute('for', 'location-select');

    listContainer.insertBefore(label, select);
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
    const listContainer = document.getElementById('locations-list');

    if (container) container.style.display = 'block';
    if (listContainer) {
        listContainer.innerHTML = `<div class="rf-error-message">Error: ${message}</div>`;
    }
}

// Initialize on load
function checkGoogleLibrary() {
    if (typeof google !== 'undefined' && google.accounts && google.accounts.oauth2) {
        initGoogleAuth();
    } else {
        // Retry after a short delay if library not yet loaded
        setTimeout(checkGoogleLibrary, 100);
    }
}

window.addEventListener('load', checkGoogleLibrary);

// Dashboard Application JavaScript

document.addEventListener('DOMContentLoaded', () => {
  loadUserInfo();
  loadUrlHistory();
  setupEventListeners();
});

// Load user info
async function loadUserInfo() {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      document.getElementById('userName').textContent = `Welcome, ${data.user.name}`;
    } else {
      window.location.href = '/login';
    }
  } catch (err) {
    console.error('Error loading user info:', err);
  }
}

// Setup event listeners
function setupEventListeners() {
  // Shorten form
  document.getElementById('shortenForm').addEventListener('submit', handleShorten);

  // Logout button
  document.getElementById('logoutBtn').addEventListener('click', handleLogout);

  // Copy button
  document.getElementById('copyBtn').addEventListener('click', handleCopy);
}

// Handle URL shortening
async function handleShorten(e) {
  e.preventDefault();

  const btn = document.getElementById('shortenBtn');
  const messageDiv = document.getElementById('message');
  const resultDiv = document.getElementById('result');
  const originalUrl = document.getElementById('originalUrl').value.trim();

  if (!originalUrl) return;

  btn.disabled = true;
  btn.textContent = 'Shortening...';
  messageDiv.className = 'message hidden';
  resultDiv.className = 'result hidden';

  try {
    const response = await fetch('/api/url/shorten', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ originalUrl })
    });

    const data = await response.json();

    if (response.ok) {
      // Show result
      const shortUrlLink = document.getElementById('shortUrlLink');
      shortUrlLink.href = data.url.shortUrl;
      shortUrlLink.textContent = data.url.shortUrl;
      resultDiv.className = 'result';

      // Clear input
      document.getElementById('originalUrl').value = '';

      // Reload history
      loadUrlHistory();
    } else {
      messageDiv.className = 'message error';
      messageDiv.textContent = data.error;
    }
  } catch (err) {
    messageDiv.className = 'message error';
    messageDiv.textContent = 'Network error. Please try again.';
  } finally {
    btn.disabled = false;
    btn.textContent = 'Shorten';
  }
}

// Handle copy to clipboard
async function handleCopy() {
  const shortUrl = document.getElementById('shortUrlLink').textContent;
  try {
    await navigator.clipboard.writeText(shortUrl);
    const copyBtn = document.getElementById('copyBtn');
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy';
    }, 2000);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = shortUrl;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);

    const copyBtn = document.getElementById('copyBtn');
    copyBtn.textContent = '✅ Copied!';
    setTimeout(() => {
      copyBtn.textContent = '📋 Copy';
    }, 2000);
  }
}

// Load URL history
async function loadUrlHistory() {
  const historyDiv = document.getElementById('urlHistory');
  const loadingDiv = document.getElementById('historyLoading');
  const emptyDiv = document.getElementById('historyEmpty');

  loadingDiv.className = 'loading';
  emptyDiv.className = 'empty-state hidden';
  historyDiv.innerHTML = '';

  try {
    const response = await fetch('/api/url/history');

    if (!response.ok) {
      if (response.status === 401) {
        window.location.href = '/login';
        return;
      }
      throw new Error('Failed to load history');
    }

    const data = await response.json();
    loadingDiv.className = 'loading hidden';

    if (data.urls.length === 0) {
      emptyDiv.className = 'empty-state';
      return;
    }

    data.urls.forEach(url => {
      const urlItem = createUrlItem(url);
      historyDiv.appendChild(urlItem);
    });

  } catch (err) {
    loadingDiv.className = 'loading hidden';
    historyDiv.innerHTML = '<p style="text-align:center;color:#999;">Error loading URLs. Please refresh.</p>';
    console.error('Error loading history:', err);
  }
}

// Create URL history item element
function createUrlItem(url) {
  const div = document.createElement('div');
  div.className = 'url-item';

  const date = new Date(url.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  div.innerHTML = `
    <div class="url-item-header">
      <div class="url-short">
        <a href="${url.shortUrl}" target="_blank">${url.shortUrl}</a>
      </div>
      <button class="btn btn-delete" onclick="deleteUrl('${url._id}')">🗑️ Delete</button>
    </div>
    <div class="url-original">📎 ${url.originalUrl}</div>
    <div class="url-meta">
      <span>📅 ${date}</span>
      <span>👆 ${url.clicks} click${url.clicks !== 1 ? 's' : ''}</span>
    </div>
  `;

  return div;
}

// Delete URL
async function deleteUrl(id) {
  if (!confirm('Are you sure you want to delete this URL?')) return;

  try {
    const response = await fetch(`/api/url/${id}`, {
      method: 'DELETE'
    });

    if (response.ok) {
      loadUrlHistory();
    } else {
      const data = await response.json();
      alert(data.error || 'Failed to delete URL');
    }
  } catch (err) {
    alert('Network error. Please try again.');
  }
}

// Handle logout
async function handleLogout() {
  try {
    const response = await fetch('/api/auth/logout', {
      method: 'POST'
    });

    if (response.ok) {
      window.location.href = '/login';
    }
  } catch (err) {
    window.location.href = '/login';
  }
}
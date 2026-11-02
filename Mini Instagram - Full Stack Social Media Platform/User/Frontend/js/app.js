/* ============================================
   INSTAGRAM CLONE – CORE APP UTILITIES
   Navigation, Modals, Toasts, Icons
   ============================================ */

// --- SVG Icons (Instagram-style) ---
const ICONS = {
  home: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9.5L12 2l9 7.5V20a2 2 0 01-2 2H5a2 2 0 01-2-2V9.5z"/><path d="M9 22V12h6v10"/></svg>`,
  homeFilled: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M12 2L3 9.5V20a2 2 0 002 2h4v-8h6v8h4a2 2 0 002-2V9.5L12 2z"/></svg>`,
  search: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
  searchFilled: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>`,
  reels: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M10 8l6 4-6 4V8z"/></svg>`,
  reelsFilled: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="2" y="2" width="20" height="20" rx="4"/><path d="M10 8l6 4-6 4V8z" fill="black"/></svg>`,
  heart: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  heartFilled: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>`,
  comment: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>`,
  share: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
  bookmark: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
  bookmarkFilled: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>`,
  plus: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>`,
  messenger: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z"/></svg>`,
  moreHoriz: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/></svg>`,
  grid: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/></svg>`,
  settings: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
  music: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
  verified: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10 10-4.5 10-10S17.5 2 12 2zm-1.7 14.3l-3.6-3.6 1.4-1.4 2.2 2.2 5.6-5.6 1.4 1.4-7 7z"/></svg>`,
  newMessage: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>`,
  camera: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
  close: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>`,
  back: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>`,
};

// --- Global Utilities ---
function formatCaption(text) {
  if (!text) return '';
  // Simple hashtag styling
  return text.replace(/(#[a-zA-Z0-9_]+)/g, '<span style="color: var(--text-link); cursor: pointer;">$1</span>');
}

// --- Current page detection ---
function getCurrentPage() {
  const path = window.location.pathname;
  if (path.includes('home')) return 'home';
  if (path.includes('explore')) return 'explore';
  if (path.includes('reels')) return 'reels';
  if (path.includes('profile')) return 'profile';
  if (path.includes('messages')) return 'messages';
  if (path.includes('index') || path.endsWith('/')) return 'auth';
  return 'home';
}

// --- Build Top Navigation ---
function buildTopNav() {
  const nav = document.getElementById('top-nav');
  if (!nav) return;

  const page = getCurrentPage();

  if (page === 'profile') {
    // Determine the username to show (CURRENT_USER by default, or the profileUser if we are on someone else's profile)
    // We will just fetch it from URL params or default to CURRENT_USER.username
    const urlParams = new URLSearchParams(window.location.search);
    const userIdParam = urlParams.get('user');
    let displayUsername = CURRENT_USER?.username || 'Profile';
    if (userIdParam && typeof USERS !== 'undefined') {
      const u = USERS.find(user => user.user_id === parseInt(userIdParam));
      if (u) displayUsername = u.username;
    }
    
    const isCurrentUser = !userIdParam || parseInt(userIdParam) === CURRENT_USER?.user_id;

    nav.innerHTML = `
      <div style="font-weight: 600; font-size: 20px; display: flex; align-items: center; gap: 8px;">
        ${!isCurrentUser ? `<button onclick="window.history.back()">${ICONS.back}</button>` : ''}
        ${displayUsername}
      </div>
      <div class="top-nav__actions">
        ${isCurrentUser ? `
          <button id="btn-create-profile" aria-label="Create" onclick="openCreateModal()">
            ${ICONS.plus}
          </button>
          <button id="btn-settings" aria-label="Settings" onclick="openSettingsMenu()">
            ${ICONS.settings}
          </button>
        ` : `
          <button id="btn-settings-other" aria-label="Settings">
            ${ICONS.moreHoriz}
          </button>
        `}
      </div>
    `;
  } else {
    nav.innerHTML = `
      <a href="home.html" class="top-nav__logo">Instagram</a>
      <div class="top-nav__actions">
        <a href="messages.html" aria-label="Messages">
          ${ICONS.messenger}
        </a>
      </div>
    `;
  }
}

// --- Build Bottom Navigation ---
function buildBottomNav() {
  const nav = document.getElementById('bottom-nav');
  if (!nav) return;

  const page = getCurrentPage();

  nav.innerHTML = `
    <a href="home.html" class="bottom-nav__item ${page === 'home' ? 'active' : ''}" id="nav-home" aria-label="Home">
      ${page === 'home' ? ICONS.homeFilled : ICONS.home}
    </a>
    <a href="explore.html" class="bottom-nav__item ${page === 'explore' ? 'active' : ''}" id="nav-explore" aria-label="Explore">
      ${page === 'explore' ? ICONS.searchFilled : ICONS.search}
    </a>
    <button class="bottom-nav__item" id="nav-create" aria-label="Create" onclick="openCreateModal()">
      <div class="bottom-nav__item--create">
        ${ICONS.plus}
      </div>
    </button>
    <a href="reels.html" class="bottom-nav__item ${page === 'reels' ? 'active' : ''}" id="nav-reels" aria-label="Reels">
      ${page === 'reels' ? ICONS.reelsFilled : ICONS.reels}
    </a>
    <a href="profile.html" class="bottom-nav__item ${page === 'profile' ? 'active' : ''}" id="nav-profile" aria-label="Profile">
      ${CURRENT_USER ? `<img src="${CURRENT_USER.avatar || DEFAULT_AVATAR}" alt="Profile" class="bottom-nav__avatar" onerror="this.onerror=null; this.src=DEFAULT_AVATAR" />` : `<div class="bottom-nav__avatar" style="background:#555"></div>`}
    </a>
  `;
}

// --- Modal System ---
function openModal(contentHTML) {
  // Remove existing modal
  closeModal();

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'active-modal';
  overlay.innerHTML = contentHTML;

  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeModal();
  });

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  const modal = document.getElementById('active-modal');
  if (modal) {
    modal.remove();
    document.body.style.overflow = '';
  }
}

// --- Create Post Modal ---
function openCreateModal() {
  const html = `
    <div class="create-modal">
      <div class="create-modal__header">
        <button onclick="closeModal()" type="button">Cancel</button>
        <h3>Create new</h3>
        <button id="create-modal-submit" style="color: var(--accent-blue);" onclick="document.getElementById('create-form').dispatchEvent(new Event('submit'))">Share</button>
      </div>
      <div class="create-modal__body" style="padding: 16px; overflow-y: auto;">
        <form id="create-form" onsubmit="handleCreateSubmit(event)">
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Type</label>
            <select id="create-type" style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary);">
              <option value="post">Post</option>
              <option value="reel">Reel</option>
            </select>
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">File (Image/Video)</label>
            <input type="file" id="create-file" required accept="image/*,video/*" style="width: 100%;" />
          </div>
          <div style="margin-bottom: 15px;">
            <label style="display: block; margin-bottom: 5px; font-weight: 500;">Caption</label>
            <textarea id="create-caption" rows="3" placeholder="Write a caption..." style="width: 100%; padding: 8px; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-primary); color: var(--text-primary); resize: vertical;"></textarea>
          </div>
          <button type="submit" style="display: none;"></button>
        </form>
      </div>
    </div>
  `;
  openModal(html);
}

async function handleCreateSubmit(e) {
  e.preventDefault();
  
  const type = document.getElementById('create-type').value;
  const fileInput = document.getElementById('create-file');
  const caption = document.getElementById('create-caption').value;
  
  if (!fileInput.files || fileInput.files.length === 0) {
    showToast('Please select a file to upload');
    return;
  }
  
  const file = fileInput.files[0];
  const formData = new FormData();
  formData.append('file', file);
  if (caption.trim()) {
    formData.append('caption', caption.trim());
  }
  
  // Set media_type based on file extension or mime type
  const isVideo = file.type.startsWith('video/');
  formData.append('media_type', isVideo ? 'video' : 'image');
  
  document.getElementById('create-modal-submit').textContent = 'Sharing...';
  document.getElementById('create-modal-submit').disabled = true;
  
  try {
    let success = false;
    if (type === 'post') {
      success = await API.createPost(formData);
    } else if (type === 'reel') {
      success = await API.createReel(formData);
    }
    
    if (success) {
      closeModal();
      showToast('Successfully uploaded! Reloading...');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      throw new Error('Upload failed');
    }
  } catch (err) {
    showToast('Error uploading file. Make sure MinIO is running.');
    document.getElementById('create-modal-submit').disabled = false;
  }
}

// --- Settings Menu (Slide up) ---
function openSettingsMenu() {
  const html = `
    <div class="settings-slide" onclick="event.stopPropagation()">
      <div class="settings-slide__bar"></div>
      <div class="settings-slide__items">
        <div class="settings-slide__item" style="color: var(--accent-red, #ed4956); font-weight: 500;" onclick="API.logout()">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="width:22px;height:22px;"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Log out
        </div>
      </div>
    </div>
  `;
  openModal(html);
  
  // Custom styling override for slide up modal
  const activeModal = document.getElementById('active-modal');
  if (activeModal) {
    activeModal.style.alignItems = 'flex-end';
    activeModal.style.padding = '0';
  }
}

// --- Edit Profile Modal ---
function openEditProfileModal() {
  const html = `
    <div class="edit-profile-modal">
      <div class="create-modal__header">
        <button onclick="closeModal()" type="button">${ICONS.close}</button>
        <h3>Edit profile</h3>
        <button id="edit-profile-submit" style="color: var(--accent-blue);" onclick="document.getElementById('edit-profile-form').dispatchEvent(new Event('submit'))">Save</button>
      </div>
      <div class="create-modal__body" style="padding: 16px; overflow-y: auto; text-align: left;">
        <form id="edit-profile-form" onsubmit="handleEditProfileSubmit(event)">
          <div style="display: flex; flex-direction: column; align-items: center; margin-bottom: 24px;">
            <img id="edit-profile-avatar-preview" src="${CURRENT_USER.avatar}" style="width: 80px; height: 80px; border-radius: 50%; object-fit: cover; margin-bottom: 12px;"/>
            <div style="display: flex; gap: 16px; align-items: center; font-size: 0.9rem;">
              <div style="color: var(--accent-blue); font-weight: 500; cursor: pointer; position: relative;">
                Edit picture or avatar
                <input type="file" id="edit-profile-pic" accept="image/*" style="position: absolute; top: 0; left: 0; width: 100%; height: 100%; opacity: 0; cursor: pointer;" onchange="handleProfilePicPreview(event)" />
              </div>
              <div style="color: var(--accent-red, #ed4956); font-weight: 500; cursor: pointer;" onclick="handleDeleteProfilePic()">
                Remove photo
              </div>
            </div>
          </div>
          
          <div class="edit-field">
            <label>Name</label>
            <input type="text" id="edit-full-name" value="${CURRENT_USER.full_name || ''}" placeholder="Name" />
          </div>
          
          <div class="edit-field">
            <label>Username</label>
            <input type="text" id="edit-username" value="${CURRENT_USER.username || ''}" placeholder="Username" />
          </div>
          
          <div class="edit-field">
            <label>Bio</label>
            <textarea id="edit-bio" rows="3" placeholder="Bio">${CURRENT_USER.bio || ''}</textarea>
          </div>
          
          <div class="edit-field">
            <label>Phone number</label>
            <input type="text" id="edit-phone" value="${CURRENT_USER.phone_no || ''}" placeholder="Phone number" />
          </div>
          
          <button type="submit" style="display: none;"></button>
        </form>
      </div>
    </div>
  `;
  openModal(html);
}

async function handleEditProfileSubmit(e) {
  e.preventDefault();
  
  const submitBtn = document.getElementById('edit-profile-submit');
  submitBtn.textContent = 'Saving...';
  submitBtn.disabled = true;
  
  const fullName = document.getElementById('edit-full-name').value;
  const username = document.getElementById('edit-username').value;
  const bio = document.getElementById('edit-bio').value;
  const phone = document.getElementById('edit-phone').value;
  const picInput = document.getElementById('edit-profile-pic');
  
  try {
    // 1. Upload profile pic if changed
    if (picInput.files && picInput.files.length > 0) {
      const formData = new FormData();
      formData.append('file', picInput.files[0]);
      await API.request('/users/profile_picture', {
        method: 'POST',
        body: formData
      });
    }
    
    // 2. Update user info
    const updateData = {
      full_name: fullName,
      username: username,
      bio: bio,
      phone_no: phone,
    };
    
    const res = await API.request(`/users/${CURRENT_USER.user_id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    
    if (res.ok) {
      closeModal();
      showToast('Profile updated! Reloading...');
      setTimeout(() => window.location.reload(), 1500);
    } else {
      throw new Error('Update failed');
    }
  } catch (err) {
    console.error('Profile update error:', err);
    showToast('Failed to update profile');
    submitBtn.textContent = 'Save';
    submitBtn.disabled = false;
  }
}


// --- Toast Notifications ---
function showToast(message, duration = 3000) {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// --- Initialize page ---
function initPage() {
  buildTopNav();
  buildBottomNav();
}

// Auto-initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Key bindings can be initialized immediately
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeModal();
      const storyViewer = document.getElementById('story-viewer');
      if (storyViewer) storyViewer.classList.add('hidden');
    }
  });

  if (localStorage.getItem('ig_logged_in') !== 'true') {
    // If not logged in, build UI immediately
    initPage();
  } else {
    // Wait for data to load so CURRENT_USER is available before building the nav
    window.addEventListener('igDataLoaded', initPage);
  }
});


function handleProfilePicPreview(event) {
  const file = event.target.files && event.target.files[0];
  if (file) {
    const preview = document.getElementById('edit-profile-avatar-preview');
    if (preview) {
      preview.src = URL.createObjectURL(file);
    }
  }
}

async function handleDeleteProfilePic() {
  if (!confirm('Are you sure you want to remove your profile picture?')) return;
  try {
    showToast('Removing profile picture...');
    const res = await API.request('/users/profile_picture', {
      method: 'DELETE'
    });
    if (res.ok) {
      CURRENT_USER.profile_pic_url = null;
      CURRENT_USER.avatar = DEFAULT_AVATAR;
      const preview = document.getElementById('edit-profile-avatar-preview');
      if (preview) preview.src = DEFAULT_AVATAR;
      showToast('Profile photo removed!');
      closeModal();
      setTimeout(() => window.location.reload(), 600);
    } else {
      showToast('Failed to remove profile photo.');
    }
  } catch (e) {
    console.error(e);
    showToast('Error removing profile photo.');
  }
}

/* ============================================
   PROFILE PAGE LOGIC
   ============================================ */

let profileUser = null;
let currentTab = 'posts';
let isFollowing = false;

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('ig_logged_in') !== 'true') {
    window.location.href = 'index.html';
    return;
  }
  initializeData();
});

window.addEventListener('igDataLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const userIdParam = urlParams.get('user');
  
  if (userIdParam) {
    const uid = parseInt(userIdParam);
    profileUser = USERS.find(u => u.user_id === uid);
    
    if (!profileUser) {
      // User hasn't posted anything so they aren't in USERS array, fetch directly
      const fetchedUser = await API.getUser(uid);
      if (fetchedUser) {
        if (fetchedUser.profile_pic_url) {
          fetchedUser.avatar = fetchedUser.profile_pic_url;
        } else {
          fetchedUser.avatar = DEFAULT_AVATAR;
        }
        USERS.push(fetchedUser);
        profileUser = fetchedUser;
      }
    }
  } else {
    profileUser = CURRENT_USER;
  }
  
  if (!profileUser) return;

  // Fetch actual follower relationships to calculate accurate counts
  try {
    const allFollowers = await API.getAllFollowers();
    if (allFollowers) {
      profileUser.followers_count = allFollowers.filter(f => f.following_id === profileUser.user_id).length;
      profileUser.following_count = allFollowers.filter(f => f.follower_id === profileUser.user_id).length;
    }
  } catch (e) {
    console.error("Failed to fetch followers", e);
  }

  if (profileUser && CURRENT_USER && profileUser.user_id !== CURRENT_USER.user_id) {
    try {
      isFollowing = await API.checkIsFollowing(profileUser.user_id);
    } catch (e) {
      isFollowing = false;
    }
  }

  // Ensure fields exist so rendering doesn't crash
  profileUser.bio = profileUser.bio || '';
  profileUser.full_name = profileUser.full_name || profileUser.username || '';
  profileUser.posts_count = profileUser.posts_count || 0;
  profileUser.followers_count = profileUser.followers_count || 0;
  profileUser.following_count = profileUser.following_count || 0;

  renderProfileHeader();
  renderProfileGrid('posts');
});

function renderProfileHeader() {
  const container = document.getElementById('profile-header');
  if (!container || !profileUser) return;

  const isCurrentUser = CURRENT_USER && profileUser.user_id === CURRENT_USER.user_id;
  
  let actionButtons = '';
  if (isCurrentUser) {
    actionButtons = `
      <button class="profile-edit-btn" onclick="openEditProfileModal()">Edit profile</button>
    `;
  } else {
    actionButtons = `
      <button id="profile-follow-btn" class="profile-edit-btn" style="background: ${isFollowing ? 'var(--bg-secondary)' : 'var(--accent-blue)'}; color: ${isFollowing ? 'var(--text-primary)' : '#fff'};" onclick="toggleFollow()">
        ${isFollowing ? 'Following' : 'Follow'}
      </button>
      <button class="profile-share-btn">Message</button>
      <button class="profile-settings-btn">
        ${ICONS.moreHoriz}
      </button>
    `;
  }

  // Format bio text to convert newlines to <br> and highlight links
  const formattedBio = (profileUser.bio || '')
    .replace(/\n/g, '<br>')
    .replace(/(linktr\.ee\/[a-zA-Z0-9_]+)/g, '<span class="profile-header__bio-link">$1</span>');

  const fallbackAvatar = DEFAULT_AVATAR;

  const html = `
    <div class="profile-header__top">
      <div class="profile-header__avatar-wrapper">
        <img src="${profileUser.avatar || fallbackAvatar}" alt="${profileUser.username}" class="profile-header__avatar" onerror="this.onerror=null; this.src='${fallbackAvatar}'" />
      </div>
      <div class="profile-header__info">
        <div class="profile-header__username-row">
          <h2 class="profile-header__username">${profileUser.username}</h2>
          ${profileUser.followers_count > 100000 ? `<span class="profile-header__verified">${ICONS.verified}</span>` : ''}
          ${actionButtons}
        </div>
        <div class="profile-header__stats">
          <div class="profile-stat">
            <span class="profile-stat__count">${profileUser.posts_count}</span>
            <span class="profile-stat__label">posts</span>
          </div>
          <div class="profile-stat clickable" onclick="openFollowListModal('followers')">
            <span class="profile-stat__count" id="stat-followers-count">${formatCount(profileUser.followers_count)}</span>
            <span class="profile-stat__label">followers</span>
          </div>
          <div class="profile-stat clickable" onclick="openFollowListModal('following')">
            <span class="profile-stat__count" id="stat-following-count">${formatCount(profileUser.following_count)}</span>
            <span class="profile-stat__label">following</span>
          </div>
        </div>
      </div>
    </div>
    <div class="profile-header__bio">
      <div class="profile-header__fullname">${profileUser.full_name}</div>
      <div class="profile-header__bio-text">${formattedBio}</div>
    </div>
  `;

  container.innerHTML = html;
}


function switchProfileTab(tabName) {
  currentTab = tabName;
  
  // Update UI active state
  document.querySelectorAll('.profile-tab').forEach(t => t.classList.remove('active'));
  document.getElementById(`tab-${tabName}`).classList.add('active');

  // If viewing someone else, hide 'Saved' tab contents
  if (tabName === 'saved' && CURRENT_USER && profileUser.user_id !== CURRENT_USER.user_id) {
    const container = document.getElementById('profile-grid');
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-tertiary);">
        <h3 style="color: var(--text-primary); margin-bottom: 8px;">Only ${profileUser.username} can see what they've saved</h3>
      </div>
    `;
    return;
  }

  renderProfileGrid(tabName);
}

function renderProfileGrid(tabName) {
  const container = document.getElementById('profile-grid');
  if (!container || !profileUser) return;

  let items = [];

  if (tabName === 'posts') {
    items = POSTS.filter(p => p.user_id === profileUser.user_id).map(p => ({
      type: 'post',
      url: p.media_url,
      likes: p.likes_count,
      comments: p.comments_count,
      id: p.post_id
    }));
  } else if (tabName === 'reels') {
    items = REELS.filter(r => r.user_id === profileUser.user_id).map(r => ({
      type: 'reel',
      url: r.media_url,
      likes: r.likes_count,
      comments: r.comments_count,
      id: r.reel_id
    }));
  } else if (tabName === 'saved') {
    const savedPosts = POSTS.filter(p => p.is_saved).map(p => ({
      type: 'post',
      url: p.media_url,
      likes: p.likes_count,
      comments: p.comments_count,
      id: p.post_id
    }));
    const savedReels = REELS.filter(r => r.is_saved).map(r => ({
      type: 'reel',
      url: r.media_url,
      likes: r.likes_count,
      comments: r.comments_count,
      id: r.reel_id
    }));
    items = [...savedPosts, ...savedReels];
  }

  if (items.length === 0) {
    container.innerHTML = `
      <div style="grid-column: 1 / -1; text-align: center; padding: 60px 20px; color: var(--text-tertiary);">
        <div style="width: 64px; height: 64px; border: 2px solid var(--text-tertiary); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 16px;">
          ${tabName === 'posts' ? ICONS.camera : (tabName === 'reels' ? ICONS.reels : ICONS.bookmark)}
        </div>
        <h3 style="color: var(--text-primary); margin-bottom: 8px;">No ${tabName} yet</h3>
      </div>
    `;
    return;
  }

  let html = '';
  items.forEach((item, index) => {
    const isReelIcon = item.type === 'reel' 
      ? `<svg style="position: absolute; top: 8px; right: 8px; width: 20px; height: 20px; fill: #fff; filter: drop-shadow(0 1px 4px rgba(0,0,0,0.5));" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z"/></svg>` 
      : '';

    const mediaHtml = item.type === 'reel' || (item.url && item.url.toLowerCase().match(/\.(mp4|webm|ogg)$/))
      ? `<video src="${item.url}" style="width:100%; height:100%; object-fit:cover;"></video>`
      : `<img src="${item.url}" alt="Grid item" loading="lazy" />`;

    html += `
      <div class="profile-grid__item" onclick="openDetailModal('${item.type}', ${item.id})">
        ${mediaHtml}
        ${isReelIcon}
        <div class="profile-grid__item-overlay">
          <div class="profile-grid__item-stat">
            ${ICONS.heartFilled}
            <span>${formatCount(item.likes)}</span>
          </div>
          <div class="profile-grid__item-stat">
            ${ICONS.comment}
            <span>${formatCount(item.comments)}</span>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function toggleFollow() {
  if (!CURRENT_USER || !profileUser || profileUser.user_id === CURRENT_USER.user_id) return;
  
  const btn = document.getElementById('profile-follow-btn');
  isFollowing = !isFollowing;
  
  if (isFollowing) {
    if (btn) {
      btn.style.background = 'var(--bg-secondary)';
      btn.style.color = 'var(--text-primary)';
      btn.textContent = 'Following';
    }
    profileUser.followers_count++;
  } else {
    if (btn) {
      btn.style.background = 'var(--accent-blue)';
      btn.style.color = '#fff';
      btn.textContent = 'Follow';
    }
    profileUser.followers_count = Math.max(0, profileUser.followers_count - 1);
  }
  
  renderProfileHeader();
  
  try {
    if (isFollowing) {
      await API.followUser(profileUser.user_id);
    } else {
      await API.unfollowUser(profileUser.user_id);
    }
  } catch (err) {
    console.error('Follow toggle failed', err);
    showToast('Failed to update follow status');
  }
}

function openDetailModal(type, id) {
  let item = null;
  if (type === 'post') {
    item = POSTS.find(p => p.post_id === id);
  } else {
    item = REELS.find(r => r.reel_id === id);
  }
  
  if (!item) return;

  const isVideo = type === 'reel' || (item.media_type && item.media_type.includes('video'));
  const mediaHtml = isVideo 
    ? `<video src="${item.media_url}" controls autoplay style="max-width: 100%; max-height: 80vh; border-radius: 8px;"></video>`
    : `<img src="${item.media_url}" alt="Media" style="max-width: 100%; max-height: 80vh; border-radius: 8px; object-fit: contain;" />`;

  let deleteBtnHtml = '';
  
  if (currentTab === 'saved') {
    deleteBtnHtml = `<button onclick="handleDeleteFromModal('${type}', ${id}, 'unsave')" style="position: absolute; top: 20px; right: 60px; color: white; background: none; border: none; padding: 8px; cursor: pointer; z-index: 400;" title="Remove from saved">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>
    </button>`;
  } else if (CURRENT_USER && profileUser.user_id === CURRENT_USER.user_id) {
    deleteBtnHtml = `<button onclick="handleDeleteFromModal('${type}', ${id}, 'delete')" style="position: absolute; top: 20px; right: 60px; color: white; background: none; border: none; padding: 8px; cursor: pointer; z-index: 400;" title="Delete">
      <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
    </button>`;
  }

  const html = `
    <div style="position: relative; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.8);">
      <button onclick="closeModal()" style="position: absolute; top: 20px; right: 20px; color: white; background: none; border: none; font-size: 32px; padding: 4px 12px; cursor: pointer; z-index: 400;">&times;</button>
      ${deleteBtnHtml}
      ${mediaHtml}
    </div>
  `;
  openModal(html);
}

window.handleDeleteFromModal = async function(type, id, action) {
  if (action === 'unsave') {
    if (!confirm('Remove this ' + type + ' from saved?')) return;
    try {
      if (type === 'post') {
        await API.savePost(id); // Toggles it off
        const post = POSTS.find(p => p.post_id === id);
        if (post) post.is_saved = false;
      } else {
        await API.saveReel(id); // Toggles it off
        const reel = REELS.find(r => r.reel_id === id);
        if (reel) reel.is_saved = false;
      }
      showToast('Removed from saved');
      closeModal();
      renderProfileGrid('saved');
    } catch (e) {
      showToast('Failed to unsave');
    }
  } else if (action === 'delete') {
    if (!confirm('Are you sure you want to delete this ' + type + '?')) return;
    try {
      if (type === 'post') {
        const ok = await API.deletePost(id);
        if (!ok) throw new Error('Delete failed');
        const idx = POSTS.findIndex(p => p.post_id === id);
        if (idx !== -1) POSTS.splice(idx, 1);
        if (profileUser.posts_count > 0) profileUser.posts_count--;
      } else {
        const ok = await API.deleteReel(id);
        if (!ok) throw new Error('Delete failed');
        const idx = REELS.findIndex(r => r.reel_id === id);
        if (idx !== -1) REELS.splice(idx, 1);
      }
      showToast(type.charAt(0).toUpperCase() + type.slice(1) + ' deleted');
      closeModal();
      renderProfileHeader();
      renderProfileGrid(currentTab);
    } catch (e) {
      showToast('Failed to delete ' + type);
    }
  }
};


/* ============================================
   FOLLOWERS / FOLLOWING MODAL LOGIC
   ============================================ */
let currentModalFollowType = 'followers';
let followModalCache = {
  followers: [],
  following: []
};

async function openFollowListModal(type) {
  if (!profileUser) return;
  currentModalFollowType = type || 'followers';

  const modalHtml = `
    <div class="follow-modal" onclick="event.stopPropagation()">
      <div class="follow-modal__header">
        <div class="follow-modal__tabs">
          <button class="follow-modal__tab ${currentModalFollowType === 'followers' ? 'active' : ''}" id="tab-btn-followers" onclick="switchFollowModalTab('followers')">
            <span id="tab-count-followers">${profileUser.followers_count || 0}</span> followers
          </button>
          <button class="follow-modal__tab ${currentModalFollowType === 'following' ? 'active' : ''}" id="tab-btn-following" onclick="switchFollowModalTab('following')">
            <span id="tab-count-following">${profileUser.following_count || 0}</span> following
          </button>
        </div>
        <button class="follow-modal__close" onclick="closeModal()" aria-label="Close">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
        </button>
      </div>
      <div class="follow-modal__search-box">
        <div class="follow-modal__search-wrapper">
          <svg class="follow-modal__search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <input type="text" class="follow-modal__search-input" id="follow-modal-search" placeholder="Search" oninput="handleFollowModalSearch(this.value)" autocomplete="off" />
        </div>
      </div>
      <div class="follow-modal__list" id="follow-modal-list">
        <div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">Loading...</div>
      </div>
    </div>
  `;

  openModal(modalHtml);
  await loadAndRenderFollowModalData(currentModalFollowType);
}

async function switchFollowModalTab(type) {
  currentModalFollowType = type;
  document.querySelectorAll('.follow-modal__tab').forEach(b => b.classList.remove('active'));
  const activeBtn = document.getElementById(`tab-btn-${type}`);
  if (activeBtn) activeBtn.classList.add('active');

  const searchInput = document.getElementById('follow-modal-search');
  if (searchInput) searchInput.value = '';

  await loadAndRenderFollowModalData(type);
}

async function loadAndRenderFollowModalData(type) {
  const listEl = document.getElementById('follow-modal-list');
  if (listEl) {
    listEl.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: var(--text-secondary);">Loading...</div>';
  }

  try {
    const allRels = await API.getAllFollowers();
    
    // Followers: f.following_id === profileUser.user_id -> f.follower_id is follower
    // Following: f.follower_id === profileUser.user_id -> f.following_id is target
    const targetUserIds = (allRels || [])
      .filter(f => type === 'followers' ? f.following_id === profileUser.user_id : f.follower_id === profileUser.user_id)
      .map(f => type === 'followers' ? f.follower_id : f.following_id);

    const myFollowingSet = new Set(
      (allRels || [])
        .filter(f => CURRENT_USER && f.follower_id === CURRENT_USER.user_id)
        .map(f => f.following_id)
    );

    const usersList = [];
    for (const uid of targetUserIds) {
      let u = USERS.find(user => user.user_id === uid);
      if (!u) {
        try {
          u = await API.getUser(uid);
          if (u) {
            u = processMediaUrls(u);
            u.avatar = u.profile_pic_url || DEFAULT_AVATAR;
            USERS.push(u);
          }
        } catch (e) {
          console.error("Error fetching user " + uid, e);
        }
      }
      if (u) {
        usersList.push({
          ...u,
          isFollowing: myFollowingSet.has(u.user_id)
        });
      }
    }

    followModalCache[type] = usersList;
    renderFollowModalList(usersList, type);

    const countEl = document.getElementById(`tab-count-${type}`);
    if (countEl) countEl.textContent = usersList.length;

  } catch (err) {
    console.error("Error loading follow list", err);
    if (listEl) {
      listEl.innerHTML = '<div style="text-align: center; padding: 40px 20px; color: var(--accent-red);">Failed to load list.</div>';
    }
  }
}

function renderFollowModalList(users, type) {
  const listEl = document.getElementById('follow-modal-list');
  if (!listEl) return;

  if (!users || users.length === 0) {
    const emptyText = type === 'followers' ? 'No followers yet.' : 'Not following anyone yet.';
    listEl.innerHTML = `
      <div style="text-align: center; padding: 48px 20px; color: var(--text-secondary);">
        <svg viewBox="0 0 24 24" width="48" height="48" stroke="var(--text-tertiary)" stroke-width="1.5" fill="none" style="margin: 0 auto 12px; display: block;">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
          <circle cx="9" cy="7" r="4"></circle>
          <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
          <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
        </svg>
        <p style="font-size: 0.95rem; font-weight: 500;">${emptyText}</p>
      </div>
    `;
    return;
  }

  listEl.innerHTML = users.map(u => {
    const isMe = CURRENT_USER && u.user_id === CURRENT_USER.user_id;
    const profileHref = isMe ? 'profile.html' : `profile.html?user=${u.user_id}`;
    const followBtn = isMe ? '' : `
      <button class="follow-btn-sm" style="background: ${u.isFollowing ? 'var(--bg-primary)' : 'var(--accent-blue)'}; color: ${u.isFollowing ? 'var(--text-primary)' : '#fff'}; border: ${u.isFollowing ? '1px solid var(--border-color)' : 'none'};" onclick="handleModalFollowToggle(${u.user_id}, this)">
        ${u.isFollowing ? 'Following' : 'Follow'}
      </button>
    `;

    return `
      <div class="follow-user-item">
        <a href="${profileHref}" class="follow-user-info" onclick="closeModal()">
          <img src="${u.avatar || DEFAULT_AVATAR}" class="follow-user-avatar" onerror="this.onerror=null; this.src='${DEFAULT_AVATAR}'" />
          <div class="follow-user-text">
            <span class="follow-user-username">${u.username}</span>
            <span class="follow-user-fullname">${u.full_name || u.username}</span>
          </div>
        </a>
        ${followBtn}
      </div>
    `;
  }).join('');
}

function handleFollowModalSearch(query) {
  const q = (query || '').trim().toLowerCase();
  const currentList = followModalCache[currentModalFollowType] || [];
  if (!q) {
    renderFollowModalList(currentList, currentModalFollowType);
    return;
  }

  const filtered = currentList.filter(u => 
    (u.username && u.username.toLowerCase().includes(q)) ||
    (u.full_name && u.full_name.toLowerCase().includes(q))
  );

  renderFollowModalList(filtered, currentModalFollowType);
}

async function handleModalFollowToggle(targetUserId, btn) {
  if (!CURRENT_USER) return;
  const currentList = followModalCache[currentModalFollowType] || [];
  const userObj = currentList.find(u => u.user_id === targetUserId);
  const currentlyFollowing = userObj ? userObj.isFollowing : (btn.textContent.trim() === 'Following');
  const willFollow = !currentlyFollowing;

  // Optimistic UI update
  if (userObj) userObj.isFollowing = willFollow;
  btn.textContent = willFollow ? 'Following' : 'Follow';
  btn.style.background = willFollow ? 'var(--bg-primary)' : 'var(--accent-blue)';
  btn.style.color = willFollow ? 'var(--text-primary)' : '#fff';
  btn.style.border = willFollow ? '1px solid var(--border-color)' : 'none';

  // If on current user's profile and viewing following list
  if (profileUser.user_id === CURRENT_USER.user_id) {
    if (willFollow) profileUser.following_count++;
    else profileUser.following_count = Math.max(0, profileUser.following_count - 1);
    const followingCountEl = document.getElementById('stat-following-count');
    if (followingCountEl) followingCountEl.textContent = formatCount(profileUser.following_count);
    const tabCountEl = document.getElementById('tab-count-following');
    if (tabCountEl) tabCountEl.textContent = profileUser.following_count;
  }

  // If target user is the profile user whose page we are currently viewing
  if (profileUser.user_id === targetUserId) {
    isFollowing = willFollow;
    const mainBtn = document.getElementById('profile-follow-btn');
    if (mainBtn) {
      mainBtn.textContent = willFollow ? 'Following' : 'Follow';
      mainBtn.style.background = willFollow ? 'var(--bg-secondary)' : 'var(--accent-blue)';
      mainBtn.style.color = willFollow ? 'var(--text-primary)' : '#fff';
    }
    if (willFollow) profileUser.followers_count++;
    else profileUser.followers_count = Math.max(0, profileUser.followers_count - 1);
    const followersCountEl = document.getElementById('stat-followers-count');
    if (followersCountEl) followersCountEl.textContent = formatCount(profileUser.followers_count);
    const tabCountEl = document.getElementById('tab-count-followers');
    if (tabCountEl) tabCountEl.textContent = profileUser.followers_count;
  }

  try {
    if (willFollow) {
      await API.followUser(targetUserId);
    } else {
      await API.unfollowUser(targetUserId);
    }
  } catch (err) {
    console.error('Modal follow toggle failed', err);
    showToast('Failed to update follow');
    // Revert
    if (userObj) userObj.isFollowing = currentlyFollowing;
    btn.textContent = currentlyFollowing ? 'Following' : 'Follow';
    btn.style.background = currentlyFollowing ? 'var(--bg-primary)' : 'var(--accent-blue)';
    btn.style.color = currentlyFollowing ? 'var(--text-primary)' : '#fff';
    btn.style.border = currentlyFollowing ? '1px solid var(--border-color)' : 'none';
  }
}

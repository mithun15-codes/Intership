/* ============================================
   EXPLORE PAGE LOGIC – Grid & Search
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('ig_logged_in') !== 'true') {
    window.location.href = 'index.html';
    return;
  }
  initializeData();

  const searchInput = document.getElementById('explore-search-input');
  const searchResults = document.getElementById('explore-search-results');
  let allUsers = [];

  if (searchInput) {
    searchInput.addEventListener('input', async (e) => {
      const val = e.target.value.trim().toLowerCase();
      
      if (val.length > 0) {
        searchResults.style.display = 'block';
        
        if (allUsers.length === 0) {
          searchResults.innerHTML = '<div style="padding: 16px; text-align: center; color: var(--text-tertiary);">Loading...</div>';
          if (typeof USERS !== 'undefined' && USERS.length > 0) {
            allUsers = USERS;
          } else {
            const rawUsers = await API.getAllUsers() || [];
            allUsers = rawUsers.map(u => {
              if (u.profile_pic_url) {
                u.avatar = u.profile_pic_url.startsWith('/media/') ? API_BASE_URL + u.profile_pic_url : u.profile_pic_url;
              } else {
                u.avatar = `https://i.pravatar.cc/150?img=${u.user_id % 70}`;
              }
              return u;
            });
          }
        }

        const filtered = allUsers.filter(u => 
          u.user_id !== CURRENT_USER.user_id && u.role_id === 1 && (
            (u.username && u.username.toLowerCase().includes(val)) || 
            (u.full_name && u.full_name.toLowerCase().includes(val))
          )
        );

        if (filtered.length > 0) {
          searchResults.innerHTML = filtered.map(u => `
            <a href="profile.html?user=${u.user_id}" style="display: flex; align-items: center; padding: 12px 16px; text-decoration: none; border-bottom: 1px solid var(--border-color); color: var(--text-primary); transition: background 0.2s;" onmouseover="this.style.background='var(--bg-secondary)'" onmouseout="this.style.background='transparent'">
              <img src="${u.avatar || 'https://i.pravatar.cc/150?u=' + u.user_id}" alt="${u.username}" style="width: 44px; height: 44px; border-radius: 50%; object-fit: cover; margin-right: 12px; border: 1px solid var(--border-color);" />
              <div style="display: flex; flex-direction: column;">
                <span style="font-weight: 600; font-size: 0.9rem;">${u.username}</span>
                <span style="color: var(--text-tertiary); font-size: 0.85rem;">${u.full_name || ''}</span>
              </div>
            </a>
          `).join('');
        } else {
          searchResults.innerHTML = `<div style="padding: 16px; text-align: center; color: var(--text-tertiary);">No results found.</div>`;
        }
      } else {
        searchResults.style.display = 'none';
        searchResults.innerHTML = '';
      }
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
        searchResults.style.display = 'none';
      }
    });
    
    // Show dropdown again if clicked on input and it has value
    searchInput.addEventListener('focus', () => {
      if (searchInput.value.trim().length > 0) {
        searchResults.style.display = 'block';
      }
    });
  }
});

window.addEventListener('igDataLoaded', () => {
  renderExploreGrid();
});

function renderExploreGrid() {
  const container = document.getElementById('explore-grid');
  if (!container) return;

  let html = '';

  EXPLORE_ITEMS.forEach((item, index) => {
    // Make every 5th item large (2x2)
    const isLarge = index % 5 === 0 && index !== 0 ? 'large' : '';
    
    // Add icon modifier class based on type
    const typeClass = item.type === 'reel' ? 'explore-grid__item--reel' : 
                     (item.type === 'multi' ? 'explore-grid__item--multi' : '');

    html += `
      <div class="explore-grid__item ${isLarge} ${typeClass}" onclick="openPostDetail(${index})">
        <img src="${item.media_url}" alt="Explore content" loading="lazy" />
        <div class="explore-grid__overlay">
          <div class="explore-grid__stat">
            ${ICONS.heartFilled}
            <span>${formatCount(item.likes)}</span>
          </div>
          <div class="explore-grid__stat">
            <svg viewBox="0 0 24 24"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <span>${formatCount(item.comments)}</span>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openPostDetail(index) {
  const item = EXPLORE_ITEMS[index];
  
  // Pick a random user for the mock detail view
  const randomUser = USERS[Math.floor(Math.random() * (USERS.length - 1)) + 1];

  const html = `
    <div class="post-detail-modal">
      <div class="post-detail-modal__image">
        <img src="${item.media_url}" alt="Post detail" />
      </div>
      <div class="post-detail-modal__sidebar">
        <!-- Header -->
        <div class="post-detail-modal__header">
          <img src="${randomUser.avatar}" alt="Avatar" />
          <div class="post-detail-modal__header-username">${randomUser.username}</div>
          <div style="flex: 1"></div>
          ${randomUser.user_id !== CURRENT_USER?.user_id ? `<button style="color: var(--text-primary); font-weight: 600;">Follow</button>` : ''}
          <button class="comments-modal__close" onclick="closeModal()" style="position: static; margin-left: 12px;">&times;</button>
        </div>
        
        <!-- Comments (Mocked) -->
        <div class="post-detail-modal__comments">
          <div class="comment-item">
            <img src="${randomUser.avatar}" class="comment-item__avatar" />
            <div class="comment-item__body">
              <span class="comment-item__username">${randomUser.username}</span>
              <span class="comment-item__text">Living my best life right now! ✨ What do you think of this edit?</span>
              <div class="comment-item__time">2h</div>
            </div>
          </div>
          <div class="comment-item" style="margin-top: 24px;">
            <img src="${CURRENT_USER.avatar}" class="comment-item__avatar" />
            <div class="comment-item__body">
              <span class="comment-item__username">${CURRENT_USER.username}</span>
              <span class="comment-item__text">Absolutely stunning!</span>
              <div class="comment-item__time">1h</div>
            </div>

          </div>
        </div>

        <!-- Actions -->
        <div class="post-detail-modal__actions">
          <div class="post-card__actions" style="padding: 0 0 10px 0;">
            <button>${ICONS.heart}</button>
            <button>${ICONS.comment}</button>
            <div class="spacer"></div>
            <button>${ICONS.bookmark}</button>
          </div>
          <div class="post-card__likes" style="padding: 0;">${formatCount(item.likes)} likes</div>
          <div class="post-card__time" style="padding: 0; margin-top: 4px;">1 DAY AGO</div>
        </div>

        <!-- Add Comment Input -->
        <div class="comments-modal__input">
          <input type="text" placeholder="Add a comment..." />
          <button style="opacity: 0.5;">Post</button>
        </div>
      </div>
    </div>
  `;

  openModal(html);
}

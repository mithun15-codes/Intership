/* ============================================
   REELS PAGE LOGIC – Vertical scroll & interactions
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('ig_logged_in') !== 'true') {
    window.location.href = 'index.html';
    return;
  }
  initializeData();
});

window.addEventListener('igDataLoaded', () => {
  renderReels();
  setupReelsObserver();
});

function renderReels() {
  const container = document.getElementById('reels-container');
  if (!container) return;

  let html = '';

  if (REELS.length === 0) {
    container.innerHTML = `
      <div style="display:flex; height:100%; align-items:center; justify-content:center; color:var(--text-tertiary); padding:20px; flex-direction:column; text-align:center;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:48px;height:48px;margin-bottom:16px;">
          <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"></rect>
          <line x1="7" y1="2" x2="7" y2="22"></line>
          <line x1="17" y1="2" x2="17" y2="22"></line>
          <line x1="2" y1="12" x2="22" y2="12"></line>
          <line x1="2" y1="7" x2="7" y2="7"></line>
          <line x1="2" y1="17" x2="7" y2="17"></line>
          <line x1="17" y1="17" x2="22" y2="17"></line>
          <line x1="17" y1="7" x2="22" y2="7"></line>
        </svg>
        <h3 style="color:var(--text-primary); margin-bottom:8px;">No Reels Yet</h3>
        <p>When you upload reels, they will appear here.</p>
      </div>
    `;
    return;
  }

  REELS.forEach((reel, index) => {
    const user = getUserById(reel.user_id);
    if (!user) return;

    const likedClass = reel.is_liked ? 'liked' : '';
    const heartIcon = reel.is_liked ? ICONS.heartFilled : ICONS.heart;

    const isVideo = (reel.media_type && reel.media_type.includes('video')) || (reel.media_url && reel.media_url.toLowerCase().match(/\.(mp4|webm|ogg)$/)) || true; // Reels are videos
    const mediaUrl = reel.media_url || '';
    const mediaHtml = isVideo 
      ? `<video src="${mediaUrl}" class="reel-item__media" loop muted playsinline onclick="toggleReelAudio(this)"></video>`
      : `<img src="${mediaUrl}" class="reel-item__media" alt="Reel video" />`;

    html += `
      <div class="reel-item" id="reel-${index}" data-id="${reel.reel_id}">
        <!-- Video Placeholder (Image with gradient) -->
        ${mediaHtml}
        <div class="reel-item__gradient"></div>

        <!-- Left/Bottom Content -->
        <div class="reel-item__content">
          <div class="reel-item__user">
            <img src="${user.avatar}" class="reel-item__avatar" alt="${user.username}" />
            <span class="reel-item__username">${user.username}</span>
            ${user.user_id !== CURRENT_USER?.user_id ? `<button class="reel-item__follow-btn">Follow</button>` : ''}
          </div>
          
          <div class="reel-item__caption">${formatCaption(reel.caption)}</div>
        </div>

        
        <!-- Sound Toggle Button -->
        <button class="reel-audio-toggle-btn" onclick="toggleReelAudioFromBtn(this, event)" aria-label="Toggle sound">
          <svg class="audio-icon-muted" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <line x1="23" y1="9" x2="17" y2="15"></line>
            <line x1="17" y1="9" x2="23" y2="15"></line>
          </svg>
          <svg class="audio-icon-unmuted" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
          </svg>
        </button>

        <!-- Right Side Actions -->
        <div class="reel-item__actions">
          <div class="reel-action ${likedClass}" id="reel-like-${reel.reel_id}" onclick="toggleReelLike(${reel.reel_id})">
            ${heartIcon}
            <span class="reel-action__count" id="reel-likes-count-${reel.reel_id}">${formatCount(reel.likes_count)}</span>
          </div>
          
          <div class="reel-action" onclick="openCommentsModal(${reel.reel_id}, 'reel')">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>
            <span class="reel-action__count">${formatCount(reel.comments_count)}</span>
          </div>
          
          <div class="reel-action" id="reel-save-${reel.reel_id}" onclick="toggleReelSave(${reel.reel_id})">
            ${reel.is_saved ? ICONS.bookmarkFilled : ICONS.bookmark}
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

async function toggleReelLike(reelId) {
  const reel = REELS.find(r => r.reel_id === reelId);
  if (!reel) return;

  reel.is_liked = !reel.is_liked;
  reel.likes_count += reel.is_liked ? 1 : -1;

  const btn = document.getElementById(`reel-like-${reelId}`);
  const countEl = document.getElementById(`reel-likes-count-${reelId}`);
  
  if (reel.is_liked) {
    btn.classList.add('liked');
    // Using string replacement to keep the icon and update
    btn.innerHTML = `
      ${ICONS.heartFilled}
      <span class="reel-action__count" id="reel-likes-count-${reelId}">${formatCount(reel.likes_count)}</span>
    `;
  } else {
    btn.classList.remove('liked');
    btn.innerHTML = `
      ${ICONS.heart}
      <span class="reel-action__count" id="reel-likes-count-${reelId}">${formatCount(reel.likes_count)}</span>
    `;
  }
  
  try {
    await API.likeReel(reelId);
  } catch (e) {
    console.error('Like reel failed', e);
  }
}

async function toggleReelSave(reelId) {
  const reel = REELS.find(r => r.reel_id === reelId);
  if (!reel) return;

  reel.is_saved = !reel.is_saved;
  const btn = document.getElementById(`reel-save-${reelId}`);
  
  if (reel.is_saved) {
    btn.innerHTML = ICONS.bookmarkFilled;
    showToast('Saved to collection');
  } else {
    btn.innerHTML = ICONS.bookmark;
    showToast('Removed from collection');
  }

  try {
    await API.saveReel(reelId);
  } catch (e) {
    console.error('Save reel failed', e);
  }
}

function setupReelsObserver() {
  const container = document.getElementById('reels-container');
  if (!container) return;

  const options = {
    root: container,
    threshold: 0.6 // Reel is active if 60% is visible
  };

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('.reel-item__media');
      const btn = entry.target.querySelector('.reel-audio-toggle-btn');
      if (entry.isIntersecting) {
        // "Play" the reel
        if(video && video.tagName === 'VIDEO') video.play().catch(() => {});
      } else {
        // "Pause" the reel and silence completely
        if(video && video.tagName === 'VIDEO') {
          video.pause();
          video.muted = true;
          if (btn) {
            const iconMuted = btn.querySelector('.audio-icon-muted');
            const iconUnmuted = btn.querySelector('.audio-icon-unmuted');
            if (iconMuted) iconMuted.style.display = 'block';
            if (iconUnmuted) iconUnmuted.style.display = 'none';
          }
        }
      }
    });
  }, options);

  document.querySelectorAll('.reel-item').forEach(item => {
    observer.observe(item);
  });
}

function openCommentsModal(id, type = 'reel') {
  let comments = COMMENTS['reel_' + id] || [];
  
  let commentsHtml = '';
  
  if (comments.length === 0) {
    commentsHtml = `
      <div style="text-align: center; color: var(--text-tertiary); padding: 40px 0;">
        <h3 style="color: var(--text-primary); margin-bottom: 8px;">No comments yet.</h3>
        <p>Start the conversation.</p>
      </div>
    `;
  } else {
    comments.forEach(c => {
      commentsHtml += `
        <div class="comment-item">
          <img src="${c.user.avatar}" alt="${c.user.username}" class="comment-item__avatar" />
          <div class="comment-item__body">
            <span class="comment-item__username">${c.user.username}</span>
            <span class="comment-item__text">${c.comment_text}</span>
            <div class="comment-item__time">${timeAgo(c.created_at)}</div>
          </div>

        </div>
      `;
    });
  }

  const html = `
    <div class="comments-modal">
      <div class="comments-modal__header">
        <h3>Comments</h3>
        <button class="comments-modal__close" onclick="closeModal()">&times;</button>
      </div>
      <div class="comments-modal__list" id="modal-comments-list">
        ${commentsHtml}
      </div>
      <div class="comments-modal__input">
        <img src="${CURRENT_USER.avatar}" alt="Your avatar" />
        <input type="text" placeholder="Add a comment..." id="modal-comment-input" oninput="toggleModalCommentBtn()" />
        <button id="modal-comment-btn" onclick="addModalComment(${id}, '${type}')">Post</button>
      </div>
    </div>
  `;
  openModal(html);
}

function toggleModalCommentBtn() {
  const input = document.getElementById('modal-comment-input');
  const btn = document.getElementById('modal-comment-btn');
  if (input.value.trim().length > 0) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
}

async function addModalComment(id, type = 'reel') {
  const input = document.getElementById('modal-comment-input');
  const text = input.value.trim();
  if (!text) return;
  
  input.value = '';
  toggleModalCommentBtn();
  
  try {
    const res = await API.addReelComment(id, text);
    if (res) {
      // Create comment HTML directly
      const newCommentHtml = `
        <div class="comment-item">
          <img src="${CURRENT_USER.avatar}" alt="${CURRENT_USER.username}" class="comment-item__avatar" />
          <div class="comment-item__body">
            <span class="comment-item__username">${CURRENT_USER.username}</span>
            <span class="comment-item__text">${text}</span>
            <div class="comment-item__time">just now</div>
          </div>

        </div>
      `;
      
      const list = document.getElementById('modal-comments-list');
      if (list.innerHTML.includes('No comments yet')) {
        list.innerHTML = '';
      }
      
      list.insertAdjacentHTML('beforeend', newCommentHtml);
      list.scrollTop = list.scrollHeight;
    }
  } catch (e) {
    showToast('Failed to add comment');
  }
}


// --- Audio Toggle Functions ---
function toggleReelAudio(videoEl) {
  if (!videoEl || videoEl.tagName !== 'VIDEO') return;
  const reelItem = videoEl.closest('.reel-item');
  const btn = reelItem ? reelItem.querySelector('.reel-audio-toggle-btn') : null;
  
  if (videoEl.muted) {
    videoEl.muted = false;
    videoEl.volume = 1.0;
    if (btn) {
      const iconMuted = btn.querySelector('.audio-icon-muted');
      const iconUnmuted = btn.querySelector('.audio-icon-unmuted');
      if (iconMuted) iconMuted.style.display = 'none';
      if (iconUnmuted) iconUnmuted.style.display = 'block';
    }
    showToast('Sound on 🔊');
  } else {
    videoEl.muted = true;
    if (btn) {
      const iconMuted = btn.querySelector('.audio-icon-muted');
      const iconUnmuted = btn.querySelector('.audio-icon-unmuted');
      if (iconMuted) iconMuted.style.display = 'block';
      if (iconUnmuted) iconUnmuted.style.display = 'none';
    }
    showToast('Sound off 🔇');
  }
}

function toggleReelAudioFromBtn(btn, event) {
  if (event) event.stopPropagation();
  const reelItem = btn.closest('.reel-item');
  if (!reelItem) return;
  const video = reelItem.querySelector('.reel-item__media');
  if (video && video.tagName === 'VIDEO') {
    toggleReelAudio(video);
  }
}

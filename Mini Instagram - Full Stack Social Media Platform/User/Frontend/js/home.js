/* ============================================
   HOME PAGE LOGIC – Feed & Stories
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (localStorage.getItem('ig_logged_in') !== 'true') {
    window.location.href = 'index.html';
    return;
  }

  // Initialize data asynchronously
  initializeData();
});

window.addEventListener('igDataLoaded', () => {
  renderStories();
  renderPosts();
});

// --- Render Stories ---
function renderStories() {
  const container = document.getElementById('stories-bar');
  if (!container || !CURRENT_USER) return;

  const currentFallback = DEFAULT_AVATAR;

  // Check if current user has uploaded stories
  const myStoryIndex = STORIES.findIndex(s => s.user_id === CURRENT_USER.user_id);
  const myStoryGroup = myStoryIndex !== -1 ? STORIES[myStoryIndex] : null;
  const hasMyStory = myStoryGroup && myStoryGroup.stories && myStoryGroup.stories.length > 0;

  const myAvatar = CURRENT_USER.avatar || currentFallback;
  const myRingClass = hasMyStory 
    ? (myStoryGroup.seen ? 'story-ring seen' : 'story-ring') 
    : 'story-ring';

  // 1. Current user's story is ALWAYS the FIRST circle
  let html = '';
  if (hasMyStory) {
    html += `
      <div class="story-item" style="position: relative;">
        <div class="${myRingClass}" onclick="openStoryViewer(${myStoryIndex})" title="View your story">
          <div class="story-ring__inner">
            <img src="${myAvatar}" alt="Your Story" onerror="this.onerror=null; this.src='${currentFallback}'" />
          </div>
        </div>
        <span class="story-item__name" onclick="openStoryViewer(${myStoryIndex})">Your story</span>
        <button type="button" class="story-add-badge" onclick="document.getElementById('story-upload').click();" title="Add new story">+</button>
      </div>
    `;
  } else {
    html += `
      <div class="story-item story-item--add" onclick="document.getElementById('story-upload').click()">
        <div class="story-ring">
          <div class="story-ring__inner">
            <img src="${myAvatar}" alt="Your Story" onerror="this.onerror=null; this.src='${currentFallback}'" />
          </div>
        </div>
        <span class="story-item__name">Your story</span>
      </div>
    `;
  }

  // 2. Render OTHER users' stories afterwards (do NOT duplicate current user!)
  STORIES.forEach((storyData, index) => {
    if (storyData.user_id === CURRENT_USER.user_id) return; // Skip current user

    const user = getUserById(storyData.user_id);
    if (!user) return;

    const ringClass = storyData.seen ? 'story-ring seen' : 'story-ring';
    const userFallback = DEFAULT_AVATAR;
    
    html += `
      <div class="story-item" onclick="openStoryViewer(${index})">
        <div class="${ringClass}">
          <div class="story-ring__inner">
            <img src="${user.avatar || userFallback}" alt="${user.username}'s story" onerror="this.onerror=null; this.src='${userFallback}'" />
          </div>
        </div>
        <span class="story-item__name">${user.username}</span>
      </div>
    `;
  });

  container.innerHTML = html;
}

// --- Render Posts ---
function renderPosts() {
  const container = document.getElementById('posts-feed');
  if (!container) return;

  let html = '';

  // Combine POSTS and REELS
  const allMedia = [
    ...POSTS.map(p => ({ ...p, feed_type: 'post', id: p.post_id })),
    ...REELS.map(r => ({ ...r, feed_type: 'reel', id: r.reel_id }))
  ];

  // Sort by created_at descending if available
  allMedia.sort((a, b) => {
    if (a.created_at && b.created_at) {
      return new Date(b.created_at) - new Date(a.created_at);
    }
    return 0; // Maintain original order if no date
  });

  if (allMedia.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 60px 20px; color: var(--text-tertiary); max-width: 400px; margin: 40px auto;">
        <div style="width: 72px; height: 72px; border: 2px solid var(--border-color); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px; color: var(--text-primary);">
          ${ICONS.camera}
        </div>
        <h3 style="color: var(--text-primary); margin-bottom: 8px; font-size: 1.25rem;">Welcome to Instagram</h3>
        <p style="font-size: 0.9rem; line-height: 1.5; margin-bottom: 24px;">When people you follow share photos and reels, you'll see them here.</p>
        <button class="profile-edit-btn" style="background: var(--accent-blue); color: #fff; padding: 10px 24px; font-weight: 600;" onclick="openCreateModal()">Create your first post</button>
      </div>
    `;
    return;
  }

  allMedia.forEach((post) => {
    const user = getUserById(post.user_id);
    if (!user) return;
    const postUserFallback = DEFAULT_AVATAR;

    const likedClass = post.is_liked ? 'liked' : '';
    const heartIcon = post.is_liked ? ICONS.heartFilled : ICONS.heart;
    
    const savedClass = post.is_saved ? 'saved' : '';
    const bookmarkIcon = post.is_saved ? ICONS.bookmarkFilled : ICONS.bookmark;

    const locationHtml = post.location 
      ? `<div class="post-card__location">${post.location}</div>` 
      : '';

    html += `
      <article class="post-card" id="post-${post.id}">
        <!-- Header -->
        <div class="post-card__header">
          <img src="${user.avatar || postUserFallback}" alt="${user.username}" class="post-card__avatar" onerror="this.onerror=null; this.src='${postUserFallback}'" onclick="window.location.href='profile.html?user=${user.user_id}'" />
          <div class="post-card__user-info">
            <div class="post-card__username" onclick="window.location.href='profile.html?user=${user.user_id}'">
              ${user.username}
            </div>
            ${locationHtml}
          </div>
        </div>

        <!-- Media -->
        <div class="post-card__image-wrapper" ondblclick="handleDoubleTap(${post.id}, '${post.feed_type}')">
          ${(post.feed_type === 'reel' || (post.media_type && post.media_type.includes('video')) || (post.media_url && post.media_url.toLowerCase().match(/\.(mp4|webm|ogg)$/))) ? 
            `<video src="${post.media_url || ''}" loop muted playsinline style="width:100%; max-height: 600px; object-fit: cover; cursor: pointer;" onclick="toggleFeedVideoAudio(this)"></video>
             <button class="post-video-audio-btn" onclick="toggleFeedVideoAudioFromBtn(this, event)" aria-label="Toggle sound">
               <svg class="audio-icon-muted" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                 <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                 <line x1="23" y1="9" x2="17" y2="15"></line>
                 <line x1="17" y1="9" x2="23" y2="15"></line>
               </svg>
               <svg class="audio-icon-unmuted" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="display:none;">
                 <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                 <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
               </svg>
             </button>` : 
            `<img src="${post.media_url || ''}" alt="Post image" loading="lazy" />`
          }
          <div class="post-card__double-tap-heart" id="heart-anim-${post.feed_type}-${post.id}">
            <svg viewBox="0 0 24 24" fill="white"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>
          </div>
        </div>

        <!-- Actions -->
        <div class="post-card__actions">
          <button class="action-like ${likedClass}" id="btn-like-${post.feed_type}-${post.id}" onclick="toggleLike(${post.id}, '${post.feed_type}')">
            ${heartIcon}
          </button>
          <button class="action-comment" onclick="openCommentsModal(${post.id}, '${post.feed_type}')">
            ${ICONS.comment}
          </button>
          <div class="spacer"></div>
          <button class="action-save ${savedClass}" id="btn-save-${post.feed_type}-${post.id}" onclick="toggleSave(${post.id}, '${post.feed_type}')">
            ${bookmarkIcon}
          </button>
        </div>

        <!-- Likes count -->
        <div class="post-card__likes" id="likes-count-${post.feed_type}-${post.id}">
          ${formatCount(post.likes_count)} likes
        </div>

        <!-- Caption -->
        <div class="post-card__caption">
          <strong onclick="window.location.href='profile.html?user=${user.user_id}'">${user.username}</strong>
          <span class="caption-text">${formatCaption(post.caption)}</span>
        </div>

        <!-- View all comments -->
        ${post.comments_count > 0 ? `
          <div class="post-card__view-comments" onclick="openCommentsModal(${post.id}, '${post.feed_type}')">
            View all ${formatCount(post.comments_count)} comments
          </div>
        ` : ''}

        <!-- Timestamp -->
        <div class="post-card__time">
          ${timeAgo(post.created_at)}
        </div>

        <!-- Add comment inline -->
        <div class="post-card__add-comment">
          <input type="text" placeholder="Add a comment..." id="inline-comment-${post.feed_type}-${post.id}" oninput="toggleInlineCommentBtn(${post.id}, '${post.feed_type}')" />
          <button id="inline-comment-btn-${post.feed_type}-${post.id}" onclick="addInlineComment(${post.id}, '${post.feed_type}')">Post</button>
        </div>
      </article>
    `;
  });

  container.innerHTML = html;
  setupFeedVideosObserver();
}

async function handleStoryUpload(e) {
  if (!e.target.files || e.target.files.length === 0) return;
  const file = e.target.files[0];
  const formData = new FormData();
  formData.append('file', file);
  
  showToast('Uploading story...');
  try {
    const success = await API.createStory(formData);
    if (success) {
      showToast('Story uploaded!');
      setTimeout(() => window.location.reload(), 1000);
    } else {
      throw new Error('Failed');
    }
  } catch (err) {
    showToast('Failed to upload story.');
  }
}


// --- Interactions ---

function handleDoubleTap(id, type = 'post') {
  // Play heart animation
  const animEl = document.getElementById(`heart-anim-${type}-${id}`);
  if (animEl) {
    animEl.classList.remove('animate');
    void animEl.offsetWidth; // trigger reflow
    animEl.classList.add('animate');
  }

  // Like the post if not already liked
  const post = type === 'post' ? POSTS.find(p => p.post_id === id) : REELS.find(r => r.reel_id === id);
  if (post && !post.is_liked) {
    toggleLike(id, type);
  }
}

async function toggleLike(id, type = 'post') {
  const post = type === 'post' ? POSTS.find(p => p.post_id === id) : REELS.find(r => r.reel_id === id);
  if (!post) return;

  // Optimistic UI update
  post.is_liked = !post.is_liked;
  post.likes_count += post.is_liked ? 1 : -1;

  const btn = document.getElementById(`btn-like-${type}-${id}`);
  const countEl = document.getElementById(`likes-count-${type}-${id}`);
  
  if (btn) {
    if (post.is_liked) {
      btn.classList.add('liked');
      btn.innerHTML = ICONS.heartFilled;
    } else {
      btn.classList.remove('liked');
      btn.innerHTML = ICONS.heart;
    }
  }
  
  if (countEl) {
    countEl.textContent = `${formatCount(post.likes_count)} likes`;
  }

  // Backend sync
  try {
    if (type === 'post') {
      await API.likePost(id);
    } else {
      await API.likeReel(id);
    }
  } catch (e) {
    console.error('Like failed', e);
  }
}

async function toggleSave(id, type = 'post') {
  const post = type === 'post' ? POSTS.find(p => p.post_id === id) : REELS.find(r => r.reel_id === id);
  if (!post) return;

  // Optimistic UI update
  post.is_saved = !post.is_saved;

  const btn = document.getElementById(`btn-save-${type}-${id}`);
  
  if (btn) {
    if (post.is_saved) {
      btn.classList.add('saved');
      btn.innerHTML = ICONS.bookmarkFilled;
      showToast('Saved to collection');
    } else {
      btn.classList.remove('saved');
      btn.innerHTML = ICONS.bookmark;
    }
  }

  // Backend sync
  try {
    if (type === 'post') {
      await API.savePost(id);
    } else {
      await API.saveReel(id);
    }
  } catch (e) {
    console.error('Save failed', e);
  }
}


// --- Comments Modal ---

function openCommentsModal(id, type = 'post') {
  let comments = [];
  if (type === 'post') {
    comments = getPostComments(id);
  } else {
    // Map user data onto reel comments (same as getPostComments does for posts)
    comments = (COMMENTS['reel_' + id] || []).map(c => ({
      ...c,
      user: getUserById(c.user_id)
    }));
  }
  
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

function toggleInlineCommentBtn(id, type = 'post') {
  const input = document.getElementById(`inline-comment-${type}-${id}`);
  const btn = document.getElementById(`inline-comment-btn-${type}-${id}`);
  if (!input || !btn) return;
  if (input.value.trim().length > 0) {
    btn.classList.add('active');
  } else {
    btn.classList.remove('active');
  }
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

async function addInlineComment(id, type = 'post') {
  const input = document.getElementById(`inline-comment-${type}-${id}`);
  if (!input) return;
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  toggleInlineCommentBtn(id, type);

  try {
    const res = type === 'post' ? await API.addComment(id, text) : await API.addReelComment(id, text);
    if (res) {
      showToast('Comment posted');
      // Update local cache so the modal shows the new comment when opened
      if (type === 'reel') {
        if (!COMMENTS['reel_' + id]) COMMENTS['reel_' + id] = [];
        COMMENTS['reel_' + id].push(res);
        const reel = REELS.find(r => r.reel_id === id);
        if (reel) {
          reel.comments_count = (reel.comments_count || 0) + 1;
          const viewEl = document.querySelector(`#post-${id} .post-card__view-comments`);
          if (viewEl) viewEl.textContent = `View all ${formatCount(reel.comments_count)} comments`;
          else {
            // First comment: insert the "View all" link above the timestamp
            const timeEl = document.querySelector(`#post-${id} .post-card__time`);
            if (timeEl) {
              const div = document.createElement('div');
              div.className = 'post-card__view-comments';
              div.textContent = `View all 1 comments`;
              div.onclick = () => openCommentsModal(id, 'reel');
              timeEl.parentNode.insertBefore(div, timeEl);
            }
          }
        }
      } else {
        if (!COMMENTS[id]) COMMENTS[id] = [];
        COMMENTS[id].push(res);
        const post = POSTS.find(p => p.post_id === id);
        if (post) post.comments_count = (post.comments_count || 0) + 1;
      }
    }
  } catch (e) {
    showToast('Failed to add comment');
  }
}

async function addModalComment(id, type = 'post') {
  const input = document.getElementById('modal-comment-input');
  const text = input.value.trim();
  if (!text) return;

  input.value = '';
  toggleModalCommentBtn();

  try {
    let res = null;
    if (type === 'post') {
      res = await API.addComment(id, text);
    } else {
      res = await API.addReelComment(id, text);
    }

    if (res) {
      // Update local cache
      if (type === 'reel') {
        if (!COMMENTS['reel_' + id]) COMMENTS['reel_' + id] = [];
        COMMENTS['reel_' + id].push(res);
        const reel = REELS.find(r => r.reel_id === id);
        if (reel) reel.comments_count = (reel.comments_count || 0) + 1;
      } else {
        if (!COMMENTS[id]) COMMENTS[id] = [];
        COMMENTS[id].push(res);
        const post = POSTS.find(p => p.post_id === id);
        if (post) post.comments_count = (post.comments_count || 0) + 1;
      }

      // Append to the open modal list
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
      if (list) {
        if (list.innerHTML.includes('No comments yet')) list.innerHTML = '';
        list.insertAdjacentHTML('beforeend', newCommentHtml);
        list.scrollTop = list.scrollHeight;
      }
    }
  } catch (e) {
    showToast('Failed to add comment');
  }
}

// --- Story Viewer logic ---
let currentStoryGroupIndex = 0;
let currentStoryItemIndex = 0;

function openStoryViewer(groupIndex) {
  currentStoryGroupIndex = groupIndex;
  currentStoryItemIndex = 0;
  
  const viewer = document.getElementById('story-viewer');
  viewer.classList.remove('hidden');
  
  renderStoryFrame();
}

function renderStoryFrame() {
  const group = STORIES[currentStoryGroupIndex];
  if (!group) {
    closeStoryViewer();
    return;
  }
  
  const user = getUserById(group.user_id);
  const story = group.stories[currentStoryItemIndex];
  
  const mediaUrl = story.media_url || '';
  const isVideo = (story.media_type && story.media_type.includes('video')) || mediaUrl.toLowerCase().match(/\.(mp4|webm|ogg)$/);
  
  const mediaContainer = document.getElementById('story-media-container');
  if (isVideo) {
    mediaContainer.innerHTML = `<video class="story-viewer__image" src="${mediaUrl}" loop muted playsinline style="width:100%; height:100%; object-fit:contain;"></video>`;
  } else {
    mediaContainer.innerHTML = `<img class="story-viewer__image" src="${mediaUrl}" alt="Story" style="width:100%; height:100%; object-fit:contain;" />`;
  }
  document.getElementById('story-user').innerHTML = `
    <img src="${user.avatar}" alt="${user.username}" />
    <span class="story-viewer__user-name">${user.username}</span>
    <span class="story-viewer__user-time">${timeAgo(story.created_at)}</span>
  `;
  
  // Setup progress bars
  let progressHtml = '';
  group.stories.forEach((s, idx) => {
    let fillStyle = idx < currentStoryItemIndex ? 'width: 100%' : 'width: 0%';
    progressHtml += `
      <div class="story-viewer__progress-bar">
        <div class="story-viewer__progress-fill" id="story-prog-${idx}" style="${fillStyle}"></div>
      </div>
    `;
  });
  document.getElementById('story-progress').innerHTML = progressHtml;
  
  // Setup delete button
  const deleteBtn = document.getElementById('story-delete');
  if (deleteBtn) {
    if (group.user_id === CURRENT_USER.user_id) {
      deleteBtn.classList.remove('hidden');
      deleteBtn.onclick = () => deleteCurrentStory(story.story_id);
    } else {
      deleteBtn.classList.add('hidden');
      deleteBtn.onclick = null;
    }
  }

  // Mark current story as seen
  const seenStories = JSON.parse(localStorage.getItem('seen_stories') || '[]');
  if (!seenStories.includes(story.story_id)) {
    seenStories.push(story.story_id);
    localStorage.setItem('seen_stories', JSON.stringify(seenStories));
  }
  
  // A group is seen if all its stories have been seen
  group.seen = group.stories.every(s => seenStories.includes(s.story_id));
  
  // Start animation for current progress
  setTimeout(() => {
    const activeFill = document.getElementById(`story-prog-${currentStoryItemIndex}`);
    if (activeFill) {
      activeFill.style.transition = 'width 5s linear';
      activeFill.style.width = '100%';
    }
  }, 50);
}

// Nav handlers
document.getElementById('story-close')?.addEventListener('click', closeStoryViewer);

document.getElementById('story-prev')?.addEventListener('click', () => {
  if (currentStoryItemIndex > 0) {
    currentStoryItemIndex--;
    renderStoryFrame();
  } else if (currentStoryGroupIndex > 0) {
    currentStoryGroupIndex--;
    currentStoryItemIndex = STORIES[currentStoryGroupIndex].stories.length - 1;
    renderStoryFrame();
  }
});

async function deleteCurrentStory(storyId) {
  if (!confirm('Are you sure you want to delete this story?')) return;
  
  const res = await API.deleteStory(storyId);
  if (res) {
    showToast('Story deleted');
    const group = STORIES[currentStoryGroupIndex];
    group.stories.splice(currentStoryItemIndex, 1);
    
    if (group.stories.length === 0) {
      STORIES.splice(currentStoryGroupIndex, 1);
      closeStoryViewer();
    } else {
      if (currentStoryItemIndex >= group.stories.length) {
        currentStoryItemIndex = group.stories.length - 1;
      }
      renderStoryFrame();
    }
    renderStories();
  } else {
    showToast('Failed to delete story');
  }
}

document.getElementById('story-next')?.addEventListener('click', () => {
  const group = STORIES[currentStoryGroupIndex];
  if (currentStoryItemIndex < group.stories.length - 1) {
    currentStoryItemIndex++;
    renderStoryFrame();
  } else if (currentStoryGroupIndex < STORIES.length - 1) {
    currentStoryGroupIndex++;
    currentStoryItemIndex = 0;
    renderStoryFrame();
  } else {
    closeStoryViewer();
  }
});

function closeStoryViewer() {
  document.getElementById('story-viewer').classList.add('hidden');
  renderStories(); // refresh seen rings
}

function toggleFeedVideoAudio(video) {
  if (!video) return;
  const wrapper = video.closest('.post-card__image-wrapper');
  const btn = wrapper ? wrapper.querySelector('.post-video-audio-btn') : null;
  
  if (video.muted) {
    video.muted = false;
    video.volume = 1.0;
    if (btn) {
      const iconMuted = btn.querySelector('.audio-icon-muted');
      const iconUnmuted = btn.querySelector('.audio-icon-unmuted');
      if (iconMuted) iconMuted.style.display = 'none';
      if (iconUnmuted) iconUnmuted.style.display = 'block';
    }
    showToast('Sound on 🔊');
  } else {
    video.muted = true;
    if (btn) {
      const iconMuted = btn.querySelector('.audio-icon-muted');
      const iconUnmuted = btn.querySelector('.audio-icon-unmuted');
      if (iconMuted) iconMuted.style.display = 'block';
      if (iconUnmuted) iconUnmuted.style.display = 'none';
    }
    showToast('Sound off 🔇');
  }
}

function toggleFeedVideoAudioFromBtn(btn, event) {
  if (event) event.stopPropagation();
  const wrapper = btn.closest('.post-card__image-wrapper');
  if (!wrapper) return;
  const video = wrapper.querySelector('video');
  if (video) {
    toggleFeedVideoAudio(video);
  }
}


// --- Feed Videos Intersection Observer ---
let feedVideoObserver = null;

function setupFeedVideosObserver() {
  if (feedVideoObserver) {
    feedVideoObserver.disconnect();
  }

  const options = {
    root: null,
    threshold: 0.6 // Video must be at least 60% visible to play
  };

  feedVideoObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const video = entry.target.querySelector('video');
      if (!video) return;
      const btn = entry.target.querySelector('.post-video-audio-btn');

      if (entry.isIntersecting) {
        // Video is scrolled into view -> play
        video.play().catch(() => {});
      } else {
        // Video scrolled away -> pause and stop sound completely
        video.pause();
        video.muted = true;
        if (btn) {
          const iconMuted = btn.querySelector('.audio-icon-muted');
          const iconUnmuted = btn.querySelector('.audio-icon-unmuted');
          if (iconMuted) iconMuted.style.display = 'block';
          if (iconUnmuted) iconUnmuted.style.display = 'none';
        }
      }
    });
  }, options);

  document.querySelectorAll('.post-card__image-wrapper').forEach(wrapper => {
    if (wrapper.querySelector('video')) {
      feedVideoObserver.observe(wrapper);
    }
  });
}

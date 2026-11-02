/* ============================================
   INSTAGRAM CLONE – API CLIENT
   ============================================ */

const API_BASE_URL = `http://${window.location.hostname || 'localhost'}:8000`;
const DEFAULT_AVATAR = "data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 150 150' fill='%23262626'><circle cx='75' cy='75' r='75'/><circle cx='75' cy='55' r='25' fill='%23737373'/><path d='M75 90 C50 90 35 110 35 130 C45 142 60 150 75 150 C90 150 105 142 115 130 C115 110 100 90 75 90 Z' fill='%23737373'/></svg>";

const API = {
  getHeaders() {
    return {};
  },

  async request(endpoint, options = {}) {
    options.headers = {
      ...options.headers,
      ...this.getHeaders()
    };
    // Include credentials to send cookies (for access_token)
    options.credentials = 'include';
    
    try {
      const res = await fetch(`${API_BASE_URL}${endpoint}`, options);
      if (res.status === 401) {
        // Try to refresh token
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Update the headers with the newly refreshed token
          options.headers = {
            ...options.headers,
            ...this.getHeaders()
          };
          return await fetch(`${API_BASE_URL}${endpoint}`, options);
        } else {
          this.logout();
          throw new Error("Unauthorized");
        }
      }
      return res;
    } catch (err) {
      console.error('API Error:', err);
      throw err;
    }
  },

  async refreshToken() {
    const refresh_token = localStorage.getItem('refresh_token');
    if (!refresh_token) return false;
    
    try {
      const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh_token })
      });
      if (res.ok) {
        const data = await res.json();
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      }
    } catch(err) {
      return false;
    }
    return false;
  },

  async logout() {
    try {
      const refresh_token = localStorage.getItem('refresh_token');
      if (refresh_token) {
        await fetch(`${API_BASE_URL}/auth/logout`, {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh_token })
        });
      }
    } catch (e) {
      console.error('Logout error', e);
    }
    localStorage.removeItem('ig_logged_in');
    localStorage.removeItem('refresh_token');
    window.location.href = 'index.html';
  },

  async getMe() {
    const res = await this.request('/users/me');
    if (res.ok) return await res.json();
    return null;
  },

  async getPosts() {
    const res = await this.request('/posts/');
    if (res.ok) return await res.json();
    return [];
  },

  async getUser(id) {
    const res = await this.request(`/users/${id}`);
    if (res.ok) return await res.json();
    return null;
  },

  async getAllUsers() {
    const res = await this.request('/users/');
    if (res.ok) return await res.json();
    return [];
  },
  
  async getPostComments(postId) {
    // Requires a route for comments, assuming /posts/{post_id}/comments exists
    const res = await this.request(`/post_comments/post/${postId}`);
    if (res.ok) return await res.json();
    return [];
  },
  
  async likePost(postId) {
    const res = await this.request('/post_likes/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId })
    });
    return res.ok;
  },

  async savePost(postId) {
    const res = await this.request('/saved_posts/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId })
    });
    return res.ok;
  },

  async likeReel(reelId) {
    const res = await this.request('/reel_likes/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reel_id: reelId })
    });
    return res.ok;
  },

  async saveReel(reelId) {
    const res = await this.request('/saved_reels/toggle', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reel_id: reelId })
    });
    return res.ok;
  },

  async deleteStory(storyId) {
    const res = await this.request(`/stories/${storyId}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  async deletePost(postId) {
    const res = await this.request(`/posts/${postId}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  async deleteReel(reelId) {
    const res = await this.request(`/reels/${reelId}`, {
      method: 'DELETE'
    });
    return res.ok;
  },

  async getPostLikes(postId) {
    const res = await this.request(`/post_likes/post/${postId}`);
    if (res.ok) return await res.json();
    return [];
  },

  async getPostSaves(postId) {
    const res = await this.request(`/saved_posts/post/${postId}`);
    if (res.ok) return await res.json();
    return [];
  },

  async getReelLikes(reelId) {
    const res = await this.request(`/reel_likes/reel/${reelId}`);
    if (res.ok) return await res.json();
    return [];
  },

  async getReelSaves(reelId) {
    const res = await this.request(`/saved_reels/reel/${reelId}`);
    if (res.ok) return await res.json();
    return [];
  },
  
  async addComment(postId, text) {
    const res = await this.request('/post_comments/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ post_id: postId, comment_text: text })
    });
    if(res.ok) return await res.json();
    return null;
  },

  async addReelComment(reelId, text) {
    const res = await this.request('/reel_comments/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reel_id: reelId, comment_text: text })
    });
    if(res.ok) return await res.json();
    return null;
  },

  async getReelComments(reelId) {
    const res = await this.request(`/reel_comments/reel/${reelId}`);
    if (res.ok) return await res.json();
    return [];
  },
  
  async getStories() {
    const res = await this.request('/stories/');
    if (res.ok) return await res.json();
    return [];
  },
  
  async getReels() {
    const res = await this.request('/reels/');
    if (res.ok) return await res.json();
    return [];
  },

  async createPost(formData) {
    const res = await this.request('/posts/', {
      method: 'POST',
      body: formData // Let the browser set the Content-Type with boundary automatically
    });
    return res.ok;
  },

  async createStory(formData) {
    const res = await this.request('/stories/', {
      method: 'POST',
      body: formData
    });
    return res.ok;
  },

  async createReel(formData) {
    const res = await this.request('/reels/', {
      method: 'POST',
      body: formData
    });
    return res.ok;
  },

  async followUser(followingId) {
    const followerId = localStorage.getItem('user_id') || CURRENT_USER?.user_id;
    if (!followerId) return false;
    const res = await this.request('/followers/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ follower_id: parseInt(followerId), following_id: followingId, followed_at: new Date().toISOString() })
    });
    return res.ok;
  },
  
  async checkIsFollowing(followingId) {
    const followerId = localStorage.getItem('user_id') || CURRENT_USER?.user_id;
    if (!followerId) return false;
    const res = await this.request(`/followers/${followerId}/${followingId}`);
    return res.ok;
  },

  async getAllFollowers() {
    const res = await this.request('/followers/?limit=10000');
    if (res.ok) return await res.json();
    return [];
  },

  async getFollowers(userId) {
    const res = await this.request('/followers/?following_id=' + userId + '&limit=10000');
    if (res.ok) return await res.json();
    return [];
  },

  async getFollowing(userId) {
    const res = await this.request('/followers/?follower_id=' + userId + '&limit=10000');
    if (res.ok) return await res.json();
    return [];
  },

  async unfollowUser(followingId) {
    // Current user's id is implicit from token in the backend route
    const followerId = localStorage.getItem('user_id') || CURRENT_USER?.user_id;
    if (!followerId) return false;
    
    const res = await this.request(`/followers/${followerId}/${followingId}`, {
      method: 'DELETE'
    });
    return res.ok;
  }
};

// State variables to emulate original data.js synchronous access
let CURRENT_USER = null;
let USERS = [];
let POSTS = [];
let COMMENTS = {};
let STORIES = [];
let REELS = [];
let EXPLORE_ITEMS = []; // Simplified
let CONVERSATIONS = []; // Simplified

function getUserById(id) {
  return USERS.find(u => Number(u.user_id) === Number(id)) || { username: 'Unknown', avatar: DEFAULT_AVATAR };
}

function getPostComments(postId) {
  return (COMMENTS[postId] || []).map(c => ({
    ...c,
    user: getUserById(c.user_id)
  }));
}

function formatCount(num) {
  if (num >= 1000000) return (num / 1000000).toFixed(1).replace(/\.0$/, '') + 'M';
  if (num >= 10000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  if (num >= 1000) return (num / 1000).toFixed(1).replace(/\.0$/, '') + 'K';
  return num ? num.toString() : '0';
}

function timeAgo(dateStr) {
  if (!dateStr) return 'just now';
  
  // Ensure we treat the backend string as UTC if missing timezone
  let parseStr = dateStr;
  if (!parseStr.includes('Z') && !parseStr.includes('+') && !parseStr.match(/-\d\d:\d\d$/)) {
    parseStr += 'Z';
  }
  
  const now = new Date();
  const date = new Date(parseStr);
  const seconds = Math.floor((now - date) / 1000);

  if (seconds < 60) return 'just now';
  if (seconds < 3600) return Math.floor(seconds / 60) + 'm';
  if (seconds < 86400) return Math.floor(seconds / 3600) + 'h';
  if (seconds < 604800) return Math.floor(seconds / 86400) + 'd';
  return Math.floor(seconds / 604800) + 'w';
}

function processMediaUrls(item) {
  if (!item) return item;
  if (item.media_url && item.media_url.startsWith('/media/')) {
    item.media_url = API_BASE_URL + item.media_url;
  }
  if (item.profile_pic_url && item.profile_pic_url.startsWith('/media/')) {
    item.profile_pic_url = API_BASE_URL + item.profile_pic_url;
  }
  if (item.avatar && item.avatar.startsWith('/media/')) {
    item.avatar = API_BASE_URL + item.avatar;
  }
  return item;
}

async function initializeData() {
  if (localStorage.getItem('ig_logged_in') !== 'true') {
    return;
  }
  
  try {
    CURRENT_USER = processMediaUrls(await API.getMe());
    if (!CURRENT_USER) {
      API.logout();
      return;
    }
    
    if (CURRENT_USER.profile_pic_url) {
      CURRENT_USER.avatar = CURRENT_USER.profile_pic_url;
    } else {
      CURRENT_USER.avatar = DEFAULT_AVATAR;
    }
    
    USERS = (await API.getAllUsers() || []).map(processMediaUrls);
    USERS.forEach(u => {
      if (u.profile_pic_url) {
        u.avatar = u.profile_pic_url;
      } else {
        u.avatar = DEFAULT_AVATAR;
      }
    });
    
    POSTS = (await API.getPosts() || []).map(processMediaUrls);
    REELS = (await API.getReels() || []).map(processMediaUrls);
    
    // Parallelize likes, saves, comments fetches for both posts and reels
    await Promise.all(POSTS.map(async p => {
      p.likes_count = 0;
      p.is_liked = false;
      p.is_saved = false;
      p.comments_count = 0;
      COMMENTS[p.post_id] = [];
      try {
        const [likes, saves, comments] = await Promise.all([
          API.getPostLikes(p.post_id),
          API.getPostSaves(p.post_id),
          API.getPostComments(p.post_id)
        ]);
        p.likes_count = likes ? likes.length : 0;
        p.is_liked = likes ? likes.some(l => l.user_id === CURRENT_USER.user_id) : false;
        p.is_saved = saves ? saves.some(s => s.user_id === CURRENT_USER.user_id) : false;
        p.comments_count = comments ? comments.length : 0;
        COMMENTS[p.post_id] = comments || [];
      } catch (err) {
        console.error("Error fetching data for post", p.post_id, err);
      }
    }));

    await Promise.all(REELS.map(async r => {
      r.likes_count = 0;
      r.is_liked = false;
      r.is_saved = false;
      r.comments_count = 0;
      COMMENTS['reel_' + r.reel_id] = [];
      try {
        const [likes, saves, comments] = await Promise.all([
          API.getReelLikes(r.reel_id),
          API.getReelSaves(r.reel_id),
          API.getReelComments(r.reel_id)
        ]);
        r.likes_count = likes ? likes.length : 0;
        r.is_liked = likes ? likes.some(l => l.user_id === CURRENT_USER.user_id) : false;
        r.is_saved = saves ? saves.some(s => s.user_id === CURRENT_USER.user_id) : false;
        r.comments_count = comments ? comments.length : 0;
        COMMENTS['reel_' + r.reel_id] = comments || [];
      } catch (err) {
        console.error("Error fetching data for reel", r.reel_id, err);
      }
    }));
    
    const rawStories = (await API.getStories() || []).map(processMediaUrls);
    const storiesByUser = {};
    rawStories.forEach(story => {
      if (!storiesByUser[story.user_id]) {
        storiesByUser[story.user_id] = {
          user_id: story.user_id,
          seen: false,
          stories: []
        };
      }
      storiesByUser[story.user_id].stories.push(story);
    });
    STORIES = Object.values(storiesByUser);
    // Sort so CURRENT_USER's story is always first
    STORIES.sort((a, b) => {
      if (a.user_id === CURRENT_USER.user_id) return -1;
      if (b.user_id === CURRENT_USER.user_id) return 1;
      return 0;
    });
    
    let seenStories = [];
    try {
      seenStories = JSON.parse(localStorage.getItem('seen_stories') || '[]');
    } catch(e) {}
    
    STORIES.forEach(group => {
      group.seen = group.stories.every(s => seenStories.includes(s.story_id));
    });

    
    // We need users for posts/stories
    const userIds = new Set();
    POSTS.forEach(p => userIds.add(p.user_id));
    STORIES.forEach(s => userIds.add(s.user_id));
    REELS.forEach(r => userIds.add(r.user_id));
    
    // Calculate posts count (posts + reels) to fix 'undefined' bug
    const myPostsCount = POSTS.filter(p => p.user_id === CURRENT_USER.user_id).length;
    const myReelsCount = REELS.filter(r => r.user_id === CURRENT_USER.user_id).length;
    CURRENT_USER.posts_count = myPostsCount + myReelsCount;
    
    const currentUserInUsers = USERS.find(u => u.user_id === CURRENT_USER.user_id);
    if (currentUserInUsers) {
      currentUserInUsers.posts_count = CURRENT_USER.posts_count;
      if (currentUserInUsers.avatar && currentUserInUsers.avatar !== DEFAULT_AVATAR) {
        CURRENT_USER.avatar = currentUserInUsers.avatar;
      }
    }
    
    await Promise.all(Array.from(userIds).map(async id => {
      if (!USERS.some(u => u.user_id === id)) {
        try {
          const u = await API.getUser(id);
          if (u) {
            processMediaUrls(u);
            if (u.profile_pic_url) {
              u.avatar = u.profile_pic_url;
            } else {
              u.avatar = DEFAULT_AVATAR;
            }
            USERS.push(u);
          }
        } catch (e) {
          console.error("Failed to load user", id, e);
        }
      }
    }));
    
  } catch (err) {
    console.error("Initialization failed:", err);
    API.logout();
    return;
  } finally {
    if (CURRENT_USER) {
      window.dispatchEvent(new Event('igDataLoaded'));
    }
  }
}

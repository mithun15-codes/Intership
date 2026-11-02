/* ============================================
   MESSAGES PAGE LOGIC
   ============================================ */

let activeChatUserId = null;

document.addEventListener('DOMContentLoaded', () => {
  if (localStorage.getItem('ig_logged_in') !== 'true') {
    window.location.href = 'index.html';
    return;
  }
  initializeData();
});

window.addEventListener('igDataLoaded', () => {
  // Set current username in header
  const headerName = document.getElementById('current-username-display');
  if (headerName) headerName.textContent = CURRENT_USER.username;

  renderConversations();
});

function renderConversations() {
  const container = document.getElementById('conversations-list');
  if (!container) return;

  let html = '';

  CONVERSATIONS.forEach((conv) => {
    const user = getUserById(conv.user_id);
    if (!user) return;

    const unreadClass = conv.unread ? 'unread' : '';
    const activeClass = activeChatUserId === user.user_id ? 'active' : '';
    
    // Online indicator logic
    let avatarIndicator = '';
    if (conv.is_online) {
      avatarIndicator = `<div class="message-preview__online-dot"></div>`;
    }

    // Unread indicator logic
    let rightIndicator = '';
    if (conv.unread) {
      rightIndicator = `<div class="message-preview__unread-dot"></div>`;
    } else {
      rightIndicator = `<div class="message-preview__camera-icon">${ICONS.camera}</div>`;
    }

    html += `
      <div class="message-preview ${unreadClass} ${activeClass}" id="conv-${user.user_id}" onclick="openChat(${user.user_id})">
        <div class="message-preview__avatar">
          <img src="${user.avatar}" alt="${user.username}" style="width: 100%; height: 100%; border-radius: 50%; object-fit: cover;" />
          ${avatarIndicator}
        </div>
        <div class="message-preview__info">
          <div class="message-preview__name">${user.full_name}</div>
          <div class="message-preview__last-msg">
            ${conv.last_message} • ${conv.last_time}
          </div>
        </div>
        <div style="color: var(--text-tertiary); display: flex; align-items: center;">
          ${rightIndicator}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

function openChat(userId) {
  activeChatUserId = userId;
  
  // Update active state in sidebar
  renderConversations();
  
  const user = getUserById(userId);
  const conversation = CONVERSATIONS.find(c => c.user_id === userId);
  const chatArea = document.getElementById('chat-area');
  
  // Mark as read locally
  if (conversation) conversation.unread = false;
  
  // Show chat area (handles mobile view too)
  chatArea.classList.add('active');

  let messagesHtml = '';
  if (conversation && conversation.messages) {
    conversation.messages.forEach(msg => {
      const isSent = msg.from === CURRENT_USER.user_id;
      const bubbleClass = isSent ? 'chat-bubble--sent' : 'chat-bubble--received';
      
      messagesHtml += `
        <div class="chat-bubble ${bubbleClass}">
          ${msg.text}
          <div class="chat-bubble__time">${msg.time}</div>
        </div>
      `;
    });
  }

  chatArea.innerHTML = `
    <div class="messages-chat__header">
      <button class="messages-chat__back" onclick="closeChatMobile()" style="display: none;">
        ${ICONS.back}
      </button>
      <img src="${user.avatar}" class="messages-chat__avatar" alt="${user.username}" />
      <div style="flex: 1;">
        <div class="messages-chat__name">${user.full_name}</div>
        <div class="messages-chat__status">${conversation.is_online ? 'Active now' : 'Active ' + conversation.last_time}</div>
      </div>
      <button style="color: var(--text-primary); margin-right: 16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z"/></svg>
      </button>
      <button style="color: var(--text-primary);">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/></svg>
      </button>
      <button style="color: var(--text-primary); margin-left: 16px;">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
      </button>
    </div>

    <div class="messages-chat__body" id="chat-messages-container">
      <div style="text-align: center; margin-bottom: 20px;">
        <img src="${user.avatar}" style="width: 90px; height: 90px; border-radius: 50%; object-fit: cover; margin-bottom: 12px;" />
        <h3 style="font-size: 1.2rem; margin-bottom: 4px;">${user.full_name}</h3>
        <p style="color: var(--text-secondary); font-size: 0.9rem;">${user.username} • Instagram</p>
        <button style="margin-top: 12px; padding: 6px 16px; background: var(--bg-elevated); border-radius: var(--radius-md); font-weight: 600;">View Profile</button>
      </div>
      
      ${messagesHtml}
    </div>

    <div class="messages-chat__input-bar">
      <button style="color: var(--text-primary);">${ICONS.camera}</button>
      <input type="text" id="chat-input" placeholder="Message..." onkeypress="handleChatKeypress(event)" />
      <button id="chat-send-btn" onclick="sendMessage()" style="display: none;">Send</button>
      <button id="chat-mic-btn" style="color: var(--text-primary);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="23"></line><line x1="8" y1="23" x2="16" y2="23"></line></svg></button>
      <button style="color: var(--text-primary);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg></button>
      <button style="color: var(--text-primary);"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" width="24" height="24"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg></button>
    </div>
  `;

  // Handle responsive back button
  const backBtn = document.querySelector('.messages-chat__back');
  if (window.innerWidth <= 768 && backBtn) {
    backBtn.style.display = 'block';
  }

  // Scroll to bottom
  const container = document.getElementById('chat-messages-container');
  container.scrollTop = container.scrollHeight;

  // Input toggling
  const input = document.getElementById('chat-input');
  const sendBtn = document.getElementById('chat-send-btn');
  const micBtn = document.getElementById('chat-mic-btn');

  input.addEventListener('input', () => {
    if (input.value.trim().length > 0) {
      sendBtn.style.display = 'block';
      micBtn.style.display = 'none';
    } else {
      sendBtn.style.display = 'none';
      micBtn.style.display = 'block';
    }
  });
}

function closeChatMobile() {
  document.getElementById('chat-area').classList.remove('active');
  activeChatUserId = null;
  renderConversations();
}

function handleChatKeypress(e) {
  if (e.key === 'Enter') {
    sendMessage();
  }
}

function sendMessage() {
  const input = document.getElementById('chat-input');
  const text = input.value.trim();
  
  if (!text || !activeChatUserId) return;

  const conversation = CONVERSATIONS.find(c => c.user_id === activeChatUserId);
  if (!conversation) return;

  const newMsg = {
    from: CURRENT_USER.user_id,
    text: text,
    time: 'just now'
  };

  conversation.messages.push(newMsg);
  conversation.last_message = text;
  conversation.last_time = 'just now';

  // Re-render chat to show new message
  openChat(activeChatUserId);
  
  // Re-render sidebar to show updated last message
  renderConversations();
}

// Window resize listener to handle responsive view changes
window.addEventListener('resize', () => {
  const backBtn = document.querySelector('.messages-chat__back');
  if (backBtn) {
    backBtn.style.display = window.innerWidth <= 768 ? 'block' : 'none';
  }
});

/**
 * OmniChat - Chat Manager
 * Advanced chat features: search, delete, export
 */

class ChatManager {
    constructor(app) {
        this.app = app;
        this.searchMode = false;
        this.init();
    }

    init() {
        this.setupSearch();
        this.setupContextMenu();
    }

    setupSearch() {
        const searchBtn = document.getElementById('searchBtn');
        if (!searchBtn) return;

        searchBtn.addEventListener('click', () => {
            this.toggleSearch();
        });
    }

    toggleSearch() {
        if (this.searchMode) {
            this.closeSearch();
            return;
        }

        this.searchMode = true;
        const header = document.querySelector('.header-center');

        const searchHTML = `
            <div class="search-box" style="display:flex;align-items:center;gap:8px;flex:1;max-width:300px;">
                <input type="text" id="searchInput" placeholder="ابحث في الرسائل..." 
                    style="flex:1;background:var(--bg-card);border:1px solid var(--border);border-radius:20px;padding:8px 14px;color:var(--text);font-size:0.85rem;outline:none;">
                <button class="icon-btn" id="closeSearch" style="width:32px;height:32px;">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="18" y1="6" x2="6" y2="18"/>
                        <line x1="6" y1="6" x2="18" y2="18"/>
                    </svg>
                </button>
            </div>
        `;

        header.innerHTML = searchHTML;

        const input = document.getElementById('searchInput');
        input.focus();

        input.addEventListener('input', (e) => this.searchMessages(e.target.value));

        document.getElementById('closeSearch').addEventListener('click', () => this.closeSearch());
    }

    closeSearch() {
        this.searchMode = false;
        const header = document.querySelector('.header-center');
        header.innerHTML = `
            <div class="chat-avatar">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=OmniBot" alt="Bot">
                <span class="online-indicator"></span>
            </div>
            <div class="chat-info">
                <h2>المساعد الذكي</h2>
                <span class="status-text">متصل الآن</span>
            </div>
        `;

        // Restore highlight
        document.querySelectorAll('.message-bubble').forEach(el => {
            el.style.background = '';
        });
    }

    searchMessages(query) {
        if (!query) {
            document.querySelectorAll('.message').forEach(m => m.style.display = '');
            return;
        }

        const messages = document.querySelectorAll('.message');
        messages.forEach(msg => {
            const text = msg.textContent.toLowerCase();
            msg.style.display = text.includes(query.toLowerCase()) ? '' : 'none';
        });
    }

    setupContextMenu() {
        let longPressTimer;

        document.addEventListener('contextmenu', (e) => {
            const bubble = e.target.closest('.message-bubble, .message-media, .file-message');
            if (bubble) {
                e.preventDefault();
                this.showContextMenu(e, bubble);
            }
        });

        // Long press for mobile
        document.addEventListener('touchstart', (e) => {
            const bubble = e.target.closest('.message-bubble, .message-media, .file-message');
            if (bubble) {
                longPressTimer = setTimeout(() => {
                    this.showContextMenu(e.touches[0], bubble);
                }, 600);
            }
        });

        document.addEventListener('touchend', () => clearTimeout(longPressTimer));
        document.addEventListener('touchmove', () => clearTimeout(longPressTimer));
    }

    showContextMenu(event, element) {
        // Remove existing menu
        document.querySelectorAll('.context-menu').forEach(m => m.remove());

        const menu = document.createElement('div');
        menu.className = 'context-menu';
        menu.style.cssText = `
            position: fixed;
            background: var(--bg-light);
            border: 1px solid var(--border);
            border-radius: 12px;
            padding: 8px 0;
            z-index: 500;
            box-shadow: var(--shadow);
            min-width: 180px;
            animation: fadeIn 0.15s ease;
        `;

        const isUser = element.closest('.message')?.classList.contains('sent');

        menu.innerHTML = `
            <div class="ctx-item" data-action="copy">📋 نسخ النص</div>
            ${isUser ? '<div class="ctx-item" data-action="delete">🗑️ حذف</div>' : ''}
            <div class="ctx-item" data-action="reply">↩️ رد</div>
            <div class="ctx-item" data-action="forward">↪️ إعادة توجيه</div>
        `;

        const x = event.clientX || event.pageX;
        const y = event.clientY || event.pageY;
        menu.style.left = Math.min(x, window.innerWidth - 200) + 'px';
        menu.style.top = Math.min(y, window.innerHeight - 150) + 'px';

        document.body.appendChild(menu);

        menu.querySelectorAll('.ctx-item').forEach(item => {
            item.style.cssText = `
                padding: 10px 16px;
                cursor: pointer;
                font-size: 0.9rem;
                transition: background 0.2s;
                display: flex;
                align-items: center;
                gap: 8px;
            `;
            item.addEventListener('click', () => {
                this.handleContextAction(item.dataset.action, element);
                menu.remove();
            });
            item.addEventListener('mouseenter', () => item.style.background = 'var(--bg-hover)');
            item.addEventListener('mouseleave', () => item.style.background = '');
        });

        // Close on outside click
        setTimeout(() => {
            document.addEventListener('click', function closeMenu(e) {
                if (!menu.contains(e.target)) {
                    menu.remove();
                    document.removeEventListener('click', closeMenu);
                }
            });
        }, 10);
    }

    handleContextAction(action, element) {
        const messageEl = element.closest('.message');
        const id = parseInt(messageEl?.dataset.id);

        switch(action) {
            case 'copy':
                const text = element.textContent;
                navigator.clipboard?.writeText(text).then(() => {
                    this.showToast('✅ تم النسخ');
                });
                break;

            case 'delete':
                if (confirm('هل تريد حذف هذه الرسالة؟')) {
                    messageEl.style.animation = 'fadeOut 0.3s ease forwards';
                    setTimeout(() => {
                        messageEl.remove();
                        this.deleteFromStorage(id);
                    }, 300);
                }
                break;

            case 'reply':
                this.app.elements.messageInput.value = `> ${element.textContent.substring(0, 50)}...
`;
                this.app.elements.messageInput.focus();
                break;

            case 'forward':
                this.showToast('↪️ جاري إعادة التوجيه...');
                break;
        }
    }

    deleteFromStorage(id) {
        const messages = JSON.parse(localStorage.getItem('omnichat_messages') || '[]');
        const filtered = messages.filter(m => m.id !== id);
        localStorage.setItem('omnichat_messages', JSON.stringify(filtered));
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 100px;
            left: 50%;
            transform: translateX(-50%);
            background: var(--bg-light);
            color: var(--text);
            padding: 12px 24px;
            border-radius: 24px;
            font-size: 0.9rem;
            z-index: 1000;
            border: 1px solid var(--border);
            animation: fadeIn 0.3s ease;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);

        setTimeout(() => {
            toast.style.animation = 'fadeOut 0.3s ease forwards';
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    exportChat() {
        const messages = JSON.parse(localStorage.getItem('omnichat_messages') || '[]');
        const data = {
            app: 'OmniChat',
            version: '1.0',
            exported: new Date().toISOString(),
            messages: messages
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `omnichat_backup_${Date.now()}.json`;
        a.click();
        URL.revokeObjectURL(url);

        this.showToast('📥 تم تصدير الدردشة');
    }
}

// Add fadeOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeOut {
        to { opacity: 0; transform: scale(0.9); }
    }
    @keyframes fadeIn {
        from { opacity: 0; transform: translateY(10px); }
        to { opacity: 1; transform: translateY(0); }
    }
`;
document.head.appendChild(style);

// Initialize ChatManager after app
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.chatManager = new ChatManager(window.omniChat);
    }, 100);
});

/**
 * OmniChat - Main Application
 * Developed by: Chibani Lotfi
 */

class OmniChatApp {
    constructor() {
        this.state = {
            messages: [],
            isTyping: false,
            currentMedia: null,
            attachMenuOpen: false,
            sideMenuOpen: false,
            user: { name: 'المستخدم', phone: '+213 555 123 456' }
        };

        this.elements = {};
        this.init();
    }

    init() {
        this.cacheElements();
        this.bindEvents();
        this.hideSplash();
        this.loadMessages();
        console.log('🚀 OmniChat initialized by Chibani Lotfi');
    }

    cacheElements() {
        this.elements = {
            splash: document.getElementById('splash-screen'),
            app: document.getElementById('app'),
            chatContainer: document.getElementById('chatContainer'),
            messagesWrapper: document.getElementById('messagesWrapper'),
            messageInput: document.getElementById('messageInput'),
            sendBtn: document.getElementById('sendBtn'),
            attachBtn: document.getElementById('attachBtn'),
            attachMenu: document.getElementById('attachMenu'),
            mediaPreview: document.getElementById('mediaPreview'),
            previewContent: document.getElementById('previewContent'),
            captionInput: document.getElementById('captionInput'),
            sendMediaBtn: document.getElementById('sendMediaBtn'),
            closePreview: document.getElementById('closePreview'),
            menuBtn: document.getElementById('menuBtn'),
            sideMenu: document.getElementById('sideMenu'),
            fileInput: document.getElementById('fileInput'),
            imageInput: document.getElementById('imageInput'),
            videoInput: document.getElementById('videoInput'),
            cameraInput: document.getElementById('cameraInput')
        };
    }

    bindEvents() {
        // Send message
        this.elements.sendBtn.addEventListener('click', () => this.sendMessage());
        this.elements.messageInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        this.elements.messageInput.addEventListener('input', () => this.autoResize());

        // Attach menu
        this.elements.attachBtn.addEventListener('click', () => this.toggleAttachMenu());

        // Attach items
        document.querySelectorAll('.attach-item').forEach(item => {
            item.addEventListener('click', (e) => this.handleAttach(e.currentTarget.dataset.type));
        });

        // File inputs
        this.elements.fileInput.addEventListener('change', (e) => this.handleFileSelect(e, 'file'));
        this.elements.imageInput.addEventListener('change', (e) => this.handleFileSelect(e, 'image'));
        this.elements.videoInput.addEventListener('change', (e) => this.handleFileSelect(e, 'video'));
        this.elements.cameraInput.addEventListener('change', (e) => this.handleFileSelect(e, 'camera'));

        // Media preview
        this.elements.closePreview.addEventListener('click', () => this.closeMediaPreview());
        this.elements.sendMediaBtn.addEventListener('click', () => this.sendMediaMessage());

        // Side menu
        this.elements.menuBtn.addEventListener('click', () => this.toggleSideMenu());
        document.querySelector('.side-menu-overlay').addEventListener('click', () => this.toggleSideMenu());

        // Close menus on outside click
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.attach-menu') && !e.target.closest('.attach-btn')) {
                this.closeAttachMenu();
            }
        });

        // Keyboard handling
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAttachMenu();
                this.closeMediaPreview();
                if (this.state.sideMenuOpen) this.toggleSideMenu();
            }
        });
    }

    hideSplash() {
        setTimeout(() => {
            this.elements.splash.classList.add('hidden');
            this.elements.app.classList.remove('hidden');
        }, 2500);
    }

    autoResize() {
        const textarea = this.elements.messageInput;
        textarea.style.height = 'auto';
        textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }

    toggleAttachMenu() {
        this.state.attachMenuOpen = !this.state.attachMenuOpen;
        this.elements.attachMenu.classList.toggle('hidden', !this.state.attachMenuOpen);
        this.elements.attachBtn.classList.toggle('active', this.state.attachMenuOpen);
    }

    closeAttachMenu() {
        this.state.attachMenuOpen = false;
        this.elements.attachMenu.classList.add('hidden');
        this.elements.attachBtn.classList.remove('active');
    }

    handleAttach(type) {
        this.closeAttachMenu();

        switch(type) {
            case 'image':
                this.elements.imageInput.click();
                break;
            case 'camera':
                this.elements.cameraInput.click();
                break;
            case 'video':
                this.elements.videoInput.click();
                break;
            case 'file':
                this.elements.fileInput.click();
                break;
            case 'audio':
                this.startAudioRecording();
                break;
            case 'location':
                this.shareLocation();
                break;
        }
    }

    handleFileSelect(event, type) {
        const file = event.target.files[0];
        if (!file) return;

        this.state.currentMedia = { file, type };

        const reader = new FileReader();
        reader.onload = (e) => {
            this.showMediaPreview(e.target.result, type, file);
        };

        if (type === 'file') {
            this.showFilePreview(file);
        } else {
            reader.readAsDataURL(file);
        }

        event.target.value = '';
    }

    showMediaPreview(dataUrl, type, file) {
        const content = this.elements.previewContent;
        content.innerHTML = '';

        if (type === 'image' || type === 'camera') {
            const img = document.createElement('img');
            img.src = dataUrl;
            img.alt = 'Preview';
            content.appendChild(img);
        } else if (type === 'video') {
            const video = document.createElement('video');
            video.src = dataUrl;
            video.controls = true;
            content.appendChild(video);
        }

        this.elements.mediaPreview.classList.remove('hidden');
    }

    showFilePreview(file) {
        const content = this.elements.previewContent;
        content.innerHTML = `
            <div class="file-message" style="margin: 0;">
                <div class="file-icon">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                    </svg>
                </div>
                <div class="file-info">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${this.formatFileSize(file.size)}</div>
                </div>
            </div>
        `;
        this.elements.mediaPreview.classList.remove('hidden');
    }

    closeMediaPreview() {
        this.elements.mediaPreview.classList.add('hidden');
        this.state.currentMedia = null;
        this.elements.captionInput.value = '';
    }

    sendMediaMessage() {
        if (!this.state.currentMedia) return;

        const { file, type } = this.state.currentMedia;
        const caption = this.elements.captionInput.value.trim();

        const reader = new FileReader();
        reader.onload = (e) => {
            const message = {
                id: Date.now(),
                type: type === 'file' ? 'file' : (type === 'camera' ? 'image' : type),
                content: e.target.result,
                caption: caption,
                fileName: file.name,
                fileSize: file.size,
                timestamp: new Date(),
                sender: 'user',
                status: 'sent'
            };

            this.addMessage(message);
            this.saveMessage(message);
            this.closeMediaPreview();
            this.simulateReply();
        };

        if (type === 'file') {
            reader.readAsDataURL(file);
        } else {
            reader.readAsDataURL(file);
        }
    }

    sendMessage() {
        const text = this.elements.messageInput.value.trim();
        if (!text) return;

        const message = {
            id: Date.now(),
            type: 'text',
            content: text,
            timestamp: new Date(),
            sender: 'user',
            status: 'sent'
        };

        this.addMessage(message);
        this.saveMessage(message);
        this.elements.messageInput.value = '';
        this.elements.messageInput.style.height = 'auto';
        this.simulateReply();
    }

    addMessage(message) {
        const el = this.createMessageElement(message);
        this.elements.messagesWrapper.appendChild(el);
        this.scrollToBottom();
    }

    createMessageElement(message) {
        const div = document.createElement('div');
        div.className = `message ${message.sender === 'user' ? 'sent' : 'received'}`;
        div.dataset.id = message.id;

        const time = this.formatTime(message.timestamp);

        if (message.type === 'text') {
            div.innerHTML = `
                <div class="message-bubble">
                    ${this.escapeHtml(message.content)}
                    <span class="message-time">
                        ${time}
                        ${message.sender === 'user' ? '<span class="message-status">✓✓</span>' : ''}
                    </span>
                </div>
            `;
        } else if (message.type === 'image') {
            div.innerHTML = `
                <div class="message-media">
                    <img src="${message.content}" alt="صورة" loading="lazy">
                    ${message.caption ? `<div class="media-caption">${this.escapeHtml(message.caption)}</div>` : ''}
                    <div class="media-meta">
                        <span>${time}</span>
                        ${message.sender === 'user' ? '<span>✓✓</span>' : ''}
                    </div>
                </div>
            `;
        } else if (message.type === 'video') {
            div.innerHTML = `
                <div class="message-media">
                    <video src="${message.content}" controls preload="metadata"></video>
                    ${message.caption ? `<div class="media-caption">${this.escapeHtml(message.caption)}</div>` : ''}
                    <div class="media-meta">
                        <span>${time}</span>
                        ${message.sender === 'user' ? '<span>✓✓</span>' : ''}
                    </div>
                </div>
            `;
        } else if (message.type === 'file') {
            div.innerHTML = `
                <div class="file-message" onclick="window.open('${message.content}', '_blank')">
                    <div class="file-icon">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                            <polyline points="14 2 14 8 20 8"/>
                        </svg>
                    </div>
                    <div class="file-info">
                        <div class="file-name">${message.fileName}</div>
                        <div class="file-size">${this.formatFileSize(message.fileSize)}</div>
                    </div>
                </div>
            `;
        }

        return div;
    }

    simulateReply() {
        if (this.state.isTyping) return;
        this.state.isTyping = true;

        const replies = [
            'تم استلام رسالتك! 👍',
            'شكراً على المشاركة! 😊',
            'أنا هنا للمساعدة في أي وقت.',
            'رائع! هل تريد المزيد من المعلومات؟',
            'تمام، سأقوم بالمعالجة...',
            '💡 فكرة ممتازة!',
            'أفهم ما تقصده تماماً.',
            'هل يمكنك توضيح المزيد؟'
        ];

        setTimeout(() => {
            const reply = {
                id: Date.now() + 1,
                type: 'text',
                content: replies[Math.floor(Math.random() * replies.length)],
                timestamp: new Date(),
                sender: 'bot',
                status: 'delivered'
            };

            this.addMessage(reply);
            this.saveMessage(reply);
            this.state.isTyping = false;
        }, 1500 + Math.random() * 2000);
    }

    scrollToBottom() {
        setTimeout(() => {
            this.elements.chatContainer.scrollTop = this.elements.chatContainer.scrollHeight;
        }, 50);
    }

    toggleSideMenu() {
        this.state.sideMenuOpen = !this.state.sideMenuOpen;
        this.elements.sideMenu.classList.toggle('open', this.state.sideMenuOpen);
    }

    startAudioRecording() {
        if (!navigator.mediaDevices) {
            alert('التسجيل الصوتي غير مدعوم على هذا الجهاز');
            return;
        }
        alert('🎤 جاري تسجيل الصوت... (وضعية تجريبية)');
    }

    shareLocation() {
        if (!navigator.geolocation) {
            alert('الموقع الجغرافي غير مدعوم');
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                const message = {
                    id: Date.now(),
                    type: 'text',
                    content: `📍 موقعي: ${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}`,
                    timestamp: new Date(),
                    sender: 'user',
                    status: 'sent'
                };
                this.addMessage(message);
                this.saveMessage(message);
            },
            () => alert('تعذر الحصول على الموقع')
        );
    }

    // Storage
    saveMessage(message) {
        const messages = JSON.parse(localStorage.getItem('omnichat_messages') || '[]');
        messages.push(message);
        localStorage.setItem('omnichat_messages', JSON.stringify(messages));
    }

    loadMessages() {
        const messages = JSON.parse(localStorage.getItem('omnichat_messages') || '[]');
        messages.forEach(msg => {
            msg.timestamp = new Date(msg.timestamp);
            this.addMessage(msg);
        });
    }

    // Utilities
    formatTime(date) {
        return date.toLocaleTimeString('ar-SA', { hour: '2-digit', minute: '2-digit' });
    }

    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    window.omniChat = new OmniChatApp();
});

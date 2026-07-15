/**
 * OmniChat - Media Manager
 * Handles images, videos, files, audio, camera
 */

class MediaManager {
    constructor(app) {
        this.app = app;
        this.recordedChunks = [];
        this.mediaRecorder = null;
        this.init();
    }

    init() {
        this.setupDragDrop();
        this.setupPaste();
    }

    setupDragDrop() {
        const container = document.getElementById('chatContainer');

        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            container.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
            });
        });

        container.addEventListener('dragenter', () => {
            container.style.background = 'rgba(99, 102, 241, 0.05)';
        });

        container.addEventListener('dragleave', () => {
            container.style.background = '';
        });

        container.addEventListener('drop', (e) => {
            container.style.background = '';
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                this.handleDroppedFiles(files);
            }
        });
    }

    setupPaste() {
        document.addEventListener('paste', (e) => {
            const items = e.clipboardData.items;
            for (let item of items) {
                if (item.type.startsWith('image/')) {
                    const file = item.getAsFile();
                    this.handleFile(file, 'image');
                }
            }
        });
    }

    handleDroppedFiles(files) {
        Array.from(files).forEach(file => {
            const type = file.type.startsWith('image/') ? 'image' :
                        file.type.startsWith('video/') ? 'video' : 'file';
            this.handleFile(file, type);
        });
    }

    handleFile(file, type) {
        this.app.state.currentMedia = { file, type };

        const reader = new FileReader();
        reader.onload = (e) => {
            if (type === 'file') {
                this.app.showFilePreview(file);
            } else {
                this.app.showMediaPreview(e.target.result, type, file);
            }
        };
        reader.readAsDataURL(file);
    }

    async startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            this.mediaRecorder = new MediaRecorder(stream);
            this.recordedChunks = [];

            this.mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) this.recordedChunks.push(e.data);
            };

            this.mediaRecorder.onstop = () => {
                const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
                const url = URL.createObjectURL(blob);

                const message = {
                    id: Date.now(),
                    type: 'audio',
                    content: url,
                    timestamp: new Date(),
                    sender: 'user',
                    status: 'sent'
                };

                this.app.addMessage(message);
                this.app.saveMessage(message);
                stream.getTracks().forEach(t => t.stop());
            };

            this.mediaRecorder.start();
            this.showRecordingUI();

        } catch (err) {
            console.error('Recording error:', err);
            alert('تعذر الوصول إلى الميكروفون');
        }
    }

    showRecordingUI() {
        const overlay = document.createElement('div');
        overlay.id = 'recordingOverlay';
        overlay.style.cssText = `
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,0.8);
            z-index: 1000;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            gap: 24px;
        `;

        overlay.innerHTML = `
            <div style="width:80px;height:80px;border-radius:50%;background:#ef4444;animation:pulse 1s infinite;display:flex;align-items:center;justify-content:center;">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="white">
                    <path d="M12 1a3 3 0 00-3 3v8a3 3 0 006 0V4a3 3 0 00-3-3z"/>
                    <path d="M19 10v2a7 7 0 01-14 0v-2"/>
                </svg>
            </div>
            <p style="color:white;font-size:1.2rem;">جاري التسجيل...</p>
            <button id="stopRecording" style="padding:12px 32px;border-radius:24px;border:none;background:white;color:#ef4444;font-weight:700;cursor:pointer;">
                إيقاف التسجيل
            </button>
        `;

        document.body.appendChild(overlay);

        document.getElementById('stopRecording').addEventListener('click', () => {
            this.mediaRecorder?.stop();
            overlay.remove();
        });
    }

    compressImage(dataUrl, maxWidth = 1200, quality = 0.8) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');

                let { width, height } = img;
                if (width > maxWidth) {
                    height = (height * maxWidth) / width;
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;
                ctx.drawImage(img, 0, 0, width, height);

                resolve(canvas.toDataURL('image/jpeg', quality));
            };
            img.src = dataUrl;
        });
    }

    generateThumbnail(videoFile) {
        return new Promise((resolve) => {
            const video = document.createElement('video');
            video.src = URL.createObjectURL(videoFile);
            video.currentTime = 1;

            video.onloadeddata = () => {
                const canvas = document.createElement('canvas');
                canvas.width = 320;
                canvas.height = (video.videoHeight / video.videoWidth) * 320;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                resolve(canvas.toDataURL('image/jpeg', 0.7));
                URL.revokeObjectURL(video.src);
            };
        });
    }
}

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        window.mediaManager = new MediaManager(window.omniChat);
    }, 200);
});

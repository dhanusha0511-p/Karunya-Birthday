/* ==========================================================================
   ✨ KARUNYA'S 10TH BIRTHDAY MAGICAL SCRAPBOOK - JAVASCRIPT ✨
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    /* ==========================================================================
       1. SCENE NAVIGATION & TRANSITIONS
       ========================================================================== */
    const scenes = document.querySelectorAll('.scene-page');
    const transitionOverlay = document.getElementById('pageTransitionOverlay');
    let currentSceneIdx = 1;

    window.goToPage = function(targetPageNum) {
        if (targetPageNum < 1 || targetPageNum > 8) return;
        
        playFairyChime();

        // Activate sparkle transition overlay
        if (transitionOverlay) {
            transitionOverlay.classList.add('active');
        }

        // Trigger transition confetti burst
        triggerTransitionBurst();

        // If clicking Enter to Page 2 or navigating to Page 2 -> BIRTHDAY SPRINKLES BLAST!
        if (targetPageNum === 2) {
            triggerBirthdayBlastSprinkles();
        }

        setTimeout(() => {
            // Hide all pages
            scenes.forEach(scene => scene.classList.remove('active'));

            // Show target page
            const targetScene = document.getElementById(`page-${targetPageNum}`);
            if (targetScene) {
                targetScene.classList.add('active');
                currentSceneIdx = targetPageNum;
            }

            // Scroll to top of target scene if needed
            window.scrollTo(0, 0);

            // Hide transition overlay
            setTimeout(() => {
                if (transitionOverlay) {
                    transitionOverlay.classList.remove('active');
                }
            }, 300);

        }, 300);
    };

    /* ==========================================================================
       2. PHOTO CLICK INTERACTION (SPARKLE BURST WITHOUT ENLARGING)
       ========================================================================== */
    window.handleCardClick = function(event, cardElement) {
        if (event) event.stopPropagation();
        
        playFairyChime();

        if (cardElement) {
            // Trigger bounce glow effect
            cardElement.classList.remove('card-sparkle-active');
            void cardElement.offsetWidth; // Trigger reflow
            cardElement.classList.add('card-sparkle-active');

            // Get card rect for targeted particle explosion
            const rect = cardElement.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;

            createSparkleBurstAt(centerX, centerY, 40);
        }
    };

    /* ==========================================================================
       3. AUDIO SYSTEM & FAIRY CHIME SOUND
       ========================================================================== */
    const bgMusic = document.getElementById('bgMusic');
    const musicBtn = document.getElementById('musicToggle');
    const musicTooltip = document.getElementById('musicTooltip');
    let isPlaying = false;
    let audioCtx = null;

    function playFairyChime() {
        try {
            if (!audioCtx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                audioCtx = new AudioContext();
            }
            if (audioCtx.state === 'suspended') audioCtx.resume();
            
            const osc = audioCtx.createOscillator();
            const gain = audioCtx.createGain();
            const freq = 600 + Math.random() * 450;
            
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
            gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.2);
            
            osc.connect(gain);
            gain.connect(audioCtx.destination);
            
            osc.start();
            osc.stop(audioCtx.currentTime + 0.2);
        } catch(e) {}
    }

    if (musicBtn && bgMusic) {
        musicBtn.addEventListener('click', () => {
            playFairyChime();
            if (isPlaying) {
                bgMusic.pause();
                isPlaying = false;
                musicBtn.classList.remove('active');
                if (musicTooltip) musicTooltip.textContent = 'Play Music 🎵';
            } else {
                bgMusic.play().then(() => {
                    isPlaying = true;
                    musicBtn.classList.add('active');
                    if (musicTooltip) musicTooltip.textContent = 'Pause Music 🎵';
                }).catch(() => {
                    if (musicTooltip) musicTooltip.textContent = 'Add birthday-song.mp3';
                });
            }
        });
    }

    /* ==========================================================================
       4. CANVAS PARTICLE ENGINE (STARS, BUBBLES, FAIRY DUST, BIRTHDAY SPRINKLES)
       ========================================================================== */
    const canvas = document.getElementById('magicCanvas');
    const ctx = canvas.getContext('2d');
    
    let width = canvas.width = window.innerWidth;
    let height = canvas.height = window.innerHeight;

    window.addEventListener('resize', () => {
        width = canvas.width = window.innerWidth;
        height = canvas.height = window.innerHeight;
    });

    const backgroundParticles = [];
    const interactiveSparkles = [];
    let wandSparklesEnabled = true;

    const sparkleBtn = document.getElementById('sparkleToggle');
    if (sparkleBtn) {
        sparkleBtn.addEventListener('click', () => {
            wandSparklesEnabled = !wandSparklesEnabled;
            sparkleBtn.classList.toggle('active', wandSparklesEnabled);
        });
    }

    // Birthday Sprinkles Confetti Particle Class
    class SprinkleConfettiParticle {
        constructor(x, y, isBurst = true) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 9 + 5;
            const angle = (Math.random() - 0.5) * Math.PI * 1.4 - Math.PI / 2;
            const speed = isBurst ? (Math.random() * 15 + 5) : (Math.random() * 3 + 1);
            this.vx = Math.cos(angle) * speed + (Math.random() - 0.5) * 6;
            this.vy = Math.sin(angle) * speed - Math.random() * 6;
            this.gravity = 0.24;
            this.drag = 0.96;
            this.rotation = Math.random() * Math.PI * 2;
            this.rotationSpeed = (Math.random() - 0.5) * 0.25;
            this.colors = ['#ff4081', '#00e5ff', '#ffd700', '#ba68c8', '#ff9800', '#4caf50', '#ff8da1', '#ffffff', '#e91e63', '#ff6097'];
            this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
            this.shape = Math.random() > 0.35 ? 'rect' : (Math.random() > 0.5 ? 'circle' : 'star');
            this.life = 1.0;
            this.decay = Math.random() * 0.015 + 0.008;
        }
        update() {
            this.vx *= this.drag;
            this.vy *= this.drag;
            this.vy += this.gravity;
            this.x += this.vx;
            this.y += this.vy;
            this.rotation += this.rotationSpeed;
            this.life -= this.decay;
        }
        draw() {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = Math.max(0, this.life);
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = this.color;
            if (this.shape === 'rect') {
                ctx.fillRect(-this.size / 2, -this.size / 4, this.size, this.size / 2);
            } else if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.font = `${this.size * 1.5}px sans-serif`;
                ctx.fillText('✨', -this.size / 2, this.size / 2);
            }
            ctx.restore();
        }
    }

    // Twinkling Star Particle
    class TwinklingStar {
        constructor() {
            this.x = Math.random() * width;
            this.y = Math.random() * height;
            this.size = Math.random() * 4 + 2;
            this.alpha = Math.random();
            this.speed = Math.random() * 0.02 + 0.008;
            this.rotation = Math.random() * Math.PI * 2;
        }
        update() {
            this.alpha += this.speed;
            this.rotation += 0.005;
            if (this.alpha > 1 || this.alpha < 0) this.speed = -this.speed;
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = Math.abs(this.alpha) * 0.85;
            ctx.translate(this.x, this.y);
            ctx.rotate(this.rotation);
            ctx.fillStyle = '#ffffff';
            ctx.shadowBlur = 10;
            ctx.shadowColor = '#ffd700';

            for (let i = 0; i < 4; i++) {
                ctx.rotate(Math.PI / 2);
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-this.size * 0.25, 0);
                ctx.lineTo(0, -this.size * 2);
                ctx.lineTo(this.size * 0.25, 0);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    // Sparkling Iridescent Bubble Class
    class SparklingBubble {
        constructor() { this.reset(true); }
        reset(initial = false) {
            this.x = Math.random() * width;
            this.y = initial ? Math.random() * height : height + Math.random() * 60;
            this.size = Math.random() * 20 + 8;
            this.speedY = Math.random() * 0.5 + 0.25;
            this.wobbleSpeed = Math.random() * 0.03 + 0.015;
            this.wobbleAngle = Math.random() * Math.PI * 2;
            this.alpha = Math.random() * 0.5 + 0.3;
            this.hue = Math.random() * 60 + 310;
            this.sparkleTimer = Math.random() * 10;
        }
        update() {
            this.y -= this.speedY;
            this.wobbleAngle += this.wobbleSpeed;
            this.x += Math.sin(this.wobbleAngle) * 0.6;
            this.sparkleTimer += 0.1;

            // Emit subtle sparkles while floating up!
            if (Math.random() < 0.12) {
                interactiveSparkles.push(new SparkleParticle(
                    this.x + (Math.random() - 0.5) * this.size,
                    this.y + (Math.random() - 0.5) * this.size
                ));
            }

            if (this.y < -40) this.reset(false);
        }
        draw() {
            ctx.save();
            ctx.globalAlpha = this.alpha;
            
            // Iridescent Rim Gradient
            const grad = ctx.createRadialGradient(this.x - this.size * 0.3, this.y - this.size * 0.3, 2, this.x, this.y, this.size);
            grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
            grad.addColorStop(0.3, `hsla(${this.hue}, 90%, 85%, 0.45)`);
            grad.addColorStop(0.7, 'hsla(190, 90%, 80%, 0.35)');
            grad.addColorStop(1, `hsla(${this.hue + 40}, 85%, 75%, 0.65)`);

            ctx.fillStyle = grad;
            ctx.strokeStyle = `hsla(${this.hue}, 95%, 90%, 0.9)`;
            ctx.lineWidth = 1.4;

            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();

            // Inner Glass Reflection Highlight
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.beginPath();
            ctx.arc(this.x - this.size * 0.35, this.y - this.size * 0.35, this.size * 0.22, 0, Math.PI * 2);
            ctx.fill();

            // Inner Twinkling Sparkle Center inside Bubble
            if (Math.sin(this.sparkleTimer) > 0.25) {
                ctx.fillStyle = '#ffffff';
                ctx.shadowBlur = 6;
                ctx.shadowColor = '#ffd700';
                ctx.font = `${this.size * 0.65}px sans-serif`;
                ctx.fillText('✨', this.x - this.size * 0.2, this.y + this.size * 0.2);
            }

            ctx.restore();
        }
    }

    // Sparkle Particle Class
    class SparkleParticle {
        constructor(x, y) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 5 + 2;
            const angle = Math.random() * Math.PI * 2;
            const speed = Math.random() * 4 + 1;
            this.vx = Math.cos(angle) * speed;
            this.vy = Math.sin(angle) * speed - Math.random() * 2;
            this.color = ['#ffb6c1', '#ffd700', '#ffffff', '#ff4081', '#e1bee7', '#f48fb1', '#00e5ff'][Math.floor(Math.random() * 7)];
            this.life = 1.0;
            this.decay = Math.random() * 0.03 + 0.015;
            this.shape = Math.random() > 0.4 ? 'circle' : 'star';
        }
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.vy += 0.08; // gravity
            this.life -= this.decay;
        }
        draw() {
            if (this.life <= 0) return;
            ctx.save();
            ctx.globalAlpha = this.life;
            ctx.fillStyle = this.color;
            ctx.shadowBlur = 8;
            ctx.shadowColor = this.color;

            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.font = `${this.size * 1.8}px sans-serif`;
                ctx.fillText('✨', this.x, this.y);
            }
            ctx.restore();
        }
    }

    // Populate canvas elements (NOW WITH 60 FLOATING SPARKLING BUBBLES!)
    for (let i = 0; i < 50; i++) backgroundParticles.push(new TwinklingStar());
    for (let i = 0; i < 60; i++) backgroundParticles.push(new SparklingBubble());

    function createSparkleBurstAt(x, y, count = 30) {
        for (let i = 0; i < count; i++) {
            interactiveSparkles.push(new SparkleParticle(x, y));
        }
    }

    function triggerTransitionBurst() {
        createSparkleBurstAt(width / 2, height / 2, 45);
    }

    // Birthday Blast Sprinkles Function (Triggered on Entering Page 2)
    window.triggerBirthdayBlastSprinkles = function() {
        playFairyChime();
        
        const cannons = [
            { x: width * 0.15, y: height * 0.85 },
            { x: width * 0.5, y: height * 0.9 },
            { x: width * 0.85, y: height * 0.85 }
        ];

        cannons.forEach((c, idx) => {
            setTimeout(() => {
                playFairyChime();
                for (let i = 0; i < 65; i++) {
                    interactiveSparkles.push(new SprinkleConfettiParticle(c.x, c.y, true));
                }
            }, idx * 130);
        });
    };

    window.triggerGrandConfetti = function() {
        triggerBirthdayBlastSprinkles();
    };

    // Mouse movement sparkles
    window.addEventListener('mousemove', (e) => {
        if (!wandSparklesEnabled) return;
        if (Math.random() < 0.45) {
            interactiveSparkles.push(new SparkleParticle(e.clientX, e.clientY));
        }
    });

    window.addEventListener('touchmove', (e) => {
        if (!wandSparklesEnabled) return;
        if (e.touches[0] && Math.random() < 0.45) {
            interactiveSparkles.push(new SparkleParticle(e.touches[0].clientX, e.touches[0].clientY));
        }
    });

    function animateCanvas() {
        ctx.clearRect(0, 0, width, height);

        backgroundParticles.forEach(p => { p.update(); p.draw(); });

        for (let i = interactiveSparkles.length - 1; i >= 0; i--) {
            interactiveSparkles[i].update();
            interactiveSparkles[i].draw();
            if (interactiveSparkles[i].life <= 0) {
                interactiveSparkles.splice(i, 1);
            }
        }

        requestAnimationFrame(animateCanvas);
    }
    animateCanvas();

    /* ==========================================================================
       5. EDITABLE BIRTHDAY MESSAGE LOCALSTORAGE AUTO-SAVE
       ========================================================================== */
    const birthdayMsgArea = document.getElementById('birthdayMessageArea');
    if (birthdayMsgArea) {
        const savedMsg = localStorage.getItem('karunya_birthday_wish');
        if (savedMsg) {
            birthdayMsgArea.textContent = savedMsg;
        }

        birthdayMsgArea.addEventListener('input', () => {
            localStorage.setItem('karunya_birthday_wish', birthdayMsgArea.textContent);
        });
    }

});

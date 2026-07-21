
(function() {
    'use strict';

    function createLightweightBackground() {
        const container = document.getElementById('canvas-container');
        if (!container) {
            console.warn('canvas-container not found');
            return;
        }

        // Clear any existing content
        container.innerHTML = '';

        // ==================== STYLE THE CONTAINER ====================
        container.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
            pointer-events: none;
            overflow: hidden;
            background: linear-gradient(180deg, 
                #0a0a2e 0%, 
                #1a0a3e 20%, 
                #2d1b4d 40%, 
                #1a3a2e 60%, 
                #0a4a3a 80%, 
                #0a2a1a 100%
            );
        `;

        // ==================== CREATE STARS ====================
        const starsContainer = document.createElement('div');
        starsContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        `;

        for (let i = 0; i < 80; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 3 + 1;
            const x = Math.random() * 100;
            const y = Math.random() * 60;
            const delay = Math.random() * 3;
            const duration = Math.random() * 2 + 1;
            const opacity = Math.random() * 0.8 + 0.2;

            star.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                background: white;
                border-radius: 50%;
                opacity: ${opacity};
                animation: starTwinkle ${duration}s ease-in-out ${delay}s infinite alternate;
                box-shadow: 0 0 ${size * 2}px rgba(255, 215, 0, 0.2);
            `;
            starsContainer.appendChild(star);
        }
        container.appendChild(starsContainer);

        // ==================== CREATE GOLDEN WAVES ====================
        const wavesContainer = document.createElement('div');
        wavesContainer.style.cssText = `
            position: absolute;
            bottom: 0;
            left: 0;
            width: 100%;
            height: 40%;
            z-index: 2;
            overflow: hidden;
        `;

        // Wave 1 - Bottom wave (largest)
        const wave1 = document.createElement('div');
        wave1.style.cssText = `
            position: absolute;
            bottom: -10px;
            left: -50%;
            width: 200%;
            height: 120px;
            background: radial-gradient(ellipse at center, 
                rgba(255, 215, 0, 0.12) 0%, 
                rgba(255, 182, 193, 0.04) 40%,
                transparent 70%
            );
            border-radius: 50% 50% 0 0 / 30% 30% 0 0;
            animation: waveMove1 6s ease-in-out infinite alternate;
            filter: blur(2px);
        `;
        wavesContainer.appendChild(wave1);

        // Wave 2 - Middle wave
        const wave2 = document.createElement('div');
        wave2.style.cssText = `
            position: absolute;
            bottom: 0;
            left: -30%;
            width: 160%;
            height: 100px;
            background: radial-gradient(ellipse at center, 
                rgba(255, 215, 0, 0.08) 0%, 
                rgba(255, 182, 193, 0.03) 50%,
                transparent 70%
            );
            border-radius: 50% 50% 0 0 / 40% 40% 0 0;
            animation: waveMove2 8s ease-in-out infinite alternate;
            filter: blur(3px);
        `;
        wavesContainer.appendChild(wave2);

        // Wave 3 - Top wave (smallest)
        const wave3 = document.createElement('div');
        wave3.style.cssText = `
            position: absolute;
            bottom: 20px;
            left: -20%;
            width: 140%;
            height: 80px;
            background: radial-gradient(ellipse at center, 
                rgba(255, 215, 0, 0.06) 0%, 
                rgba(255, 182, 193, 0.02) 50%,
                transparent 70%
            );
            border-radius: 50% 50% 0 0 / 50% 50% 0 0;
            animation: waveMove3 10s ease-in-out infinite alternate;
            filter: blur(4px);
        `;
        wavesContainer.appendChild(wave3);

        container.appendChild(wavesContainer);

        // ==================== CREATE GOLDEN PARTICLES ====================
        const particlesContainer = document.createElement('div');
        particlesContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 3;
            pointer-events: none;
        `;

        for (let i = 0; i < 25; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 6 + 3;
            const x = Math.random() * 100;
            const y = Math.random() * 80 + 10;
            const delay = Math.random() * 5;
            const duration = Math.random() * 4 + 3;

            particle.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                background: radial-gradient(circle, 
                    rgba(255, 215, 0, 0.5) 0%, 
                    rgba(255, 215, 0, 0) 70%
                );
                border-radius: 50%;
                animation: particleFloat ${duration}s ease-in-out ${delay}s infinite alternate;
                filter: blur(1px);
            `;
            particlesContainer.appendChild(particle);
        }
        container.appendChild(particlesContainer);

        // ==================== CREATE GLOWING SUN ====================
        const sun = document.createElement('div');
        sun.style.cssText = `
            position: absolute;
            top: 8%;
            right: 10%;
            width: 140px;
            height: 140px;
            border-radius: 50%;
            background: radial-gradient(circle, 
                rgba(255, 215, 0, 0.25) 0%, 
                rgba(255, 215, 0, 0.08) 40%,
                rgba(255, 182, 193, 0.04) 60%,
                transparent 80%
            );
            z-index: 0;
            animation: sunPulse 4s ease-in-out infinite alternate;
            filter: blur(5px);
        `;

        const sunCore = document.createElement('div');
        sunCore.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 70px;
            height: 70px;
            border-radius: 50%;
            background: radial-gradient(circle, 
                rgba(255, 215, 0, 0.7) 0%, 
                rgba(255, 215, 0, 0.2) 50%,
                transparent 80%
            );
            animation: sunCorePulse 3s ease-in-out infinite alternate;
        `;
        sun.appendChild(sunCore);
        container.appendChild(sun);

        // ==================== ADD CSS ANIMATIONS ====================
        const style = document.createElement('style');
        style.id = 'bg-animations';
        style.textContent = `
            @keyframes starTwinkle {
                0% { opacity: 0.2; transform: scale(0.8); }
                100% { opacity: 1; transform: scale(1.2); }
            }

            @keyframes waveMove1 {
                0% { transform: translateX(-10%) scaleX(1); }
                50% { transform: translateX(5%) scaleX(1.05); }
                100% { transform: translateX(-5%) scaleX(0.95); }
            }

            @keyframes waveMove2 {
                0% { transform: translateX(5%) scaleX(1.05); }
                50% { transform: translateX(-10%) scaleX(0.95); }
                100% { transform: translateX(10%) scaleX(1.02); }
            }

            @keyframes waveMove3 {
                0% { transform: translateX(-5%) scaleX(0.95); }
                50% { transform: translateX(10%) scaleX(1.02); }
                100% { transform: translateX(-10%) scaleX(1); }
            }

            @keyframes particleFloat {
                0% { transform: translateY(0) scale(1); opacity: 0.2; }
                50% { transform: translateY(-30px) scale(1.5); opacity: 0.8; }
                100% { transform: translateY(10px) scale(0.8); opacity: 0.3; }
            }

            @keyframes sunPulse {
                0% { transform: scale(1); opacity: 0.5; }
                100% { transform: scale(1.1); opacity: 0.8; }
            }

            @keyframes sunCorePulse {
                0% { transform: translate(-50%, -50%) scale(1); opacity: 0.6; }
                100% { transform: translate(-50%, -50%) scale(1.3); opacity: 1; }
            }

            /* Reduce animations on low-end devices */
            @media (prefers-reduced-motion: reduce) {
                #canvas-container * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }
        `;
        document.head.appendChild(style);

        console.log('✨ Lightweight background loaded successfully!');
    }

    // ============================================================
    // INITIALIZE ON DOM READY
    // ============================================================
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', createLightweightBackground);
    } else {
        createLightweightBackground();
    }

})();

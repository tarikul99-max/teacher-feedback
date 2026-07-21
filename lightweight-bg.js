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
            background: radial-gradient(ellipse at 20% 30%, #0d1b2a, #1b0e2e, #0a1a12);
        `;

        // ==================== CREATE STARS WITH EMOJIS ====================
        const starsContainer = document.createElement('div');
        starsContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 1;
        `;

        // Different star emojis and symbols
        const starEmojis = ['⭐', '✨', '🌟', '💫', '✦', '✧', '⋆', '·', '•'];
        const colors = ['#FFD700', '#FF6B6B', '#48DBFB', '#FECA57', '#FF9F43', '#10AC84', '#EE5A24', '#A29BFE'];

        for (let i = 0; i < 100; i++) {
            const star = document.createElement('div');
            const size = Math.random() * 18 + 10;
            const x = Math.random() * 100;
            const y = Math.random() * 70;
            const delay = Math.random() * 4;
            const duration = Math.random() * 3 + 2;
            const opacity = Math.random() * 0.6 + 0.2;
            const emoji = starEmojis[Math.floor(Math.random() * starEmojis.length)];
            const color = colors[Math.floor(Math.random() * colors.length)];

            star.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                font-size: ${size}px;
                opacity: ${opacity};
                animation: starTwinkle ${duration}s ease-in-out ${delay}s infinite alternate;
                text-shadow: 0 0 ${size/2}px ${color}40, 0 0 ${size}px ${color}20;
                transform-origin: center;
                filter: drop-shadow(0 0 5px ${color}30);
                transition: all 0.3s ease;
            `;
            star.textContent = emoji;
            
            // Random rotation for some stars
            if (Math.random() > 0.5) {
                star.style.animation += `, starRotate ${duration * 2}s linear ${delay}s infinite`;
            }
            
            starsContainer.appendChild(star);
        }
        container.appendChild(starsContainer);

        // ==================== CREATE POP ART EFFECT (BURSTING STARS) ====================
        const popContainer = document.createElement('div');
        popContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            pointer-events: none;
        `;

        // Pop art burst shapes
        const popShapes = [
            { emoji: '💥', size: 30 },
            { emoji: '🌟', size: 25 },
            { emoji: '⭐', size: 20 },
            { emoji: '✨', size: 15 },
            { emoji: '🎆', size: 35 },
            { emoji: '🎇', size: 30 },
            { emoji: '💫', size: 22 },
            { emoji: '✨', size: 18 }
        ];

        for (let i = 0; i < 20; i++) {
            const pop = document.createElement('div');
            const shape = popShapes[Math.floor(Math.random() * popShapes.length)];
            const x = Math.random() * 100;
            const y = Math.random() * 80 + 10;
            const delay = Math.random() * 8;
            const duration = Math.random() * 4 + 3;
            const scale = Math.random() * 0.8 + 0.6;
            
            pop.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                font-size: ${shape.size * scale}px;
                opacity: 0;
                animation: popBurst ${duration}s ease-out ${delay}s infinite;
                transform-origin: center;
                filter: blur(0.5px);
                text-shadow: 0 0 30px rgba(255, 215, 0, 0.3);
            `;
            pop.textContent = shape.emoji;
            popContainer.appendChild(pop);
        }
        container.appendChild(popContainer);

        // ==================== CREATE GOLDEN PARTICLES (FLOATING) ====================
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

        const particleEmojis = ['✦', '✧', '⋆', '·', '•', '◦', '◈', '◇'];
        
        for (let i = 0; i < 40; i++) {
            const particle = document.createElement('div');
            const size = Math.random() * 16 + 8;
            const x = Math.random() * 100;
            const y = Math.random() * 90 + 5;
            const delay = Math.random() * 6;
            const duration = Math.random() * 5 + 4;
            const opacity = Math.random() * 0.3 + 0.1;
            const emoji = particleEmojis[Math.floor(Math.random() * particleEmojis.length)];

            particle.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                font-size: ${size}px;
                opacity: ${opacity};
                animation: particleFloat ${duration}s ease-in-out ${delay}s infinite alternate;
                color: rgba(255, 215, 0, 0.4);
                text-shadow: 0 0 ${size}px rgba(255, 215, 0, 0.1);
                transform-origin: center;
            `;
            particle.textContent = emoji;
            particlesContainer.appendChild(particle);
        }
        container.appendChild(particlesContainer);

        // ==================== CREATE GLOWING ORBS ====================
        const orbsContainer = document.createElement('div');
        orbsContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 0;
            pointer-events: none;
        `;

        const orbColors = [
            'rgba(255, 215, 0, 0.08)',
            'rgba(255, 107, 107, 0.06)',
            'rgba(72, 219, 251, 0.06)',
            'rgba(254, 202, 87, 0.08)',
            'rgba(16, 172, 132, 0.06)'
        ];

        for (let i = 0; i < 8; i++) {
            const orb = document.createElement('div');
            const size = Math.random() * 200 + 100;
            const x = Math.random() * 100;
            const y = Math.random() * 100;
            const delay = Math.random() * 5;
            const duration = Math.random() * 6 + 4;
            const color = orbColors[Math.floor(Math.random() * orbColors.length)];

            orb.style.cssText = `
                position: absolute;
                left: ${x}%;
                top: ${y}%;
                width: ${size}px;
                height: ${size}px;
                border-radius: 50%;
                background: radial-gradient(circle, ${color} 0%, transparent 70%);
                animation: orbFloat ${duration}s ease-in-out ${delay}s infinite alternate;
                filter: blur(30px);
                transform: translate(-50%, -50%);
            `;
            orbsContainer.appendChild(orb);
        }
        container.appendChild(orbsContainer);

        // ==================== CREATE SHOOTING STARS ====================
        const shootingStarsContainer = document.createElement('div');
        shootingStarsContainer.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 4;
            pointer-events: none;
        `;

        for (let i = 0; i < 5; i++) {
            const shootingStar = document.createElement('div');
            const delay = Math.random() * 10 + 5;
            const duration = Math.random() * 1.5 + 0.8;
            const startX = Math.random() * 80 + 10;
            const startY = Math.random() * 40 + 5;

            shootingStar.style.cssText = `
                position: absolute;
                left: ${startX}%;
                top: ${startY}%;
                font-size: 20px;
                opacity: 0;
                animation: shootingStar ${duration}s ease-in ${delay}s infinite;
                transform: rotate(${Math.random() * 30 - 15}deg);
                filter: drop-shadow(0 0 10px rgba(255, 215, 0, 0.5));
            `;
            shootingStar.textContent = '✦';
            shootingStarsContainer.appendChild(shootingStar);
        }
        container.appendChild(shootingStarsContainer);

        // ==================== ADD CSS ANIMATIONS ====================
        const style = document.createElement('style');
        style.id = 'bg-animations';
        style.textContent = `
            @keyframes starTwinkle {
                0% { opacity: 0.1; transform: scale(0.7) rotate(0deg); }
                50% { opacity: 0.8; transform: scale(1.2) rotate(10deg); }
                100% { opacity: 0.3; transform: scale(0.9) rotate(-5deg); }
            }

            @keyframes starRotate {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            @keyframes popBurst {
                0% { 
                    opacity: 0; 
                    transform: scale(0.3) rotate(0deg);
                    filter: blur(4px);
                }
                20% { 
                    opacity: 1; 
                    transform: scale(1.2) rotate(20deg);
                    filter: blur(0px);
                }
                40% { 
                    opacity: 0.8; 
                    transform: scale(0.9) rotate(-10deg);
                    filter: blur(0px);
                }
                60% { 
                    opacity: 0.6; 
                    transform: scale(1.1) rotate(15deg);
                    filter: blur(1px);
                }
                100% { 
                    opacity: 0; 
                    transform: scale(0.4) rotate(30deg) translateY(-50px);
                    filter: blur(3px);
                }
            }

            @keyframes particleFloat {
                0% { 
                    transform: translateY(0) scale(1) rotate(0deg);
                    opacity: 0.1;
                }
                50% { 
                    transform: translateY(-40px) scale(1.3) rotate(180deg);
                    opacity: 0.5;
                }
                100% { 
                    transform: translateY(20px) scale(0.7) rotate(360deg);
                    opacity: 0.2;
                }
            }

            @keyframes orbFloat {
                0% { transform: translate(-50%, -50%) scale(1) translateX(0); }
                33% { transform: translate(-50%, -50%) scale(1.2) translateX(30px); }
                66% { transform: translate(-50%, -50%) scale(0.8) translateX(-20px); }
                100% { transform: translate(-50%, -50%) scale(1.1) translateX(10px); }
            }

            @keyframes shootingStar {
                0% { 
                    opacity: 0; 
                    transform: translate(0, 0) scale(0.5);
                }
                10% { 
                    opacity: 1; 
                    transform: translate(30px, 40px) scale(1);
                }
                30% { 
                    opacity: 0.8; 
                    transform: translate(80px, 100px) scale(0.8);
                }
                50% { 
                    opacity: 0.5; 
                    transform: translate(120px, 160px) scale(0.5);
                }
                100% { 
                    opacity: 0; 
                    transform: translate(200px, 250px) scale(0.1);
                }
            }

            @keyframes sparkleFade {
                0% { opacity: 0; transform: scale(0.5) rotate(0deg); }
                50% { opacity: 1; transform: scale(1.5) rotate(180deg); }
                100% { opacity: 0; transform: scale(0.3) rotate(360deg) translateY(-30px); }
            }

            /* Reduce animations on low-end devices */
            @media (prefers-reduced-motion: reduce) {
                #canvas-container * {
                    animation-duration: 0.01ms !important;
                    animation-iteration-count: 1 !important;
                    transition-duration: 0.01ms !important;
                }
            }

            /* Add a subtle gradient overlay for depth */
            #canvas-container::after {
                content: '';
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.3) 100%);
                pointer-events: none;
                z-index: 5;
            }
        `;

        // Check if style already exists
        const existingStyle = document.getElementById('bg-animations');
        if (existingStyle) {
            existingStyle.remove();
        }
        document.head.appendChild(style);

        console.log('✨ Pop & Star Lightweight background loaded successfully!');
        console.log('🌟 Featuring: Stars, Pop bursts, Floating particles, Shooting stars, Glowing orbs');
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

   const character = document.getElementById('character');
        const gameWorld = document.getElementById('gameWorld');
        const scrollHint = document.getElementById('scrollHint');
        let isWalking = false;
        let lastScrollPos = 0;
        let rafId = null;
        
        let touchStartX = 0;
        let touchStartTime = 0;
        let velocity = 0;
        let momentumId = null;

        const lerp = (start, end, factor) => start + (end - start) * factor;

        function updateCharacterPosition() {
            const scrollPos = window.scrollX;
            const targetLeft = Math.min(10 + scrollPos * 0.05, 20);
            character.style.left = `${lerp(parseFloat(character.style.left || 10), targetLeft, 0.1)}%`;
            rafId = requestAnimationFrame(updateCharacterPosition);
        }

        function applyMomentum() {
            if (Math.abs(velocity) > 0.5) {
                window.scrollBy(velocity, 0);
                velocity *= 0.95;
                momentumId = requestAnimationFrame(applyMomentum);
            } else {
                velocity = 0;
            }
        }

        window.addEventListener('scroll', () => {
            const scrollPos = window.scrollX;
            
            if (scrollPos > 50) {
                scrollHint.style.opacity = '0';
                setTimeout(() => {
                    scrollHint.style.display = 'none';
                }, 300);
            }

            if (scrollPos !== lastScrollPos) {
                if (!isWalking) {
                    character.classList.add('walking');
                    isWalking = true;
                }

                character.style.transform = scrollPos > lastScrollPos ? 'scaleX(1)' : 'scaleX(-1)';

                clearTimeout(window.walkTimeout);
                window.walkTimeout = setTimeout(() => {
                    character.classList.remove('walking');
                    isWalking = false;
                }, 150);
            }

            lastScrollPos = scrollPos;

            const clouds = document.querySelectorAll('.cloud');
            clouds.forEach((cloud, i) => {
                const speed = 0.3 + (i * 0.1);
                cloud.style.transform = `translateX(${scrollPos * speed}px)`;
            });

            const horses = document.querySelectorAll('.horse');
            horses.forEach((horse, i) => {
                const speed = 0.25 + (i * 0.05);
                horse.style.transform = `translateX(${scrollPos * speed}px)`;
            });
        }, { passive: true });

        updateCharacterPosition();

        window.addEventListener('unload', () => {
            if (rafId) cancelAnimationFrame(rafId);
            if (momentumId) cancelAnimationFrame(momentumId);
        });

        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
                character.classList.add('jumping');
                setTimeout(() => {
                    character.classList.remove('jumping');
                }, 600);
            }
        });

        document.addEventListener('touchstart', (e) => {
            if (!e.target.closest('.content-box, .flag, .project-block')) {
                character.classList.add('jumping');
                setTimeout(() => {
                    character.classList.remove('jumping');
                }, 600);
            } else {
                touchStartX = e.touches[0].clientX;
                touchStartTime = Date.now();
                velocity = 0;
                if (momentumId) {
                    cancelAnimationFrame(momentumId);
                }
            }
        }, { passive: true });

        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.content-box')) {
                const touch = e.touches[0];
                const deltaX = touchStartX - touch.clientX;
                const deltaTime = Date.now() - touchStartTime;
                
                velocity = deltaX / deltaTime * 16;
                
                window.scrollBy(deltaX * 0.5, 0);
                touchStartX = touch.clientX;
                touchStartTime = Date.now();
            }
        }, { passive: true });

        document.addEventListener('touchend', () => {
            if (Math.abs(velocity) > 1) {
                applyMomentum();
            }
        }, { passive: true });

        const projectBlocks = document.querySelectorAll('.project-block');
        projectBlocks.forEach(block => {
            const button = block.querySelector('.preview-button');
            button.addEventListener('click', (e) => {
                e.stopPropagation();
                console.log(`Previewing ${block.querySelector('h3').textContent}`);
            });

            block.addEventListener('click', () => {
                block.style.animation = 'none';
                setTimeout(() => {
                    block.style.animation = 'slideIn 0.3s ease-out';
                }, 10);
            });
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowRight') {
                window.scrollBy({ left: 100, behavior: 'smooth' });
            } else if (e.key === 'ArrowLeft') {
                window.scrollBy({ left: -100, behavior: 'smooth' });
            }
        });
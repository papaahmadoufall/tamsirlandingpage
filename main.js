// Effet typing infini sur quatre mots
const typingTexts = ['tamcreativ', '3D artist', 'Motion designer', 'Graphic designer'];
const typingEl = document.getElementById('typing-text');
const cursorEl = document.getElementById('typing-cursor');
let typingWordIndex = 0;
let typingIndex = 0;
let typingForward = true;

function typeLoop() {
  const currentText = typingTexts[typingWordIndex];
  if (typingForward) {
    typingIndex++;
    if (typingIndex > currentText.length) {
      typingForward = false;
      setTimeout(typeLoop, 1200);
      return;
    }
  } else {
    typingIndex--;
    if (typingIndex < 0) {
      typingForward = true;
      typingWordIndex = (typingWordIndex + 1) % typingTexts.length;
      setTimeout(typeLoop, 500);
      return;
    }
  }
  typingEl.textContent = currentText.slice(0, typingIndex);
  setTimeout(typeLoop, typingForward ? 120 : 60);
}
typeLoop();

// Curseur clignotant
setInterval(() => {
  cursorEl.style.opacity = cursorEl.style.opacity === '0' ? '1' : '0';
}, 500);

// GSAP Animations + gestion scroll/clic
window.addEventListener('DOMContentLoaded', () => {
  gsap.registerPlugin(ScrollTrigger);

  // Animation synchronisée scroll (GSAP + ScrollTrigger)
  const isMobile = window.innerWidth < 768;
  const scrubValue = isMobile ? 2 : 1;
  const yOut = isMobile ? -120 : -60;
  const scaleOut = isMobile ? 0.7 : 0.85;

  // Tamcreativ elements
  const logo = document.querySelector('#tamcreativ-wrapper .logo-intro');
  const typing = document.querySelector('#tamcreativ-wrapper .text-3xl');
  const btn = document.getElementById('explanation-btn');
  // Description wrapper
  const descSection = document.getElementById('presentation');
  const descLines = document.querySelectorAll('#presentation-lines > div');

  // Reset states
  gsap.set([logo, typing, btn], {opacity: 1, y: 0, scale: 1});
  gsap.set(descSection, {opacity: 0, pointerEvents: 'none'});
  gsap.set(descLines, {opacity: 0, y: 40});

  // ScrollTrigger timeline
  const tl = gsap.timeline({
    scrollTrigger: {
      trigger: '#main-scroll',
      start: 'top top',
      end: '+=100%',
      scrub: scrubValue,
      pin: true,
      anticipatePin: 1,
      onUpdate: self => {
        // Optionnel : pointer-events pour la description
        if (self.progress > 0.98) {
          descSection.style.pointerEvents = 'auto';
        } else {
          descSection.style.pointerEvents = 'none';
        }
      },
      onLeave: () => {
        // Effet bounce à la fin
        gsap.to(descSection, {y: -30, duration: 0.18, ease: 'power2.in'});
        gsap.to(descSection, {y: 0, duration: 0.5, ease: 'bounce.out', delay: 0.18});
      }
    }
  });

  // Tamcreativ out
  tl.to([logo, typing, btn], {
    opacity: 0,
    y: yOut,
    scale: scaleOut,
    stagger: 0.05,
    duration: 0.6,
    ease: 'power1.inOut'
  }, 0);

  // Description in
  tl.to(descSection, {
    opacity: 1,
    duration: 0.3,
    ease: 'power1.inOut'
  }, 0.2);
  tl.to(descLines, {
    opacity: 1,
    y: 0,
    stagger: 0.18,
    duration: 0.7,
    ease: 'power2.out'
  }, 0.3);

  const presentationSection = document.getElementById('presentation');
  const explanationBtn = document.getElementById('explanation-btn');
  let isPresentationVisible = false;
  let lastScrollY = window.scrollY;
  const closeBtn = document.getElementById('close-presentation');
  // Ajout de la classe fade-blur pour l'animation du fond
  if (presentationSection) {
    presentationSection.classList.add('fade-blur');
    presentationSection.style.opacity = 0;
  }

  function showPresentation() {
    if (isPresentationVisible) return;
    isPresentationVisible = true;
    presentationSection.classList.remove('hidden');
    gsap.to(presentationSection, {opacity: 1, duration: 0.2, ease: 'power2.out'});
    gsap.fromTo(
      '#presentation-lines > div',
      {opacity: 0, y: 40},
      {opacity: 1, y: 0, stagger: 0.25, duration: 1, ease: 'power2.out'}
    );
  }

  function hidePresentation() {
    if (!isPresentationVisible) return;
    isPresentationVisible = false;
    gsap.to('#presentation-lines > div', {
      opacity: 0,
      y: 40,
      stagger: 0.15,
      duration: 1,
      ease: 'power2.in',
      onComplete: () => {
        gsap.to(presentationSection, {
          opacity: 0,
          duration: 0.2, // fade-out très rapide
          ease: 'power2.in',
          onComplete: () => {
            presentationSection.classList.add('hidden');
          }
        });
      }
    });
  }

  // Clic sur le bouton explication
  if (presentationSection && explanationBtn) {
    gsap.set('#presentation-lines > div', {opacity: 0, y: 40});
    explanationBtn.addEventListener('click', showPresentation);
  }
  // Clic sur le bouton close
  if (closeBtn) {
    closeBtn.addEventListener('click', hidePresentation);
  }

  // Scroll down : show présentation, Scroll up : hide présentation
  window.addEventListener('wheel', (e) => {
    if (e.deltaY > 0) {
      // scroll down
      showPresentation();
    } else if (e.deltaY < 0) {
      // scroll up
      hidePresentation();
    }
    lastScrollY = window.scrollY;
  }, {passive: true});

  // Touch events pour mobile (swipe up/down) - version robuste
  let touchStartY = null;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
    }
  });
  document.addEventListener('touchend', (e) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    if (touchStartY - touchEndY > 20) {
      // swipe up (ouvrir la description)
      console.log('Swipe up detected');
      showPresentation();
    } else if (touchEndY - touchStartY > 20) {
      // swipe down (fermer la description)
      console.log('Swipe down detected');
      hidePresentation();
    }
    touchStartY = null;
  });

  // Fermer la description en cliquant en dehors du texte ou du bouton close
  if (presentationSection) {
    presentationSection.addEventListener('mousedown', (e) => {
      const lines = document.getElementById('presentation-lines');
      const closeBtn = document.getElementById('close-presentation');
      if (!lines.contains(e.target) && (!closeBtn || !closeBtn.contains(e.target))) {
        hidePresentation();
      }
    });
  }

  const introSection = document.getElementById('intro');
  if (introSection) {
    introSection.addEventListener('mousedown', (e) => {
      // Ne pas ouvrir si la description est déjà visible
      if (isPresentationVisible) return;
      // Ne pas ouvrir si on clique sur le bouton explanation (pour éviter double animation)
      const explanationBtn = document.getElementById('explanation-btn');
      if (explanationBtn && explanationBtn.contains(e.target)) return;
      showPresentation();
    });
  }

  // Effet élastique sur overscroll haut (fin du scroll)
  let elasticActive = false;
  let elasticTimeout = null;
  const scrollTrigger = tl.scrollTrigger;
  const elasticWrapper = document.getElementById('desc-elastic-wrapper');

  function triggerElastic(stretch = 1.3, duration = 0.12) {
    if (elasticActive) return;
    elasticActive = true;
    gsap.to(elasticWrapper, {scaleY: stretch, y: -30, duration, transformOrigin: '50% 0%', ease: 'power1.out'});
    if (elasticTimeout) clearTimeout(elasticTimeout);
    elasticTimeout = setTimeout(() => {
      gsap.to(elasticWrapper, {scaleY: 1, y: 0, duration: 0.9, ease: 'elastic.out(1,0.4)', clearProps: 'scaleY,y'});
      elasticActive = false;
    }, 180);
  }

  // Wheel (desktop)
  window.addEventListener('wheel', (e) => {
    if (scrollTrigger && scrollTrigger.progress >= 1 && e.deltaY < 0) {
      triggerElastic();
    }
  }, {passive: true});

  // Touch (mobile)
  let lastTouchY = null;
  document.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) lastTouchY = e.touches[0].clientY;
  });
  document.addEventListener('touchmove', (e) => {
    if (lastTouchY !== null && scrollTrigger && scrollTrigger.progress >= 1) {
      const currentY = e.touches[0].clientY;
      if (lastTouchY - currentY > 10) { // swipe up
        triggerElastic(1.15, 0.13);
      }
    }
  }, {passive: true});
  document.addEventListener('touchend', () => { lastTouchY = null; });
});

// Curseur custom sur le bouton (inutile ici, mais conservé si besoin d'autres interactions)
// const followBtn = document.getElementById('follow-btn');
// if (followBtn) {
//   followBtn.addEventListener('mouseenter', () => {
//     followBtn.style.cursor = 'pointer';
//   });
//   followBtn.addEventListener('mouseleave', () => {
//     followBtn.style.cursor = '';
//   });
//   // (Optionnel) Son discret au clic
//   // followBtn.addEventListener('click', () => {
//   //   const audio = new Audio('click.mp3');
//   //   audio.volume = 0.08;
//   //   audio.play();
//   // });
// } 
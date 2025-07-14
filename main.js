// Effet typing infini sur deux mots
const typingTexts = ['tamcreativ', 'coming soon...'];
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
          duration: 0.2, // fade-out encore plus rapide
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

  // Parallax drag-to-reveal sur mobile
  let dragStartY = null;
  let dragging = false;
  let dragDirection = null; // 'up' ou 'down'
  let dragThreshold = window.innerHeight * 0.4;
  let dragActive = false;

  function setPresentationY(y) {
    gsap.set(presentationSection, {y: y});
    const lines = document.getElementById('presentation-lines');
    if (lines) gsap.set(lines, {y: y});
  }

  function animatePresentationTo(y, cb) {
    gsap.to(presentationSection, {y: y, duration: 0.3, ease: 'power2.out', onComplete: cb});
    const lines = document.getElementById('presentation-lines');
    if (lines) gsap.to(lines, {y: y, duration: 0.3, ease: 'power2.out'});
  }

  function enableParallaxReveal() {
    document.addEventListener('touchstart', (e) => {
      if (e.touches.length !== 1) return;
      // Désactiver le drag si on touche un bouton (explanation ou close)
      const explanationBtn = document.getElementById('explanation-btn');
      const closeBtn = document.getElementById('close-presentation');
      if ((explanationBtn && explanationBtn.contains(e.target)) || (closeBtn && closeBtn.contains(e.target))) {
        return;
      }
      // Si la description est cachée, drag up pour ouvrir
      if (!isPresentationVisible) {
        dragStartY = e.touches[0].clientY;
        dragging = true;
        dragDirection = 'up';
        setPresentationY(window.innerHeight);
        presentationSection.classList.remove('hidden');
        presentationSection.style.opacity = 1;
        dragActive = true;
        e.preventDefault();
      } else {
        // Si la description est visible, drag down pour fermer
        dragStartY = e.touches[0].clientY;
        dragging = true;
        dragDirection = 'down';
        setPresentationY(0);
        dragActive = true;
        e.preventDefault();
      }
    }, {passive: false});

    document.addEventListener('touchmove', (e) => {
      if (!dragging || e.touches.length !== 1) return;
      const currentY = e.touches[0].clientY;
      let deltaY = currentY - dragStartY;
      if (dragDirection === 'up' && deltaY < 0) {
        // Drag up pour reveal
        setPresentationY(Math.max(window.innerHeight + deltaY, 0));
      } else if (dragDirection === 'down' && deltaY > 0) {
        // Drag down pour hide
        setPresentationY(Math.min(deltaY, window.innerHeight));
      }
      e.preventDefault();
    }, {passive: false});

    document.addEventListener('touchend', (e) => {
      if (!dragging) return;
      const endY = e.changedTouches[0].clientY;
      let deltaY = endY - dragStartY;
      if (dragDirection === 'up') {
        if (Math.abs(deltaY) > dragThreshold) {
          // Ouvre complètement
          animatePresentationTo(0, () => {
            isPresentationVisible = true;
            const lines = document.getElementById('presentation-lines');
            if (lines) gsap.set(lines, {y: 0});
            gsap.fromTo(
              '#presentation-lines > div',
              {opacity: 0, y: 40},
              {opacity: 1, y: 0, stagger: 0.25, duration: 1, ease: 'power2.out'}
            );
          });
        } else {
          // Annule
          animatePresentationTo(window.innerHeight, () => {
            presentationSection.classList.add('hidden');
            presentationSection.style.opacity = 0;
            const lines = document.getElementById('presentation-lines');
            if (lines) gsap.set(lines, {y: 0});
          });
        }
      } else if (dragDirection === 'down') {
        if (deltaY > dragThreshold) {
          // Ferme complètement
          gsap.to('#presentation-lines > div', {
            opacity: 0,
            y: 40,
            stagger: 0.15,
            duration: 1,
            ease: 'power2.in',
            onComplete: () => {
              animatePresentationTo(window.innerHeight, () => {
                presentationSection.classList.add('hidden');
                presentationSection.style.opacity = 0;
                isPresentationVisible = false;
                const lines = document.getElementById('presentation-lines');
                if (lines) gsap.set(lines, {y: 0});
              });
            }
          });
        } else {
          // Annule
          animatePresentationTo(0, () => {
            const lines = document.getElementById('presentation-lines');
            if (lines) gsap.set(lines, {y: 0});
          });
        }
      }
      dragging = false;
      dragActive = false;
      dragStartY = null;
      dragDirection = null;
    }, {passive: false});
  }

  // Active le parallax drag sur mobile uniquement
  if (window.matchMedia('(pointer: coarse)').matches) {
    enableParallaxReveal();
  }
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
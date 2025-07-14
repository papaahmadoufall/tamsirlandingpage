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
    gsap.to(presentationSection, {opacity: 1, duration: 0.5, ease: 'power2.out'});
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
          duration: 0.1, // fade-out plus rapide
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

  // Touch events pour mobile (swipe up/down)
  let touchStartY = null;
  window.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartY = e.touches[0].clientY;
    }
  });
  window.addEventListener('touchend', (e) => {
    if (touchStartY === null) return;
    const touchEndY = e.changedTouches[0].clientY;
    if (touchStartY - touchEndY > 40) {
      // swipe up (ouvrir la description)
      showPresentation();
    } else if (touchEndY - touchStartY > 40) {
      // swipe down (fermer la description)
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
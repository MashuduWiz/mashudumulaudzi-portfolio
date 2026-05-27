const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");

  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute(
    "class",
    isOpen ? "ri-close-line" : "ri-menu-3-line"
  );
});

navLinks.addEventListener("click", (e) => {
  navLinks.classList.remove("open");
  menuBtnIcon.setAttribute("class", "ri-menu-3-line");
});

// Projects filter
const projectFilterBtns = document.querySelectorAll(".project__filter-btn");
const projectCards = document.querySelectorAll(".project__card[data-cat]");
const projectsEmpty = document.getElementById("projects-empty");

if (projectFilterBtns.length && projectCards.length) {
  projectFilterBtns.forEach((btn) => {
    btn.addEventListener("click", () => {
      projectFilterBtns.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");

      const filter = btn.dataset.filter;
      let visible = 0;

      projectCards.forEach((card) => {
        const show = filter === "all" || card.dataset.cat === filter;
        card.style.display = show ? "" : "none";
        if (show) visible++;
      });

      if (projectsEmpty) {
        projectsEmpty.style.display = visible === 0 ? "block" : "none";
      }
    });
  });
}

// Project card slideshows
document.querySelectorAll(".project__slideshow").forEach((slideshow) => {
  const slides = slideshow.querySelectorAll(".project__slide");
  const prevBtn = slideshow.querySelector(".project__slideshow-btn--prev");
  const nextBtn = slideshow.querySelector(".project__slideshow-btn--next");
  const dotsContainer = slideshow.querySelector(".project__slideshow-dots");
  const autoplayMs = Number(slideshow.dataset.autoplay) || 0;
  let current = 0;
  let timer = null;

  if (slides.length < 2) return;

  let dots = [];

  const goTo = (index) => {
    slides[current].classList.remove("is-active");
    dots[current].classList.remove("is-active");
    current = (index + slides.length) % slides.length;
    slides[current].classList.add("is-active");
    dots[current].classList.add("is-active");
  };

  const next = () => goTo(current + 1);
  const prev = () => goTo(current - 1);

  const startAutoplay = () => {
    if (!autoplayMs) return;
    stopAutoplay();
    timer = setInterval(next, autoplayMs);
  };

  const stopAutoplay = () => {
    if (timer) clearInterval(timer);
    timer = null;
  };

  const resetAutoplay = () => {
    stopAutoplay();
    startAutoplay();
  };

  slides.forEach((_, index) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.className = `project__slideshow-dot${index === 0 ? " is-active" : ""}`;
    dot.setAttribute("aria-label", `Go to screenshot ${index + 1}`);
    dot.addEventListener("click", (e) => {
      e.stopPropagation();
      goTo(index);
      resetAutoplay();
    });
    dotsContainer.appendChild(dot);
  });

  dots = [...dotsContainer.querySelectorAll(".project__slideshow-dot")];

  prevBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    prev();
    resetAutoplay();
  });

  nextBtn.addEventListener("click", (e) => {
    e.stopPropagation();
    next();
    resetAutoplay();
  });

  slideshow.addEventListener("mouseenter", stopAutoplay);
  slideshow.addEventListener("mouseleave", startAutoplay);

  startAutoplay();
});

// Project image lightbox
const projectLightbox = document.getElementById("project-lightbox");
const lightboxImg = projectLightbox?.querySelector(".project__lightbox-img");
const lightboxCaption = projectLightbox?.querySelector(".project__lightbox-caption");
const lightboxCounter = document.getElementById("lightbox-counter");
const lightboxPrev = document.getElementById("lightbox-prev");
const lightboxNext = document.getElementById("lightbox-next");

if (projectLightbox && lightboxImg) {
  let gallery = [];
  let galleryIndex = 0;

  const renderLightbox = () => {
    const item = gallery[galleryIndex];
    lightboxImg.src = item.src;
    lightboxImg.alt = item.alt;
    lightboxCaption.textContent = item.alt;

    const hasMultiple = gallery.length > 1;
    lightboxPrev.hidden = !hasMultiple;
    lightboxNext.hidden = !hasMultiple;
    lightboxCounter.hidden = !hasMultiple;
    if (hasMultiple) {
      lightboxCounter.textContent = `${galleryIndex + 1} / ${gallery.length}`;
    }
  };

  const openLightbox = (images, startIndex = 0) => {
    gallery = images.filter((img) => img.src);
    if (!gallery.length) return;
    galleryIndex = Math.min(Math.max(startIndex, 0), gallery.length - 1);
    renderLightbox();

    projectLightbox.hidden = false;
    projectLightbox.setAttribute("aria-hidden", "false");
    projectLightbox.classList.add("is-open");
    document.body.classList.add("lightbox-open");
  };

  const closeLightbox = () => {
    projectLightbox.classList.remove("is-open");
    projectLightbox.hidden = true;
    projectLightbox.setAttribute("aria-hidden", "true");
    document.body.classList.remove("lightbox-open");
    lightboxImg.removeAttribute("src");
  };

  const showPrev = () => {
    galleryIndex = (galleryIndex - 1 + gallery.length) % gallery.length;
    renderLightbox();
  };

  const showNext = () => {
    galleryIndex = (galleryIndex + 1) % gallery.length;
    renderLightbox();
  };

  document.querySelectorAll(".project__card-media").forEach((media) => {
    const imgs = [...media.querySelectorAll("img")].filter(
      (img) => img.src && getComputedStyle(img).display !== "none"
    );
    if (!imgs.length) return;

    media.classList.add("project__card-media--zoomable");

    if (!media.querySelector(".project__zoom-hint")) {
      const hint = document.createElement("span");
      hint.className = "project__zoom-hint";
      hint.innerHTML = '<i class="ri-zoom-in-line"></i> Click to enlarge';
      media.appendChild(hint);
    }

    media.addEventListener("click", (e) => {
      if (e.target.closest(".project__slideshow-btn, .project__slideshow-dot")) {
        return;
      }

      let startIndex = 0;
      const clickedImg = e.target.closest("img");
      const activeImg =
        media.querySelector(".project__slide.is-active img") || imgs[0];

      if (clickedImg) {
        startIndex = imgs.indexOf(clickedImg);
      } else {
        startIndex = imgs.indexOf(activeImg);
      }

      openLightbox(imgs, Math.max(0, startIndex));
    });
  });

  projectLightbox.querySelectorAll("[data-lightbox-close]").forEach((el) => {
    el.addEventListener("click", closeLightbox);
  });

  lightboxPrev?.addEventListener("click", (e) => {
    e.stopPropagation();
    showPrev();
  });

  lightboxNext?.addEventListener("click", (e) => {
    e.stopPropagation();
    showNext();
  });

  document.addEventListener("keydown", (e) => {
    if (!projectLightbox.classList.contains("is-open")) return;

    if (e.key === "Escape") closeLightbox();
    if (e.key === "ArrowLeft" && !lightboxPrev.hidden) showPrev();
    if (e.key === "ArrowRight" && !lightboxNext.hidden) showNext();
  });
}

const swiper = new Swiper(".swiper", {
  loop: true,
  pagination: {
    el: ".swiper-pagination",
  },
});
66660

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

// header container
ScrollReveal().reveal(".header__image img", {
  ...scrollRevealOption,
});

ScrollReveal().reveal(".header__content h4", {
  ...scrollRevealOption,
  delay: 500,
});

ScrollReveal().reveal(".header__content h1", {
  ...scrollRevealOption,
  delay: 1000,
});

ScrollReveal().reveal(".header__content p", {
  ...scrollRevealOption,
  delay: 1500,
});

ScrollReveal().reveal(".header__content .btn", {
  ...scrollRevealOption,
  delay: 2000,
});

// about container
ScrollReveal().reveal(".about__image img", {
  ...scrollRevealOption,
  origin: "left",
});

ScrollReveal().reveal(".about__content .section__header", {
  ...scrollRevealOption,
  delay: 500,
});

ScrollReveal().reveal(".about__content p", {
  ...scrollRevealOption,
  delay: 1000,
});

ScrollReveal().reveal(".about__content h4", {
  ...scrollRevealOption,
  delay: 1500,
});

ScrollReveal().reveal(".about__btns", {
  ...scrollRevealOption,
  delay: 2000,
});

// skills container
ScrollReveal().reveal(".skills__card", {
  duration: 1000,
  interval: 500,
});

// blog container
ScrollReveal().reveal(".blog__card", {
  ...scrollRevealOption,
  interval: 500,
});

// contact container
ScrollReveal().reveal(".contact__container .section__subheader", {
  ...scrollRevealOption,
  delay: 200,
});
ScrollReveal().reveal(".contact__container .section__header", {
  ...scrollRevealOption,
  delay: 400,
});
ScrollReveal().reveal(".contact__intro", {
  ...scrollRevealOption,
  delay: 600,
});
ScrollReveal().reveal(".contact__form-wrapper", {
  ...scrollRevealOption,
  delay: 400,
  duration: 800,
});
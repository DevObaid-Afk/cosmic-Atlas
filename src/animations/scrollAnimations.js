import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);
gsap.defaults({ ease: "expo.out" });

export function initScrollAnimations() {
  window.__spaceProgress = {
    total: 0,
    blackHole: 0,
    cameraDepth: 0,
    parallax: 0,
  };

  const ctx = gsap.context(() => {
    gsap.to(window.__spaceProgress, {
      total: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 1,
      },
    });

    gsap.to(window.__spaceProgress, {
      cameraDepth: 1,
      parallax: 1,
      ease: "none",
      scrollTrigger: {
        trigger: document.body,
        start: "top top",
        end: "bottom bottom",
        scrub: 2.4,
      },
    });

    gsap.to(window.__spaceProgress, {
      blackHole: 1,
      ease: "power1.inOut",
      scrollTrigger: {
        trigger: '[data-scene="blackhole"]',
        start: "top 78%",
        end: "bottom bottom",
        scrub: 1.35,
      },
    });

    gsap.utils.toArray(".reveal").filter((el) => !el.closest(".reveal-group")).forEach((el) => {
      gsap.fromTo(
        el,
        {
          autoAlpha: 0,
          y: 44,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.25,
          ease: "expo.out",
          scrollTrigger: {
            trigger: el,
            start: "top 86%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    gsap.utils.toArray(".reveal-group").forEach((group) => {
      gsap.fromTo(
        group.querySelectorAll(".info-card"),
        {
          autoAlpha: 0,
          y: 36,
        },
        {
          autoAlpha: 1,
          y: 0,
          duration: 1.05,
          stagger: 0.1,
          ease: "expo.out",
          scrollTrigger: {
            trigger: group,
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    gsap.to(".space-canvas", {
      opacity: 0.9,
      scale: 1.04,
      scrollTrigger: {
        trigger: '[data-scene="blackhole"]',
        start: "top center",
        end: "bottom bottom",
        scrub: true,
      },
    });

    gsap.utils.toArray(".info-card").forEach((card, index) => {
      gsap.to(card, {
        y: index % 2 ? -12 : 12,
        scrollTrigger: {
          trigger: card,
          start: "top bottom",
          end: "bottom top",
          scrub: 1.4,
        },
      });
    });
  });

  ScrollTrigger.refresh();
  return () => ctx.revert();
}

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export function initScrollAnimations() {
  window.__spaceProgress = { total: 0, blackHole: 0 };

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
          filter: "blur(14px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 1.15,
          ease: "power3.out",
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
          filter: "blur(12px)",
        },
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.95,
          stagger: 0.12,
          ease: "power3.out",
          scrollTrigger: {
            trigger: group,
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
        },
      );
    });

    gsap.to(".space-canvas", {
      opacity: 0.88,
      scale: 1.45,
      filter: "blur(2px)",
      scrollTrigger: {
        trigger: '[data-scene="blackhole"]',
        start: "top center",
        end: "bottom bottom",
        scrub: true,
      },
    });

    // const starWarp = document.querySelector(".star-warp");

    // if (starWarp) {
    //   gsap.to(starWarp, {
    //     opacity: 1,
    //     duration: 2,
    //   });
    // }

    gsap.utils.toArray(".info-card").forEach((card, index) => {
      gsap.to(card, {
        y: index % 2 ? -18 : 18,
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

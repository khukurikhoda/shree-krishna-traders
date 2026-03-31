// Animate the header logo and title
gsap.fromTo(".logo", {opacity: 0, scale: 0}, {opacity: 1, scale: 1, duration: 1, delay: 0.5, ease: "bounce.out"});
gsap.fromTo("h1", {opacity: 0, y: -50}, {opacity: 1, y: 0, duration: 1, delay: 1, ease: "power4.out"});

// Animate social buttons sliding in from the left, one by one, starting hidden
gsap.to(".youtube", {x: 0, opacity: 1, duration: 1, delay: 1.5, ease: "power4.out"});
gsap.to(".facebook", {x: 0, opacity: 1, duration: 1, delay: 2, ease: "power4.out"});
gsap.to(".instagram", {x: 0, opacity: 1, duration: 1, delay: 2.5, ease: "power4.out"});
gsap.to(".tiktok", {x: 0, opacity: 1, duration: 1, delay: 3, ease: "power4.out"});
gsap.to(".whatsapp", {x: 0, opacity: 1, duration: 1, delay: 3.5, ease: "power4.out"});
gsap.to(".website", {x: 0, opacity: 1, duration: 1, delay: 4, ease: "power4.out"});

// Fade in the footer
gsap.fromTo("footer", {opacity: 0}, {opacity: 1, duration: 1, delay: 4.5});

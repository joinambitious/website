
// FAQ
document.addEventListener("DOMContentLoaded", function () {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const answer = item.querySelector(".faq-answer");

        item.addEventListener("click", function () {
            const isOpen = item.classList.contains("active");

            // Close all other items (optional, if you want accordion behavior)
            faqItems.forEach(i => {
                if (i !== item) {
                    i.classList.remove("active");
                    i.querySelector(".faq-answer").style.maxHeight = null;
                }
            });

            if (!isOpen) {
                item.classList.add("active");
                answer.style.maxHeight = answer.scrollHeight + "px"; // Expands smoothly
            } else {
                item.classList.remove("active");
                answer.style.maxHeight = null; // Collapses smoothly
            }
        });
    });
});


// Testimonials Carousel
document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector(".carousel");
    const prevBtn = document.querySelector(".carousel-btn.left");
    const nextBtn = document.querySelector(".carousel-btn.right");

    let currentIndex = 0;
    const items = document.querySelectorAll(".carousel .testimonial");
    const totalItems = items.length;

    function getMaxVisible() {
        return window.innerWidth <= 768 ? 1 : 3; // 1 video per row on mobile, 3 on larger screens
    }

    function getScrollAmount() {
        return items[0].offsetWidth + parseFloat(getComputedStyle(carousel).gap || 0); 
    }

    function updateCarousel() {
        const maxVisible = getMaxVisible();
        const maxIndex = totalItems - maxVisible;
        currentIndex = Math.min(currentIndex, maxIndex); // Prevent overscrolling

        const scrollAmount = getScrollAmount();
        const translateX = -(currentIndex * scrollAmount) + "px";

        carousel.style.transform = `translateX(${translateX})`;
    }

    nextBtn.addEventListener("click", () => {
        const maxVisible = getMaxVisible();
        const maxIndex = totalItems - maxVisible;
        if (currentIndex < maxIndex) {
            currentIndex++;
            updateCarousel();
        }
    });

    prevBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateCarousel();
        }
    });

    window.addEventListener("resize", updateCarousel);
    updateCarousel();
});
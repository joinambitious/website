document.addEventListener("DOMContentLoaded", function () {
    const carousel = document.querySelector(".carousel");
    const prevBtn = document.querySelector(".carousel-btn.left");
    const nextBtn = document.querySelector(".carousel-btn.right");

    let currentIndex = 0;
    const items = document.querySelectorAll(".carousel .testimonial");
    const totalItems = items.length;
    const maxVisible = 3;

    function updateCarousel() {
        const translateX = -(currentIndex * (100 / maxVisible));
        carousel.style.transform = `translateX(${translateX}%)`;
    }

    nextBtn.addEventListener("click", () => {
        if (currentIndex < totalItems - maxVisible) {
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

    updateCarousel(); // Initialize positioning
});
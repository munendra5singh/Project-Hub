document.addEventListener("DOMContentLoaded", () => {
  // Mobile Bottom Navigation Active Switch
  const bottomNavItems = document.querySelectorAll(".bottom-nav-item");

  bottomNavItems.forEach((item) => {
    item.addEventListener("click", function () {
      bottomNavItems.forEach((btn) => btn.classList.remove("active"));
      this.classList.add("active");
    });
  });

  // Highlight bottom bar items on scroll
  const sections = document.querySelectorAll("section");
  window.addEventListener("scroll", () => {
    let current = "";
    sections.forEach((section) => {
      const sectionTop = section.offsetTop;
      const sectionHeight = section.clientHeight;
      if (pageYOffset >= sectionTop - 150) {
        current = section.getAttribute("id");
      }
    });

    bottomNavItems.forEach((item) => {
      item.classList.remove("active");
      if (item.getAttribute("href") === `#${current}`) {
        item.classList.add("active");
      }
    });
  });

  // Enquiry Form Handling
  const enquiryForm = document.getElementById("enquiryForm");
  if (enquiryForm) {
    enquiryForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("name").value;
      alert(`Thank you, ${name}! Your enquiry has been received. We will contact you soon.`);
      enquiryForm.reset();
    });
  }
});
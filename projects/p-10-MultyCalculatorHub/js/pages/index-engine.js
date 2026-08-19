/* index-engine.js — extracted verbatim from original inline <script>; logic/behavior unchanged, only relocated */
function updateClock() {
      const now = new Date();
      let hours = now.getHours();
      const minutes = String(now.getMinutes()).padStart(2, '0');
      const seconds = String(now.getSeconds()).padStart(2, '0');
      const ampm = hours >= 12 ? 'PM' : 'AM';
      hours = hours % 12;
      hours = hours ? hours : 12; 
      const timeString = `${String(hours).padStart(2, '0')}:${minutes}:${seconds} ${ampm}`;
      
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      const dateString = now.toLocaleDateString('en-US', options);

      document.getElementById('liveClock').textContent = timeString;
      document.getElementById('liveDate').textContent = dateString;
    }

    setInterval(updateClock, 1000);

    document.addEventListener("DOMContentLoaded", () => {
      updateClock(); 
      const isDarkMode = localStorage.getItem("globalDarkMode") === "enabled";
      const checkbox = document.getElementById("darkModeCheckbox");
      const iconNode = document.getElementById("btnThemeToggleNode").querySelector('i');

      if (isDarkMode) {
        document.body.classList.add("dark-mode");
        checkbox.checked = true;
        iconNode.className = "fa-solid fa-sun";
      } else {
        iconNode.className = "fa-solid fa-moon";
      }

      // Live Real-time Search Engine Logic
      const searchInput = document.getElementById('dashboardSearchInput');
      const toolSections = document.querySelectorAll('.tool-section');
      const noResults = document.getElementById('noResults');
      const counterBadge = document.getElementById('activeModulesBadge');

      searchInput.addEventListener('input', function() {
        const query = this.value.toLowerCase().trim();
        let globalVisibleCount = 0;

        toolSections.forEach(section => {
          const cards = section.querySelectorAll('.button');
          let sectionVisibleCount = 0;

          cards.forEach(card => {
            const title = card.querySelector('.card-title-node').textContent.toLowerCase();
            const desc = card.querySelector('.card-desc-node').textContent.toLowerCase();

            // Match query in either Title or Key Descriptions
            if (title.includes(query) || desc.includes(query)) {
              card.style.display = 'flex';
              sectionVisibleCount++;
              globalVisibleCount++;
            } else {
              card.style.display = 'none';
            }
          });

          // Show or hide section container according to internal matching card count
          if (sectionVisibleCount > 0) {
            section.style.display = 'block';
          } else {
            section.style.display = 'none';
          }
        });

        // Trigger 'No Results' notice standard
        if (globalVisibleCount === 0) {
          noResults.style.display = 'block';
        } else {
          noResults.style.display = 'none';
        }

        // Dynamically update modules count badge
        counterBadge.innerHTML = `<i class="fa-solid fa-layer-group"></i> ${globalVisibleCount} Active Modules`;
      });
    });

    function toggleGlobalDashboardTheme() {
      const checkbox = document.getElementById("darkModeCheckbox");
      const iconNode = document.getElementById("btnThemeToggleNode").querySelector('i');

      if (!document.body.classList.contains("dark-mode")) {
        document.body.classList.add("dark-mode");
        checkbox.checked = true;
        localStorage.setItem("globalDarkMode", "enabled");
        iconNode.className = "fa-solid fa-sun";
      } else {
        document.body.classList.remove("dark-mode");
        checkbox.checked = false;
        localStorage.setItem("globalDarkMode", "disabled");
        iconNode.className = "fa-solid fa-moon";
      }
    }

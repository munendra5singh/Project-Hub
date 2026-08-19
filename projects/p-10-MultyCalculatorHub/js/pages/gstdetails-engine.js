/* gstdetails-engine.js — extracted verbatim from gstdetails.html's original inline <script>; logic/behavior unchanged, only relocated */
function filterSlabs() {
      const input = document.getElementById('searchBar').value.toLowerCase();
      const cards = document.getElementsByClassName('slab-card');

      for (let i = 0; i < cards.length; i++) {
        const searchContent = cards[i].getAttribute('data-search').toLowerCase();
        if (searchContent.includes(input)) {
          cards[i].style.display = "grid";
        } else {
          cards[i].style.display = "none";
        }
      }
    }

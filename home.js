/* -----------------------------
   🟢 WHATSAPP BOOKING (from property cards)
----------------------------- */
const bookButtons = document.querySelectorAll(".book-btn");
const whatsappNumber = "971504238543";

bookButtons.forEach(button => {
  button.addEventListener("click", () => {
    const title = button.dataset.title;
    const price = button.dataset.price;
    const desc = button.dataset.desc;

    const confirmBooking = confirm(
      `Do you want to send an inquiry about:\n\n🏠 ${title}\n💰 ${price}\n📋 ${desc}\n\nClick OK to continue to WhatsApp.`
    );

    if (confirmBooking) {
      const message = `Hello! I'm interested in:\n🏠 *${title}*\n💰 Price: ${price}\n📋 Details: ${desc}\nCan you tell me more about it?`;
      const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
      window.open(url, "_blank");
    }
  });
});

/* -----------------------------
   🟡 VIEW MODAL + DETAILS + WHATSAPP INQUIRY + DEEP LINK
----------------------------- */
const modal = document.getElementById("galleryModal");
const gallery = document.getElementById("gallery");
const modalTitle = document.getElementById("modalTitle");
const modalDesc = document.getElementById("modalDesc");
const modalAddress = document.getElementById("modalAddress");
const modalSize = document.getElementById("modalSize");
const modalMap = document.getElementById("modalMap");
const extraDetails = document.getElementById("extraDetails");
const closeBtn = document.querySelector(".close-btn");

// ✅ open modal helper
function openPropertyFromButton(btn) {
  const id = btn.dataset.id;
  const images = (btn.dataset.images || "").split(",").filter(Boolean);
  const video = btn.dataset.video;
  const title = btn.dataset.title || "";
  const desc = btn.dataset.desc || "";
  const size = btn.dataset.size || "";
  const address = btn.dataset.address || "";
  const map = btn.dataset.map || "#";
  const detailsHTML = btn.dataset.details || "";
  const price = btn.dataset.price || "";

  modalTitle.textContent = title;
  modalDesc.textContent = desc;
  modalSize.textContent = size;
  modalAddress.textContent = address;
  modalMap.href = map;
  extraDetails.innerHTML = detailsHTML;

  // 🖼️ Gallery
  gallery.innerHTML = "";
  images.forEach(img => {
    const imageEl = document.createElement("img");
    imageEl.src = img.trim();
    imageEl.classList.add("zoomable");
    gallery.appendChild(imageEl);
  });
  if (video) {
    const videoEl = document.createElement("video");
    videoEl.src = video;
    videoEl.controls = true;
    gallery.appendChild(videoEl);
  }

  // 🌟 Add Share / Save Buttons
  addShareButtons(title, desc, id);

  // 🌟 Add WhatsApp Inquiry Button inside modal
  const oldBtn = document.querySelector(".modal-whatsapp");
  if (oldBtn) oldBtn.remove();

  const whatsappBtn = document.createElement("a");
  whatsappBtn.href = "#";
  whatsappBtn.className = "modal-whatsapp";
  whatsappBtn.innerHTML = `<i class="fab fa-whatsapp"></i> Inquire on WhatsApp`;

  whatsappBtn.addEventListener("click", e => {
    e.preventDefault();
    const message = `Hello! I’d like to inquire about:\n🏠 *${title}*\n💰 ${price || "Price not listed"}\n📋 ${desc}\n📍 Location: ${address}\nCan you tell me more about this property?`;
    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
  });

  // Append WhatsApp button after property details
  extraDetails.appendChild(whatsappBtn);

  // Show modal
  modal.style.display = "flex";
  document.body.style.overflow = "hidden";

  // Update URL hash for shareable link
  history.replaceState(null, null, `#${id}`);
}

document.querySelectorAll(".view-btn").forEach(btn => {
  btn.addEventListener("click", () => openPropertyFromButton(btn));
});

closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", e => { if (e.target === modal) closeModal(); });

function closeModal() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
  history.replaceState(null, null, " ");
}

/* -----------------------------
   🔗 SHARE / SAVE BAR
----------------------------- */
function addShareButtons(title, desc, id) {
  const oldBar = document.querySelector(".share-bar");
  if (oldBar) oldBar.remove();

  const bar = document.createElement("div");
  bar.classList.add("share-bar");
  bar.innerHTML = `
    <button class="save-btn">💾 Save</button>
    <button class="share-btn">🔗 Share</button>
  `;
  modal.querySelector(".modal-content").insertBefore(bar, modalDesc);

  const saveBtn = bar.querySelector(".save-btn");
  const shareBtn = bar.querySelector(".share-btn");

  const shareUrl = `${window.location.origin}${window.location.pathname}#${id}`;
  let savedList = JSON.parse(localStorage.getItem("savedProperties")) || [];
  const alreadySaved = savedList.find(p => p.id === id);

  if (alreadySaved) {
    saveBtn.textContent = "💛 Saved";
    saveBtn.style.background = "gold";
    saveBtn.style.color = "#000";
  }

  saveBtn.addEventListener("click", () => {
    savedList = JSON.parse(localStorage.getItem("savedProperties")) || [];
    const property = {
      id,
      title,
      desc,
      image: gallery.querySelector("img")?.src || ""
    };

    const existingIndex = savedList.findIndex(p => p.id === id);
    if (existingIndex === -1) {
      savedList.push(property);
      localStorage.setItem("savedProperties", JSON.stringify(savedList));
      alert("✅ Property saved to favorites!");
      saveBtn.textContent = "💛 Saved";
      saveBtn.style.background = "gold";
      saveBtn.style.color = "#000";
    } else {
      savedList.splice(existingIndex, 1);
      localStorage.setItem("savedProperties", JSON.stringify(savedList));
      alert("❌ Removed from favorites.");
      saveBtn.textContent = "💾 Save";
      saveBtn.style.background = "";
      saveBtn.style.color = "";
    }
    updateSavedCounter();
  });

  shareBtn.addEventListener("click", async () => {
    try {
      await navigator.share({
        title: "Prairies Hills Real Estate",
        text: `Check out this property: ${title}`,
        url: shareUrl,
      });
    } catch {
      navigator.clipboard.writeText(shareUrl);
      alert("🔗 Property link copied to clipboard!");
    }
  });
}

/* -----------------------------
   🌐 AUTO OPEN PROPERTY BY HASH LINK
----------------------------- */
window.addEventListener("load", () => {
  const hash = window.location.hash.replace("#", "");
  if (!hash) return;

  const card = document.getElementById(hash);
  if (!card) return;

  const type = card.getAttribute("data-type");
  const filterBtn = document.querySelector(`.filter-btn[data-type="${type}"]`);
  if (filterBtn) filterBtn.click();

  const viewBtn = card.querySelector(".view-btn");
  if (viewBtn) {
    card.scrollIntoView({ behavior: "smooth", block: "center" });
    setTimeout(() => openPropertyFromButton(viewBtn), 600);
  }
});

/* -----------------------------
   ❤️ FAVORITES SYSTEM + DIRECT VIEW
----------------------------- */
function updateSavedCounter() {
  const savedList = JSON.parse(localStorage.getItem("savedProperties")) || [];
  const counter = document.getElementById("saved-counter");
  if (counter) counter.textContent = savedList.length;
}

const savedBtn = document.createElement("div");
savedBtn.className = "saved-floating";
savedBtn.innerHTML = `❤️ <span id="saved-counter">0</span>`;
document.body.appendChild(savedBtn);
updateSavedCounter();
savedBtn.addEventListener("click", openSavedModal);

function openSavedModal() {
  const saved = JSON.parse(localStorage.getItem("savedProperties")) || [];
  const savedModal = document.createElement("div");
  savedModal.classList.add("modal");
  savedModal.style.display = "flex";

  const content = document.createElement("div");
  content.classList.add("modal-content");

  if (saved.length === 0) {
    content.innerHTML = `
      <span class="close-btn">&times;</span>
      <div style="text-align:center;padding:40px 20px;">
        <i class="fa-solid fa-heart-circle-xmark" style="font-size:4rem;color:gold;margin-bottom:15px;"></i>
        <h3 style="color:gold;">No favorite properties yet</h3>
        <p style="color:#ccc;">Start exploring listings and tap 💾 Save to add your favorites here.</p>
      </div>
    `;
  } else {
    content.innerHTML = `
      <span class="close-btn">&times;</span>
      <h3>❤️ Saved Properties</h3>
      <div class="saved-list">
        ${saved.map((p, i) => `
          <div class="saved-item">
            <img src="${p.image}" alt="${p.title}">
            <div class="saved-info">
              <h4>${p.title}</h4>
              <p>${p.desc}</p>
              <div class="saved-actions">
                <button class="view-saved-btn" data-id="${p.id}">👁 View</button>
                <button class="remove-btn" data-index="${i}">🗑 Remove</button>
              </div>
            </div>
          </div>`).join("")}
      </div>
    `;
  }

  savedModal.appendChild(content);
  document.body.appendChild(savedModal);
  document.body.style.overflow = "hidden";

  content.querySelector(".close-btn").addEventListener("click", () => {
    savedModal.remove();
    document.body.style.overflow = "auto";
  });
  savedModal.addEventListener("click", e => {
    if (e.target === savedModal) {
      savedModal.remove();
      document.body.style.overflow = "auto";
    }
  });

  content.querySelectorAll(".remove-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      removeSavedProperty(index);
      savedModal.remove();
      openSavedModal();
    });
  });

  content.querySelectorAll(".view-saved-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const id = btn.dataset.id;
      const viewBtn = document.querySelector(`.view-btn[data-id="${id}"]`);
      if (viewBtn) {
        savedModal.remove();
        document.body.style.overflow = "auto";
        openPropertyFromButton(viewBtn);
      } else {
        alert("⚠️ This property is not currently visible on the page.");
      }
    });
  });
}

function removeSavedProperty(index) {
  let saved = JSON.parse(localStorage.getItem("savedProperties")) || [];
  saved.splice(index, 1);
  localStorage.setItem("savedProperties", JSON.stringify(saved));
  updateSavedCounter();
}

/* -----------------------------
   🖼 IMAGE ZOOM + FULLSCREEN SLIDER
----------------------------- */
document.addEventListener("click", e => {
  if (e.target.classList.contains("zoomable")) {
    const zoomOverlay = document.createElement("div");
    zoomOverlay.classList.add("image-zoom");
    zoomOverlay.innerHTML = `<img src="${e.target.src}" alt="Zoomed Image">`;
    document.body.appendChild(zoomOverlay);
    zoomOverlay.addEventListener("click", () => zoomOverlay.remove());
  }
});

let currentIndex = 0;
let currentImages = [];

gallery.addEventListener("click", e => {
  if (e.target.classList.contains("zoomable")) {
    currentImages = Array.from(gallery.querySelectorAll(".zoomable")).map(img => img.src);
    currentIndex = currentImages.indexOf(e.target.src);
    openFullScreenSlider(currentIndex);
  }
});

function openFullScreenSlider(index) {
  const overlay = document.createElement("div");
  overlay.className = "fullscreen-slider";
  overlay.innerHTML = `
    <div class="slider-header">
      <button class="back-btn">⟨ Back</button>
    </div>
    <div class="slider-content">
      <button class="arrow left">⟨</button>
      <img src="${currentImages[index]}" class="slide-photo fade-photo">
      <button class="arrow right">⟩</button>
    </div>
    <div class="thumbnail-bar"></div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  const img = overlay.querySelector(".slide-photo");
  const left = overlay.querySelector(".arrow.left");
  const right = overlay.querySelector(".arrow.right");
  const back = overlay.querySelector(".back-btn");
  const thumbs = overlay.querySelector(".thumbnail-bar");

  currentImages.forEach((src, i) => {
    const thumb = document.createElement("img");
    thumb.src = src;
    thumb.className = "thumb";
    if (i === index) thumb.classList.add("active");
    thumb.addEventListener("click", () => {
      currentIndex = i;
      updateImage();
    });
    thumbs.appendChild(thumb);
  });

  const updateImage = () => {
    img.classList.remove("fade-photo");
    void img.offsetWidth;
    img.src = currentImages[currentIndex];
    img.classList.add("fade-photo");
    thumbs.querySelectorAll(".thumb").forEach((t, i) => {
      t.classList.toggle("active", i === currentIndex);
    });
  };

  left.onclick = () => {
    currentIndex = (currentIndex - 1 + currentImages.length) % currentImages.length;
    updateImage();
  };
  right.onclick = () => {
    currentIndex = (currentIndex + 1) % currentImages.length;
    updateImage();
  };
  back.onclick = () => {
    overlay.remove();
    document.body.style.overflow = "auto";
  };

  overlay.addEventListener("click", e => {
    if (e.target === overlay) {
      overlay.remove();
      document.body.style.overflow = "auto";
    }
  });
}

/* -----------------------------
   🏷 PROPERTY FILTER + SEARCH
----------------------------- */
const filterButtons = document.querySelectorAll(".filter-btn");
const propertyCards = document.querySelectorAll(".property-card");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const type = button.getAttribute("data-type");
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    propertyCards.forEach(card => {
      if (type === "all" || card.dataset.type === type) {
        card.classList.remove("hide");
        setTimeout(() => { card.style.display = "block"; }, 100);
      } else {
        card.classList.add("hide");
        setTimeout(() => { card.style.display = "none"; }, 400);
      }
    });
  });
});

/* -----------------------------
   📖 READ MORE / READ LESS
----------------------------- */
document.addEventListener("DOMContentLoaded", function() {
  const readMoreBtn = document.getElementById("readMoreBtn");
  const extraText = document.querySelector(".extra-text");
  if (readMoreBtn && extraText) {
    readMoreBtn.addEventListener("click", function() {
      extraText.classList.toggle("show");
      readMoreBtn.textContent = extraText.classList.contains("show") ? "Read Less" : "Read More";
    });
  }
});

/* -----------------------------
   🔎 SEARCH + AUTO HIDE KEYBOARD
----------------------------- */
const searchInput = document.getElementById("searchInput");
const noResults = document.getElementById("noResults");

function highlightMatch(text, query) {
  if (!query) return text;
  const regex = new RegExp(`(${query})`, "gi");
  return text.replace(regex, `<span class="highlight">$1</span>`);
}

function performSearch() {
  const searchValue = searchInput.value.toLowerCase().trim();
  const activeType = document.querySelector(".filter-btn.active").dataset.type;
  let matchCount = 0;

  propertyCards.forEach(card => {
    const titleElement = card.querySelector("h3");
    const title = titleElement.textContent.toLowerCase();
    const matchesSearch = title.includes(searchValue);
    const matchesFilter = activeType === "all" || card.dataset.type === activeType;

    if (matchesSearch && matchesFilter) {
      card.classList.remove("hide");
      card.style.display = "block";
      matchCount++;
      if (searchValue) {
        titleElement.innerHTML = highlightMatch(titleElement.textContent, searchValue);
      } else {
        titleElement.innerHTML = titleElement.textContent;
      }
    } else {
      card.classList.add("hide");
      setTimeout(() => { card.style.display = "none"; }, 300);
    }
  });

  noResults.style.display = matchCount === 0 ? "block" : "none";
}

searchInput.addEventListener("input", performSearch);
searchInput.addEventListener("keydown", e => {
  if (e.key === "Enter") {
    e.preventDefault();
    performSearch();
    searchInput.blur();
  }
});
filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    performSearch();
    searchInput.blur();
  });
});

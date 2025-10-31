/* -----------------------------
   🟢 WHATSAPP BOOKING
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
   🟡 VIEW MODAL + DETAILS
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

document.querySelectorAll(".view-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    const images = btn.dataset.images.split(",");
    const video = btn.dataset.video;
    const title = btn.dataset.title;
    const desc = btn.dataset.desc;
    const size = btn.dataset.size;
    const address = btn.dataset.address;
    const map = btn.dataset.map;
    const detailsHTML = btn.dataset.details;

    modalTitle.textContent = title;
    modalDesc.textContent = desc;
    modalSize.textContent = size;
    modalAddress.textContent = address;
    modalMap.href = map;
    extraDetails.innerHTML = detailsHTML || "";

    gallery.innerHTML = "";

    // Images
    images.forEach(img => {
      const imageEl = document.createElement("img");
      imageEl.src = img.trim();
      imageEl.classList.add("zoomable");
      gallery.appendChild(imageEl);
    });

    // Video
    if (video) {
      const videoEl = document.createElement("video");
      videoEl.src = video;
      videoEl.controls = true;
      gallery.appendChild(videoEl);
    }

    // Add Save/Share
    addShareButtons(title, desc);

    modal.style.display = "flex";
    document.body.style.overflow = "hidden";
  });
});

closeBtn.addEventListener("click", closeModal);
window.addEventListener("click", e => {
  if (e.target === modal) closeModal();
});

function closeModal() {
  modal.style.display = "none";
  document.body.style.overflow = "auto";
}



/* -----------------------------
   🖼 FULLSCREEN IMAGE SLIDER LIKE BAYUT
----------------------------- */
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
      <button class="back-btn">⟨ Back to gallery</button>
    </div>
    <div class="slider-content">
      <button class="arrow left">⟨</button>
      <img src="${currentImages[index]}" class="slide-photo">
      <button class="arrow right">⟩</button>
    </div>
  `;
  document.body.appendChild(overlay);
  document.body.style.overflow = "hidden";

  // navigation
  const img = overlay.querySelector(".slide-photo");
  const left = overlay.querySelector(".arrow.left");
  const right = overlay.querySelector(".arrow.right");
  const back = overlay.querySelector(".back-btn");

  const updateImage = () => { img.src = currentImages[currentIndex]; };

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
   ❤️ SAVE / SHARE BUTTONS
----------------------------- */
function addShareButtons(title, desc) {
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

  const saved = JSON.parse(localStorage.getItem("savedProperties")) || [];
  const alreadySaved = saved.find(p => p.title === title);

  if (alreadySaved) {
    saveBtn.textContent = "💛 Saved";
    saveBtn.style.background = "gold";
    saveBtn.style.color = "#000";
  }

  // SAVE
  saveBtn.addEventListener("click", () => {
    const property = {
      title,
      desc,
      image: gallery.querySelector("img")?.src || "",
    };
    let savedList = JSON.parse(localStorage.getItem("savedProperties")) || [];

    if (!savedList.find(p => p.title === property.title)) {
      savedList.push(property);
      localStorage.setItem("savedProperties", JSON.stringify(savedList));
      alert("✅ Property saved to favorites!");
      saveBtn.textContent = "💛 Saved";
      saveBtn.style.background = "gold";
      saveBtn.style.color = "#000";
      updateSavedCounter();
    } else {
      alert("⚠️ Already saved.");
    }
  });

  // SHARE
  shareBtn.addEventListener("click", async () => {
    const url = window.location.href;
    try {
      await navigator.share({
        title: "Prairies Hills Real Estate",
        text: `Check out this property: ${title}`,
        url: url,
      });
    } catch {
      navigator.clipboard.writeText(`${title} - ${url}`);
      alert("🔗 Link copied to clipboard!");
    }
  });
}

/* -----------------------------
   💖 FAVORITE SYSTEM
----------------------------- */
function updateSavedCounter() {
  const savedList = JSON.parse(localStorage.getItem("savedProperties")) || [];
  const counter = document.getElementById("saved-counter");
  if (counter) counter.textContent = savedList.length;
}

// Floating heart icon
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
  content.innerHTML = `
    <span class="close-btn">&times;</span>
    <h3>❤️ Saved Properties</h3>
    <div class="saved-list">
      ${
        saved.length
          ? saved
              .map(
                (p, i) => `
              <div class="saved-item">
                <img src="${p.image}" alt="${p.title}">
                <div class="saved-info">
                  <h4>${p.title}</h4>
                  <p>${p.desc}</p>
                  <button class="remove-btn" data-index="${i}">🗑 Remove</button>
                </div>
              </div>`
              )
              .join("")
          : "<p>No saved properties yet.</p>"
      }
    </div>
  `;

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

  // Remove buttons
  const removeBtns = content.querySelectorAll(".remove-btn");
  removeBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const index = btn.dataset.index;
      removeSavedProperty(index);
      savedModal.remove();
      openSavedModal(); // refresh view
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
   🖼 IMAGE ZOOM
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

/* -----------------------------
   🏷 PROPERTY FILTER (Rent / Sale)
----------------------------- */
const filterButtons = document.querySelectorAll(".filter-btn");
const propertyCards = document.querySelectorAll(".property-card");

filterButtons.forEach(button => {
  button.addEventListener("click", () => {
    const type = button.getAttribute("data-type");

    // Toggle active button
    filterButtons.forEach(btn => btn.classList.remove("active"));
    button.classList.add("active");

    // Show / hide cards smoothly
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

// READ MORE / READ LESS FUNCTION
document.addEventListener("DOMContentLoaded", function() {
  const readMoreBtn = document.getElementById("readMoreBtn");
  const extraText = document.querySelector(".extra-text");

  readMoreBtn.addEventListener("click", function() {
    extraText.classList.toggle("show");

    if (extraText.classList.contains("show")) {
      readMoreBtn.textContent = "Read Less";
    } else {
      readMoreBtn.textContent = "Read More";
    }
  });
});

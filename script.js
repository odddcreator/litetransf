const API = "http://localhost:3000";   // ← change to your real backend URL later
let token = localStorage.getItem("token");

const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ── Tabs ───────────────────────────────────────────────
$$(".tab").forEach(btn => {
  btn.addEventListener("click", () => {
    $$(".tab").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");

    $$(".tab-content").forEach(c => c.classList.remove("active"));
    $(btn.dataset.tab).classList.add("active");

    if (btn.dataset.tab === "texts") loadTexts();
    if (btn.dataset.tab === "media") loadMedia();
  });
});

// ── Auth ───────────────────────────────────────────────
if (!token) {
  $("login-screen").classList.remove("hidden");
  $("app").classList.add("hidden");
} else {
  $("login-screen").classList.add("hidden");
  $("app").classList.remove("hidden");
  checkPremium();
}

$("google-login").addEventListener("click", () => {
  window.location.href = API + "/auth/google";
});

// After Google redirects back → backend should redirect to ?token=xxx
const urlParams = new URLSearchParams(window.location.search);
const urlToken = urlParams.get("token");
if (urlToken) {
  localStorage.setItem("token", urlToken);
  token = urlToken;
  window.location.href = window.location.pathname; // clean URL
}

// ── Upload ─────────────────────────────────────────────
$("upload-text").onclick = async () => {
  const text = $("text-input").value.trim();
  if (!text) return alert("Enter some text");

  try {
    const res = await fetch(API + "/uploads/text", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Bearer " + token
      },
      body: JSON.stringify({ text })
    });
    if (!res.ok) throw new Error(await res.text());
    alert("Text uploaded!");
    $("text-input").value = "";
  } catch (err) {
    alert("Error: " + err.message);
  }
};

$("upload-file").onclick = async () => {
  const file = $("file-input").files[0];
  if (!file) return alert("Select a file");

  const formData = new FormData();
  formData.append("file", file);

  try {
    const res = await fetch(API + "/uploads/media", {
      method: "POST",
      headers: { "Authorization": "Bearer " + token },
      body: formData
    });
    if (!res.ok) throw new Error(await res.text());
    alert("File uploaded!");
    $("file-input").value = "";
  } catch (err) {
    alert("Error: " + err.message);
  }
};

// ── Load lists ─────────────────────────────────────────
async function loadTexts() {
  const list = $("texts-list");
  list.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(API + "/uploads/my-uploads", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) throw new Error();
    const items = await res.json();
    const texts = items.filter(i => i.type === "text");

    list.innerHTML = texts.length === 0
      ? "<p>No texts yet.</p>"
      : texts.map(t => `
        <div class="item">
          <pre>${t.content.substring(0, 300)}${t.content.length > 300 ? "..." : ""}</pre>
          <small>${new Date(t.timestamp).toLocaleString()}</small>
        </div>
      `).join("");
  } catch {
    list.innerHTML = "<p>Error loading texts.</p>";
  }
}

async function loadMedia() {
  const list = $("media-list");
  list.innerHTML = "<p>Loading...</p>";

  try {
    const res = await fetch(API + "/uploads/my-uploads", {
      headers: { "Authorization": "Bearer " + token }
    });
    if (!res.ok) throw new Error();
    const items = await res.json();
    const media = items.filter(i => i.type === "media");

    list.innerHTML = media.length === 0
      ? "<p>No media yet.</p>"
      : media.map(m => `
        <div class="item">
          <a href="${API}/uploads/download/${m._id}" target="_blank">Download</a>
          <small>${new Date(m.timestamp).toLocaleString()}</small>
        </div>
      `).join("");
  } catch {
    list.innerHTML = "<p>Error loading media.</p>";
  }
}

// ── Premium (very basic – real Stripe needs more code) ──
async function checkPremium() {
  // You can add /me endpoint later to return isPremium
  // For now just placeholder
  $("premium-status").textContent = "You are on the Free plan (premium check not implemented yet)";
}

$("subscribe-btn").onclick = () => {
  alert("Premium subscription → redirect to Stripe checkout (to be implemented)");
  // Real version: fetch(API + "/payments/create-checkout-session") → stripe.redirectToCheckout
};
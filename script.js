const API = "https://litetransf-backend.onrender.com";   // ← change to your real backend URL later
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
  if (!token) return alert("Not authenticated — please sign in");

  // brief debug: show partial token in console
  console.log("Uploading file; token present:", Boolean(token), "token-preview:", token ? token.slice(0,16) + "..." : null);

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
          <button onclick="downloadMedia('${m._id}')">Download</button>
          <small>${new Date(m.timestamp).toLocaleString()}</small>
        </div>
      `).join("");
  } catch {
    list.innerHTML = "<p>Error loading media.</p>";
  }
}

async function downloadMedia(id) {
  if (!token) return alert("Not authenticated");
  try {
    const res = await fetch(`${API}/uploads/download/${id}`, {
      headers: { "Authorization": "Bearer " + token }
    });
    if (res.status === 401) throw new Error("Unauthorized");
    if (!res.ok) throw new Error(await res.text());

    const blob = await res.blob();
    const cd = res.headers.get('content-disposition');
    let filename = id;
    if (cd) {
      const match = /filename="?(.*?)"?($|;)/.exec(cd);
      if (match) filename = match[1];
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  } catch (err) {
    alert("Error: " + err.message);
  }
}

// ── Logout ─────────────────────────────────────────────
$("logout-btn").onclick = () => {
  localStorage.removeItem("token"); // Remove token from local storage
  token = null;
  $("login-screen").classList.remove("hidden");
  $("app").classList.add("hidden");
  $("logout-btn").classList.add("hidden"); // Hide the logout button
};

// Show the logout button if the user is logged in
if (token) {
  $("logout-btn").classList.remove("hidden");
}

// ── Premium (very basic – real Stripe needs more code) ──
async function checkPremium() {
  // You can add /me endpoint later to return isPremium
  // For now just placeholder
  $("premium-status").textContent = "You are on the Free plan (premium check not implemented yet)";
}

let stripe;

(async () => {
  try {
    const res = await fetch(`${API}/stripe-key`); // Fetch the publishable key from the backend
    if (!res.ok) throw new Error('Failed to fetch Stripe publishable key');
    const { publishableKey } = await res.json();

    // Ensure the Stripe object is initialized with the fetched key
    stripe = window.Stripe(publishableKey); // Use `window.Stripe` to ensure it's globally available
    if (!stripe) throw new Error('Stripe initialization failed');
  } catch (err) {
    console.error('Error initializing Stripe:', err.message);
    alert('Stripe initialization failed. Please try again later.');
  }
})();

$("subscribe-btn").onclick = async () => {
  if (!token) return alert("Login first");
  if (!stripe) return alert("Stripe is not initialized. Please try again later.");

  try {
    const res = await fetch(API + "/payments/create-checkout-session", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + token,
        "Content-Type": "application/json"
      }
    });
    if (!res.ok) throw new Error('Could not create checkout session');
    const { id } = await res.json();

    const { error } = await stripe.redirectToCheckout({ sessionId: id });
    if (error) alert(error.message);
  } catch (err) {
    alert("Error: " + err.message);
  }
};
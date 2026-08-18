// 후기 모달/통계 공용 로직. common.js(supabaseFetch)와 #reviewModalOverlay 마크업이 있는 페이지에서 사용.

// { [spot_name]: { count, avgRating } }
let reviewStats = {};

async function loadReviewStats() {
  try {
    const res = await supabaseFetch("reviews?select=spot_name,rating");
    if (!res.ok) throw new Error("failed");
    const rows = await res.json();
    const grouped = {};
    rows.forEach(r => {
      if (!grouped[r.spot_name]) grouped[r.spot_name] = [];
      grouped[r.spot_name].push(r.rating);
    });
    reviewStats = {};
    Object.keys(grouped).forEach(name => {
      const ratings = grouped[name];
      reviewStats[name] = {
        count: ratings.length,
        avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      };
    });
  } catch (err) {
    reviewStats = {};
  }
}

function reviewStatsText(name) {
  const stat = reviewStats[name];
  if (!stat) return "후기 없음";
  return `후기 ${stat.count}개 · 평균 ${stat.avgRating.toFixed(1)}점`;
}

async function loadReviewsForSpot(name) {
  const listEl = document.getElementById("reviewList");
  listEl.innerHTML = "불러오는 중...";
  try {
    const res = await supabaseFetch(
      `reviews?spot_name=eq.${encodeURIComponent(name)}&order=created_at.desc&limit=50`
    );
    if (!res.ok) throw new Error("failed");
    const rows = await res.json();
    listEl.innerHTML = rows.length
      ? rows.map(r => `
          <div class="review-item">
            <div class="review-meta">${r.nickname || "익명"} · ${r.rating}점 · ${new Date(r.created_at).toLocaleDateString("ko-KR")}</div>
            <div>${r.comment}</div>
          </div>
        `).join("")
      : "<div class=\"review-item\">아직 후기가 없습니다. 첫 후기를 남겨보세요.</div>";
  } catch (err) {
    listEl.innerHTML = "후기를 불러오지 못했습니다. Supabase 설정을 확인하세요.";
  }
}

let currentReviewSpot = null;

function openReviewModal(name) {
  currentReviewSpot = name;
  document.getElementById("reviewModalTitle").textContent = `${name} 후기`;
  document.getElementById("reviewStatus").textContent = "";
  document.getElementById("reviewForm").reset();
  document.getElementById("reviewModalOverlay").classList.add("open");
  loadReviewsForSpot(name);
}

function closeReviewModal() {
  document.getElementById("reviewModalOverlay").classList.remove("open");
  currentReviewSpot = null;
}

function initReviewModal(onSubmitted) {
  document.getElementById("reviewModalClose").addEventListener("click", closeReviewModal);
  document.getElementById("reviewModalOverlay").addEventListener("click", (e) => {
    if (e.target.id === "reviewModalOverlay") closeReviewModal();
  });
  document.getElementById("reviewForm").addEventListener("submit", async (e) => {
    e.preventDefault();
    if (!currentReviewSpot) return;
    const statusEl = document.getElementById("reviewStatus");
    statusEl.textContent = "등록 중...";
    try {
      const res = await supabaseFetch("reviews", {
        method: "POST",
        headers: { Prefer: "return=minimal" },
        body: JSON.stringify({
          spot_name: currentReviewSpot,
          rating: Number(document.getElementById("reviewRating").value),
          nickname: document.getElementById("reviewNickname").value.trim() || "익명",
          comment: document.getElementById("reviewComment").value.trim(),
        }),
      });
      if (!res.ok) throw new Error("failed");
      statusEl.textContent = "등록되었습니다.";
      document.getElementById("reviewForm").reset();
      await loadReviewStats();
      await loadReviewsForSpot(currentReviewSpot);
      if (onSubmitted) onSubmitted();
    } catch (err) {
      statusEl.textContent = "등록에 실패했습니다. Supabase 설정을 확인하세요.";
    }
  });
}

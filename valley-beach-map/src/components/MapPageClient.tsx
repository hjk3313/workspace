"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { REGIONS, type Spot } from "@/lib/data";
import { depthLabel, typeLabel, typeColor, distanceKm, getFavorites, setFavorites, naverMapUrl } from "@/lib/common";
import { reviewStatsText } from "@/lib/reviews";
import { useReviewStats } from "@/lib/useReviewStats";
import { useSpots } from "@/lib/spots";
import SpotCard from "./SpotCard";
import ReviewModal from "./ReviewModal";
import PopularRanking from "./PopularRanking";

const NAVER_MAP_CLIENT_ID = process.env.NEXT_PUBLIC_NAVER_MAP_CLIENT_ID || "";

type SortMode = "default" | "distance";

const TYPE_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "beach", label: "해수욕장" },
  { value: "valley", label: "계곡" },
];
const DEPTH_OPTIONS = [
  { value: "all", label: "전체" },
  { value: "shallow", label: "얕음" },
  { value: "medium", label: "보통" },
  { value: "deep", label: "깊음" },
];

export default function MapPageClient({ initialSpots }: { initialSpots?: Spot[] }) {
  const [region, setRegion] = useState("all");
  const [type, setType] = useState("all");
  const [depth, setDepth] = useState("all");
  const [search, setSearch] = useState("");
  const [favOnly, setFavOnly] = useState(false);
  const [sort, setSort] = useState<SortMode>("default");
  const [userLoc, setUserLoc] = useState<{ lat: number; lng: number } | null>(null);

  const [favorites, setFavoritesState] = useState<Set<string>>(new Set());
  const [controlsOpen, setControlsOpen] = useState(false);
  const [view, setView] = useState<"list" | "map">("list");
  const [openReviewSpot, setOpenReviewSpot] = useState<string | null>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);

  const { stats, refresh: refreshStats } = useReviewStats();
  const { spots: allSpots, loading: spotsLoading } = useSpots(initialSpots);

  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  useEffect(() => {
    setFavoritesState(getFavorites());
    // 카톡 공유 딥링크(?q=스팟이름) 지원. useSearchParams 대신 여기서 직접 읽는 이유:
    // useSearchParams는 Suspense 경계가 필요해서 홈 화면 SSR 콘텐츠(스팟 목록)가 통째로 안 나가게 됨 - SEO 손해.
    const q = new URLSearchParams(window.location.search).get("q");
    if (q) setSearch(q.toLowerCase());
  }, []);

  // 진입 시 자동으로 위치 요청 → 거리순 정렬. 권한 거부/미지원이면 조용히 기본순 유지(경고 없음).
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSort("distance");
      },
      () => {}
    );
  }, []);

  // 네이버 지도 SDK 로드 + 초기화. 페이지 재방문 시 window.naver 있으면 스크립트 재로딩 스킵.
  useEffect(() => {
    function init() {
      if (!mapDivRef.current) return;
      const naver = window.naver;
      const map = new naver.maps.Map(mapDivRef.current, {
        center: new naver.maps.LatLng(36.4, 127.9),
        zoom: 7,
      });
      mapRef.current = map;
      infoWindowRef.current = new naver.maps.InfoWindow({ content: "" });
      setMapReady(true);
    }

    window.navermap_authFailure = () => {
      setMapError("네이버 지도 인증에 실패했습니다. NAVER_MAP_CLIENT_ID 값과 Ncloud 콘솔의 Web 서비스 URL 등록(현재 도메인)을 확인하세요.");
    };

    if (window.naver?.maps) {
      init();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpKeyId=${NAVER_MAP_CLIENT_ID}`;
    script.onload = init;
    script.onerror = () => setMapError("네이버 지도를 불러오지 못했습니다. 네트워크 상태를 확인하세요.");
    document.head.appendChild(script);
    // ponytail: 스크립트/지도 인스턴스 언마운트 정리 안 함(SPA 내에서 이 페이지는 사실상 한 번만 마운트됨).
    // 다른 라우트 오가며 중복 로드 문제 보이면 그때 cleanup 추가.
  }, []);

  const filteredSpots = useMemo(() => {
    let spots = allSpots.filter((s) => {
      if (region !== "all" && s.region !== region) return false;
      if (type !== "all" && s.type !== type) return false;
      if (depth !== "all" && s.depth !== depth) return false;
      if (search && !(s.name.toLowerCase().includes(search) || s.region.toLowerCase().includes(search))) return false;
      if (favOnly && !favorites.has(s.name)) return false;
      return true;
    });
    if (sort === "distance" && userLoc) {
      spots = [...spots].sort(
        (a, b) =>
          distanceKm(userLoc.lat, userLoc.lng, a.lat, a.lng) - distanceKm(userLoc.lat, userLoc.lng, b.lat, b.lng)
      );
    }
    return spots;
  }, [allSpots, region, type, depth, search, favOnly, sort, userLoc, favorites]);

  function focusSpot(spot: Spot, marker: any) {
    const naver = window.naver;
    const map = mapRef.current;
    const infoWindow = infoWindowRef.current;
    if (!naver || !map || !infoWindow) return;
    map.panTo(new naver.maps.LatLng(spot.lat, spot.lng));
    // 지도 InfoWindow는 React가 아니라 순수 HTML 문자열이라, 닫기 버튼은 window에 걸어둔 전역 콜백으로 연결.
    (window as any).__closeSpotInfoWindow = () => infoWindow.close();
    infoWindow.setContent(
      `<div style="padding:8px 10px;font-size:13px;position:relative;">
        <button onclick="window.__closeSpotInfoWindow()" style="position:absolute;top:4px;right:6px;border:none;background:none;font-size:14px;line-height:1;cursor:pointer;color:#999;padding:2px;">✕</button>
        <b style="padding-right:16px;display:inline-block;"><span style="display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;background:${typeColor[spot.type]};"></span>${spot.name}</b><br>
        ${spot.region} · ${typeLabel[spot.type]} · 수심 ${depthLabel[spot.depth]}<br>
        <span style="color:#666;">${spot.address}</span><br>
        <span style="color:#666;">${spot.note}</span><br>
        <a href="${naverMapUrl(spot)}" target="_blank" rel="noopener noreferrer" style="display:inline-block;margin-top:6px;font-size:12px;color:${typeColor[spot.type]};">지도 보기 →</a>
      </div>`
    );
    infoWindow.open(map, marker);
  }

  // 목록/필터가 바뀔 때마다 마커 다시 그림.
  useEffect(() => {
    if (!mapReady) return;
    const naver = window.naver;
    const map = mapRef.current;
    markersRef.current.forEach((m) => {
      try {
        m.setMap(null);
      } catch {
        /* noop */
      }
    });
    markersRef.current = filteredSpots.map((spot) => {
      const marker = new naver.maps.Marker({
        position: new naver.maps.LatLng(spot.lat, spot.lng),
        map,
        icon: {
          content: `<svg width="24" height="32" viewBox="0 0 24 32" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 1px 2px rgba(0,0,0,0.35));">
            <path d="M12 0C5.4 0 0 5.4 0 12c0 9 12 20 12 20s12-11 12-20C24 5.4 18.6 0 12 0z" fill="${typeColor[spot.type]}"/>
            <circle cx="12" cy="12" r="4.5" fill="#fff"/>
          </svg>`,
          anchor: new naver.maps.Point(12, 32),
        },
      });
      naver.maps.Event.addListener(marker, "click", () => focusSpot(spot, marker));
      return marker;
    });
  }, [filteredSpots, mapReady]);

  useEffect(() => {
    if (view === "map" && mapReady) {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          try {
            mapRef.current.autoResize();
            mapRef.current.refresh(true);
          } catch {
            /* noop */
          }
        });
      });
    }
  }, [view, mapReady]);

  function toggleFavorite(name: string) {
    const next = new Set(favorites);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setFavorites(next);
    setFavoritesState(next);
  }

  function requestDistanceSort() {
    if (!navigator.geolocation) {
      alert("이 브라우저는 위치 확인을 지원하지 않습니다.");
      setSort("default");
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setSort("distance");
      },
      () => {
        alert("위치 확인을 허용해야 거리순 정렬을 쓸 수 있어요.");
        setSort("default");
      }
    );
  }

  return (
    <main>
      <PopularRanking
        spots={allSpots}
        stats={stats}
        onSelect={(name) => {
          setRegion("all");
          setType("all");
          setDepth("all");
          setFavOnly(false);
          setSearch(name.toLowerCase());
        }}
      />

      <div id="controls" className={controlsOpen ? "open" : ""}>
        <button className="controls-title" type="button" onClick={() => setControlsOpen((v) => !v)}>
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3}>
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          검색 및 필터
          <svg className="chevron" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <div id="controlsBody">
          <div className="search-box">
            <svg className="search-box-icon" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.3}>
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              className="search-box-input"
              value={search}
              onChange={(e) => setSearch(e.target.value.trim().toLowerCase())}
              placeholder="이름 또는 지역으로 검색..."
            />
            {search && (
              <button className="search-box-clear" onClick={() => setSearch("")} aria-label="검색어 지우기">
                ✕
              </button>
            )}
          </div>

          <div className="filter-row">
            <span className="filter-label">지역</span>
            <div className="pills">
              <button className={`pill ${region === "all" ? "active" : ""}`} onClick={() => setRegion("all")}>전체</button>
              {REGIONS.map((r) => (
                <button key={r} className={`pill ${region === r ? "active" : ""}`} onClick={() => setRegion(r)}>
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">유형</span>
            <div className="pills">
              {TYPE_OPTIONS.map((opt) => (
                <button key={opt.value} className={`pill ${type === opt.value ? "active" : ""}`} onClick={() => setType(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">수심</span>
            <div className="pills">
              {DEPTH_OPTIONS.map((opt) => (
                <button key={opt.value} className={`pill ${depth === opt.value ? "active" : ""}`} onClick={() => setDepth(opt.value)}>
                  {opt.label}
                </button>
              ))}
            </div>
          </div>

          <div className="filter-row">
            <span className="filter-label">정렬</span>
            <div className="pills">
              <button className={`pill ${sort === "default" ? "active" : ""}`} onClick={() => setSort("default")}>기본순</button>
              <button
                className={`pill ${sort === "distance" ? "active" : ""}`}
                onClick={() => requestDistanceSort()}
              >
                거리순
              </button>
            </div>
          </div>

          <div className="filter-row">
            <button className={`pill ${favOnly ? "active" : ""}`} onClick={() => setFavOnly((v) => !v)}>
              즐겨찾기만 보기
            </button>
          </div>
        </div>
      </div>

      <div className="view-tabs">
        <button className={view === "list" ? "active" : ""} onClick={() => setView("list")}>리스트</button>
        <button className={view === "map" ? "active" : ""} onClick={() => setView("map")}>지도</button>
      </div>

      <div id="layout" className={view === "map" ? "show-map" : "show-list"}>
        <div className="map-pane">
          <div className="pane-title">위치</div>
          {mapError ? <div id="apiKeyWarning" dangerouslySetInnerHTML={{ __html: mapError }} /> : null}
          <div id="map" ref={mapDivRef} style={mapError ? { display: "none" } : undefined} />
        </div>
        <div className="list-pane">
          <div className="pane-title">
            목록{" "}
            <span id="count">{spotsLoading ? "불러오는 중..." : `${filteredSpots.length}곳 표시 중`}</span>
          </div>
          <div id="list">
            {filteredSpots.map((spot) => (
              <SpotCard
                key={spot.name}
                spot={spot}
                isFav={favorites.has(spot.name)}
                dist={sort === "distance" && userLoc ? distanceKm(userLoc.lat, userLoc.lng, spot.lat, spot.lng) : null}
                reviewText={reviewStatsText(stats, spot.name)}
                onClick={() => {
                  const idx = filteredSpots.indexOf(spot);
                  const marker = markersRef.current[idx];
                  if (marker) focusSpot(spot, marker);
                }}
                onToggleFav={() => toggleFavorite(spot.name)}
                onOpenReview={() => setOpenReviewSpot(spot.name)}
              />
            ))}
          </div>
        </div>
      </div>

      <footer>
        수심은 실측치가 아닌 참고용 3단계 구분입니다 · 좌표는 표기용 근사치입니다
        <br />
        안전수칙: 음주 후 입수 금지 · 구명조끼 착용 권장 · 우천·상류 방류 시 급류 위험 · 지정되지 않은 구역 다이빙 금지
        <br />
        <a href="/privacy">개인정보처리방침</a>
      </footer>

      <ReviewModal
        spotName={openReviewSpot}
        onClose={() => setOpenReviewSpot(null)}
        onSubmitted={refreshStats}
      />
    </main>
  );
}

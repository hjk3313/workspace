# Graph Report - .  (2026-07-31)

## Corpus Check
- 200 files · ~184,662 words
- Verdict: corpus is large enough that graph structure adds value.

## Summary
- 1143 nodes · 1769 edges · 103 communities (56 shown, 47 thin omitted)
- Extraction: 98% EXTRACTED · 2% INFERRED · 0% AMBIGUOUS · INFERRED: 32 edges (avg confidence: 0.79)
- Token cost: 696,000 input · 30,700 output

## Community Hubs (Navigation)
- Valley Beach Map Pages
- AI Company Simulation Core
- Carousel Studio (ai-office-1)
- Beach Map Shared Assets
- Admin/Geocode API Routes
- Dust Dashboard Dependencies
- Drive Worker (ai-office-1)
- Drive Worker (ai-office)
- ai-office-1 Package Config
- Dev Dependencies (Cloudflare/Drizzle)
- Office World Rendering
- ai-office-1 TS Config
- ai-office TS Config
- Dust Dashboard TS Config
- Valley Beach Map Dependencies
- Valley Beach Map TS Config
- Game Report/Integrations
- Dust Dashboard Home Page
- KMA Weather Time Utils
- Staff/Department Simulation
- Carousel Studio (ai-office)
- AI Company Policy Docs
- Simulation Engine (sim.ts)
- Dust Dashboard Dev Deps
- Content Pipeline Script
- Pathfinding Algorithm
- Pipeline Panel UI
- Employee Movement/Pathfinding
- Air Quality API Routes
- Korea Map Component
- Sky/Weather Panel UI
- Salary Calculator Core Logic
- Dust Dashboard Core Deps
- Rain Summary API Routes
- Google Drive Upload Script
- ChatGPT Auth (ai-office-1)
- DB Schema/Notes API (ai-office-1)
- ChatGPT Auth (ai-office)
- DB Schema/Notes API (ai-office)
- Site Verification/Policy Docs
- Weather Grid Utils
- ai-office Package Config
- NPM Scripts
- Dust Dashboard Layout/Fonts
- OAuth Local Server Script
- Rain Grade Utils
- Salary Calculator UI Handlers
- Weather Alert API Route
- GODSENG OG Preview Branding
- Rendered HTML Test (ai-office-1)
- Rendered HTML Test (ai-office)
- Workspace-wide Conventions
- About Page (Beach Map)
- Dust Dashboard Guide Page
- Dust Dashboard Privacy Page
- Valley Beach Map Root Layout
- Vercel Config
- ai-office-1 ESLint Config
- ai-office-1 Next Config
- ai-office-1 PostCSS Config
- Office Favicon Icons
- File Icon Assets
- Globe Icon Assets
- Window Icon Assets
- ai-office-1 Vite Config
- ai-office ESLint Config
- ai-office Next Config
- ESLint Dependency
- eslint-config-next Dependency
- Tailwind CSS Dependency
- @types/node Dependency
- @types/react-dom Dependency
- TypeScript Dependency
- vinext Dependency
- Vite Dependency
- Wrangler Dependency
- ai-office PostCSS Config
- ai-office Vite Config
- Deps Package Metadata
- Dust Dashboard Bootstrap Notes
- Dust Dashboard ESLint Config
- Dust Dashboard Next Config
- Dust Dashboard PostCSS Config
- Google Verification Files
- Valley Beach Map ESLint Config
- Valley Beach Map Next Config
- Valley Beach Map Favicons
- Google Search Console Files
- Naver Verification Files
- Robots.txt Static Files
- Naver Maps Type Defs
- Next.js File Icon
- Next.js Globe Icon
- Dust Dashboard Naver Verification
- Next.js Logo Icon
- Vercel Logo Icon
- App Favicon Icon

## God Nodes (most connected - your core abstractions)
1. `Company` - 59 edges
2. `compilerOptions` - 16 edges
3. `compilerOptions` - 16 edges
4. `compilerOptions` - 16 edges
5. `compilerOptions` - 16 edges
6. `roomOf()` - 13 edges
7. `supabaseAdminFetch()` - 13 edges
8. `isValidSession()` - 11 edges
9. `findPath()` - 10 edges
10. `supabaseFetch()` - 10 edges

## Surprising Connections (you probably didn't know these)
- `salary-calculator 자동 commit/push 표준 승인 정책` --semantically_similar_to--> `dust-dashboard 자동 commit/push 표준 승인 정책`  [INFERRED] [semantically similar]
  salary-calculator/CLAUDE.md → dust-dashboard/CLAUDE.md
- `ads.txt (AdSense 발행자 선언)` --semantically_similar_to--> `ads.txt (public)`  [INFERRED] [semantically similar]
  valley-beach-map.static-backup/ads.txt → valley-beach-map/public/ads.txt
- `Google Search Console 사이트 인증 파일` --semantically_similar_to--> `Google 사이트 인증 파일 (public)`  [INFERRED] [semantically similar]
  valley-beach-map.static-backup/googlef8809cfe8a2a3b34.html → valley-beach-map/public/googlef8809cfe8a2a3b34.html
- `네이버 사이트 인증 파일` --semantically_similar_to--> `네이버 사이트 인증 파일 (public)`  [INFERRED] [semantically similar]
  valley-beach-map.static-backup/naver6c57921268af54cc0384ff2fd857d336.html → valley-beach-map/public/naver6c57921268af54cc0384ff2fd857d336.html
- `robots.txt (static-backup)` --semantically_similar_to--> `robots.txt (public)`  [INFERRED] [semantically similar]
  valley-beach-map.static-backup/robots.txt → valley-beach-map/public/robots.txt

## Import Cycles
- None detected.

## Hyperedges (group relationships)
- **갓생맘 AI Company 템플릿 계열 (사규 템플릿 + ai-office 구현)** — aicompany_ai_company_copy_department_pipeline, aicompany_ai_company_department_pipeline, aicompany_ai_company_pro_staff_roster, aicompany_ai_office_claude, aicompany_ai_office_readme [INFERRED 0.85]
- **dust-dashboard ↔ salary-calculator AdSense/사이트 소유자 동일성** — dust_dashboard_public_ads, salary_calculator_ads, dust_dashboard_public_googlef8809cfe8a2a3b34, salary_calculator_googlef8809cfe8a2a3b34 [INFERRED 0.85]
- **정적 백업 사이트에서 public 폴더로 이관된 검색엔진 인증/설정 파일** — valley_beach_map_static_backup_ads_file, valley_beach_map_static_backup_googlef8809cfe8a2a3b34_file, valley_beach_map_static_backup_naver6c57921268af54cc0384ff2fd857d336_file, valley_beach_map_static_backup_robots_file, valley_beach_map_public_ads_file, valley_beach_map_public_googlef8809cfe8a2a3b34_file, valley_beach_map_public_naver6c57921268af54cc0384ff2fd857d336_file, valley_beach_map_public_robots_file [INFERRED 0.85]
- **Supabase REST API(supabaseFetch)를 통한 제보/후기 데이터 흐름** — valley_beach_map_static_backup_register_submithandler, valley_beach_map_static_backup_reviews_loadfeed, valley_beach_map_static_backup_assets_js_common_supabasefetch [INFERRED 0.85]
- **여러 페이지에 공통 적용된 후기 모달 위젯 패턴** — valley_beach_map_static_backup_favorites_page, valley_beach_map_static_backup_index_page, valley_beach_map_static_backup_reviews_page, valley_beach_map_static_backup_assets_js_reviews_widget_initreviewmodal [INFERRED 0.85]

## Communities (103 total, 47 thin omitted)

### Community 0 - "Valley Beach Map Pages"
Cohesion: 0.05
Nodes (60): metadata, metadata, metadata, Page(), revalidate, metadata, metadata, metadata (+52 more)

### Community 1 - "AI Company Simulation Core"
Cohesion: 0.12
Nodes (5): BLOCKED_DEPTS, Company, rand(), Pt, roomOf()

### Community 2 - "Carousel Studio (ai-office-1)"
Cohesion: 0.06
Nodes (41): BG_STYLES, buildSlides(), CarouselStudio(), closeBtnStyle, ctaBtnStyle, dotStyle(), featureRowStyle, listItemStyle (+33 more)

### Community 3 - "Beach Map Shared Assets"
Cohesion: 0.07
Nodes (36): ads.txt (public), ads.txt (AdSense 발행자 선언), depthLabel, getFavorites(), hasRiskNote(), REGIONS, setFavorites(), SPOT_BY_NAME (+28 more)

### Community 4 - "Admin/Geocode API Routes"
Cohesion: 0.09
Nodes (30): metadata, Page(), GET(), POST(), authorized(), DELETE(), GET(), authorized() (+22 more)

### Community 5 - "Dust Dashboard Dependencies"
Cohesion: 0.05
Nodes (42): d3-geo, dependencies, d3-geo, next, react, react-dom, topojson-client, @vercel/analytics (+34 more)

### Community 6 - "Drive Worker (ai-office-1)"
Cohesion: 0.09
Nodes (30): base64ToBytes(), DriveEnv, findOrCreateFolder(), getAccessToken(), uploadFile(), uploadFilesToDrive(), Env, ExecutionContext (+22 more)

### Community 7 - "Drive Worker (ai-office)"
Cohesion: 0.09
Nodes (30): base64ToBytes(), DriveEnv, findOrCreateFolder(), getAccessToken(), uploadFile(), uploadFilesToDrive(), Env, ExecutionContext (+22 more)

### Community 8 - "ai-office-1 Package Config"
Cohesion: 0.06
Nodes (32): allowScripts, esbuild@0.18.20, esbuild@0.25.12, esbuild@0.27.3, esbuild@0.28.0, sharp@0.34.5, unrs-resolver@1.11.1, workerd@1.20260515.1 (+24 more)

### Community 9 - "Dev Dependencies (Cloudflare/Drizzle)"
Cohesion: 0.06
Nodes (33): devDependencies, @cloudflare/vite-plugin, drizzle-kit, eslint, eslint-config-next, react-server-dom-webpack, tailwindcss, @tailwindcss/postcss (+25 more)

### Community 10 - "Office World Rendering"
Cohesion: 0.08
Nodes (28): AgentLayer, Cam, clamp(), OfficeWorld(), PropLayer, Props, STATUS_CLASS, Agent (+20 more)

### Community 11 - "ai-office-1 TS Config"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 12 - "ai-office TS Config"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 13 - "Dust Dashboard TS Config"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 14 - "Valley Beach Map Dependencies"
Cohesion: 0.07
Nodes (28): dependencies, next, react, react-dom, devDependencies, eslint, eslint-config-next, @types/node (+20 more)

### Community 15 - "Valley Beach Map TS Config"
Cohesion: 0.07
Nodes (28): compilerOptions, allowJs, esModuleInterop, incremental, isolatedModules, jsx, lib, module (+20 more)

### Community 16 - "Game Report/Integrations"
Cohesion: 0.13
Nodes (16): buildReport(), DayReport, fetchIntegrations(), IntegrationStatus, publish(), PublishResult, PHASES, Snapshot (+8 more)

### Community 17 - "Dust Dashboard Home Page"
Cohesion: 0.19
Nodes (16): DUST_LEGEND, formatRainText(), Home(), RAIN_LEGEND, RainReading, SearchRegion, Tab, StationCard() (+8 more)

### Community 18 - "KMA Weather Time Utils"
Cohesion: 0.16
Nodes (17): baseDateTimeFor(), initialInstant(), kstParts(), withHourlyFallback(), CurrentWeather, FcstItem, fetchCurrentWeather(), fetchItems() (+9 more)

### Community 19 - "Staff/Department Simulation"
Cohesion: 0.13
Nodes (14): BLOCK_NEED, CEO, DEPT_LEAD, SKIN, StaffSeed, metadata, CEO_PROFILE, COMPANY (+6 more)

### Community 20 - "Carousel Studio (ai-office)"
Cohesion: 0.14
Nodes (15): BG_STYLES, buildSlides(), CarouselStudio(), closeBtnStyle, ctaBtnStyle, dotStyle(), featureRowStyle, listItemStyle (+7 more)

### Community 21 - "AI Company Policy Docs"
Cohesion: 0.23
Nodes (15): 절대 규칙 7원칙 (메일·SNS·결제 실행 금지 등), AI 콘텐츠 회사 사규 템플릿 (12부서 파이프라인), 오늘의 AI 한 개 — 사규 (12부서 파이프라인 구현체), 대표 지시창 (CEO 명령 콘솔), 12단계 하루 시나리오, AI COMPANY 심화 사규 — 32명 인원 편성, ai-office CLAUDE.md — AI 코딩 도구용 작업 지침, .dev.vars 비밀정보 취급 원칙 (출력·커밋·공유 금지) (+7 more)

### Community 22 - "Simulation Engine (sim.ts)"
Cohesion: 0.13
Nodes (13): Action, AgentStatus, Anim, BLOCK_REASON, ChatEntry, DEPT_KEYWORDS, Facing, LogEntry (+5 more)

### Community 23 - "Dust Dashboard Dev Deps"
Cohesion: 0.13
Nodes (15): devDependencies, @cloudflare/vite-plugin, drizzle-kit, react-server-dom-webpack, @tailwindcss/postcss, @types/react, @vitejs/plugin-react, @vitejs/plugin-rsc (+7 more)

### Community 24 - "Content Pipeline Script"
Cohesion: 0.23
Nodes (12): BRAND_RULES, callOpenAI(), fs, KEY_PATH, main(), OPENAI_API_KEY, path, STATE_PATH (+4 more)

### Community 25 - "Pathfinding Algorithm"
Cohesion: 0.24
Nodes (10): DIRS, findPath(), heuristic(), idx(), nearestWalkable(), Queue, rebuild(), COLS (+2 more)

### Community 26 - "Pipeline Panel UI"
Cohesion: 0.14
Nodes (10): CHECK_COLOR, CHECK_LABEL, Checks, CheckState, closeBtnStyle, overlayStyle, panelStyle, PipelinePanel() (+2 more)

### Community 27 - "Employee Movement/Pathfinding"
Cohesion: 0.18
Nodes (9): beginTrip(), decideNextAction(), findPath() — A* 경로탐색, frame() — requestAnimationFrame 루프, handleBlocked() (ponytail: 강제 전진 안전판), isWalkable(), pickRoomTile(), renderFrame() (+1 more)

### Community 28 - "Air Quality API Routes"
Cohesion: 0.25
Nodes (10): GET(), average(), GET(), SidoSummary, parseValue(), AirkoreaItem, AirkoreaResponse, fetchStations() (+2 more)

### Community 29 - "Korea Map Component"
Cohesion: 0.19
Nodes (11): KoreaMap(), CODE_TO_SIDO, geojson, KOREA_REGIONS, KoreaRegion, MAP_HEIGHT, MAP_WIDTH, pathGenerator (+3 more)

### Community 30 - "Sky/Weather Panel UI"
Cohesion: 0.18
Nodes (7): CONDITION_GRADIENT, GRADE_GRADIENT, resolveCondition(), SkyCondition, SkyPanel(), Grade, SkyStatus

### Community 31 - "Salary Calculator Core Logic"
Cohesion: 0.29
Nodes (10): calcAnnualIncomeTax(), calcEarnedIncomeDeduction(), calcNetSalary(), calcProgressiveTax(), calcSeverance(), TAX_BRACKETS, assert, { calcEarnedIncomeDeduction, calcProgressiveTax, calcNetSalary, calcSeverance } (+2 more)

### Community 32 - "Dust Dashboard Core Deps"
Cohesion: 0.18
Nodes (11): dependencies, drizzle-orm, html-to-image, next, react, react-dom, drizzle-orm, html-to-image (+3 more)

### Community 33 - "Rain Summary API Routes"
Cohesion: 0.27
Nodes (9): GET(), average(), GET(), SidoRainSummary, GET(), resolveRegion(), SIDO_LIST, fetchRainfall() (+1 more)

### Community 34 - "Google Drive Upload Script"
Cohesion: 0.29
Nodes (9): crypto, findOrCreateFolder(), fs, getAccessToken(), main(), mimeFor(), path, TOKEN_PATH (+1 more)

### Community 35 - "ChatGPT Auth (ai-office-1)"
Cohesion: 0.39
Nodes (8): chatGPTSignInPath(), chatGPTSignOutPath(), ChatGPTUser, getChatGPTUser(), isReservedAuthPath(), requireChatGPTUser(), safeDecodeURIComponent(), safeRelativeReturnPath()

### Community 36 - "DB Schema/Notes API (ai-office-1)"
Cohesion: 0.39
Nodes (5): getDb(), GET(), POST(), toRouteErrorMessage(), notes

### Community 37 - "ChatGPT Auth (ai-office)"
Cohesion: 0.39
Nodes (8): chatGPTSignInPath(), chatGPTSignOutPath(), ChatGPTUser, getChatGPTUser(), isReservedAuthPath(), requireChatGPTUser(), safeDecodeURIComponent(), safeRelativeReturnPath()

### Community 38 - "DB Schema/Notes API (ai-office)"
Cohesion: 0.39
Nodes (5): getDb(), GET(), POST(), toRouteErrorMessage(), notes

### Community 39 - "Site Verification/Policy Docs"
Cohesion: 0.22
Nodes (9): dust-dashboard 자동 commit/push 표준 승인 정책, dust-dashboard ads.txt (AdSense pub-1475889248445126), salary-calculator ads.txt (AdSense pub-1475889248445126), salary-calculator CLAUDE.md — 프로젝트 지침, salary-calculator 자동 commit/push 표준 승인 정책, index.html + calc.js(순수 계산) + calc.test.js 분리 구조, salary-calculator index.html — 연봉/퇴직금 계산기 앱, salary-calculator privacy-policy.html — 개인정보처리방침 (+1 more)

### Community 40 - "Weather Grid Utils"
Cohesion: 0.39
Nodes (5): Sido, latLonToGrid(), nearestRegion(), GridPoint, SIDO_TO_GRID_POINTS

### Community 41 - "ai-office Package Config"
Cohesion: 0.29
Nodes (6): engines, node, name, private, type, version

### Community 42 - "NPM Scripts"
Cohesion: 0.29
Nodes (7): scripts, build, db:generate, dev, lint, start, test

### Community 43 - "Dust Dashboard Layout/Fonts"
Cohesion: 0.29
Nodes (5): metadata, nanumMyeongjo, notoSansKr, spaceMono, websiteJsonLd

### Community 44 - "OAuth Local Server Script"
Cohesion: 0.33
Nodes (5): fs, http, OUT, path, server

### Community 45 - "Rain Grade Utils"
Cohesion: 0.53
Nodes (5): getRainGrade(), RAIN_LEVELS, RainGrade, rainRangeLabel(), rainSwatch()

### Community 46 - "Salary Calculator UI Handlers"
Cohesion: 0.40
Nodes (6): calcNetBtn click handler, calcNetSalary() (calc.js, 순수 함수), calcSeverance() (calc.js, 순수 함수), calcSeveranceBtn click handler, stampIn(), won()

### Community 47 - "Weather Alert API Route"
Cohesion: 0.40
Nodes (5): GET(), REGION_TITLE_MAP, runtime, toYYYYMMDD(), WarnItem

### Community 48 - "GODSENG OG Preview Branding"
Cohesion: 0.67
Nodes (4): AI Office-1 OG Social Preview Image (og.png), GODSENG AI COMPANY (갓생 AI Company) brand, Tagline: 'AI가 일하고, 대표가 결정하는 회사' (AI works, the CEO decides), GODSENG AI COMPANY Open Graph Preview Image

### Community 51 - "Workspace-wide Conventions"
Cohesion: 0.67
Nodes (3): workspace/CLAUDE.md — 저장소 전역 지침, calculator 공용 core operations 설계 (핸들러 중복 대신 공유 함수로 수렴), Telegram reply 도구를 통한 결과 보고 정책

## Ambiguous Edges - Review These
- `AI Office-1 OG Social Preview Image (og.png)` → `GODSENG AI COMPANY (갓생 AI Company) brand`  [AMBIGUOUS]
  AIcompany/ai-office-1/public/og.png · relation: FEATURES_PIXEL_ART_OFFICE_LAYOUT_WITH_CUBICLES_MEETING_ROOM_AND_STAFF_CHARACTERS

## Knowledge Gaps
- **435 isolated node(s):** `Slide`, `subStyle`, `listStyle`, `listItemStyle`, `featureRowStyle` (+430 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **47 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **What is the exact relationship between `AI Office-1 OG Social Preview Image (og.png)` and `GODSENG AI COMPANY (갓생 AI Company) brand`?**
  _Edge tagged AMBIGUOUS (relation: FEATURES_PIXEL_ART_OFFICE_LAYOUT_WITH_CUBICLES_MEETING_ROOM_AND_STAFF_CHARACTERS) - confidence is low._
- **Why does `Company` connect `AI Company Simulation Core` to `Game Report/Integrations`, `Office World Rendering`, `Simulation Engine (sim.ts)`?**
  _High betweenness centrality (0.013) - this node is a cross-community bridge._
- **Why does `devDependencies` connect `Dev Dependencies (Cloudflare/Drizzle)` to `ai-office-1 Package Config`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **Why does `findPath()` connect `Pathfinding Algorithm` to `AI Company Simulation Core`, `Simulation Engine (sim.ts)`?**
  _High betweenness centrality (0.002) - this node is a cross-community bridge._
- **What connects `Slide`, `subStyle`, `listStyle` to the rest of the system?**
  _435 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Valley Beach Map Pages` be split into smaller, more focused modules?**
  _Cohesion score 0.05158324821246169 - nodes in this community are weakly interconnected._
- **Should `AI Company Simulation Core` be split into smaller, more focused modules?**
  _Cohesion score 0.11581920903954802 - nodes in this community are weakly interconnected._
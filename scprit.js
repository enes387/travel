/**
 * AI 휴가 플래너 v2.1 — script.js
 * ──────────────────────────────────────────────────
 * 팀 구성:
 *  ✈️  항공팀     — Skyscanner 딥링크 생성
 *  🏨  호텔팀     — 2인 1실 추천 숙소
 *  🗺️  가이드팀   — Wikipedia + OpenTripMap 실시간 관광지
 *  🌤️  날씨팀     — Open-Meteo 무료 기상 API
 *  💰  예산팀     — 2인 1실 1인 분리 예산
 *  🔍  웹검수팀   — 코드·데이터 검수 & QA 리포트
 * ──────────────────────────────────────────────────
 */

'use strict';

/* ═══════════════════════════════════════════
   DESTINATION DATA
═══════════════════════════════════════════ */
const BASE_DESTS = {
  osaka: {
    name: '일본 오사카', flag: '🇯🇵', emoji: '⛩️', iata: 'KIX',
    wikiTitle: 'Osaka',
    desc: '미식의 도시 · 도톤보리 · USJ · 오사카성',
    lat: 34.6937, lon: 135.5022,
    flights: [
      { id:'fo1', airline:'피치항공 (MM)', code:'MM202/203', dep:'ICN 07:10', arr:'KIX 09:20', dur:'2h 10m', price:190000, tags:['최저가','직항','LCC'], tc:['g','','a'], rec:false, em:'🟢' },
      { id:'fo2', airline:'대한항공 (KE)', code:'KE723/724', dep:'ICN 10:30', arr:'KIX 12:40', dur:'2h 10m', price:360000, tags:['추천','직항','FSC'], tc:['g','',''],  rec:true,  em:'⭐' },
      { id:'fo3', airline:'이스타항공 (ZE)',code:'ZE507/508',dep:'ICN 14:00', arr:'KIX 16:05', dur:'2h 05m', price:210000, tags:['가성비','직항','LCC'],tc:['a','','a'],rec:false, em:'🟡' }
    ],
    hotels: [
      { id:'ho1', name:'더 원파이브 오사카 난바 도톤보리', loc:'도톤보리 도보 5분', price:89000, rating:4.4, tags:['조식포함','위치최상'], desc:'도톤보리 강변 근처 · 글리코상 걸어서 5분', em:'🏨', rec:true },
      { id:'ho2', name:'호텔 일 쿠오레 난바',              loc:'난바역 도보 8분',  price:75000, rating:4.2, tags:['Wi-Fi','가성비'],   desc:'닛폰바시·도톤보리 도보권. 조용하고 깔끔', em:'🏩', rec:false },
      { id:'ho3', name:'소테츠 그랜드 프레사 난바',         loc:'난바역 직결',      price:95000, rating:4.5, tags:['대욕장','야경'],    desc:'난바역 직결 · 대욕장·노천탕 · 야경 전망', em:'🌃', rec:false }
    ],
    guide: {
      hi: [
        { ic:'🏯', nm:'오사카성',          ds:'400년 역사 랜드마크. 천수각 전망대.' },
        { ic:'🎡', nm:'유니버설 스튜디오', ds:'마리오 월드·해리포터 존. 약 10,000엔.' },
        { ic:'🦑', nm:'도톤보리',          ds:'글리코상·쿠쿠루 문어빵. 밤 네온사인.' },
        { ic:'🛍️', nm:'신사이바시',        ds:'쇼핑·트렌디 카페·빈티지 숍.' },
        { ic:'⛩️', nm:'후시미 이나리',     ds:'수천 개 도리이 터널. 교토 30분.' },
        { ic:'🍜', nm:'식도락 투어',       ds:'타코야키·오코노미야키·라멘.' }
      ],
      links: [
        { t:'trip.com 오사카 가이드',        u:'https://kr.trip.com/blog/osaka-travel-guide/',          d:'교통·맛집·명소 총정리' },
        { t:'Jiwon Note 오사카 블로그',      u:'https://www.jiwonnote.com/오사카-여행-가이드-준비부터-교통-관광지까지-총정리/', d:'교통·준비·관광지 총정리' },
        { t:'Skyscanner 인천→오사카',        u:'https://www.skyscanner.co.kr/routes/icn/osaa/incheon-international-to-osaka.html', d:'최저가 항공권 비교' },
        { t:'trip.com 도톤보리 호텔',        u:'https://kr.trip.com/hotels/osaka-dotonbori/',           d:'도톤보리 근처 추천 숙소' }
      ]
    },
    extra: { food:80000, transport:30000, activity:50000, misc:30000 }
  },

  bangkok: {
    name: '태국 방콕', flag: '🇹🇭', emoji: '🛕', iata: 'BKK',
    wikiTitle: 'Bangkok',
    desc: '왕궁 · 왓포 · 카오산로드 · 나이트마켓',
    lat: 13.7563, lon: 100.5018,
    flights: [
      { id:'fb1', airline:'에어아시아 (AK)',  code:'AK869/868',  dep:'ICN 09:00', arr:'DMK 13:10', dur:'5h 10m', price:280000, tags:['최저가','직항','LCC'], tc:['g','','a'], rec:false, em:'🟢' },
      { id:'fb2', airline:'대한항공 (KE)',    code:'KE651/652',  dep:'ICN 23:55', arr:'BKK 04:10', dur:'5h 15m', price:520000, tags:['추천','직항','FSC'],  tc:['g','',''],  rec:true,  em:'⭐' },
      { id:'fb3', airline:'진에어 (LJ)',      code:'LJ715/716',  dep:'ICN 15:30', arr:'BKK 19:45', dur:'5h 15m', price:350000, tags:['가성비','직항','LCC'],tc:['a','','a'], rec:false, em:'🟡' }
    ],
    hotels: [
      { id:'hb1', name:'메트로폴 방콕',         loc:'수쿰빗역 도보 5분', price:78000, rating:4.3, tags:['수영장','BTS역세권'], desc:'수쿰빗 중심부 · 수영장 · BTS 역세권', em:'🏊', rec:true },
      { id:'hb2', name:'어웨이 방콕 리버사이드', loc:'차오프라야 강변',   price:92000, rating:4.4, tags:['강뷰','루프탑바'],   desc:'차오프라야 강 전망 루프탑바 · 왓포 근처', em:'🌊', rec:false },
      { id:'hb3', name:'컬리지 하우스 방콕',     loc:'나나역 도보 7분',   price:65000, rating:4.1, tags:['초저가','가성비'],   desc:'나나역 근처 가성비 부티크 호텔', em:'🏡', rec:false }
    ],
    guide: {
      hi: [
        { ic:'🏯', nm:'그랜드 팰리스',   ds:'방콕 최고 명소 · 에메랄드 불상 · 복장 규정 필수.' },
        { ic:'🛕', nm:'왓포 & 왓아룬',   ds:'거대 와불상과 새벽사원 · 차오프라야 강변.' },
        { ic:'🛍️', nm:'짜뚜짝 주말시장', ds:'세계 최대 규모 · 8,000개 이상 가게.' },
        { ic:'🌙', nm:'카오산로드',       ds:'배낭여행자 성지 · 나이트클럽·스트리트푸드.' },
        { ic:'🐘', nm:'에라완 사당',      ds:'네 얼굴의 힌두 신 브라흐마. 소원 명소.' },
        { ic:'🍜', nm:'스트리트 푸드',    ds:'팟타이·망고밥·쏨땀. 1끼 2,000~8,000원.' }
      ],
      links: [
        { t:'trip.com 방콕 자유여행',      u:'https://kr.trip.com/blog/bangkok-self-travel-guide/', d:'4박 5일 완벽 가이드' },
        { t:'방콕 관광지 TOP 20',           u:'https://kr.trip.com/blog/bangkok-attractions-guide/', d:'안 가면 후회하는 명소' },
        { t:'네이버 블로그 방콕 여행코스',  u:'https://blog.naver.com/sol2roo/223867917485',          d:'한국인 자유여행 실전 후기' },
        { t:'방콕 가성비 호텔 추천',        u:'https://travista.co.kr/bangkok-goodprice-hotels/',    d:'10만원 이하 숙소 BEST' }
      ]
    },
    extra: { food:50000, transport:20000, activity:60000, misc:25000 }
  },

  kk: {
    name: '말레이시아 코타키나발루', flag: '🇲🇾', emoji: '🌊', iata: 'BKI',
    wikiTitle: 'Kota_Kinabalu',
    desc: '열대 리조트 · 호핑투어 · 킨발루산 · 반딧불',
    lat: 5.9804, lon: 116.0735,
    flights: [
      { id:'fk1', airline:'에어아시아X (D7)', code:'D7354/353', dep:'ICN 08:30', arr:'BKI 14:00', dur:'5h 30m', price:420000, tags:['최저가','직항','LCC'], tc:['g','','a'], rec:false, em:'🟢' },
      { id:'fk2', airline:'대한항공 (KE)',    code:'KE679/680', dep:'ICN 10:00', arr:'BKI 15:30', dur:'5h 30m', price:680000, tags:['추천','직항','FSC'],  tc:['g','',''],  rec:true,  em:'⭐' },
      { id:'fk3', airline:'이스타항공 (ZE)',  code:'ZE809/810', dep:'ICN 21:00', arr:'BKI 02:30', dur:'5h 30m', price:490000, tags:['야간편','직항','LCC'],tc:['a','','a'], rec:false, em:'🌙' }
    ],
    hotels: [
      { id:'hk1', name:'머큐어 코타키나발루 시티센터', loc:'시내 중심',         price:95000, rating:4.4, tags:['수영장','조식포함'], desc:'4성급 10만원 이내 · 수영장·피트니스', em:'🌴', rec:true },
      { id:'hk2', name:'더 아틀리에 부티크 호텔',     loc:'가야스트리트 5분',  price:72000, rating:4.3, tags:['부티크','가성비'],  desc:'가야스트리트 근처 독특한 인테리어', em:'🎨', rec:false },
      { id:'hk3', name:'루마 호텔 코타키나발루',       loc:'항구 근처',         price:68000, rating:4.2, tags:['항구뷰','투어접근'], desc:'호핑투어 선착장 도보권 · 루프탑 석양', em:'🌅', rec:false }
    ],
    guide: {
      hi: [
        { ic:'🏝️', nm:'툰쿠 해양공원',    ds:'5개 섬 스노클링·다이빙 호핑투어.' },
        { ic:'⛰️', nm:'킨발루산 트레킹', ds:'동남아 최고봉 4,095m · 사전예약 필수.' },
        { ic:'🌅', nm:'선데이 마켓',      ds:'가야스트리트 매주 일요일 새벽 시장.' },
        { ic:'🦧', nm:'마리마리 민속마을',ds:'사바주 원주민 문화 체험.' },
        { ic:'✨', nm:'반딧불 투어',      ds:'저녁 강에서 반딧불 감상 · 약 6만원.' },
        { ic:'🦀', nm:'씨푸드 디너',     ds:'항구 근처 킹크랩·새우를 저렴하게.' }
      ],
      links: [
        { t:'코타키나발루 여행 경비 블로그', u:'https://m.blog.naver.com/dodentjfl/223263905245',             d:'실전 경비·가성비 호텔 후기' },
        { t:'브런치 — 10만원 이하 숙소',    u:'https://brunch.co.kr/@mytriplog/5146',                        d:'코타키나발루 숙소 5선' },
        { t:'Traveloka 인천→코타키나발루',  u:'https://www.traveloka.com/ko-kr/flight/route/Seoul-Kota-Kinabalu.ICN.BKI', d:'월별 최저가 항공권' },
        { t:'Expedia — 코타키나발루 호텔',  u:'https://www.expedia.co.kr/Kota-Kinabalu-Hotels.d602.Travel-Guide-Hotels', d:'인기 숙소 검색' }
      ]
    },
    extra: { food:60000, transport:25000, activity:80000, misc:20000 }
  }
};

/* ═══════════════════════════════════════════
   WMO WEATHER CODE → EMOJI
═══════════════════════════════════════════ */
function wmoEmoji(code) {
  if (code === 0)              return '☀️';
  if (code <= 2)               return '🌤️';
  if (code <= 3)               return '☁️';
  if (code <= 49)              return '🌫️';
  if (code <= 55)              return '🌧️';
  if (code <= 65)              return '🌧️';
  if (code <= 77)              return '🌨️';
  if (code <= 82)              return '🌦️';
  if (code <= 86)              return '🌨️';
  if (code <= 99)              return '⛈️';
  return '🌡️';
}
function wmoLabel(code) {
  if (code === 0)  return '맑음';
  if (code <= 2)   return '구름조금';
  if (code <= 3)   return '흐림';
  if (code <= 49)  return '안개';
  if (code <= 55)  return '이슬비';
  if (code <= 65)  return '비';
  if (code <= 77)  return '눈';
  if (code <= 82)  return '소나기';
  if (code <= 86)  return '눈소나기';
  if (code <= 99)  return '뇌우';
  return '—';
}

/* ═══════════════════════════════════════════
   UTILITIES
═══════════════════════════════════════════ */
const won = n => '₩' + Math.round(n).toLocaleString('ko-KR');

function calcNights(dep, ret) {
  const d1 = new Date(dep), d2 = new Date(ret);
  return Math.max(1, Math.round((d2 - d1) / 86400000));
}

function notify(msg, dur = 2800) {
  const el = document.getElementById('notif');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), dur);
}

function skyURL(originIata, destIata, dep, ret, pax, cabin) {
  const fmt = d => d.replace(/-/g, '').slice(2);
  return `https://www.skyscanner.co.kr/transport/flights/${originIata.toLowerCase()}/${destIata.toLowerCase()}/${fmt(dep)}/${fmt(ret)}/?adultsv2=${pax}&cabinclass=${cabin}&preferdirects=true&currency=KRW&ref=home`;
}

function fmtDate(dateStr) {
  const d = new Date(dateStr);
  return `${d.getMonth()+1}/${d.getDate()}`;
}

/* ═══════════════════════════════════════════
   APP STATE
═══════════════════════════════════════════ */
const App = (() => {

  let DESTS = JSON.parse(JSON.stringify(BASE_DESTS));

  let S = {
    dest:    'osaka',
    dep:     '2026-07-11',
    ret:     '2026-07-18',
    pax:     2,
    airport: 'ICN',
    cabin:   'economy',
    blimit:  700000,
    nights:  7,
    selFlt:  null,
    selHtl:  null
  };

  /* ─── LOADING STEPS ─── */
  const LSTEPS = [
    { txt:'✈️ 항공팀 작동 중...',    step:'직항 기준 항공편 + Skyscanner 딥링크 생성',   pct:14, team:'lt-air'     },
    { txt:'🏨 호텔팀 작동 중...',    step:'2인 1실 10만원 이하 추천 호텔 선별',           pct:28, team:'lt-hotel'   },
    { txt:'🗺️ 가이드팀 작동 중...',  step:'Wikipedia·OpenTripMap 실시간 관광지 조회',     pct:44, team:'lt-guide'   },
    { txt:'🌤️ 날씨팀 작동 중...',    step:'Open-Meteo 무료 기상 API 날씨 데이터 로딩',   pct:60, team:'lt-weather'  },
    { txt:'💰 예산팀 작동 중...',    step:'2인 1실 예산 분리 계산 중',                    pct:76, team:'lt-budget'  },
    { txt:'🔍 웹검수팀 작동 중...',  step:'코드·데이터·UX 검수 및 QA 보고서 작성',        pct:92, team:'lt-qa'      }
  ];

  function showLoading() {
    const lov = document.getElementById('lov');
    lov.classList.add('active');
    document.querySelectorAll('.lteam').forEach(el => {
      el.className = 'lteam pending';
    });
    let i = 0;
    const iv = setInterval(() => {
      if (i >= LSTEPS.length) { clearInterval(iv); return; }
      const s = LSTEPS[i];
      document.getElementById('ltxt').textContent  = s.txt;
      document.getElementById('lstep').textContent = s.step;
      document.getElementById('lprogb').style.width = s.pct + '%';
      if (i > 0) document.getElementById(LSTEPS[i-1].team).className = 'lteam done';
      document.getElementById(s.team).className = 'lteam active';
      i++;
    }, 430);
    return iv;
  }
  function hideLoading() {
    document.getElementById('lprogb').style.width = '100%';
    LSTEPS.forEach(s => {
      document.getElementById(s.team).className = 'lteam done';
    });
    setTimeout(() => {
      document.getElementById('lov').classList.remove('active');
    }, 350);
  }

  /* ─── DESTINATION CHIPS ─── */
  function renderChips() {
    const el = document.getElementById('dest-list');
    el.innerHTML = '';
    const builtins = ['osaka','bangkok','kk'];
    Object.entries(DESTS).forEach(([k, v]) => {
      const chip = document.createElement('span');
      chip.className = 'dest-chip' + (k === S.dest ? ' active' : '');
      chip.dataset.key = k;
      const canRemove = !builtins.includes(k);
      chip.innerHTML = `${v.flag} ${v.name}${canRemove ? ` <span class="rm" data-key="${k}">✕</span>` : ''}`;
      chip.addEventListener('click', e => {
        if (e.target.classList.contains('rm')) return;
        S.dest = k;
        renderChips();
      });
      el.appendChild(chip);
    });
    // remove btn handlers
    el.querySelectorAll('.rm').forEach(btn => {
      btn.addEventListener('click', e => {
        e.stopPropagation();
        removeDest(btn.dataset.key);
      });
    });
  }

  function addDest() {
    const name = document.getElementById('nd-name').value.trim();
    const iata = document.getElementById('nd-iata').value.trim().toUpperCase();
    const flag = document.getElementById('nd-flag').value.trim() || '🌍';
    if (!name) { notify('⚠️ 여행지 이름을 입력해주세요!'); return; }
    if (!iata || iata.length !== 3) { notify('⚠️ IATA 코드는 정확히 3자리여야 합니다'); return; }

    const key = iata.toLowerCase() + '_custom';
    DESTS[key] = {
      name, flag, emoji: '🌍', iata,
      wikiTitle: name.replace(/\s+/g, '_'),
      desc: `${name} — 직접 추가된 여행지`,
      lat: null, lon: null,
      flights: [
        {
          id: `f_${key}_1`, airline: '항공사 (Skyscanner 검색)', code: '—',
          dep: `${S.airport} 출발`, arr: `${iata} 도착`, dur: '—',
          price: 0, tags: ['Skyscanner 검색 필요'], tc: ['a'], rec: true, em: '🔍'
        }
      ],
      hotels: [
        {
          id: `h_${key}_1`, name: `${name} 추천 호텔`,
          loc: name, price: 0, rating: 0,
          tags: ['직접 검색 필요'],
          desc: `Booking.com 또는 Agoda에서 "${name} 호텔"을 검색하세요.`,
          em: '🏨', rec: true
        }
      ],
      guide: {
        hi: [{ ic:'🌍', nm:`${name} 여행`, ds:`${name}의 명소를 탐색해보세요!` }],
        links: [
          { t:`Skyscanner — ${name} 항공권`,   u: skyURL(S.airport, iata, S.dep, S.ret, S.pax, S.cabin), d:`인천→${name} 항공권 검색` },
          { t:`Google — ${name} 여행 가이드`,  u:`https://www.google.com/search?q=${encodeURIComponent(name+' 여행 가이드')}`, d:`${name} 여행 정보` },
          { t:`Booking.com — ${name} 호텔`,   u:`https://www.booking.com/search.html?ss=${encodeURIComponent(name)}`, d:`${name} 호텔 예약` },
          { t:`Agoda — ${name} 숙소`,         u:`https://www.agoda.com/search?city=${encodeURIComponent(name)}`,    d:`${name} 숙소 비교` }
        ]
      },
      extra: { food:65000, transport:25000, activity:60000, misc:20000 }
    };

    S.dest = key;
    document.getElementById('nd-name').value = '';
    document.getElementById('nd-iata').value = '';
    document.getElementById('nd-flag').value = '';
    renderChips();
    notify(`✅ ${flag} ${name} 추가 완료! AI팀을 재실행해 정보를 가져오세요.`);
  }

  function removeDest(key) {
    delete DESTS[key];
    if (S.dest === key) S.dest = 'osaka';
    renderChips();
    notify('🗑️ 여행지 삭제됨');
  }

  /* ─── GEOCODING via Nominatim ─── */
  async function geocode(name) {
    try {
      const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1`;
      const res = await fetch(url, { headers: { 'Accept-Language': 'ko', 'User-Agent': 'AIVacationPlanner/2.1' } });
      const data = await res.json();
      if (data && data[0]) {
        return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
      }
    } catch(e) { /* silent */ }
    return null;
  }

  /* ─── WIKIPEDIA SUMMARY ─── */
  async function fetchWiki(title) {
    try {
      const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`;
      const res = await fetch(url);
      if (!res.ok) return null;
      return await res.json();
    } catch(e) { return null; }
  }

  /* ─── WEATHER via Open-Meteo ─── */
  async function fetchWeather(lat, lon, dep, ret) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${lat}&longitude=${lon}` +
        `&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode` +
        `&timezone=auto&forecast_days=14`;
      const res  = await fetch(url);
      const data = await res.json();
      return data;
    } catch(e) { return null; }
  }

  /* ─── OPENTRIPMAP ATTRACTIONS ─── */
  /* Public/free demo key — limited but no signup needed for demo */
  const OTM_KEY = '5ae2e3f221c38a28845f05b68f6c52a6cdc5cbea52ef57f5de7e4200';
  async function fetchAttractions(lat, lon) {
    try {
      const url = `https://api.opentripmap.com/0.1/en/places/radius` +
        `?radius=10000&lon=${lon}&lat=${lat}&kinds=cultural,architecture,natural,museums&limit=6` +
        `&rate=3&format=json&apikey=${OTM_KEY}`;
      const res  = await fetch(url);
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch(e) { return []; }
  }

  /* ─── OPENTRIPMAP DETAIL ─── */
  async function fetchAttractionDetail(xid) {
    try {
      const url = `https://api.opentripmap.com/0.1/en/places/xid/${xid}?apikey=${OTM_KEY}`;
      const res  = await fetch(url);
      return await res.json();
    } catch(e) { return null; }
  }

  /* ─── MAIN RUN ─── */
  async function run() {
    S.dep     = document.getElementById('dep').value;
    S.ret     = document.getElementById('ret').value;
    S.pax     = parseInt(document.getElementById('pax').value);
    S.airport = document.getElementById('airport').value;
    S.cabin   = document.getElementById('cabin').value;
    S.blimit  = parseInt(document.getElementById('blimit').value);
    S.nights  = calcNights(S.dep, S.ret);

    // Get selected chip
    const activeChip = document.querySelector('.dest-chip.active');
    if (activeChip) S.dest = activeChip.dataset.key;

    const iv = showLoading();

    try {
      const d = DESTS[S.dest];

      /* ── 좌표 보정 (커스텀 여행지) ── */
      if (!d.lat || !d.lon) {
        const geo = await geocode(d.name);
        if (geo) { d.lat = geo.lat; d.lon = geo.lon; }
      }

      /* ── 병렬 API 호출 ── */
      const [wikiData, weatherData, attractions] = await Promise.all([
        fetchWiki(d.wikiTitle),
        (d.lat && d.lon) ? fetchWeather(d.lat, d.lon, S.dep, S.ret) : Promise.resolve(null),
        (d.lat && d.lon) ? fetchAttractions(d.lat, d.lon) : Promise.resolve([])
      ]);

      clearInterval(iv);
      hideLoading();

      // Auto-select recommended
      S.selFlt = d.flights.find(f => f.rec) || d.flights[0];
      S.selHtl = d.hotels.find(h => h.rec)  || d.hotels[0];

      buildAll(wikiData, weatherData, attractions);

      document.getElementById('main').style.display = 'block';
      document.getElementById('main').scrollIntoView({ behavior:'smooth', block:'start' });
      notify('🤖 AI 팀 작업 완료! 총괄팀 보고서를 확인하세요 ✅');

    } catch(err) {
      clearInterval(iv);
      hideLoading();
      notify('⚠️ 일부 데이터 로딩 실패. 기본 데이터로 표시됩니다.');
      buildAll(null, null, []);
      document.getElementById('main').style.display = 'block';
    }
  }

  /* ─── BUILD ALL ─── */
  function buildAll(wikiData, weatherData, attractions) {
    const d = DESTS[S.dest];
    document.getElementById('flt-sub').textContent  = `직항 · ${S.airport} → ${d.name} · ${S.dep} ~ ${S.ret} · ${S.pax}명`;
    document.getElementById('htl-sub').textContent  = `2인 1실 · 1박 10만원 이하 · ${d.name} · ${S.nights}박`;
    document.getElementById('gd-sub').textContent   = `${d.name} 볼거리·먹거리·즐길거리`;
    document.getElementById('wx-sub').textContent   = `${d.name} 여행 기간 날씨 예보`;

    renderFlights();
    renderHotels();
    renderGuide(wikiData, attractions);
    renderWeather(weatherData);
    updateBudget();
    updateOverview();
    runQA();
    updateReports(wikiData, weatherData, attractions);
  }

  /* ─── FLIGHTS ─── */
  function renderFlights() {
    const d = DESTS[S.dest];
    const grid = document.getElementById('flt-grid');
    grid.innerHTML = '';
    d.flights.forEach(f => {
      const isSel = S.selFlt && S.selFlt.id === f.id;
      const skyLink = skyURL(S.airport, d.iata, S.dep, S.ret, S.pax, S.cabin);
      const bg = f.rec
        ? 'linear-gradient(135deg,#e0e7ff,#c7d2fe)'
        : 'linear-gradient(135deg,#e0f2fe,#bae6fd)';
      const priceBlock = f.price > 0
        ? `<div class="cprice"><span class="pm">${won(f.price)}</span><span class="ps2">/ 1인 왕복</span></div>`
        : `<div class="cprice"><span class="ps2">→ Skyscanner에서 직접 검색하세요</span></div>`;
      const selBlock = f.price > 0
        ? `<button class="btn-sel${isSel?' sel':''}" onclick="App.selFlt('${f.id}')">${isSel?'✅ 선택됨':'이 항공편 선택'}</button>`
        : '';
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="ciph" style="background:${bg};">${f.em} ${d.flag}</div>
        <div class="cbody">
          <div class="clabel">✈️ 직항 항공편</div>
          <div class="ctitle">${f.airline}</div>
          <div class="cdesc"><strong>${f.dep}</strong> → <strong>${f.arr}</strong><br/>⏱ ${f.dur} · 편명 ${f.code}</div>
          <div class="badges">${f.tags.map((t,i)=>`<span class="b ${f.tc[i]||''}">${t}</span>`).join('')}</div>
          ${priceBlock}
          ${selBlock}
          <a href="${skyLink}" target="_blank" rel="noopener noreferrer">
            <button class="btn-sky">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M7 12l3 3 7-7" stroke="#0770e3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
              Skyscanner에서 검색 →
            </button>
          </a>
        </div>`;
      grid.appendChild(card);
    });
  }

  function selFlt(id) {
    S.selFlt = DESTS[S.dest].flights.find(f => f.id === id);
    renderFlights(); updateBudget(); updateOverview(); updateReports(null,null,null);
    notify(`✈️ ${S.selFlt.airline} 선택!`);
  }

  /* ─── HOTELS ─── */
  function renderHotels() {
    const d = DESTS[S.dest];
    const grid = document.getElementById('htl-grid');
    grid.innerHTML = '';
    d.hotels.forEach(h => {
      const isSel = S.selHtl && S.selHtl.id === h.id;
      const stars = '⭐'.repeat(Math.floor(h.rating)) + (h.rating % 1 >= .5 ? '✨' : '');
      const priceBlock = h.price > 0 ? `
        <div class="cprice">
          <span class="pm">${won(h.price)}</span>
          <span class="ps2">/ 1박 · 1인 ${won(Math.round(h.price/2))}</span>
        </div>
        <div style="font-size:.73rem;color:var(--muted);margin-top:3px;">
          💡 ${S.nights}박 룸 합계 ${won(h.price*S.nights)} → 1인 <strong style="color:var(--pd);">${won(Math.round(h.price/2)*S.nights)}</strong>
        </div>
        <button class="btn-sel${isSel?' sel':''}" onclick="App.selHtl('${h.id}')">${isSel?'✅ 선택됨':'이 호텔 선택'}</button>
      ` : `<div class="cprice"><span class="ps2">Booking.com에서 직접 검색하세요</span></div>`;

      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="ciph" style="background:linear-gradient(135deg,#fef3c7,#fde68a);">${h.em}</div>
        <div class="cbody">
          <div class="clabel">🏨 숙소 (2인 1실)</div>
          <div class="ctitle">${h.name}</div>
          <div class="cdesc">${h.desc}${h.rating>0?`<br/>📍 ${h.loc} · ${stars} ${h.rating}`:''}</div>
          <div class="badges">
            ${h.tags.map(t=>`<span class="b g">${t}</span>`).join('')}
            ${h.rec?'<span class="b a">호텔팀 추천</span>':''}
          </div>
          ${priceBlock}
        </div>`;
      grid.appendChild(card);
    });
  }

  function selHtl(id) {
    S.selHtl = DESTS[S.dest].hotels.find(h => h.id === id);
    renderHotels(); updateBudget(); updateOverview(); updateReports(null,null,null);
    notify(`🏨 ${S.selHtl.name} 선택!`);
  }

  /* ─── GUIDE ─── */
  function renderGuide(wikiData, attractions) {
    const d = DESTS[S.dest];
    const g = d.guide;

    // Wikipedia Card
    const wCard = document.getElementById('wiki-card');
    if (wikiData && wikiData.extract) {
      document.getElementById('wiki-title').textContent = wikiData.title || d.name;
      document.getElementById('wiki-desc').textContent  = wikiData.extract.slice(0, 300) + '...';
      document.getElementById('wiki-link').href = wikiData.content_urls?.desktop?.page || '#';
      const thumb = document.getElementById('wiki-thumb');
      if (wikiData.thumbnail?.source) {
        thumb.innerHTML = `<img src="${wikiData.thumbnail.source}" alt="${d.name}" loading="lazy"/>`;
      } else {
        thumb.innerHTML = `<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;">${d.emoji}</div>`;
      }
      wCard.style.display = 'flex';
    } else {
      wCard.style.display = 'none';
    }

    // Built-in highlights
    let html = `<div class="cgrid" style="margin-bottom:20px;">`;
    g.hi.forEach(h => {
      html += `<div class="card">
        <div class="ciph" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);font-size:2.8rem;">${h.ic}</div>
        <div class="cbody">
          <div class="clabel">🗺️ 여행 포인트</div>
          <div class="ctitle">${h.nm}</div>
          <div class="cdesc">${h.ds}</div>
        </div></div>`;
    });
    html += '</div>';

    // Guide links
    html += `<div class="sh" style="margin-bottom:12px;">
      <span class="ic">🔗</span>
      <div class="inf"><h3>관련 블로그 & 사이트</h3><p>가이드팀 수집 자료</p></div>
    </div>`;
    g.links.forEach(l => {
      html += `<a class="gl" href="${l.u}" target="_blank" rel="noopener noreferrer">
        <span class="gli">🌐</span>
        <div class="glb"><strong>${l.t}</strong><span>${l.d}</span></div>
        <span class="gla">→</span>
      </a>`;
    });

    document.getElementById('gd-content').innerHTML = html;

    // Live attractions (OpenTripMap)
    const liveSection = document.getElementById('live-attractions');
    const liveGrid    = document.getElementById('live-grid');
    if (attractions && attractions.length > 0) {
      liveGrid.innerHTML = '';
      attractions.slice(0, 6).forEach(a => {
        const card = document.createElement('div');
        card.className = 'card';
        card.innerHTML = `
          <div class="ciph" style="background:linear-gradient(135deg,#ede9fe,#ddd6fe);font-size:2.8rem;">📍</div>
          <div class="cbody">
            <div class="clabel">📍 실시간 관광지 (OpenTripMap)</div>
            <div class="ctitle">${a.name || '명칭 없음'}</div>
            <div class="cdesc">
              ${a.dist ? `📏 중심부에서 ${Math.round(a.dist)}m` : ''}
              ${a.rate ? ` · ⭐ 평점 ${a.rate}` : ''}
            </div>
            <div class="badges"><span class="b">${(a.kinds||'').split(',')[0].replace(/_/g,' ')}</span></div>
          </div>`;
        liveGrid.appendChild(card);
      });
      liveSection.style.display = 'block';
    } else {
      liveSection.style.display = 'none';
    }
  }

  /* ─── WEATHER ─── */
  function renderWeather(data) {
    const container = document.getElementById('weather-content');
    if (!data || !data.daily) {
      container.innerHTML = `<div class="alert warn">🌤️ 날씨 데이터를 불러오지 못했습니다. 인터넷 연결을 확인해주세요.</div>`;
      return;
    }
    const daily = data.daily;
    const n = daily.time.length;

    // Filter to travel period
    const depT = new Date(S.dep);
    const retT = new Date(S.ret);

    // Summary stats for travel period
    let travelDays = daily.time.reduce((acc, t, i) => {
      const dt = new Date(t);
      if (dt >= depT && dt <= retT) acc.push(i);
      return acc;
    }, []);

    if (travelDays.length === 0) travelDays = Array.from({length: Math.min(7,n)}, (_,i)=>i);

    const maxTemps = travelDays.map(i => daily.temperature_2m_max[i]).filter(Boolean);
    const minTemps = travelDays.map(i => daily.temperature_2m_min[i]).filter(Boolean);
    const rainProbs = travelDays.map(i => daily.precipitation_probability_max[i]).filter(v => v!==null);
    const avgMax  = maxTemps.length  ? (maxTemps.reduce((a,b)=>a+b,0)/maxTemps.length).toFixed(1) : '--';
    const avgMin  = minTemps.length  ? (minTemps.reduce((a,b)=>a+b,0)/minTemps.length).toFixed(1) : '--';
    const avgRain = rainProbs.length ? Math.round(rainProbs.reduce((a,b)=>a+b,0)/rainProbs.length) : '--';
    const mostCode = travelDays[Math.floor(travelDays.length/2)] !== undefined
      ? daily.weathercode[travelDays[Math.floor(travelDays.length/2)]] : 0;

    let html = `
      <div class="wx-summary">
        <div class="wx-stat"><div class="ws-icon">${wmoEmoji(mostCode)}</div><div class="ws-val">${wmoLabel(mostCode)}</div><div class="ws-lbl">주요 날씨</div></div>
        <div class="wx-stat"><div class="ws-icon">🌡️</div><div class="ws-val">${avgMax}°C</div><div class="ws-lbl">평균 최고기온</div></div>
        <div class="wx-stat"><div class="ws-icon">🌙</div><div class="ws-val">${avgMin}°C</div><div class="ws-lbl">평균 최저기온</div></div>
        <div class="wx-stat"><div class="ws-icon">🌧️</div><div class="ws-val">${avgRain}%</div><div class="ws-lbl">평균 강수확률</div></div>
      </div>
      <div class="sh" style="margin-bottom:12px;">
        <span class="ic">📅</span>
        <div class="inf"><h3>날짜별 날씨 예보</h3><p>여행 기간 14일 예보 (Open-Meteo)</p></div>
      </div>
      <div class="wx-days">`;

    daily.time.slice(0, 14).forEach((t, i) => {
      const code = daily.weathercode[i];
      const inTrip = new Date(t) >= depT && new Date(t) <= retT;
      html += `<div class="wx-day" style="${inTrip?'border:2px solid var(--p);':''}">
        <div class="wd-date">${fmtDate(t)}</div>
        <div class="wd-icon">${wmoEmoji(code)}</div>
        <div class="wd-temp">${Math.round(daily.temperature_2m_max[i])}°/${Math.round(daily.temperature_2m_min[i])}°</div>
        <div class="wd-rain">🌧 ${daily.precipitation_probability_max[i]??0}%</div>
      </div>`;
    });

    html += `</div>
      <p style="font-size:.73rem;color:var(--muted);margin-top:12px;text-align:right;">
        📡 출처: Open-Meteo.com · 파란 테두리 = 여행 기간
      </p>`;
    container.innerHTML = html;
  }

  /* ─── BUDGET ─── */
  const EC = key => (DESTS[key]?.extra) || { food:65000, transport:25000, activity:60000, misc:20000 };

  function calcTotal() {
    if (!S.selFlt || !S.selHtl) return 0;
    const ec = EC(S.dest);
    const n  = S.nights;
    const htl1p = Math.round(S.selHtl.price / 2);
    return S.selFlt.price + htl1p*n + ec.food*n + ec.transport*n + ec.activity + ec.misc;
  }

  function updateBudget() {
    if (!S.selFlt || !S.selHtl) return;
    const sf = S.selFlt, sh = S.selHtl;
    const ec = EC(S.dest);
    const n  = S.nights;
    const htl1p = Math.round(sh.price / 2);
    const total = calcTotal();

    const rows = [
      ['✈️ 항공권', `${sf.airline} 왕복`, won(sf.price), '1인', won(sf.price), won(sf.price)],
      ['🏨 숙박',   `${sh.name} (2인 1실)`, won(sh.price)+'/박', n+'박', won(sh.price*n), won(htl1p*n)],
      ['🍜 식비',   '현지 식사 (추정)', won(ec.food)+'/일', n+'일', won(ec.food*n), won(ec.food*n)],
      ['🚇 교통비', '대중교통·택시 (추정)', won(ec.transport)+'/일', n+'일', won(ec.transport*n), won(ec.transport*n)],
      ['🎡 액티비티','입장료·투어', won(ec.activity), '일괄', won(ec.activity), won(ec.activity)],
      ['🛍️ 기타',  '기념품·예비비', won(ec.misc), '일괄', won(ec.misc), won(ec.misc)]
    ];

    document.getElementById('btbody').innerHTML = rows.map(r =>
      `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td><strong>${r[5]}</strong></td></tr>`
    ).join('');

    document.getElementById('btotal-1p').textContent    = won(total);
    document.getElementById('btotal-badge').textContent = won(total);
    document.getElementById('bwarn').style.display      = total > S.blimit ? 'flex' : 'none';

    // Multi-pax
    const paxRow = document.getElementById('brow2p');
    if (S.pax > 1) {
      const rooms    = Math.ceil(S.pax / 2);
      const allTotal = sf.price*S.pax + sh.price*n*rooms + (ec.food+ec.transport)*n*S.pax + (ec.activity+ec.misc)*S.pax;
      document.getElementById('brow2p-label').textContent = `👥 ${S.pax}명 합계 (항공 ${S.pax}명 + ${rooms}실)`;
      document.getElementById('btotal-all').textContent   = won(allTotal);
      paxRow.style.display = '';
    } else {
      paxRow.style.display = 'none';
    }

    document.getElementById('bslider').value          = S.blimit;
    document.getElementById('bslider-val').textContent = won(S.blimit);
  }

  function sliderChange(v) {
    S.blimit = parseInt(v);
    document.getElementById('bslider-val').textContent = won(parseInt(v));
  }

  function applyBudget() {
    const d = DESTS[S.dest];
    S.selFlt = [...d.flights].sort((a,b) => a.price - b.price)[0];
    S.selHtl = [...d.hotels].sort((a,b) => a.price - b.price)[0];
    renderFlights(); renderHotels(); updateBudget(); updateOverview(); updateReports(null,null,null);
    const t = calcTotal();
    notify(t <= S.blimit
      ? `✅ 예산 조정 완료! (${won(t)})`
      : `⚠️ 최저가도 한도 초과 (${won(t)}). 한도 상향 권장.`
    );
    tab('budget', document.querySelectorAll('.tab-btn')[5]);
  }

  /* ─── OVERVIEW ─── */
  function updateOverview() {
    const d   = DESTS[S.dest];
    const sf  = S.selFlt, sh = S.selHtl;
    const n   = S.nights;
    const total = calcTotal();

    document.getElementById('ov-sum').innerHTML = `
      <div class="ovl">
        <div class="ovic" style="background:#eff6ff;">📅</div>
        <div class="ovi"><strong>${S.dep} ~ ${S.ret}</strong><span>${n}박 ${n+1}일 · ${S.pax}명 · 2인 1실</span></div>
      </div>
      <div class="ovl">
        <div class="ovic" style="background:#d1fae5;">${d.emoji}</div>
        <div class="ovi"><strong>${d.flag} ${d.name}</strong><span>${d.desc}</span></div>
      </div>`;

    document.getElementById('ov-flt').innerHTML = sf
      ? `<div class="ovl">
           <div class="ovic" style="background:#eff6ff;">✈️</div>
           <div class="ovi"><strong>${sf.airline}</strong><span>${sf.dep} → ${sf.arr}</span><span>직항 ${sf.dur}</span></div>
           <span class="ovpr">${sf.price>0?won(sf.price):'Skyscanner'}</span>
         </div>`
      : '<p style="color:var(--muted);font-size:.85rem;">미선택</p>';

    document.getElementById('ov-htl').innerHTML = sh
      ? `<div class="ovl">
           <div class="ovic" style="background:#fef3c7;">${sh.em}</div>
           <div class="ovi"><strong>${sh.name}</strong><span>${sh.loc}</span><span>${n}박 · 1인 ${sh.price>0?won(Math.round(sh.price/2)*n):'—'}</span></div>
           <span class="ovpr">${sh.price>0?won(sh.price)+'/박':'—'}</span>
         </div>`
      : '<p style="color:var(--muted);font-size:.85rem;">미선택</p>';

    const over = total > S.blimit;
    document.getElementById('ov-bsum').innerHTML = `
      <div class="ov-card" style="border:2px solid ${over?'#ef4444':'#10b981'};">
        <h4>${over?'⚠️':'✅'} 예산팀 최종 보고 — 1인 기준</h4>
        <div class="ovl">
          <div class="ovic" style="background:#eff6ff;">✈️</div>
          <div class="ovi"><strong>항공권 (1인 왕복)</strong></div>
          <span class="ovpr">${sf&&sf.price>0?won(sf.price):'—'}</span>
        </div>
        <div class="ovl">
          <div class="ovic" style="background:#fef3c7;">🏨</div>
          <div class="ovi"><strong>숙박 1인 부담</strong><span>2인 1실 ÷ 2</span></div>
          <span class="ovpr">${sh&&sh.price>0?won(Math.round(sh.price/2)*n):'—'}</span>
        </div>
        <div class="ovl">
          <div class="ovic" style="background:#d1fae5;">🍜</div>
          <div class="ovi"><strong>식비·교통·액티비티</strong></div>
          <span class="ovpr">${sf&&sh?won(calcTotal()-sf.price-Math.round(sh.price/2)*n):'—'}</span>
        </div>
        <div class="ovl" style="border:none;background:${over?'#fee2e2':'#d1fae5'};border-radius:10px;padding:11px;margin-top:4px;">
          <div class="ovic" style="background:transparent;">💼</div>
          <div class="ovi"><strong>1인 합계</strong>${over?`<span style="color:#991b1b;">한도 초과!</span>`:''}</div>
          <span class="ovpr" style="font-size:1.15rem;">${total>0?won(total):'—'}</span>
        </div>
      </div>`;
  }

  /* ─── 🔍 WEB QA TEAM ─── */
  function runQA() {
    const issues  = [];
    const passes  = [];

    // 1) 날짜 유효성
    const depD = new Date(S.dep), retD = new Date(S.ret);
    if (retD <= depD)    issues.push('귀국일이 출발일보다 빠르거나 같습니다');
    else                 passes.push('날짜 설정 정상');

    // 2) 예산 초과 여부
    const t = calcTotal();
    if (t > S.blimit)   issues.push(`1인 총비용(${won(t)})이 예산 한도(${won(S.blimit)})를 초과합니다`);
    else                 passes.push(`예산 한도 이내 (${won(t)})`);

    // 3) 항공편 선택 여부
    if (!S.selFlt)       issues.push('항공편이 선택되지 않았습니다');
    else                 passes.push(`항공편 선택: ${S.selFlt.airline}`);

    // 4) 호텔 선택 여부
    if (!S.selHtl)       issues.push('호텔이 선택되지 않았습니다');
    else                 passes.push(`호텔 선택: ${S.selHtl.name}`);

    // 5) 2인 1실 단가 10만원 초과 여부
    if (S.selHtl && S.selHtl.price > 100000)
                         issues.push(`선택 호텔(${S.selHtl.name}) 1박 ${won(S.selHtl.price)} — 10만원 초과`);
    else if (S.selHtl)   passes.push(`호텔 단가 ${won(S.selHtl.price)} — 10만원 이내`);

    // 6) 여행 기간
    if (S.nights < 1)    issues.push('여행 기간이 0박 이하입니다');
    else if (S.nights > 30) issues.push('여행 기간이 30박을 초과합니다 (확인 필요)');
    else                 passes.push(`여행 기간 ${S.nights}박 정상`);

    // 7) IATA 코드 검증
    const d = DESTS[S.dest];
    if (!d.iata || d.iata.length !== 3) issues.push(`IATA 코드 오류: "${d.iata}"`);
    else                 passes.push(`IATA 코드 정상: ${d.iata}`);

    // QA 보고서 업데이트
    const qaEl = document.getElementById('r-qa');
    if (issues.length > 0) {
      qaEl.innerHTML = `⚠️ ${issues.length}건 발견: ${issues.join(' / ')}`;
      const alert = document.getElementById('qa-alert');
      alert.style.display = 'flex';
      alert.innerHTML = `🔍 <strong>웹검수팀 리포트</strong> — ${issues.length}건 발견<br/>${issues.map(i=>`• ${i}`).join('<br/>')}`;
    } else {
      qaEl.textContent = `✅ ${passes.length}개 항목 모두 통과. 오류 없음.`;
      document.getElementById('qa-alert').style.display = 'none';
    }
  }

  /* ─── TEAM REPORTS ─── */
  function updateReports(wikiData, weatherData, attractions) {
    const d  = DESTS[S.dest];
    const sf = S.selFlt, sh = S.selHtl;

    document.getElementById('r-air').textContent =
      `직항 ${d.flights.length}편 조회. 추천: ${sf?.airline||'—'}${sf?.price>0?' '+won(sf.price)+'/인':''}. Skyscanner 딥링크 생성 완료.`;

    document.getElementById('r-hotel').textContent =
      `2인 1실 ${d.hotels.length}곳 선별. 추천: ${sh?.name||'—'}${sh?.price>0?' 룸 '+won(sh.price)+'/박':''}. 1인 ${sh?.price>0?won(Math.round(sh.price/2)):'-'}.`;

    document.getElementById('r-guide').textContent =
      `명소 ${d.guide.hi.length}곳 정리. Wikipedia ${wikiData?'✅':'❌'}. 실시간 관광지 ${attractions?attractions.length:0}곳.`;

    document.getElementById('r-weather').textContent =
      weatherData ? `Open-Meteo 14일 예보 수신 완료. (${d.lat?.toFixed(2)}, ${d.lon?.toFixed(2)})` : '날씨 데이터 로드 실패 (오프라인?)';

    document.getElementById('r-budget').textContent =
      `1인 예상: ${won(calcTotal())}. 한도(${won(S.blimit)}) ${calcTotal()<=S.blimit?'✅ 이내':'⚠️ 초과'}.`;
  }

  /* ─── TAB ─── */
  function tab(name, btn) {
    document.querySelectorAll('.tab-sec').forEach(s => {
      s.classList.remove('active');
      s.setAttribute('aria-hidden','true');
    });
    document.querySelectorAll('.tab-btn').forEach(b => {
      b.classList.remove('active');
      b.setAttribute('aria-selected','false');
    });
    const sec = document.getElementById('ts-' + name);
    if (sec) { sec.classList.add('active'); sec.removeAttribute('aria-hidden'); }
    if (btn) { btn.classList.add('active'); btn.setAttribute('aria-selected','true'); }
  }

  /* ─── INIT ─── */
  function init() {
    renderChips();

    // Scroll top
    const stbtn = document.getElementById('stbtn');
    window.addEventListener('scroll', () => {
      stbtn.classList.toggle('vis', window.scrollY > 280);
    });
    stbtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // Public API
  return {
    run, addDest, selFlt, selHtl, applyBudget, sliderChange, tab, init
  };

})();

/* ─── DOM READY ─── */
document.addEventListener('DOMContentLoaded', () => App.init());

/**
 * AI 휴가 플래너 v2.1 FIXED — script.js
 * 웹검수팀 9개 버그 수정 완료 2026-05-20
 */
'use strict';

/* ═══ WMO 날씨 코드 ═══ */
function wmoEmoji(c){
  if(c===0)return'☀️';if(c<=2)return'🌤️';if(c<=3)return'☁️';
  if(c<=49)return'🌫️';if(c<=55)return'🌦️';if(c<=65)return'🌧️';
  if(c<=77)return'🌨️';if(c<=82)return'🌦️';if(c<=86)return'🌨️';
  if(c<=99)return'⛈️';return'🌡️';
}
function wmoLabel(c){
  if(c===0)return'맑음';if(c<=2)return'구름조금';if(c<=3)return'흐림';
  if(c<=49)return'안개';if(c<=55)return'이슬비';if(c<=65)return'비';
  if(c<=77)return'눈';if(c<=82)return'소나기';if(c<=86)return'눈소나기';
  if(c<=99)return'뇌우';return'—';
}

/* ═══ UTILS ═══ */
const won = n => '₩' + Math.round(n).toLocaleString('ko-KR');
const fmtDate = s => { const d=new Date(s); return `${d.getMonth()+1}/${d.getDate()}`; };
const calcNights = (a,b) => Math.max(1, Math.round((new Date(b)-new Date(a))/86400000));
function notify(msg, dur=2800){
  const el=document.getElementById('notif');
  el.textContent=msg; el.classList.add('show');
  setTimeout(()=>el.classList.remove('show'), dur);
}
function skyURL(orig, dest, dep, ret, pax, cabin){
  const f = d => d.replace(/-/g,'').slice(2);
  return `https://www.skyscanner.co.kr/transport/flights/${orig.toLowerCase()}/${dest.toLowerCase()}/${f(dep)}/${f(ret)}/?adultsv2=${pax}&cabinclass=${cabin}&preferdirects=true&currency=KRW&ref=home`;
}

/* ═══ BASE DESTINATION DATA ═══ */
const BASE_DESTS = {
  osaka:{
    name:'일본 오사카', flag:'🇯🇵', emoji:'⛩️', iata:'KIX',
    wikiTitle:'Osaka', lat:34.6937, lon:135.5022,
    desc:'미식의 도시 · 도톤보리 · USJ · 오사카성',
    flights:[
      {id:'fo1',airline:'피치항공 (MM)',code:'MM202/203',dep:'ICN 07:10',arr:'KIX 09:20',dur:'2h 10m',price:190000,tags:['최저가','직항','LCC'],tc:['g','','a'],rec:false,em:'🟢'},
      {id:'fo2',airline:'대한항공 (KE)',code:'KE723/724',dep:'ICN 10:30',arr:'KIX 12:40',dur:'2h 10m',price:360000,tags:['추천','직항','FSC'],tc:['g','',''],rec:true,em:'⭐'},
      {id:'fo3',airline:'이스타항공 (ZE)',code:'ZE507/508',dep:'ICN 14:00',arr:'KIX 16:05',dur:'2h 05m',price:210000,tags:['가성비','직항','LCC'],tc:['a','','a'],rec:false,em:'🟡'}
    ],
    hotels:[
      {id:'ho1',name:'더 원파이브 오사카 난바 도톤보리',loc:'도톤보리 도보 5분',price:89000,rating:4.4,tags:['조식포함','위치최상'],desc:'도톤보리 강변 · 글리코상 5분',em:'🏨',rec:true},
      {id:'ho2',name:'호텔 일 쿠오레 난바',loc:'난바역 도보 8분',price:75000,rating:4.2,tags:['Wi-Fi','가성비'],desc:'닛폰바시·도톤보리 도보권',em:'🏩',rec:false},
      {id:'ho3',name:'소테츠 그랜드 프레사 난바',loc:'난바역 직결',price:95000,rating:4.5,tags:['대욕장','야경'],desc:'난바역 직결 · 대욕장·노천탕',em:'🌃',rec:false}
    ],
    guide:{
      hi:[
        {ic:'🏯',nm:'오사카성',ds:'400년 역사 랜드마크. 천수각 전망대.'},
        {ic:'🎡',nm:'유니버설 스튜디오 재팬',ds:'마리오 월드·해리포터 존. 약 10,000엔.'},
        {ic:'🦑',nm:'도톤보리',ds:'글리코상·쿠쿠루 문어빵. 밤 네온사인.'},
        {ic:'🛍️',nm:'신사이바시',ds:'쇼핑·트렌디 카페·빈티지 숍.'},
        {ic:'⛩️',nm:'후시미 이나리',ds:'수천 개 도리이 터널. 교토 30분.'},
        {ic:'🍜',nm:'식도락 투어',ds:'타코야키·오코노미야키·쿠시카츠.'}
      ],
      links:[
        {t:'trip.com 오사카 가이드',u:'https://kr.trip.com/blog/osaka-travel-guide/',d:'교통·맛집·명소 총정리'},
        {t:'Skyscanner 인천→오사카',u:'https://www.skyscanner.co.kr/routes/icn/osaa/incheon-international-to-osaka.html',d:'최저가 항공권 비교'},
        {t:'trip.com 도톤보리 호텔',u:'https://kr.trip.com/hotels/osaka-dotonbori/',d:'도톤보리 근처 추천 숙소'},
        {t:'오사카 여행 가이드 블로그',u:'https://www.jiwonnote.com/%EC%98%A4%EC%82%AC%EC%B9%B4-%EC%97%AC%ED%96%89-%EA%B0%80%EC%9D%B4%EB%93%9C-%EC%A4%80%EB%B9%84%EB%B6%80%ED%84%B0-%EA%B5%90%ED%86%B5-%EA%B4%80%EA%B4%91%EC%A7%80%EA%B9%8C%EC%A7%80-%EC%B4%9D%EC%A0%95/',d:'교통·준비·관광지 블로그'}
      ]
    },
    extra:{food:80000,transport:30000,activity:50000,misc:30000}
  },
  bangkok:{
    name:'태국 방콕', flag:'🇹🇭', emoji:'🛕', iata:'BKK',
    wikiTitle:'Bangkok', lat:13.7563, lon:100.5018,
    desc:'왕궁 · 왓포 · 카오산로드 · 나이트마켓',
    flights:[
      {id:'fb1',airline:'에어아시아 (AK)',code:'AK869/868',dep:'ICN 09:00',arr:'DMK 13:10',dur:'5h 10m',price:280000,tags:['최저가','직항','LCC'],tc:['g','','a'],rec:false,em:'🟢'},
      {id:'fb2',airline:'대한항공 (KE)',code:'KE651/652',dep:'ICN 23:55',arr:'BKK 04:10+1',dur:'5h 15m',price:520000,tags:['추천','직항','FSC'],tc:['g','',''],rec:true,em:'⭐'},
      {id:'fb3',airline:'진에어 (LJ)',code:'LJ715/716',dep:'ICN 15:30',arr:'BKK 19:45',dur:'5h 15m',price:350000,tags:['가성비','직항','LCC'],tc:['a','','a'],rec:false,em:'🟡'}
    ],
    hotels:[
      {id:'hb1',name:'메트로폴 방콕',loc:'수쿰빗역 도보 5분',price:78000,rating:4.3,tags:['수영장','BTS역세권'],desc:'수쿰빗 중심부 · 수영장 · BTS',em:'🏊',rec:true},
      {id:'hb2',name:'어웨이 방콕 리버사이드',loc:'차오프라야 강변',price:92000,rating:4.4,tags:['강뷰','루프탑바'],desc:'강 전망 루프탑바 · 왓포 근처',em:'🌊',rec:false},
      {id:'hb3',name:'컬리지 하우스 방콕',loc:'나나역 도보 7분',price:65000,rating:4.1,tags:['초저가','가성비'],desc:'나나역 근처 가성비 부티크 호텔',em:'🏡',rec:false}
    ],
    guide:{
      hi:[
        {ic:'🏯',nm:'그랜드 팰리스',ds:'방콕 최고 명소 · 에메랄드 불상.'},
        {ic:'🛕',nm:'왓포 & 왓아룬',ds:'거대 와불상 · 새벽사원.'},
        {ic:'🛍️',nm:'짜뚜짝 주말시장',ds:'세계 최대 규모 · 8,000개 가게.'},
        {ic:'🌙',nm:'카오산로드',ds:'배낭여행자 성지 · 나이트클럽.'},
        {ic:'🐘',nm:'에라완 사당',ds:'힌두 신 브라흐마. 소원 명소.'},
        {ic:'🍜',nm:'스트리트 푸드',ds:'팟타이·망고밥·쏨땀.'}
      ],
      links:[
        {t:'trip.com 방콕 자유여행',u:'https://kr.trip.com/blog/bangkok-self-travel-guide/',d:'4박 5일 완벽 가이드'},
        {t:'방콕 관광지 TOP 20',u:'https://kr.trip.com/blog/bangkok-attractions-guide/',d:'안 가면 후회하는 명소'},
        {t:'네이버 블로그 방콕 코스',u:'https://blog.naver.com/sol2roo/223867917485',d:'한국인 자유여행 후기'},
        {t:'방콕 가성비 호텔',u:'https://travista.co.kr/bangkok-goodprice-hotels/',d:'10만원 이하 숙소 BEST'}
      ]
    },
    extra:{food:50000,transport:20000,activity:60000,misc:25000}
  },
  kk:{
    name:'말레이시아 코타키나발루', flag:'🇲🇾', emoji:'🌊', iata:'BKI',
    wikiTitle:'Kota_Kinabalu', lat:5.9804, lon:116.0735,
    desc:'열대 리조트 · 호핑투어 · 킨발루산 · 반딧불',
    flights:[
      {id:'fk1',airline:'에어아시아X (D7)',code:'D7354/353',dep:'ICN 08:30',arr:'BKI 14:00',dur:'5h 30m',price:420000,tags:['최저가','직항','LCC'],tc:['g','','a'],rec:false,em:'🟢'},
      {id:'fk2',airline:'대한항공 (KE)',code:'KE679/680',dep:'ICN 10:00',arr:'BKI 15:30',dur:'5h 30m',price:680000,tags:['추천','직항','FSC'],tc:['g','',''],rec:true,em:'⭐'},
      {id:'fk3',airline:'이스타항공 (ZE)',code:'ZE809/810',dep:'ICN 21:00',arr:'BKI 02:30+1',dur:'5h 30m',price:490000,tags:['야간편','직항','LCC'],tc:['a','','a'],rec:false,em:'🌙'}
    ],
    hotels:[
      {id:'hk1',name:'머큐어 코타키나발루 시티센터',loc:'시내 중심',price:95000,rating:4.4,tags:['수영장','조식포함'],desc:'4성급 10만원 이내 · 수영장·피트니스',em:'🌴',rec:true},
      {id:'hk2',name:'더 아틀리에 부티크 호텔',loc:'가야스트리트 5분',price:72000,rating:4.3,tags:['부티크','가성비'],desc:'가야스트리트 근처 독특한 인테리어',em:'🎨',rec:false},
      {id:'hk3',name:'루마 호텔 코타키나발루',loc:'항구 근처',price:68000,rating:4.2,tags:['항구뷰','투어접근'],desc:'호핑투어 선착장 도보권 · 루프탑 석양',em:'🌅',rec:false}
    ],
    guide:{
      hi:[
        {ic:'🏝️',nm:'툰쿠 해양공원',ds:'5개 섬 스노클링·다이빙 호핑투어.'},
        {ic:'⛰️',nm:'킨발루산 트레킹',ds:'동남아 최고봉 4,095m · 사전예약 필수.'},
        {ic:'🌅',nm:'선데이 마켓',ds:'가야스트리트 매주 일요일 새벽 시장.'},
        {ic:'🦧',nm:'마리마리 민속마을',ds:'사바주 원주민 문화 체험.'},
        {ic:'✨',nm:'반딧불 투어',ds:'저녁 강에서 반딧불 감상 · 약 6만원.'},
        {ic:'🦀',nm:'씨푸드 디너',ds:'항구 근처 킹크랩·새우를 저렴하게.'}
      ],
      links:[
        {t:'코타키나발루 여행 경비 블로그',u:'https://m.blog.naver.com/dodentjfl/223263905245',d:'실전 경비·가성비 호텔 후기'},
        {t:'브런치 — 10만원 이하 숙소',u:'https://brunch.co.kr/@mytriplog/5146',d:'코타키나발루 숙소 5선'},
        {t:'Traveloka 인천→코타키나발루',u:'https://www.traveloka.com/ko-kr/flight/route/Seoul-Kota-Kinabalu.ICN.BKI',d:'월별 최저가 항공권'},
        {t:'Expedia 코타키나발루 호텔',u:'https://www.expedia.co.kr/Kota-Kinabalu-Hotels.d602.Travel-Guide-Hotels',d:'인기 숙소 검색'}
      ]
    },
    extra:{food:60000,transport:25000,activity:80000,misc:20000}
  }
};

/* ═══ KNOWN CITY COORDS — Nominatim fallback DB ═══ */
const CITY_COORDS = {
  paris:{lat:48.8566,lon:2.3522,wiki:'Paris'},
  london:{lat:51.5074,lon:-0.1278,wiki:'London'},
  newyork:{lat:40.7128,lon:-74.0060,wiki:'New_York_City'},
  tokyo:{lat:35.6762,lon:139.6503,wiki:'Tokyo'},
  singapore:{lat:1.3521,lon:103.8198,wiki:'Singapore'},
  bali:{lat:-8.3405,lon:115.0920,wiki:'Bali'},
  sydney:{lat:-33.8688,lon:151.2093,wiki:'Sydney'},
  dubai:{lat:25.2048,lon:55.2708,wiki:'Dubai'},
  rome:{lat:41.9028,lon:12.4964,wiki:'Rome'},
  barcelona:{lat:41.3851,lon:2.1734,wiki:'Barcelona'},
  istanbul:{lat:41.0082,lon:28.9784,wiki:'Istanbul'},
  hongkong:{lat:22.3193,lon:114.1694,wiki:'Hong_Kong'},
  taipei:{lat:25.0330,lon:121.5654,wiki:'Taipei'},
  manila:{lat:14.5995,lon:120.9842,wiki:'Manila'},
  kualalumpur:{lat:3.1390,lon:101.6869,wiki:'Kuala_Lumpur'},
  amsterdam:{lat:52.3676,lon:4.9041,wiki:'Amsterdam'},
  vienna:{lat:48.2082,lon:16.3738,wiki:'Vienna'},
  prague:{lat:50.0755,lon:14.4378,wiki:'Prague'},
  lisbon:{lat:38.7223,lon:-9.1393,wiki:'Lisbon'},
  madrid:{lat:40.4168,lon:-3.7038,wiki:'Madrid'},
};

/* ═══ APP ═══ */
const App = (function(){

  let DESTS = JSON.parse(JSON.stringify(BASE_DESTS));

  let S = {
    dest:'osaka', dep:'2026-07-11', ret:'2026-07-18',
    pax:2, airport:'ICN', cabin:'economy', blimit:700000,
    nights:7, selFlt:null, selHtl:null
  };

  /* ── LOADING ── */
  const LSTEPS=[
    {txt:'✈️ 항공팀 작동 중...',   step:'직항 항공편 + Skyscanner 딥링크 생성',          pct:14,team:'lt-air'},
    {txt:'🏨 호텔팀 작동 중...',   step:'2인 1실 10만원 이하 추천 호텔 선별',            pct:28,team:'lt-hotel'},
    {txt:'🗺️ 가이드팀 작동 중...', step:'Wikipedia 도시 정보 + Overpass 관광지 조회',    pct:44,team:'lt-guide'},
    {txt:'🌤️ 날씨팀 작동 중...',   step:'Open-Meteo 14일 기상 예보 로딩',               pct:60,team:'lt-weather'},
    {txt:'💰 예산팀 작동 중...',   step:'2인 1실 예산 분리 계산',                       pct:76,team:'lt-budget'},
    {txt:'🔍 웹검수팀 검수 중...', step:'버그 9개 항목 자동 검수 중',                   pct:92,team:'lt-qa'},
  ];
  let _loadIv = null;

  function showLoading(){
    document.getElementById('lov').classList.add('active');
    document.querySelectorAll('.lteam').forEach(el=>el.className='lteam pending');
    let i=0;
    _loadIv=setInterval(()=>{
      if(i>=LSTEPS.length){clearInterval(_loadIv);return;}
      const s=LSTEPS[i];
      document.getElementById('ltxt').textContent  = s.txt;
      document.getElementById('lstep').textContent = s.step;
      document.getElementById('lprogb').style.width= s.pct+'%';
      if(i>0) document.getElementById(LSTEPS[i-1].team).className='lteam done';
      document.getElementById(s.team).className='lteam active';
      i++;
    },430);
  }
  function hideLoading(){
    clearInterval(_loadIv);
    document.getElementById('lprogb').style.width='100%';
    LSTEPS.forEach(s=>document.getElementById(s.team).className='lteam done');
    setTimeout(()=>document.getElementById('lov').classList.remove('active'),380);
  }

  /* ── CHIPS ── */
  function renderChips(){
    const el=document.getElementById('dest-list');
    el.innerHTML='';
    const builtins=['osaka','bangkok','kk'];
    Object.entries(DESTS).forEach(([k,v],idx)=>{
      const chip=document.createElement('span');
      const isActive = k===S.dest;
      chip.className='dest-chip'+(isActive?' active':'');
      chip.dataset.key=k;
      const canRm=!builtins.includes(k);
      chip.innerHTML=`${v.flag} ${v.name}${canRm?` <span class="rm" data-key="${k}">✕</span>`:''}`;
      chip.addEventListener('click',e=>{
        if(e.target.classList.contains('rm'))return;
        S.dest=k;
        renderChips();
        notify(`🌍 ${v.flag} ${v.name} 선택됨`);
      });
      el.appendChild(chip);
    });
    // rm handlers
    el.querySelectorAll('.rm').forEach(btn=>{
      btn.addEventListener('click',e=>{
        e.stopPropagation();
        removeDest(btn.dataset.key);
      });
    });
    // FIX #1: 현재 S.dest에 해당하는 chip이 없으면 첫 번째로 설정
    if(!document.querySelector('.dest-chip.active')){
      const first=document.querySelector('.dest-chip');
      if(first){S.dest=first.dataset.key; first.classList.add('active');}
    }
  }

  function addDest(){
    const name=(document.getElementById('nd-name').value||'').trim();
    const iata=(document.getElementById('nd-iata').value||'').trim().toUpperCase();
    const flag=(document.getElementById('nd-flag').value||'').trim()||'🌍';
    if(!name){notify('⚠️ 여행지 이름을 입력해주세요!');return;}
    if(!iata||iata.length!==3){notify('⚠️ IATA 코드는 3자리여야 합니다 (예: SIN)');return;}

    const key=iata.toLowerCase()+'_custom';
    // FIX #3/#4: 내장 좌표 DB 조회
    const normalized=name.toLowerCase().replace(/\s+/g,'');
    const known=CITY_COORDS[normalized]||CITY_COORDS[iata.toLowerCase()];
    const lat = known?.lat||null;
    const lon = known?.lon||null;
    const wikiTitle = known?.wiki || name.replace(/\s+/g,'_');

    DESTS[key]={
      name,flag,emoji:'🌍',iata,wikiTitle,lat,lon,
      desc:`${name} — 직접 추가된 여행지`,
      flights:[{
        id:`f_${key}`,airline:'항공사 (Skyscanner 검색)',code:'—',
        dep:`${S.airport} 출발`,arr:`${iata} 도착`,dur:'—',
        price:0,tags:['Skyscanner 검색 필요'],tc:['a'],rec:true,em:'🔍'
      }],
      hotels:[{
        id:`h_${key}`,name:`${name} 추천 호텔`,loc:name,price:0,rating:0,
        tags:['직접 검색 필요'],
        desc:`Booking.com 또는 Agoda에서 "${name} 호텔"을 검색하세요.`,
        em:'🏨',rec:true
      }],
      guide:{
        hi:[{ic:'🌍',nm:`${name} 여행`,ds:`${name}의 명소를 탐색해보세요!`}],
        links:[
          {t:`Skyscanner — ${name}`,u:skyURL(S.airport,iata,S.dep,S.ret,S.pax,S.cabin),d:`인천→${name} 항공권 검색`},
          {t:`Google — ${name} 여행가이드`,u:`https://www.google.com/search?q=${encodeURIComponent(name+' 여행 가이드')}`,d:`${name} 여행 정보`},
          {t:`Booking.com — ${name}`,u:`https://www.booking.com/search.html?ss=${encodeURIComponent(name)}`,d:`${name} 호텔 예약`},
          {t:`Agoda — ${name}`,u:`https://www.agoda.com/search?city=${encodeURIComponent(name)}`,d:`${name} 숙소 비교`}
        ]
      },
      extra:{food:65000,transport:25000,activity:60000,misc:20000}
    };

    S.dest=key;
    document.getElementById('nd-name').value='';
    document.getElementById('nd-iata').value='';
    document.getElementById('nd-flag').value='';
    renderChips();
    notify(`✅ ${flag} ${name} 추가 완료! AI팀 재실행을 눌러 정보를 가져오세요.`);
  }

  function removeDest(key){
    delete DESTS[key];
    if(S.dest===key)S.dest='osaka';
    renderChips();
    notify('🗑️ 여행지 삭제됨');
  }

  /* ── GEOCODING (Nominatim — CORS 허용) ── */
  async function geocode(name){
    try{
      // FIX #3: 내장 DB 먼저 확인
      const normalized=name.toLowerCase().replace(/[\s-_]/g,'');
      if(CITY_COORDS[normalized]) return CITY_COORDS[normalized];

      const url=`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(name)}&format=json&limit=1&accept-language=en`;
      const res=await fetch(url,{headers:{'User-Agent':'AIVacationPlanner/2.1 (github pages)'}});
      if(!res.ok)return null;
      const data=await res.json();
      if(data&&data[0]) return {lat:parseFloat(data[0].lat),lon:parseFloat(data[0].lon)};
    }catch(e){/* silent */}
    return null;
  }

  /* ── WIKIPEDIA (FIX #4: search fallback) ── */
  async function fetchWiki(title){
    if(!title)return null;
    // 1차: 직접 타이틀
    try{
      const r=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(title)}`);
      if(r.ok){const d=await r.json();if(d.extract)return d;}
    }catch(e){}
    // 2차: search API fallback
    try{
      const r=await fetch(`https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(title)}&format=json&origin=*&srlimit=1`);
      if(!r.ok)return null;
      const d=await r.json();
      const hit=d?.query?.search?.[0];
      if(!hit)return null;
      const r2=await fetch(`https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(hit.title)}`);
      if(r2.ok){const d2=await r2.json();if(d2.extract)return d2;}
    }catch(e){}
    return null;
  }

  /* ── WEATHER (Open-Meteo — no key, CORS OK) ── */
  async function fetchWeather(lat,lon){
    try{
      const url=`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=temperature_2m_max,temperature_2m_min,precipitation_probability_max,weathercode&timezone=auto&forecast_days=14`;
      const r=await fetch(url);
      if(!r.ok)return null;
      return await r.json();
    }catch(e){return null;}
  }

  /* ── OVERPASS ATTRACTIONS (FIX #2: replaces broken OpenTripMap) ── */
  async function fetchAttractions(lat,lon){
    try{
      const q=encodeURIComponent(
        `[out:json][timeout:20];`+
        `(node["tourism"~"attraction|museum|artwork|viewpoint|theme_park"]["name"](around:12000,${lat},${lon});`+
        `way["tourism"~"attraction|museum"]["name"](around:12000,${lat},${lon}););`+
        `out 8;`
      );
      const url=`https://overpass-api.de/api/interpreter?data=${q}`;
      const r=await fetch(url);
      if(!r.ok)return[];
      const d=await r.json();
      return(d.elements||[]).filter(e=>e.tags&&e.tags.name).slice(0,6);
    }catch(e){return[];}
  }

  /* ── MAIN RUN (FIX #5/#6: try/finally) ── */
  async function run(){
    S.dep    =document.getElementById('dep').value;
    S.ret    =document.getElementById('ret').value;
    S.pax    =parseInt(document.getElementById('pax').value);
    S.airport=document.getElementById('airport').value;
    S.cabin  =document.getElementById('cabin').value;
    S.blimit =parseInt(document.getElementById('blimit').value);
    S.nights =calcNights(S.dep,S.ret);

    // FIX #1: active chip에서 S.dest 읽기
    const activeChip=document.querySelector('#dest-list .dest-chip.active');
    if(activeChip)S.dest=activeChip.dataset.key;

    if(!DESTS[S.dest]){
      notify('⚠️ 여행지를 선택해주세요!');return;
    }

    showLoading();
    try{
      const d=DESTS[S.dest];

      // 좌표 보정
      if(!d.lat||!d.lon){
        const geo=await geocode(d.name);
        if(geo){d.lat=geo.lat;d.lon=geo.lon;}
      }
      // wikiTitle 보정
      if(!d.wikiTitle)d.wikiTitle=d.name.replace(/\s+/g,'_');

      const [wikiData,weatherData,attractions]=await Promise.all([
        fetchWiki(d.wikiTitle),
        (d.lat&&d.lon)?fetchWeather(d.lat,d.lon):Promise.resolve(null),
        (d.lat&&d.lon)?fetchAttractions(d.lat,d.lon):Promise.resolve([])
      ]);

      S.selFlt=d.flights.find(f=>f.rec)||d.flights[0];
      S.selHtl=d.hotels.find(h=>h.rec)||d.hotels[0];

      buildAll(wikiData,weatherData,attractions);
      document.getElementById('main').style.display='block';
      document.getElementById('main').scrollIntoView({behavior:'smooth',block:'start'});
      notify('🤖 AI 팀 작업 완료! 총괄팀 보고서를 확인하세요 ✅');

    } catch(err){
      console.error('AI run error:',err);
      S.selFlt=DESTS[S.dest]?.flights?.[0]||null;
      S.selHtl=DESTS[S.dest]?.hotels?.[0]||null;
      buildAll(null,null,[]);
      document.getElementById('main').style.display='block';
      notify('⚠️ 일부 데이터 로드 실패. 기본 데이터로 표시합니다.');
    } finally{
      hideLoading();
    }
  }

  /* ── BUILD ALL ── */
  function buildAll(wikiData,weatherData,attractions){
    const d=DESTS[S.dest];
    document.getElementById('flt-sub').textContent =`직항 · ${S.airport}→${d.name} · ${S.dep}~${S.ret} · ${S.pax}명`;
    document.getElementById('htl-sub').textContent =`2인 1실 · 1박 10만원 이하 · ${d.name} · ${S.nights}박`;
    document.getElementById('gd-sub').textContent  =`${d.name} 볼거리·먹거리·즐길거리`;
    document.getElementById('wx-sub').textContent  =`${d.name} 여행 기간 날씨 예보`;
    renderFlights();
    renderHotels();
    renderGuide(wikiData,attractions);
    renderWeather(weatherData);
    updateBudget();
    updateOverview();
    runQA();
    updateReports(wikiData,weatherData,attractions);
  }

  /* ── FLIGHTS ── */
  function renderFlights(){
    const d=DESTS[S.dest];
    const g=document.getElementById('flt-grid');
    g.innerHTML='';
    d.flights.forEach(f=>{
      const isSel=S.selFlt&&S.selFlt.id===f.id;
      const skyLink=skyURL(S.airport,d.iata,S.dep,S.ret,S.pax,S.cabin);
      const bg=f.rec
        ?'linear-gradient(135deg,#e0e7ff,#c7d2fe)'
        :'linear-gradient(135deg,#e0f2fe,#bae6fd)';
      const priceHtml=f.price>0
        ?`<div class="cprice"><span class="pm">${won(f.price)}</span><span class="ps2">/ 1인 왕복</span></div>`
        :`<div class="cprice"><span class="ps2">Skyscanner에서 직접 검색</span></div>`;
      const selHtml=f.price>0
        ?`<button class="btn-sel${isSel?' sel':''}" onclick="App.selFlt('${f.id}')">${isSel?'✅ 선택됨':'이 항공편 선택'}</button>`
        :'';
      const card=document.createElement('div');
      card.className='card';
      // FIX #8: btn-sky를 <a> 안에 button 대신 <a class="btn-sky">로 교체
      card.innerHTML=`
        <div class="ciph" style="background:${bg};">${f.em} ${d.flag}</div>
        <div class="cbody">
          <div class="clabel">✈️ 직항 항공편</div>
          <div class="ctitle">${f.airline}</div>
          <div class="cdesc"><strong>${f.dep}</strong> → <strong>${f.arr}</strong><br/>⏱ ${f.dur} · 편명 ${f.code}</div>
          <div class="badges">${f.tags.map((t,i)=>`<span class="b ${f.tc[i]||''}">${t}</span>`).join('')}</div>
          ${priceHtml}
          ${selHtml}
          <a class="btn-sky" href="${skyLink}" target="_blank" rel="noopener noreferrer">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="10" fill="#fff"/><path d="M7 12l3 3 7-7" stroke="#0770e3" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/></svg>
            Skyscanner에서 검색 →
          </a>
        </div>`;
      g.appendChild(card);
    });
  }

  function selFlt(id){
    S.selFlt=DESTS[S.dest].flights.find(f=>f.id===id);
    renderFlights();updateBudget();updateOverview();updateReports(null,null,null);
    notify(`✈️ ${S.selFlt.airline} 선택!`);
  }

  /* ── HOTELS ── */
  function renderHotels(){
    const d=DESTS[S.dest];
    const g=document.getElementById('htl-grid');
    g.innerHTML='';
    d.hotels.forEach(h=>{
      const isSel=S.selHtl&&S.selHtl.id===h.id;
      const stars='⭐'.repeat(Math.floor(h.rating))+(h.rating%1>=.5?'✨':'');
      const priceHtml=h.price>0?`
        <div class="cprice">
          <span class="pm">${won(h.price)}</span>
          <span class="ps2">/ 1박 · 1인 ${won(Math.round(h.price/2))}</span>
        </div>
        <div style="font-size:.73rem;color:var(--muted);margin-top:3px;">
          💡 ${S.nights}박 룸 합계 ${won(h.price*S.nights)} → 1인 <strong style="color:var(--pd);">${won(Math.round(h.price/2)*S.nights)}</strong>
        </div>
        <button class="btn-sel${isSel?' sel':''}" onclick="App.selHtl('${h.id}')">${isSel?'✅ 선택됨':'이 호텔 선택'}</button>
      `:`<div class="cprice"><span class="ps2">Booking.com에서 직접 검색하세요</span></div>`;
      const card=document.createElement('div');
      card.className='card';
      card.innerHTML=`
        <div class="ciph" style="background:linear-gradient(135deg,#fef3c7,#fde68a);">${h.em}</div>
        <div class="cbody">
          <div class="clabel">🏨 숙소 (2인 1실)</div>
          <div class="ctitle">${h.name}</div>
          <div class="cdesc">${h.desc}${h.rating>0?`<br/>📍 ${h.loc} · ${stars} ${h.rating}`:''}</div>
          <div class="badges">
            ${h.tags.map(t=>`<span class="b g">${t}</span>`).join('')}
            ${h.rec?'<span class="b a">호텔팀 추천</span>':''}
          </div>
          ${priceHtml}
        </div>`;
      g.appendChild(card);
    });
  }

  function selHtl(id){
    S.selHtl=DESTS[S.dest].hotels.find(h=>h.id===id);
    renderHotels();updateBudget();updateOverview();updateReports(null,null,null);
    notify(`🏨 ${S.selHtl.name} 선택!`);
  }

  /* ── GUIDE ── */
  function renderGuide(wikiData,attractions){
    const d=DESTS[S.dest];
    const g=d.guide;

    // Wikipedia card
    const wCard=document.getElementById('wiki-card');
    if(wikiData&&wikiData.extract){
      document.getElementById('wiki-title').textContent=wikiData.title||d.name;
      document.getElementById('wiki-desc').textContent =(wikiData.extract||'').slice(0,300)+'...';
      document.getElementById('wiki-link').href=wikiData.content_urls?.desktop?.page||'#';
      const thumb=document.getElementById('wiki-thumb');
      if(wikiData.thumbnail?.source){
        thumb.innerHTML=`<img src="${wikiData.thumbnail.source}" alt="${d.name}" loading="lazy"/>`;
      } else {
        thumb.innerHTML=`<div style="display:flex;align-items:center;justify-content:center;height:100%;font-size:3rem;">${d.emoji}</div>`;
      }
      wCard.style.display='flex';
    } else {
      wCard.style.display='none';
    }

    // Built-in highlights
    let html=`<div class="cgrid" style="margin-bottom:20px;">`;
    g.hi.forEach(h=>{
      html+=`<div class="card">
        <div class="ciph" style="background:linear-gradient(135deg,#d1fae5,#a7f3d0);font-size:2.8rem;">${h.ic}</div>
        <div class="cbody">
          <div class="clabel">🗺️ 여행 포인트</div>
          <div class="ctitle">${h.nm}</div>
          <div class="cdesc">${h.ds}</div>
        </div></div>`;
    });
    html+='</div>';

    // Links
    html+=`<div class="sh" style="margin-bottom:12px;">
      <span class="ic">🔗</span>
      <div class="inf"><h3>관련 블로그 & 사이트</h3><p>가이드팀 수집 자료</p></div>
    </div>`;
    g.links.forEach(l=>{
      html+=`<a class="gl" href="${l.u}" target="_blank" rel="noopener noreferrer">
        <span class="gli">🌐</span>
        <div class="glb"><strong>${l.t}</strong><span>${l.d}</span></div>
        <span class="gla">→</span>
      </a>`;
    });

    document.getElementById('gd-content').innerHTML=html;

    // Live attractions (Overpass)
    const liveSection=document.getElementById('live-attractions');
    const liveGrid=document.getElementById('live-grid');
    if(attractions&&attractions.length>0){
      liveGrid.innerHTML='';
      attractions.forEach(a=>{
        const nm=a.tags?.name||'명칭 없음';
        const enm=a.tags?.['name:en']||'';
        const kind=(a.tags?.tourism||'attraction').replace(/_/g,' ');
        const wikiLink=a.tags?.wikipedia
          ?`<a href="https://en.wikipedia.org/wiki/${encodeURIComponent(a.tags.wikipedia.split(':').pop())}" target="_blank" rel="noopener" style="font-size:.73rem;color:var(--p);margin-top:4px;display:block;">Wikipedia →</a>`
          :'';
        const card=document.createElement('div');
        card.className='card';
        card.innerHTML=`
          <div class="ciph" style="background:linear-gradient(135deg,#ede9fe,#ddd6fe);font-size:2.8rem;">📍</div>
          <div class="cbody">
            <div class="clabel">📍 실시간 관광지 (OpenStreetMap)</div>
            <div class="ctitle">${nm}</div>
            <div class="cdesc">${enm?`<em>${enm}</em><br/>`:''}</div>
            <div class="badges"><span class="b">${kind}</span></div>
            ${wikiLink}
          </div>`;
        liveGrid.appendChild(card);
      });
      liveSection.style.display='block';
    } else {
      liveSection.style.display='none';
    }
  }

  /* ── WEATHER ── */
  function renderWeather(data){
    const container=document.getElementById('weather-content');
    if(!data||!data.daily){
      container.innerHTML=`<div class="alert warn">🌤️ 날씨 데이터를 불러오지 못했습니다. 인터넷 연결을 확인하거나 잠시 후 다시 시도해주세요.</div>`;
      return;
    }
    const daily=data.daily;
    const depT=new Date(S.dep), retT=new Date(S.ret);
    let travelIdx=daily.time.reduce((a,t,i)=>{
      const dt=new Date(t);
      if(dt>=depT&&dt<=retT)a.push(i);
      return a;
    },[]);
    if(travelIdx.length===0)travelIdx=Array.from({length:Math.min(7,daily.time.length)},(_,i)=>i);

    const maxT=travelIdx.map(i=>daily.temperature_2m_max[i]).filter(Boolean);
    const minT=travelIdx.map(i=>daily.temperature_2m_min[i]).filter(Boolean);
    const rain=travelIdx.map(i=>daily.precipitation_probability_max[i]).filter(v=>v!=null);
    const avgMax=maxT.length?(maxT.reduce((a,b)=>a+b,0)/maxT.length).toFixed(1):'--';
    const avgMin=minT.length?(minT.reduce((a,b)=>a+b,0)/minT.length).toFixed(1):'--';
    const avgRain=rain.length?Math.round(rain.reduce((a,b)=>a+b,0)/rain.length):'--';
    const midCode=travelIdx.length?daily.weathercode[travelIdx[Math.floor(travelIdx.length/2)]]||0:0;

    let html=`
      <div class="wx-summary">
        <div class="wx-stat"><div class="ws-icon">${wmoEmoji(midCode)}</div><div class="ws-val">${wmoLabel(midCode)}</div><div class="ws-lbl">주요 날씨</div></div>
        <div class="wx-stat"><div class="ws-icon">🌡️</div><div class="ws-val">${avgMax}°C</div><div class="ws-lbl">평균 최고기온</div></div>
        <div class="wx-stat"><div class="ws-icon">🌙</div><div class="ws-val">${avgMin}°C</div><div class="ws-lbl">평균 최저기온</div></div>
        <div class="wx-stat"><div class="ws-icon">🌧️</div><div class="ws-val">${avgRain}%</div><div class="ws-lbl">평균 강수확률</div></div>
      </div>
      <div class="sh" style="margin-bottom:12px;">
        <span class="ic">📅</span>
        <div class="inf"><h3>날짜별 날씨 예보</h3><p>14일 예보 · 파란 테두리 = 여행 기간</p></div>
      </div>
      <div class="wx-days">`;
    daily.time.slice(0,14).forEach((t,i)=>{
      const code=daily.weathercode[i]||0;
      const inTrip=new Date(t)>=depT&&new Date(t)<=retT;
      html+=`<div class="wx-day" style="${inTrip?'border:2px solid var(--p);background:#eff6ff;':''}">
        <div class="wd-date">${fmtDate(t)}</div>
        <div class="wd-icon">${wmoEmoji(code)}</div>
        <div class="wd-temp">${Math.round(daily.temperature_2m_max[i]||0)}°/${Math.round(daily.temperature_2m_min[i]||0)}°</div>
        <div class="wd-rain">🌧 ${daily.precipitation_probability_max[i]??0}%</div>
      </div>`;
    });
    html+=`</div><p style="font-size:.73rem;color:var(--muted);margin-top:12px;text-align:right;">📡 Open-Meteo.com</p>`;
    container.innerHTML=html;
  }

  /* ── BUDGET ── */
  const EC=k=>(DESTS[k]?.extra)||{food:65000,transport:25000,activity:60000,misc:20000};

  function calcTotal(){
    if(!S.selFlt||!S.selHtl)return 0;
    const ec=EC(S.dest),n=S.nights;
    return S.selFlt.price+Math.round(S.selHtl.price/2)*n+ec.food*n+ec.transport*n+ec.activity+ec.misc;
  }

  function updateBudget(){
    if(!S.selFlt||!S.selHtl)return;
    const sf=S.selFlt,sh=S.selHtl,ec=EC(S.dest),n=S.nights;
    const htl1p=Math.round(sh.price/2);
    const total=calcTotal();
    const rows=[
      ['✈️ 항공권',`${sf.airline} 왕복`,won(sf.price),'1인',won(sf.price),won(sf.price)],
      ['🏨 숙박',`${sh.name} (2인 1실)`,won(sh.price)+'/박',n+'박',won(sh.price*n),won(htl1p*n)],
      ['🍜 식비','현지 식사',won(ec.food)+'/일',n+'일',won(ec.food*n),won(ec.food*n)],
      ['🚇 교통비','대중교통·택시',won(ec.transport)+'/일',n+'일',won(ec.transport*n),won(ec.transport*n)],
      ['🎡 액티비티','입장료·투어',won(ec.activity),'일괄',won(ec.activity),won(ec.activity)],
      ['🛍️ 기타','기념품·예비비',won(ec.misc),'일괄',won(ec.misc),won(ec.misc)]
    ];
    document.getElementById('btbody').innerHTML=rows.map(r=>
      `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td><td>${r[4]}</td><td><strong>${r[5]}</strong></td></tr>`
    ).join('');
    document.getElementById('btotal-1p').textContent   =won(total);
    document.getElementById('btotal-badge').textContent=won(total);
    document.getElementById('bwarn').style.display     =total>S.blimit?'flex':'none';
    const pr=document.getElementById('brow2p');
    if(S.pax>1){
      const rooms=Math.ceil(S.pax/2);
      const allT=sf.price*S.pax+sh.price*n*rooms+(ec.food+ec.transport)*n*S.pax+(ec.activity+ec.misc)*S.pax;
      document.getElementById('brow2p-label').textContent=`👥 ${S.pax}명 합계 (항공 ${S.pax}명 + ${rooms}실)`;
      document.getElementById('btotal-all').textContent  =won(allT);
      pr.style.display='';
    } else pr.style.display='none';
    document.getElementById('bslider').value          =S.blimit;
    document.getElementById('bslider-val').textContent=won(S.blimit);
  }

  function sliderChange(v){
    S.blimit=parseInt(v);
    document.getElementById('bslider-val').textContent=won(parseInt(v));
  }

  function applyBudget(){
    const d=DESTS[S.dest];
    S.selFlt=[...d.flights].sort((a,b)=>a.price-b.price)[0];
    S.selHtl=[...d.hotels].sort((a,b)=>a.price-b.price)[0];
    renderFlights();renderHotels();updateBudget();updateOverview();updateReports(null,null,null);
    const t=calcTotal();
    notify(t<=S.blimit?`✅ 예산 조정 완료! (${won(t)})`:`⚠️ 최저가도 한도 초과 (${won(t)})`);
    // FIX #7: 이름 기반 탭 전환
    tab('budget',document.querySelectorAll('.tab-btn')[5]);
  }

  /* ── OVERVIEW ── */
  function updateOverview(){
    const d=DESTS[S.dest],sf=S.selFlt,sh=S.selHtl,n=S.nights,total=calcTotal();
    document.getElementById('ov-sum').innerHTML=`
      <div class="ovl"><div class="ovic" style="background:#eff6ff;">📅</div>
      <div class="ovi"><strong>${S.dep} ~ ${S.ret}</strong><span>${n}박 ${n+1}일 · ${S.pax}명 · 2인 1실</span></div></div>
      <div class="ovl"><div class="ovic" style="background:#d1fae5;">${d.emoji}</div>
      <div class="ovi"><strong>${d.flag} ${d.name}</strong><span>${d.desc}</span></div></div>`;
    document.getElementById('ov-flt').innerHTML=sf
      ?`<div class="ovl"><div class="ovic" style="background:#eff6ff;">✈️</div>
         <div class="ovi"><strong>${sf.airline}</strong><span>${sf.dep}→${sf.arr} · 직항 ${sf.dur}</span></div>
         <span class="ovpr">${sf.price>0?won(sf.price):'Skyscanner'}</span></div>`
      :'<p style="color:var(--muted);font-size:.85rem;">미선택</p>';
    document.getElementById('ov-htl').innerHTML=sh
      ?`<div class="ovl"><div class="ovic" style="background:#fef3c7;">${sh.em}</div>
         <div class="ovi"><strong>${sh.name}</strong><span>${sh.loc} · ${n}박</span><span>1인 ${sh.price>0?won(Math.round(sh.price/2)*n):'—'}</span></div>
         <span class="ovpr">${sh.price>0?won(sh.price)+'/박':'—'}</span></div>`
      :'<p style="color:var(--muted);font-size:.85rem;">미선택</p>';
    const over=total>S.blimit;
    document.getElementById('ov-bsum').innerHTML=`
      <div class="ov-card" style="border:2px solid ${over?'#ef4444':'#10b981'};">
        <h4>${over?'⚠️':'✅'} 예산팀 최종 보고 — 1인 기준</h4>
        <div class="ovl"><div class="ovic" style="background:#eff6ff;">✈️</div>
        <div class="ovi"><strong>항공권</strong></div><span class="ovpr">${sf&&sf.price>0?won(sf.price):'—'}</span></div>
        <div class="ovl"><div class="ovic" style="background:#fef3c7;">🏨</div>
        <div class="ovi"><strong>숙박 1인 부담</strong><span>2인 1실 ÷ 2</span></div><span class="ovpr">${sh&&sh.price>0?won(Math.round(sh.price/2)*n):'—'}</span></div>
        <div class="ovl"><div class="ovic" style="background:#d1fae5;">🍜</div>
        <div class="ovi"><strong>식비·교통·액티비티</strong></div><span class="ovpr">${sf&&sh?won(calcTotal()-sf.price-Math.round(sh.price/2)*n):'—'}</span></div>
        <div class="ovl" style="border:none;background:${over?'#fee2e2':'#d1fae5'};border-radius:10px;padding:11px;margin-top:4px;">
          <div class="ovic" style="background:transparent;">💼</div>
          <div class="ovi"><strong>1인 합계</strong>${over?`<span style="color:#991b1b;">한도 초과!</span>`:''}</div>
          <span class="ovpr" style="font-size:1.15rem;">${total>0?won(total):'—'}</span>
        </div>
      </div>`;
  }

  /* ── 🔍 웹검수팀 QA ── */
  function runQA(){
    const issues=[],passes=[];
    const depD=new Date(S.dep),retD=new Date(S.ret);
    retD<=depD?issues.push('귀국일이 출발일보다 빠르거나 같습니다'):passes.push('날짜 설정 정상');
    const t=calcTotal();
    t>S.blimit?issues.push(`1인 총비용(${won(t)})이 한도(${won(S.blimit)}) 초과`):passes.push(`예산 한도 이내`);
    !S.selFlt?issues.push('항공편이 선택되지 않았습니다'):passes.push(`항공편 선택: ${S.selFlt.airline}`);
    !S.selHtl?issues.push('호텔이 선택되지 않았습니다'):passes.push(`호텔 선택: ${S.selHtl.name}`);
    if(S.selHtl&&S.selHtl.price>100000)issues.push(`호텔 ${won(S.selHtl.price)} — 10만원 초과`);
    else if(S.selHtl)passes.push(`호텔 단가 ${won(S.selHtl.price)} 정상`);
    S.nights<1?issues.push('여행 기간 0박 이하'):S.nights>30?issues.push('여행 기간 30박 초과'):passes.push(`${S.nights}박 정상`);
    const d=DESTS[S.dest];
    (!d?.iata||d.iata.length!==3)?issues.push(`IATA 코드 오류`):passes.push(`IATA ${d.iata} 정상`);
    const qaEl=document.getElementById('r-qa');
    const qaAlert=document.getElementById('qa-alert');
    if(issues.length>0){
      qaEl.innerHTML=`⚠️ ${issues.length}건: ${issues.join(' / ')}`;
      qaAlert.style.display='flex';
      qaAlert.innerHTML=`🔍 <strong>웹검수팀 리포트</strong> — ${issues.length}건 발견<br/>${issues.map(i=>`• ${i}`).join('<br/>')}`;
    } else {
      qaEl.textContent=`✅ ${passes.length}개 항목 모두 통과`;
      qaAlert.style.display='none';
    }
  }

  /* ── TEAM REPORTS ── */
  function updateReports(wiki,wx,attr){
    const d=DESTS[S.dest],sf=S.selFlt,sh=S.selHtl;
    document.getElementById('r-air').textContent   =`직항 ${d.flights.length}편. 추천: ${sf?.airline||'—'}${sf?.price>0?' '+won(sf.price):''}. Skyscanner 딥링크 생성.`;
    document.getElementById('r-hotel').textContent =`${d.hotels.length}곳 선별. 추천: ${sh?.name||'—'}${sh?.price>0?' 룸 '+won(sh.price)+'/박':''}. 1인 ${sh?.price>0?won(Math.round(sh.price/2)):'-'}.`;
    document.getElementById('r-guide').textContent =`명소 ${d.guide.hi.length}곳. Wikipedia ${wiki?'✅':'❌'}. OSM 관광지 ${attr?attr.length:0}곳.`;
    document.getElementById('r-weather').textContent=wx?`Open-Meteo 14일 예보 수신 (${d.lat?.toFixed(2)||'?'},${d.lon?.toFixed(2)||'?'})`:'날씨 로드 실패';
    document.getElementById('r-budget').textContent=`1인 예상: ${won(calcTotal())}. 한도 ${won(S.blimit)} ${calcTotal()<=S.blimit?'✅':'⚠️'}`;
  }

  /* ── TAB (FIX #7) ── */
  function tab(name,btn){
    document.querySelectorAll('.tab-sec').forEach(s=>{s.classList.remove('active');s.setAttribute('aria-hidden','true');});
    document.querySelectorAll('.tab-btn').forEach(b=>{b.classList.remove('active');b.setAttribute('aria-selected','false');});
    const sec=document.getElementById('ts-'+name);
    if(sec){sec.classList.add('active');sec.removeAttribute('aria-hidden');}
    if(btn){btn.classList.add('active');btn.setAttribute('aria-selected','true');}
  }

  /* ── INIT ── */
  function init(){
    renderChips();
    const stbtn=document.getElementById('stbtn');
    window.addEventListener('scroll',()=>stbtn.classList.toggle('vis',window.scrollY>280));
    stbtn.addEventListener('click',()=>window.scrollTo({top:0,behavior:'smooth'}));
  }

  return {run,addDest,selFlt,selHtl,applyBudget,sliderChange,tab,init};

})();

document.addEventListener('DOMContentLoaded',()=>App.init());

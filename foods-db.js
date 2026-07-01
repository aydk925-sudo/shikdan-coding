// 출처: 농촌진흥청 국가표준식품성분표 / 식품의약품안전처 식품영양성분DB
// 단위: 100g 기준
// nutrients: { cal(kcal), carbs(g), sugar(g), fiber(g), protein(g),
//              fat(g), satFat(g), cholesterol(mg), sodium(mg),
//              calcium(mg), iron(mg), vitA(μgRAE), vitC(mg),
//              vitD(μg), vitB12(μg), potassium(mg), magnesium(mg), zinc(mg) }

const FOODS_DB = [
  // ── 밥·면·빵 ─────────────────────────────
  { id:1,  name:'쌀밥',       emoji:'🍚', category:'곡류',
    nutrients:{ cal:130, carbs:28.1, sugar:0,    fiber:0.3, protein:2.5,  fat:0.3,  satFat:0.1, cholesterol:0,   sodium:1,   calcium:3,   iron:0.2, vitA:0,   vitC:0,   vitD:0,   vitB12:0,   potassium:27,  magnesium:12,  zinc:0.6 }},
  { id:2,  name:'현미밥',     emoji:'🍚', category:'곡류',
    nutrients:{ cal:111, carbs:23.0, sugar:0,    fiber:1.8, protein:2.6,  fat:0.9,  satFat:0.2, cholesterol:0,   sodium:2,   calcium:10,  iron:0.5, vitA:0,   vitC:0,   vitD:0,   vitB12:0,   potassium:79,  magnesium:43,  zinc:0.7 }},
  { id:3,  name:'오트밀',     emoji:'🌾', category:'곡류',
    nutrients:{ cal:389, carbs:66.0, sugar:0,    fiber:10,  protein:17.0, fat:7.0,  satFat:1.2, cholesterol:0,   sodium:2,   calcium:54,  iron:4.7, vitA:0,   vitC:0,   vitD:0,   vitB12:0,   potassium:429, magnesium:177, zinc:4.0 }},
  { id:4,  name:'식빵',       emoji:'🍞', category:'곡류',
    nutrients:{ cal:265, carbs:49.0, sugar:5.6,  fiber:2.7, protein:9.0,  fat:3.2,  satFat:0.7, cholesterol:0,   sodium:477, calcium:141, iron:3.6, vitA:0,   vitC:0,   vitD:0,   vitB12:0,   potassium:115, magnesium:26,  zinc:0.7 }},
  { id:5,  name:'라면(끓인)', emoji:'🍜', category:'곡류',
    nutrients:{ cal:138, carbs:20.0, sugar:0.8,  fiber:0.9, protein:3.8,  fat:4.8,  satFat:2.0, cholesterol:0,   sodium:860, calcium:10,  iron:0.7, vitA:0,   vitC:0,   vitD:0,   vitB12:0,   potassium:50,  magnesium:10,  zinc:0.3 }},

  // ── 한식 ─────────────────────────────────
  { id:6,  name:'김치',       emoji:'🥬', category:'한식',
    nutrients:{ cal:15,  carbs:2.4,  sugar:1.3,  fiber:1.6, protein:1.1,  fat:0.5,  satFat:0.1, cholesterol:0,   sodium:498, calcium:45,  iron:0.5, vitA:18,  vitC:14,  vitD:0,   vitB12:0,   potassium:181, magnesium:16,  zinc:0.2 }},
  { id:7,  name:'된장찌개',   emoji:'🍲', category:'한식',
    nutrients:{ cal:55,  carbs:4.2,  sugar:1.2,  fiber:1.5, protein:4.5,  fat:2.1,  satFat:0.5, cholesterol:5,   sodium:450, calcium:85,  iron:1.1, vitA:5,   vitC:2,   vitD:0,   vitB12:0.1, potassium:210, magnesium:20,  zinc:0.5 }},
  { id:8,  name:'순두부찌개', emoji:'🍲', category:'한식',
    nutrients:{ cal:68,  carbs:3.5,  sugar:1.0,  fiber:0.8, protein:5.5,  fat:3.2,  satFat:0.8, cholesterol:15,  sodium:540, calcium:120, iron:2.0, vitA:10,  vitC:2,   vitD:0,   vitB12:0.2, potassium:180, magnesium:25,  zinc:0.5 }},
  { id:9,  name:'비빔밥',     emoji:'🍱', category:'한식',
    nutrients:{ cal:130, carbs:25.0, sugar:2.5,  fiber:2.0, protein:5.0,  fat:2.3,  satFat:0.5, cholesterol:20,  sodium:350, calcium:40,  iron:1.2, vitA:80,  vitC:8,   vitD:0,   vitB12:0.2, potassium:220, magnesium:25,  zinc:0.8 }},
  { id:10, name:'불고기',     emoji:'🥩', category:'한식',
    nutrients:{ cal:177, carbs:7.5,  sugar:5.0,  fiber:0.3, protein:18.0, fat:8.5,  satFat:3.0, cholesterol:60,  sodium:420, calcium:15,  iron:2.0, vitA:5,   vitC:2,   vitD:0,   vitB12:1.5, potassium:310, magnesium:22,  zinc:3.5 }},
  { id:11, name:'떡볶이',     emoji:'🍢', category:'한식',
    nutrients:{ cal:148, carbs:32.0, sugar:8.5,  fiber:0.8, protein:3.5,  fat:1.5,  satFat:0.3, cholesterol:5,   sodium:620, calcium:30,  iron:0.8, vitA:15,  vitC:3,   vitD:0,   vitB12:0,   potassium:120, magnesium:12,  zinc:0.4 }},
  { id:12, name:'김밥',       emoji:'🍙', category:'한식',
    nutrients:{ cal:163, carbs:29.0, sugar:2.0,  fiber:1.2, protein:5.5,  fat:3.5,  satFat:0.8, cholesterol:15,  sodium:380, calcium:45,  iron:0.8, vitA:40,  vitC:3,   vitD:0,   vitB12:0.1, potassium:130, magnesium:18,  zinc:0.6 }},
  { id:13, name:'삼계탕',     emoji:'🍗', category:'한식',
    nutrients:{ cal:130, carbs:5.5,  sugar:0.3,  fiber:0.2, protein:15.0, fat:5.5,  satFat:1.5, cholesterol:55,  sodium:330, calcium:20,  iron:1.0, vitA:5,   vitC:1,   vitD:0.1, vitB12:0.2, potassium:200, magnesium:18,  zinc:1.5 }},
  { id:14, name:'갈비탕',     emoji:'🍖', category:'한식',
    nutrients:{ cal:160, carbs:3.0,  sugar:0.5,  fiber:0.2, protein:17.0, fat:9.0,  satFat:3.5, cholesterol:70,  sodium:450, calcium:25,  iron:2.5, vitA:0,   vitC:0,   vitD:0,   vitB12:1.8, potassium:280, magnesium:20,  zinc:4.0 }},
  { id:15, name:'잡채',       emoji:'🍝', category:'한식',
    nutrients:{ cal:155, carbs:25.0, sugar:3.5,  fiber:1.5, protein:5.0,  fat:4.5,  satFat:1.0, cholesterol:25,  sodium:380, calcium:25,  iron:1.5, vitA:30,  vitC:5,   vitD:0,   vitB12:0.1, potassium:180, magnesium:18,  zinc:0.5 }},
  { id:16, name:'냉면',       emoji:'🍜', category:'한식',
    nutrients:{ cal:140, carbs:29.0, sugar:2.5,  fiber:1.0, protein:3.5,  fat:1.5,  satFat:0.3, cholesterol:10,  sodium:510, calcium:15,  iron:0.5, vitA:5,   vitC:2,   vitD:0,   vitB12:0,   potassium:90,  magnesium:12,  zinc:0.3 }},
  { id:17, name:'해물파전',   emoji:'🥘', category:'한식',
    nutrients:{ cal:165, carbs:20.0, sugar:1.5,  fiber:1.0, protein:7.0,  fat:6.5,  satFat:1.5, cholesterol:65,  sodium:450, calcium:60,  iron:1.0, vitA:15,  vitC:5,   vitD:0.5, vitB12:0.5, potassium:150, magnesium:20,  zinc:0.8 }},

  // ── 육류 ─────────────────────────────────
  { id:18, name:'닭가슴살(삶은)', emoji:'🍗', category:'육류',
    nutrients:{ cal:165, carbs:0,    sugar:0,    fiber:0,   protein:31.0, fat:3.6,  satFat:1.0, cholesterol:85,  sodium:74,  calcium:15,  iron:1.0, vitA:9,   vitC:0,   vitD:0.1, vitB12:0.3, potassium:256, magnesium:29,  zinc:1.0 }},
  { id:19, name:'삼겹살(구운)',   emoji:'🥓', category:'육류',
    nutrients:{ cal:331, carbs:0,    sugar:0,    fiber:0,   protein:19.0, fat:28.0, satFat:10,  cholesterol:73,  sodium:61,  calcium:8,   iron:0.7, vitA:5,   vitC:0.3, vitD:0.5, vitB12:0.7, potassium:287, magnesium:20,  zinc:2.0 }},
  { id:20, name:'소고기 등심',    emoji:'🥩', category:'육류',
    nutrients:{ cal:271, carbs:0,    sugar:0,    fiber:0,   protein:26.0, fat:18.0, satFat:7.0, cholesterol:87,  sodium:54,  calcium:10,  iron:2.5, vitA:0,   vitC:0,   vitD:0.1, vitB12:2.5, potassium:318, magnesium:22,  zinc:5.5 }},
  { id:21, name:'치킨(튀긴)',     emoji:'🍗', category:'육류',
    nutrients:{ cal:297, carbs:10.0, sugar:0,    fiber:0.4, protein:26.0, fat:17.0, satFat:4.5, cholesterol:84,  sodium:397, calcium:23,  iron:1.5, vitA:10,  vitC:0,   vitD:0.2, vitB12:0.3, potassium:267, magnesium:25,  zinc:2.0 }},

  // ── 해산물 ────────────────────────────────
  { id:22, name:'고등어(구운)',   emoji:'🐟', category:'해산물',
    nutrients:{ cal:205, carbs:0,    sugar:0,    fiber:0,   protein:20.0, fat:13.0, satFat:3.0, cholesterol:70,  sodium:90,  calcium:28,  iron:1.3, vitA:50,  vitC:0,   vitD:16,  vitB12:12,  potassium:435, magnesium:30,  zinc:0.8 }},
  { id:23, name:'연어(구운)',     emoji:'🐟', category:'해산물',
    nutrients:{ cal:206, carbs:0,    sugar:0,    fiber:0,   protein:22.0, fat:13.0, satFat:2.0, cholesterol:72,  sodium:59,  calcium:13,  iron:0.9, vitA:50,  vitC:3,   vitD:14,  vitB12:3.5, potassium:490, magnesium:30,  zinc:0.5 }},
  { id:24, name:'참치(통조림)',   emoji:'🐟', category:'해산물',
    nutrients:{ cal:109, carbs:0,    sugar:0,    fiber:0,   protein:25.0, fat:0.8,  satFat:0.2, cholesterol:38,  sodium:247, calcium:11,  iron:1.5, vitA:0,   vitC:0,   vitD:0,   vitB12:2.5, potassium:207, magnesium:28,  zinc:0.5 }},
  { id:25, name:'새우(삶은)',     emoji:'🦐', category:'해산물',
    nutrients:{ cal:99,  carbs:0.9,  sugar:0,    fiber:0,   protein:21.0, fat:1.1,  satFat:0.2, cholesterol:195, sodium:189, calcium:64,  iron:0.5, vitA:4,   vitC:2,   vitD:0,   vitB12:1.5, potassium:185, magnesium:35,  zinc:1.5 }},
  { id:26, name:'초밥(연어)',     emoji:'🍣', category:'해산물',
    nutrients:{ cal:175, carbs:26.0, sugar:2.0,  fiber:0.5, protein:9.0,  fat:4.0,  satFat:1.0, cholesterol:25,  sodium:290, calcium:15,  iron:0.5, vitA:20,  vitC:1,   vitD:4,   vitB12:1.5, potassium:160, magnesium:20,  zinc:0.5 }},

  // ── 달걀·콩 ──────────────────────────────
  { id:27, name:'계란(삶은)',  emoji:'🥚', category:'달걀·콩',
    nutrients:{ cal:155, carbs:1.1,  sugar:0.6,  fiber:0,   protein:13.0, fat:11.0, satFat:3.3, cholesterol:373, sodium:124, calcium:50,  iron:1.8, vitA:149, vitC:0,   vitD:2.0, vitB12:1.1, potassium:126, magnesium:12,  zinc:1.0 }},
  { id:28, name:'두부',        emoji:'🟨', category:'달걀·콩',
    nutrients:{ cal:76,  carbs:1.9,  sugar:0.5,  fiber:0.3, protein:8.1,  fat:4.8,  satFat:0.7, cholesterol:0,   sodium:7,   calcium:350, iron:5.4, vitA:0,   vitC:0.1, vitD:0,   vitB12:0,   potassium:121, magnesium:30,  zinc:0.8 }},

  // ── 채소 ─────────────────────────────────
  { id:29, name:'브로콜리',   emoji:'🥦', category:'채소',
    nutrients:{ cal:34,  carbs:7.0,  sugar:1.7,  fiber:2.6, protein:2.8,  fat:0.4,  satFat:0.1, cholesterol:0,   sodium:33,  calcium:47,  iron:0.7, vitA:31,  vitC:89,  vitD:0,   vitB12:0,   potassium:316, magnesium:21,  zinc:0.4 }},
  { id:30, name:'시금치',     emoji:'🌿', category:'채소',
    nutrients:{ cal:23,  carbs:3.6,  sugar:0.4,  fiber:2.2, protein:2.9,  fat:0.4,  satFat:0.1, cholesterol:0,   sodium:79,  calcium:99,  iron:2.7, vitA:469, vitC:28,  vitD:0,   vitB12:0,   potassium:558, magnesium:79,  zinc:0.5 }},
  { id:31, name:'당근',       emoji:'🥕', category:'채소',
    nutrients:{ cal:41,  carbs:10.0, sugar:4.7,  fiber:2.8, protein:0.9,  fat:0.2,  satFat:0,   cholesterol:0,   sodium:69,  calcium:33,  iron:0.3, vitA:835, vitC:5.9, vitD:0,   vitB12:0,   potassium:320, magnesium:12,  zinc:0.2 }},
  { id:32, name:'토마토',     emoji:'🍅', category:'채소',
    nutrients:{ cal:18,  carbs:3.9,  sugar:2.6,  fiber:1.2, protein:0.9,  fat:0.2,  satFat:0,   cholesterol:0,   sodium:5,   calcium:10,  iron:0.3, vitA:42,  vitC:14,  vitD:0,   vitB12:0,   potassium:237, magnesium:11,  zinc:0.2 }},
  { id:33, name:'아보카도',   emoji:'🥑', category:'채소',
    nutrients:{ cal:160, carbs:9.0,  sugar:0.7,  fiber:6.7, protein:2.0,  fat:15.0, satFat:2.1, cholesterol:0,   sodium:7,   calcium:12,  iron:0.6, vitA:7,   vitC:10,  vitD:0,   vitB12:0,   potassium:485, magnesium:29,  zinc:0.6 }},

  // ── 과일 ─────────────────────────────────
  { id:34, name:'바나나',     emoji:'🍌', category:'과일',
    nutrients:{ cal:89,  carbs:23.0, sugar:12.0, fiber:2.6, protein:1.1,  fat:0.3,  satFat:0.1, cholesterol:0,   sodium:1,   calcium:5,   iron:0.3, vitA:3,   vitC:8.7, vitD:0,   vitB12:0,   potassium:358, magnesium:27,  zinc:0.2 }},
  { id:35, name:'사과',       emoji:'🍎', category:'과일',
    nutrients:{ cal:52,  carbs:14.0, sugar:10.0, fiber:2.4, protein:0.3,  fat:0.2,  satFat:0,   cholesterol:0,   sodium:1,   calcium:6,   iron:0.1, vitA:3,   vitC:4.6, vitD:0,   vitB12:0,   potassium:107, magnesium:5,   zinc:0.0 }},
  { id:36, name:'오렌지',     emoji:'🍊', category:'과일',
    nutrients:{ cal:47,  carbs:12.0, sugar:9.4,  fiber:2.4, protein:0.9,  fat:0.1,  satFat:0,   cholesterol:0,   sodium:0,   calcium:40,  iron:0.1, vitA:11,  vitC:53,  vitD:0,   vitB12:0,   potassium:181, magnesium:10,  zinc:0.1 }},
  { id:37, name:'딸기',       emoji:'🍓', category:'과일',
    nutrients:{ cal:32,  carbs:7.7,  sugar:4.9,  fiber:2.0, protein:0.7,  fat:0.3,  satFat:0,   cholesterol:0,   sodium:1,   calcium:16,  iron:0.4, vitA:1,   vitC:59,  vitD:0,   vitB12:0,   potassium:153, magnesium:13,  zinc:0.1 }},
  { id:38, name:'블루베리',   emoji:'🫐', category:'과일',
    nutrients:{ cal:57,  carbs:14.0, sugar:10.0, fiber:2.4, protein:0.7,  fat:0.3,  satFat:0,   cholesterol:0,   sodium:1,   calcium:6,   iron:0.3, vitA:3,   vitC:9.7, vitD:0,   vitB12:0,   potassium:77,  magnesium:6,   zinc:0.2 }},

  // ── 감자류 ───────────────────────────────
  { id:39, name:'고구마(삶은)', emoji:'🍠', category:'감자류',
    nutrients:{ cal:86,  carbs:20.0, sugar:4.2,  fiber:3.0, protein:1.6,  fat:0.1,  satFat:0,   cholesterol:0,   sodium:55,  calcium:30,  iron:0.6, vitA:961, vitC:2.4, vitD:0,   vitB12:0,   potassium:337, magnesium:25,  zinc:0.3 }},
  { id:40, name:'감자(삶은)',   emoji:'🥔', category:'감자류',
    nutrients:{ cal:87,  carbs:20.0, sugar:0.9,  fiber:1.8, protein:1.9,  fat:0.1,  satFat:0,   cholesterol:0,   sodium:5,   calcium:8,   iron:0.4, vitA:0,   vitC:13,  vitD:0,   vitB12:0,   potassium:379, magnesium:20,  zinc:0.3 }},

  // ── 견과류 ───────────────────────────────
  { id:41, name:'아몬드',     emoji:'🥜', category:'견과류',
    nutrients:{ cal:579, carbs:22.0, sugar:4.4,  fiber:12,  protein:21.0, fat:50.0, satFat:3.9, cholesterol:0,   sodium:1,   calcium:264, iron:3.7, vitA:0,   vitC:0,   vitD:0,   vitB12:0,   potassium:733, magnesium:270, zinc:3.1 }},
  { id:42, name:'호두',       emoji:'🥜', category:'견과류',
    nutrients:{ cal:654, carbs:14.0, sugar:2.6,  fiber:6.7, protein:15.0, fat:65.0, satFat:6.1, cholesterol:0,   sodium:2,   calcium:98,  iron:2.9, vitA:1,   vitC:1.3, vitD:0,   vitB12:0,   potassium:441, magnesium:158, zinc:3.1 }},

  // ── 유제품 ───────────────────────────────
  { id:43, name:'우유',         emoji:'🥛', category:'유제품',
    nutrients:{ cal:61,  carbs:4.8,  sugar:4.8,  fiber:0,   protein:3.2,  fat:3.3,  satFat:2.0, cholesterol:13,  sodium:43,  calcium:125, iron:0,   vitA:46,  vitC:0,   vitD:1.2, vitB12:0.5, potassium:132, magnesium:10,  zinc:0.4 }},
  { id:44, name:'그릭요거트',   emoji:'🥛', category:'유제품',
    nutrients:{ cal:59,  carbs:3.6,  sugar:3.2,  fiber:0,   protein:10.0, fat:0.4,  satFat:0.1, cholesterol:5,   sodium:36,  calcium:110, iron:0,   vitA:0,   vitC:0,   vitD:0,   vitB12:0.75,potassium:141, magnesium:11,  zinc:0.5 }},
  { id:45, name:'플레인 요거트', emoji:'🥛', category:'유제품',
    nutrients:{ cal:61,  carbs:4.7,  sugar:4.7,  fiber:0,   protein:3.5,  fat:3.3,  satFat:2.1, cholesterol:13,  sodium:46,  calcium:121, iron:0,   vitA:27,  vitC:0.5, vitD:0.1, vitB12:0.4, potassium:141, magnesium:12,  zinc:0.5 }},

  // ── 간식·기타 ─────────────────────────────
  { id:46, name:'피자(치즈)',   emoji:'🍕', category:'간식',
    nutrients:{ cal:266, carbs:33.0, sugar:3.6,  fiber:2.3, protein:11.0, fat:10.0, satFat:4.5, cholesterol:17,  sodium:598, calcium:188, iron:2.1, vitA:74,  vitC:2,   vitD:0.2, vitB12:0.5, potassium:172, magnesium:23,  zinc:1.2 }},
  { id:47, name:'초콜릿(다크)', emoji:'🍫', category:'간식',
    nutrients:{ cal:546, carbs:60.0, sugar:48.0, fiber:7.0, protein:5.0,  fat:31.0, satFat:18,  cholesterol:3,   sodium:20,  calcium:73,  iron:8.0, vitA:2,   vitC:0,   vitD:0,   vitB12:0,   potassium:559, magnesium:146, zinc:1.6 }},
  { id:48, name:'녹차(우린 것)',emoji:'🍵', category:'음료',
    nutrients:{ cal:2,   carbs:0.4,  sugar:0,    fiber:0,   protein:0.3,  fat:0,    satFat:0,   cholesterol:0,   sodium:0,   calcium:2,   iron:0.1, vitA:0,   vitC:2,   vitD:0,   vitB12:0,   potassium:19,  magnesium:2,   zinc:0   }},
  { id:49, name:'오렌지주스',  emoji:'🧃', category:'음료',
    nutrients:{ cal:45,  carbs:10.0, sugar:8.4,  fiber:0.2, protein:0.7,  fat:0.2,  satFat:0,   cholesterol:0,   sodium:1,   calcium:11,  iron:0.2, vitA:10,  vitC:50,  vitD:0,   vitB12:0,   potassium:200, magnesium:11,  zinc:0.1 }},
  { id:50, name:'콜라',        emoji:'🥤', category:'음료',
    nutrients:{ cal:39,  carbs:10.0, sugar:10.0, fiber:0,   protein:0,    fat:0,    satFat:0,   cholesterol:0,   sodium:11,  calcium:4,   iron:0,   vitA:0,   vitC:0,   vitD:0,   vitB12:0,   potassium:4,   magnesium:2,   zinc:0   }},
];

// 영양소 한글 이름 및 단위
const NUTRIENT_META = {
  cal:         { label:'열량',       unit:'kcal', color:'#e53e3e' },
  carbs:       { label:'탄수화물',   unit:'g',    color:'#d69e2e' },
  sugar:       { label:'당류',       unit:'g',    color:'#f6ad55' },
  fiber:       { label:'식이섬유',   unit:'g',    color:'#48bb78' },
  protein:     { label:'단백질',     unit:'g',    color:'#4299e1' },
  fat:         { label:'지방',       unit:'g',    color:'#ed8936' },
  satFat:      { label:'포화지방',   unit:'g',    color:'#fc8181' },
  cholesterol: { label:'콜레스테롤', unit:'mg',   color:'#9f7aea' },
  sodium:      { label:'나트륨',     unit:'mg',   color:'#f687b3' },
  calcium:     { label:'칼슘',       unit:'mg',   color:'#76e4f7' },
  iron:        { label:'철분',       unit:'mg',   color:'#e53e3e' },
  vitA:        { label:'비타민A',    unit:'μgRAE',color:'#f6ad55' },
  vitC:        { label:'비타민C',    unit:'mg',   color:'#68d391' },
  vitD:        { label:'비타민D',    unit:'μg',   color:'#ffd700' },
  vitB12:      { label:'비타민B12',  unit:'μg',   color:'#9f7aea' },
  potassium:   { label:'칼륨',       unit:'mg',   color:'#4299e1' },
  magnesium:   { label:'마그네슘',   unit:'mg',   color:'#48bb78' },
  zinc:        { label:'아연',       unit:'mg',   color:'#a0aec0' },
};

// 하루 권장 섭취량 (성인 기준, 보건복지부)
const DRI = {
  cal:2000, carbs:324, sugar:100, fiber:25, protein:55,
  fat:54, satFat:15, cholesterol:300, sodium:2000,
  calcium:800, iron:12, vitA:700, vitC:100, vitD:10,
  vitB12:2.4, potassium:3500, magnesium:315, zinc:8,
};

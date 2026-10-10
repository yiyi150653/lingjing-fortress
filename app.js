(() => {
  const SAVE_KEY = 'lingjing-fortress-saves';
  const CONTROL_MODE_KEY = 'lingjing-control-mode';
  const SAVE_VERSION = 9;
  const SLOT_COUNT = 6;
  const LORD_ID = 'placeholder-pioneer';
  const LORD_NAME = '无名的开拓者';
  const BUILDINGS = [
    { id: 'main-base', name: '大本营', image: 'assets/main-base.png', fixed: true, detail: '文明的核心。负责仓储、建造与人口管理。' },
    { id: 'lumberyard', name: '伐木场', image: 'assets/lumber-yard.png', wood: 4, stone: 1, resource: 'wood', production: { wood: 2 }, detail: '在林地建造后，每回合产出木材。' },
    { id: 'mine', name: '矿场', image: 'assets/mine-workshop.png', wood: 3, stone: 2, resource: 'stone', production: { stone: 2 }, detail: '在石料地建造后，每回合产出石料。' },
    { id: 'farm', name: '农田', image: 'assets/farmstead.png', wood: 3, stone: 1, resource: 'food', production: { food: 3 }, detail: '在草原或果树林建造后，每回合产出粮食。' },
    { id: 'barracks', name: '兵营', image: 'assets/barracks.png', wood: 6, stone: 4, detail: '招募并整备原始时代的基础卫队。' },
    { id: 'house', name: '民居', image: 'assets/cottage.png', wood: 3, stone: 0, housing: 2, detail: '增加 2 个居民容量，粮食充足时人口会增长。' },
  ];
  const BUILDING_BY_ID = new Map(BUILDINGS.map((building) => [building.id, building]));
  const MAIN_BASE_ID = 'main-base';
  // Add future worlds here; rendering, carousel navigation and directory are data-driven.
  const WORLDS = [
    { id: 'initial-world', name: '初始之地', description: '文明的第一片土地', open: true, image: 'assets/world-island-initial.png' },
    ...[2, 3, 4, 5].map((number) => ({ id: 'world-' + number, name: '待命名坐标 ' + String(number).padStart(2, '0'), description: '尚未开放 · 世界设定待补充', open: false, image: 'assets/world-island-initial.png' })),
  ];
  const NODE_COOLDOWN_MS = 30 * 60 * 1000;
  const GATHER_DURATION_MS = 2500;
  const WOODCRAFT_RESEARCH_MS = 10 * 1000;
  const WOODCRAFT_COST = 3;
  const MINA_PORTRAITS = {
    welcoming: 'assets/mina-welcoming.jpg',
    concerned: 'assets/mina-concerned.jpg',
    relieved: 'assets/mina-relieved.jpg',
    speaking: 'assets/mina-speaking.jpg',
  };
  const INTRO_DIALOGUE = [
    { mood: 'welcoming', line: '哦！我伟大的领主大人，我是您的助理米娜' },
    { mood: 'concerned', line: '我们历经千险终于逃离了那片世界，很不幸，我们遗失了文明和底蕴' },
    { mood: 'relieved', line: '不过万幸我们活下来了，至少我们可以在这边暂时安宁的地方发展一番' },
    { mood: 'welcoming', line: '相信，在你的领导下，我们会反攻那个世界或者成为宇宙霸主的' },
    { mood: 'relieved', line: '在这个过程我会帮助你，领主大人' },
  ];
  const HEX_RADIUS = 18;
  const HEX_WIDTH = 150;
  const HEX_HEIGHT = 166;
  const HEX_MAP_WIDTH = 5800;
  const HEX_MAP_HEIGHT = 4900;
  const MAP_ZOOM_DEFAULT = .76;
  const MAP_ZOOM_MIN = .56;
  const MAP_ZOOM_MAX = 1.08;
  const MAP_VISION_RADIUS = 4;
  const MOVEMENT_PER_TURN = 2;
  const RESOURCE_NAMES = { wood: '木材', stone: '石料', food: '粮食' };
  const HEX_RESOURCE_GLYPHS = {
    wood: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 5.5h11.5a3 3 0 0 1 0 6H4a3 3 0 0 1 0-6Z" fill="#8a552f" stroke="#e4bc80" stroke-width="1.2"/><ellipse cx="15.5" cy="8.5" rx="2.1" ry="3" fill="#c58a4c" stroke="#f0d09a" stroke-width="1"/><path d="M7 12.5h12a3 3 0 0 1 0 6H7a3 3 0 0 1 0-6Z" fill="#9e6538" stroke="#eac58c" stroke-width="1.2"/><ellipse cx="19" cy="15.5" rx="2.1" ry="3" fill="#d19a5b" stroke="#f4d9aa" stroke-width="1"/></svg>',
    stone: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m2.5 18 2.3-7.1 4.3-2.5 3.4 2.1 3.4-4.2 4.5 2.3 2.7 9.4Z" fill="#727c77" stroke="#d3d4c3" stroke-width="1.25" stroke-linejoin="round"/><path d="m6 12 3.2-1.5 2.3 2.5M15.5 9.3l3 1.5 1.1 4.3" fill="none" stroke="#eff0da" stroke-opacity=".72" stroke-width="1.1" stroke-linecap="round"/></svg>',
    food: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.5 21V4" fill="none" stroke="#d5b35d" stroke-width="1.8" stroke-linecap="round"/><path d="M11.4 8.5C8 8 7 5.8 7.5 4.2c2.8.2 4.2 1.7 3.9 4.3ZM11.7 12c3.4-.5 4.4-2.7 3.9-4.3-2.8.2-4.2 1.7-3.9 4.3ZM11.4 15.4C8 15 7 12.7 7.5 11.1c2.8.2 4.2 1.7 3.9 4.3ZM11.7 18.7c3.4-.5 4.4-2.7 3.9-4.3-2.8.2-4.2 1.7-3.9 4.3Z" fill="#dfbe65" stroke="#f3dfa0" stroke-width=".7" stroke-linejoin="round"/></svg>',
  };
  const TECH_ERAS = ['原始时代', '石器时代', '封建时代', '帝国时代', '次工业时代', '工业时代', '信息时代', '原子时代'];
  const NODES = [
    { id: 'tree-01', type: 'tree', name: '林木', x: .43, y: .57, size: 170, yield: 2 },
    { id: 'tree-02', type: 'tree', name: '林木', x: .65, y: .52, size: 185, yield: 2 },
    { id: 'tree-03', type: 'tree', name: '林木', x: .32, y: .70, size: 160, yield: 2 },
    { id: 'tree-04', type: 'tree', name: '林木', x: .72, y: .69, size: 170, yield: 2 },
    { id: 'tree-05', type: 'tree', name: '林木', x: .52, y: .35, size: 150, yield: 2 },
    { id: 'tree-06', type: 'tree', name: '林木', x: .20, y: .43, size: 170, yield: 2 },
    { id: 'tree-07', type: 'tree', name: '林木', x: .82, y: .54, size: 165, yield: 2 },
    { id: 'tree-08', type: 'tree', name: '林木', x: .36, y: .86, size: 176, yield: 2 },
    { id: 'fruit-01', type: 'fruit', name: '果树', x: .27, y: .31, size: 178, yield: 2 },
    { id: 'fruit-02', type: 'fruit', name: '果树', x: .69, y: .31, size: 182, yield: 2 },
    { id: 'fruit-03', type: 'fruit', name: '果树', x: .29, y: .78, size: 172, yield: 2 },
    { id: 'stone-01', type: 'stone', name: '石料堆', x: .59, y: .63, size: 132, yield: 1 },
    { id: 'stone-02', type: 'stone', name: '石料堆', x: .49, y: .66, size: 140, yield: 1 },
    { id: 'stone-03', type: 'stone', name: '石料堆', x: .75, y: .44, size: 126, yield: 1 },
    { id: 'stone-04', type: 'stone', name: '石料堆', x: .25, y: .56, size: 120, yield: 1 },
    { id: 'stone-05', type: 'stone', name: '石料堆', x: .57, y: .82, size: 138, yield: 1 },
    { id: 'stone-06', type: 'stone', name: '石料堆', x: .80, y: .34, size: 130, yield: 1 },
    { id: 'mine-01', type: 'mine', name: '未开启矿洞', x: .79, y: .78, size: 156, yield: 0 },
  ];
  const HEX_DIRECTIONS = [
    { q: 1, r: 0 }, { q: 1, r: -1 }, { q: 0, r: -1 },
    { q: -1, r: 0 }, { q: -1, r: 1 }, { q: 0, r: 1 },
  ];
  const HEX_RESOURCE_LAYOUT = {
    '-1,0': { kind: 'wood', yield: 1, name: '林地' },
    '-1,1': { kind: 'wood', yield: 1, name: '密林' },
    '0,-1': { kind: 'wood', yield: 1, name: '林地' },
    '1,0': { kind: 'stone', yield: 1, name: '石料丘陵' },
    '1,-1': { kind: 'stone', yield: 1, name: '裸岩地' },
    '0,1': { kind: 'food', yield: 2, name: '果树林' },
    '-2,1': { kind: 'wood', yield: 1, name: '林地' },
    '-2,2': { kind: 'food', yield: 2, name: '果树林' },
    '2,-2': { kind: 'stone', yield: 1, name: '石料丘陵' },
    '2,-1': { kind: 'wood', yield: 1, name: '林地' },
    '0,3': { kind: 'food', yield: 2, name: '果树林' },
    '-3,1': { kind: 'stone', yield: 1, name: '裸岩地' },
    '3,-2': { kind: 'wood', yield: 1, name: '林地' },
    '3,0': { kind: 'stone', yield: 1, name: '石料丘陵' },
    '-4,2': { kind: 'food', yield: 2, name: '果树林' },
    '4,-1': { kind: 'wood', yield: 1, name: '密林' },
    '-2,-2': { kind: 'wood', yield: 1, name: '密林' },
    '1,3': { kind: 'stone', yield: 1, name: '裸岩地' },
    '-4,4': { kind: 'wood', yield: 1, name: '林地' },
    '4,-4': { kind: 'food', yield: 2, name: '果树林' },
  };
  const HEX_RESOURCE_PATCHES = [
    { q: -8, r: 2, kind: 'wood', radius: 2, density: .78 },
    { q: -5, r: -6, kind: 'wood', radius: 2, density: .74 },
    { q: 2, r: -9, kind: 'wood', radius: 2, density: .8 },
    { q: 8, r: -4, kind: 'wood', radius: 2, density: .76 },
    { q: 9, r: 2, kind: 'wood', radius: 2, density: .76 },
    { q: 0, r: 8, kind: 'wood', radius: 2, density: .74 },
    { q: -7, r: 7, kind: 'wood', radius: 2, density: .78 },
    { q: -9, r: -1, kind: 'stone', radius: 2, density: .68 },
    { q: -3, r: -9, kind: 'stone', radius: 2, density: .68 },
    { q: 7, r: -7, kind: 'stone', radius: 2, density: .7 },
    { q: 10, r: 0, kind: 'stone', radius: 2, density: .66 },
    { q: 4, r: 8, kind: 'stone', radius: 2, density: .68 },
    { q: -10, r: 5, kind: 'food', radius: 2, density: .64 },
    { q: 3, r: 9, kind: 'food', radius: 2, density: .66 },
    { q: 9, r: -8, kind: 'food', radius: 2, density: .64 },
    { q: -13, r: 1, kind: 'wood', radius: 2, density: .76 },
    { q: 3, r: -13, kind: 'wood', radius: 2, density: .76 },
    { q: 11, r: 4, kind: 'wood', radius: 2, density: .74 },
    { q: -4, r: 12, kind: 'wood', radius: 2, density: .74 },
    { q: -15, r: 2, kind: 'wood', radius: 2, density: .76 },
    { q: 2, r: -16, kind: 'wood', radius: 2, density: .76 },
    { q: 12, r: 6, kind: 'wood', radius: 2, density: .74 },
    { q: -7, r: 15, kind: 'wood', radius: 2, density: .74 },
    { q: 17, r: -12, kind: 'wood', radius: 2, density: .74 },
    { q: -13, r: 0, kind: 'stone', radius: 2, density: .66 },
    { q: -5, r: -10, kind: 'stone', radius: 2, density: .66 },
    { q: 12, r: -3, kind: 'stone', radius: 2, density: .68 },
    { q: 1, r: 13, kind: 'stone', radius: 2, density: .66 },
    { q: -17, r: 0, kind: 'stone', radius: 2, density: .66 },
    { q: -7, r: -11, kind: 'stone', radius: 2, density: .66 },
    { q: 14, r: -4, kind: 'stone', radius: 2, density: .68 },
    { q: 2, r: 16, kind: 'stone', radius: 2, density: .66 },
    { q: -2, r: -13, kind: 'food', radius: 2, density: .64 },
    { q: 7, r: 8, kind: 'food', radius: 2, density: .64 },
    { q: -8, r: 7, kind: 'food', radius: 2, density: .64 },
    { q: -14, r: 4, kind: 'food', radius: 2, density: .64 },
    { q: 0, r: 17, kind: 'food', radius: 2, density: .64 },
    { q: 14, r: 4, kind: 'food', radius: 2, density: .64 },
    { q: -3, r: -15, kind: 'food', radius: 2, density: .64 },
  ];
  // Large, connected biome masses keep landforms readable at strategy-map scale.
  const HEX_BIOME_PATCHES = {
    forest: [
      { q: -10, r: 1, radius: 3.5 }, { q: -6, r: -7, radius: 3.3 }, { q: 4, r: -9, radius: 3.2 },
      { q: 10, r: -2, radius: 3.1 }, { q: 9, r: 3, radius: 3.4 }, { q: 6, r: 6, radius: 3.1 },
      { q: -8, r: 7, radius: 3.3 }, { q: -13, r: 1, radius: 3.2 }, { q: 3, r: -13, radius: 3.1 },
      { q: 11, r: 4, radius: 3.1 }, { q: -4, r: 12, radius: 3.1 },
      { q: -16, r: 1, radius: 3.1 }, { q: 2, r: -16, radius: 3.1 }, { q: 12, r: 6, radius: 3.2 },
      { q: -7, r: 15, radius: 3.1 }, { q: 17, r: -12, radius: 3.1 },
    ],
    hills: [
      { q: -11, r: -3, radius: 2.7 }, { q: -3, r: -11, radius: 2.5 }, { q: 7, r: -9, radius: 2.5 },
      { q: -9, r: 5, radius: 2.6 }, { q: 4, r: 8, radius: 2.5 }, { q: -13, r: 0, radius: 2.5 },
      { q: -5, r: -10, radius: 2.4 }, { q: 12, r: -3, radius: 2.5 }, { q: 1, r: 13, radius: 2.5 },
      { q: -17, r: 0, radius: 2.5 }, { q: -7, r: -11, radius: 2.4 }, { q: 14, r: -4, radius: 2.5 },
      { q: 2, r: 16, radius: 2.5 }, { q: -13, r: 5, radius: 2.5 },
    ],
    mountain: [
      { q: -9, r: -5, radius: 2.05 }, { q: -2, r: -11, radius: 1.9 }, { q: 7, r: -10, radius: 1.9 },
      { q: -13, r: -2, radius: 1.8 }, { q: 12, r: -7, radius: 1.8 },
      { q: -16, r: -2, radius: 1.8 }, { q: -4, r: -14, radius: 1.85 }, { q: 11, r: -10, radius: 1.8 },
    ],
    water: [
      { q: 10, r: 0, radius: 1.8 }, { q: 8, r: 4, radius: 1.75 }, { q: 6, r: 6, radius: 1.65 },
      { q: 14, r: 0, radius: 1.7 }, { q: 12, r: 3, radius: 1.7 }, { q: 9, r: 6, radius: 1.65 },
      { q: 17, r: 0, radius: 1.7 }, { q: 15, r: 3, radius: 1.7 }, { q: 11, r: 7, radius: 1.65 },
    ],
  };
  const HEX_TERRAIN_NAMES = { camp: '营地', plains: '草原', forest: '林地', hills: '丘陵', mountain: '高山', water: '浅水' };
  const HEX_TILES = createHexTiles();
  const HEX_TILE_BY_ID = new Map(HEX_TILES.map((tile) => [tile.id, tile]));
  const TASKS = [
    { title: '建设伐木场，开始生产木材', key: 'building', target: 'lumberyard', hint: '控制一块林地，按 B 建造伐木场。设施建成后会在每回合产出木材。' },
    { title: '建设农田，保障粮食', key: 'building', target: 'farm', hint: '控制草原或果树林，再建造农田以稳定获得粮食。' },
    { title: '建设兵营，招募基础卫队', key: 'building', target: 'barracks', hint: '在已控制的空地建造兵营，之后可以手动招募民兵。' },
    { title: '招募第一支卫队', key: 'unit', target: 1, hint: '选中兵营并招募民兵。每回合由你亲自下令移动部队。' },
    { title: '营地已迈出第一步', key: 'done', target: 1, hint: '开拓日志已完成，可以自由发展。' },
  ];

  function hexId(q, r) { return q + ',' + r; }
  function hexDistance(a, b) { return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs((a.q + a.r) - (b.q + b.r))) / 2; }
  function tileNoise(q, r, salt = 0) {
    let value = Math.imul(q + 4099 + salt * 31, 374761393) ^ Math.imul(r + 2053 - salt * 17, 668265263);
    value = Math.imul(value ^ (value >>> 13), 1274126177);
    return ((value ^ (value >>> 16)) >>> 0) / 4294967296;
  }
  function generatedHexResource(q, r, distance, terrain) {
    if (distance < 6) return null;
    const matches = HEX_RESOURCE_PATCHES.map((patch) => ({ patch, distance: hexDistance({ q, r }, patch) }))
      .filter((item) => item.distance <= item.patch.radius)
      .sort((a, b) => a.distance - b.distance);
    const nearest = matches[0];
    if (nearest && (nearest.distance === 0 || tileNoise(q, r, nearest.patch.kind === 'wood' ? 1 : nearest.patch.kind === 'stone' ? 2 : 3) < nearest.patch.density)) {
      const names = { wood: '林地', stone: '石料丘陵', food: '果树林' };
      return { kind: nearest.patch.kind, yield: nearest.patch.kind === 'food' ? 2 : 1, name: names[nearest.patch.kind] };
    }
    if (terrain === 'forest' && tileNoise(q, r, 7) < .18) return { kind: 'wood', yield: 1, name: '林地' };
    if (terrain === 'hills' && tileNoise(q, r, 11) < .14) return { kind: 'stone', yield: 1, name: '石料丘陵' };
    return null;
  }
  function biomeStrength(q, r, patches, salt) {
    return patches.reduce((strength, patch, index) => {
      const distance = hexDistance({ q, r }, patch);
      const edgeVariation = (tileNoise(q, r, salt + index) - .5) * .9;
      return Math.max(strength, patch.radius - distance + edgeVariation);
    }, -Infinity);
  }
  function visualTerrainFor(tile) {
    if (tile.terrain === 'camp' || tile.terrain === 'water' || tile.terrain === 'mountain') return tile.terrain;
    let forest = biomeStrength(tile.q, tile.r, HEX_BIOME_PATCHES.forest, 21);
    let hills = biomeStrength(tile.q, tile.r, HEX_BIOME_PATCHES.hills, 41);
    if (tile.resource?.kind === 'wood') forest = Math.max(forest, .55);
    if (tile.resource?.kind === 'stone') hills = Math.max(hills, .55);
    if (forest > .2 && forest > hills + .15) return 'forest';
    if (hills > .2 && hills > forest + .15) return 'hills';
    return 'plains';
  }
  function naturalTerrainFor(q, r, distance) {
    // Preserve a generous starting clearing. Water and high ground form edge clusters,
    // while forest and hills transition in broad patches instead of checkerboard noise.
    if (distance <= 3) return 'plains';
    const water = biomeStrength(q, r, HEX_BIOME_PATCHES.water, 61);
    const mountain = biomeStrength(q, r, HEX_BIOME_PATCHES.mountain, 71);
    const forest = biomeStrength(q, r, HEX_BIOME_PATCHES.forest, 21);
    const hills = biomeStrength(q, r, HEX_BIOME_PATCHES.hills, 41);
    if (distance >= 8 && water > .05) return 'water';
    if (mountain > .05) return 'mountain';
    if (hills > .05 && hills > forest + .08) return 'hills';
    if (forest > .05) return 'forest';
    return 'plains';
  }
  function createHexTiles() {
    const tiles = [];
    for (let q = -HEX_RADIUS; q <= HEX_RADIUS; q += 1) {
      for (let r = -HEX_RADIUS; r <= HEX_RADIUS; r += 1) {
        const distance = Math.max(Math.abs(q), Math.abs(r), Math.abs(q + r));
        if (distance > HEX_RADIUS) continue;
        const id = hexId(q, r);
        let resource = HEX_RESOURCE_LAYOUT[id] || null;
        let terrain = q === 0 && r === 0 ? 'camp' : naturalTerrainFor(q, r, distance);
        if (resource?.kind === 'wood') terrain = 'forest';
        else if (resource?.kind === 'stone') terrain = 'hills';
        else if (resource?.kind === 'food') terrain = 'plains';
        if (!resource) resource = generatedHexResource(q, r, distance, terrain);
        if (resource?.kind === 'wood') terrain = 'forest';
        else if (resource?.kind === 'stone') terrain = 'hills';
        else if (resource?.kind === 'food') terrain = 'plains';
        const tile = { id, q, r, distance, terrain, resource, passable: terrain !== 'water' && terrain !== 'mountain' };
        tile.visualTerrain = visualTerrainFor(tile);
        tiles.push(tile);
      }
    }
    return tiles;
  }

  const screens = [...document.querySelectorAll('.screen')];
  const saveOverlay = document.getElementById('saveOverlay');
  const modeOverlay = document.getElementById('modeOverlay');
  const gameShell = document.getElementById('gameShell');
  const campDialog = document.getElementById('campDialog');
  const worldDirectory = document.getElementById('worldDirectory');
  const saveGrid = document.getElementById('saveGrid');
  const toast = document.getElementById('toast');
  const localToast = document.getElementById('localToast');
  const mapPlane = document.getElementById('localMapPlane');
  const localViewport = document.getElementById('localViewport');
  const localPlayer = document.getElementById('localPlayer');
  const worldCarousel = document.getElementById('worldCarousel');
  const worldStage = document.getElementById('worldStage');
  const regionViewport = document.getElementById('regionViewport');
  const regionMapPlane = document.getElementById('regionMapPlane');
  const worldObjects = document.getElementById('worldObjects');
  const buildingGhost = document.getElementById('buildingGhost');
  const buildPanel = document.getElementById('buildPanel');
  const technologyOverlay = document.getElementById('technologyOverlay');
  const assistantDialog = document.getElementById('assistantDialog');
  const assistantDialogLine = assistantDialog.querySelector('.assistant-dialog-line');
  const assistantAdvisorPortrait = assistantDialog.querySelector('.assistant-advisor-portrait');
  const assistantContinueButton = assistantDialog.querySelector('.assistant-dialog-continue');
  const assistantSceneKicker = document.getElementById('assistantSceneKicker');
  const assistantSceneCaption = document.getElementById('assistantSceneCaption');
  const assistantDialogLabel = document.getElementById('assistantDialogLabel');
  const assistantDialogTitle = document.getElementById('assistantDialogTitle');
  const assistantDialogNote = assistantDialog.querySelector('.assistant-dialog-note');
  const assistantDialogFootnote = assistantDialog.querySelector('.assistant-dialog-footnote');
  Object.values(MINA_PORTRAITS).forEach((assetPath) => {
    const frame = new Image();
    frame.src = window.LINGJING_ASSETS?.[assetPath] || assetPath;
  });
  const techEraTrack = document.getElementById('techEraTrack');
  const techEraNav = document.getElementById('techEraNav');
  const techEraCounter = document.getElementById('techEraCounter');
  const mobileControls = document.getElementById('mobileControls');
  const mobileJoystick = document.getElementById('mobileJoystick');
  const joystickKnob = document.getElementById('joystickKnob');
  const mobileEndTurnButton = document.getElementById('mobileEndTurnButton');
  const orientationPrompt = document.getElementById('orientationPrompt');
  const tutorialPanel = document.getElementById('tutorialPanel');
  const interactionPrompt = document.getElementById('interactionPrompt');
  const selectionPanel = document.getElementById('selectionPanel');
  const selectionKind = document.getElementById('selectionKind');
  const selectionName = document.getElementById('selectionName');
  const selectionDetails = document.getElementById('selectionDetails');

  const emptyWorldData = () => ({
    player: { q: 0, r: 0 },
    inventory: { wood: 8, stone: 6, food: 8 },
    nodes: {},
    tiles: { '0,0': { discovered: true, owned: true } },
    turn: 1,
    movement: MOVEMENT_PER_TURN,
    units: [{ id: 'lord', type: 'lord', name: LORD_NAME, q: 0, r: 0, health: 24, maxHealth: 24, attack: 4, range: 1, actionPoints: MOVEMENT_PER_TURN, maxActionPoints: MOVEMENT_PER_TURN }],
    population: { citizens: 4, housing: 4, growthProgress: 0 },
    buildings: [{ id: MAIN_BASE_ID, name: '大本营', q: 0, r: 0 }],
  });
  const emptySlot = (id) => ({
    id, lordId: null, lordName: null, worldId: null, screen: null, updatedAt: null, introSeen: false,
    worldStates: { 'initial-world': emptyWorldData() }, tutorialStep: 0,
    research: { woodcraft: { status: 'available', startedAt: 0, completedAt: 0 } },
  });
  const defaultState = () => ({ version: SAVE_VERSION, activeSlot: null, slots: Array.from({ length: SLOT_COUNT }, (_, i) => emptySlot(i + 1)) });
  let state = readState();
  let toastTimer;
  let currentScreen = 'title';
  let inputMode = readInputMode();
  let portraitPromptDismissed = false;
  let playerHex = { q: 0, r: 0 };
  let selectedHexId = '0,0';
  let selectedUnitId = 'lord';
  let selectedBuildingKey = null;
  let mapMetrics = { width: HEX_MAP_WIDTH, height: HEX_MAP_HEIGHT };
  let mapCamera = { x: 0, y: 0, zoom: MAP_ZOOM_DEFAULT, initialized: false, pointer: null };
  let mapCameraSlotId = null;
  let localDraggedUntil = 0;
  let regionMetrics = { width: 1800, height: 1012 };
  let regionPan = { x: 0, y: 0 };
  let selectedWorldIndex = 0;
  let focusedNodeId = null;
  let buildMode = false;
  let currentTechEra = 0;
  let chosenBuilding = null;
  let worldTurning = false;
  let activeGather = null;
  let gatherTicker = 0;
  let researchTicker = 0;
  let assistantTypingTimer = 0;
  let assistantSpeechTimer = 0;
  let introLineIndex = -1;
  let regionDraggedUntil = 0;
  let lastLocalUiAt = 0;
  const pressedKeys = new Set();
  let unitMoving = false;
  let unitMoveTimer = 0;
  let regionPointer = null;
  let joystickPointerId = null;
  let joystickVector = { x: 0, y: 0 };

  function readInputMode() {
    try {
      const saved = localStorage.getItem(CONTROL_MODE_KEY);
      if (saved === 'desktop' || saved === 'mobile') return saved;
    } catch { /* Use the current device as a first-visit hint. */ }
    return window.matchMedia?.('(pointer: coarse)').matches ? 'mobile' : 'desktop';
  }

  function clamp(value, min, max) { return Math.min(max, Math.max(min, value)); }
  function normalizeWorldData(raw, legacy = {}) {
    const blank = emptyWorldData();
    const inventorySource = raw?.inventory || raw?.resources || legacy.resources || {};
    const inventory = {
      wood: Math.max(0, Math.floor(Number.isFinite(inventorySource.wood) ? inventorySource.wood : 0)),
      stone: Math.max(0, Math.floor(Number.isFinite(inventorySource.stone) ? inventorySource.stone : 0)),
      food: Math.max(0, Math.floor(Number.isFinite(inventorySource.food) ? inventorySource.food : 0)),
    };
    const nodes = {};
    const sourceNodes = raw?.nodes && typeof raw.nodes === 'object' ? raw.nodes : null;
    if (sourceNodes) {
      Object.entries(sourceNodes).forEach(([id, value]) => {
        if (!value || typeof value !== 'object') return;
        const readyAt = Number.isFinite(value.readyAt) ? value.readyAt : 0;
        const oldPendingPickup = value.status === 'awaiting-pickup';
        const status = oldPendingPickup ? (readyAt > Date.now() ? 'cooldown' : 'available') :
          (['available', 'cooldown', 'destroyed'].includes(value.status) ? value.status : 'available');
        nodes[id] = { status, readyAt };
      });
    } else if (legacy.nodeCooldowns && typeof legacy.nodeCooldowns === 'object') {
      Object.entries(legacy.nodeCooldowns).forEach(([id, readyAt]) => {
        if (Number.isFinite(readyAt) && readyAt > Date.now()) nodes[id] = { status: 'cooldown', readyAt };
      });
    }
    // Migrate resources left on the ground by earlier builds directly into storage.
    // The current version has no world-drop or pickup step.
    const oldDrops = Array.isArray(raw?.drops) ? raw.drops.filter((drop) =>
      drop && typeof drop.id === 'string' && typeof drop.nodeId === 'string' &&
      ['wood', 'stone', 'food'].includes(drop.kind) && Number.isFinite(drop.amount) && drop.amount > 0
    ).map((drop) => ({
      id: drop.id, nodeId: drop.nodeId, kind: drop.kind, amount: Math.max(1, Math.floor(drop.amount)),
    })) : [];
    oldDrops.forEach((drop) => {
      inventory[drop.kind] += drop.amount;
      const nodeState = nodes[drop.nodeId];
      if (nodeState) nodes[drop.nodeId] = {
        status: nodeState.readyAt > Date.now() ? 'cooldown' : 'available',
        readyAt: nodeState.readyAt,
      };
    });
    const point = raw?.player || legacy.player || blank.player;
    const player = Number.isInteger(point.q) && Number.isInteger(point.r) && HEX_TILE_BY_ID.has(hexId(point.q, point.r))
      ? { q: point.q, r: point.r }
      : { ...blank.player };
    const tiles = {};
    if (raw?.tiles && typeof raw.tiles === 'object') {
      Object.entries(raw.tiles).forEach(([id, value]) => {
        if (!HEX_TILE_BY_ID.has(id) || !value || typeof value !== 'object') return;
        tiles[id] = { discovered: Boolean(value.discovered), owned: Boolean(value.owned) };
      });
    }
    if (!tiles[hexId(0, 0)]) tiles[hexId(0, 0)] = { discovered: true, owned: true };
    HEX_TILES.forEach((tile) => {
      const distance = hexDistance(player, tile);
      if (distance <= MAP_VISION_RADIUS) {
        tiles[tile.id] ||= { discovered: true, owned: false };
        tiles[tile.id].discovered = true;
      }
    });
    const buildingSource = Array.isArray(raw?.buildings) ? raw.buildings : legacy.buildings;
    const sourceBuildings = Array.isArray(buildingSource) ? buildingSource.filter((item) => item && typeof item.id === 'string') : [];
    const previousBase = sourceBuildings.find((item) => item.id === MAIN_BASE_ID) || sourceBuildings.find((item) => item.id === 'workshop');
    const basePoint = previousBase && Number.isInteger(previousBase.q) && Number.isInteger(previousBase.r) && HEX_TILE_BY_ID.has(hexId(previousBase.q, previousBase.r))
      ? { q: previousBase.q, r: previousBase.r }
      : { q: 0, r: 0 };
    const buildings = sourceBuildings.filter((item) => ![MAIN_BASE_ID, 'workshop'].includes(item.id)).map((item) => ({
      id: item.id, name: typeof item.name === 'string' ? item.name : (BUILDING_BY_ID.get(item.id)?.name || '建筑'),
      q: Number.isInteger(item.q) && Number.isInteger(item.r) && HEX_TILE_BY_ID.has(hexId(item.q, item.r)) ? item.q : 0,
      r: Number.isInteger(item.q) && Number.isInteger(item.r) && HEX_TILE_BY_ID.has(hexId(item.q, item.r)) ? item.r : 0,
    }));
    buildings.unshift({ id: MAIN_BASE_ID, name: '大本营', q: basePoint.q, r: basePoint.r });
    const populationSource = raw?.population && typeof raw.population === 'object' ? raw.population : {};
    const population = {
      citizens: clamp(Math.floor(Number.isFinite(populationSource.citizens) ? populationSource.citizens : 4), 0, 999),
      housing: Math.max(4 + buildings.filter((building) => building.id === 'house').length * 2,
        Math.floor(Number.isFinite(populationSource.housing) ? populationSource.housing : 4)),
      growthProgress: clamp(Math.floor(Number.isFinite(populationSource.growthProgress) ? populationSource.growthProgress : 0), 0, 2),
    };
    const unitSource = Array.isArray(raw?.units) ? raw.units : [];
    const units = unitSource.filter((unit) => unit && typeof unit.id === 'string' && ['lord', 'militia'].includes(unit.type)).map((unit) => {
      const fallback = unit.type === 'lord'
        ? { name: LORD_NAME, health: 24, maxHealth: 24, attack: 4, range: 1 }
        : { name: '原始民兵', health: 14, maxHealth: 14, attack: 3, range: 1 };
      const unitPoint = Number.isInteger(unit.q) && Number.isInteger(unit.r) && HEX_TILE_BY_ID.has(hexId(unit.q, unit.r)) ? { q: unit.q, r: unit.r } : player;
      const maxActionPoints = clamp(Math.floor(Number.isFinite(unit.maxActionPoints) ? unit.maxActionPoints : MOVEMENT_PER_TURN), 1, 6);
      return {
        id: unit.type === 'lord' ? 'lord' : unit.id, type: unit.type,
        name: typeof unit.name === 'string' ? unit.name : fallback.name,
        q: unitPoint.q, r: unitPoint.r,
        health: clamp(Math.floor(Number.isFinite(unit.health) ? unit.health : fallback.health), 0, 999),
        maxHealth: clamp(Math.floor(Number.isFinite(unit.maxHealth) ? unit.maxHealth : fallback.maxHealth), 1, 999),
        attack: clamp(Math.floor(Number.isFinite(unit.attack) ? unit.attack : fallback.attack), 0, 999),
        range: clamp(Math.floor(Number.isFinite(unit.range) ? unit.range : fallback.range), 1, 99),
        actionPoints: clamp(Math.floor(Number.isFinite(unit.actionPoints) ? unit.actionPoints : (unit.type === 'lord' ? raw?.movement : maxActionPoints)), 0, maxActionPoints),
        maxActionPoints,
      };
    });
    let lordUnit = units.find((unit) => unit.type === 'lord');
    if (!lordUnit) {
      lordUnit = { id: 'lord', type: 'lord', name: LORD_NAME, q: player.q, r: player.r, health: 24, maxHealth: 24, attack: 4, range: 1, actionPoints: clamp(Math.floor(Number.isFinite(raw?.movement) ? raw.movement : MOVEMENT_PER_TURN), 0, MOVEMENT_PER_TURN), maxActionPoints: MOVEMENT_PER_TURN };
      units.unshift(lordUnit);
    }
    lordUnit.q = player.q;
    lordUnit.r = player.r;
    return {
      player, inventory, nodes, tiles, units, population,
      turn: Math.max(1, Math.floor(Number.isFinite(raw?.turn) ? raw.turn : Number.isFinite(raw?.day) ? raw.day : 1)),
      movement: lordUnit.actionPoints,
      buildings,
    };
  }
  function normalizeResearch(raw) {
    const saved = raw?.woodcraft && typeof raw.woodcraft === 'object' ? raw.woodcraft : {};
    const status = ['available', 'researching', 'ready', 'active'].includes(saved.status) ? saved.status : 'available';
    const startedAt = Number.isFinite(saved.startedAt) ? Math.min(saved.startedAt, Date.now()) : 0;
    return {
      woodcraft: {
        status: status === 'researching' && !startedAt ? 'available' : status,
        startedAt,
        completedAt: Number.isFinite(saved.completedAt) ? saved.completedAt : 0,
      },
    };
  }
  function normalizeSlot(raw, id) {
    const blank = emptySlot(id);
    if (!raw) return blank;
    const worldStates = {};
    if (raw.worldStates && typeof raw.worldStates === 'object') {
      Object.entries(raw.worldStates).forEach(([worldId, data]) => { worldStates[worldId] = normalizeWorldData(data); });
    }
    const primaryWorld = raw.worldId || 'initial-world';
    if (!worldStates[primaryWorld]) {
      worldStates[primaryWorld] = normalizeWorldData(null, raw);
    }
    return {
      ...blank,
      lordId: typeof raw.lordId === 'string' ? raw.lordId : null,
      lordName: typeof raw.lordName === 'string' ? raw.lordName : null,
      worldId: typeof raw.worldId === 'string' ? raw.worldId : null,
      screen: ['lord', 'worlds', 'regions', 'local'].includes(raw.screen) ? raw.screen : null,
      updatedAt: Number.isFinite(raw.updatedAt) ? raw.updatedAt : null,
      introSeen: typeof raw.introSeen === 'boolean' ? raw.introSeen : Boolean(raw.updatedAt || raw.lordId),
      worldStates,
      tutorialStep: clamp(Math.floor(Number.isFinite(raw.tutorialStep) ? raw.tutorialStep : 0), 0, TASKS.length - 1),
      research: normalizeResearch(raw.research),
    };
  }
  function readState() {
    try {
      const stored = JSON.parse(localStorage.getItem(SAVE_KEY) || 'null');
      if (!stored || !Array.isArray(stored.slots)) return defaultState();
      const slots = Array.from({ length: SLOT_COUNT }, (_, i) => normalizeSlot(
        stored.slots.find((slot) => Number(slot?.id) === i + 1), i + 1
      ));
      const normalized = { version: SAVE_VERSION, activeSlot: Number.isInteger(stored.activeSlot) ? stored.activeSlot : null, slots };
      try { localStorage.setItem(SAVE_KEY, JSON.stringify(normalized)); } catch { /* Keep the in-memory save if storage is unavailable. */ }
      return normalized;
    } catch { return defaultState(); }
  }
  function activeSlot() {
    if (!Number.isInteger(state.activeSlot)) return null;
    return state.slots.find((slot) => slot.id === state.activeSlot) || null;
  }
  function currentWorldData(slot = activeSlot()) {
    if (!slot) return null;
    const worldId = slot.worldId || 'initial-world';
    slot.worldStates ||= {};
    slot.worldStates[worldId] ||= emptyWorldData();
    return slot.worldStates[worldId];
  }
  function unitsInWorld(world = currentWorldData()) { return world?.units || []; }
  function selectedUnit(world = currentWorldData()) {
    return selectedUnitId ? unitsInWorld(world).find((unit) => unit.id === selectedUnitId) || null : null;
  }
  function buildingKey(building) { return building.id + ':' + building.q + ',' + building.r; }
  function selectedBuilding(world = currentWorldData()) {
    return selectedBuildingKey ? (world?.buildings || []).find((building) => buildingKey(building) === selectedBuildingKey) || null : null;
  }
  function selectUnit(unitId) {
    const world = currentWorldData();
    if (!unitsInWorld(world).some((unit) => unit.id === unitId)) return;
    selectedUnitId = unitId;
    selectedBuildingKey = null;
    const unit = selectedUnit(world);
    selectedHexId = hexId(unit.q, unit.r);
    renderSelectionPanel(world);
    updateHexVisualState(world);
    updatePrompt();
  }
  function selectBuilding(building) {
    selectedUnitId = null;
    selectedBuildingKey = buildingKey(building);
    selectedHexId = hexId(building.q, building.r);
    renderSelectionPanel(currentWorldData());
    updateHexVisualState();
    updatePrompt();
  }
  function terrainBlocked(x, y) {
    return x < .055 || x > .945 || y < .085 || y > .915;
  }
  function persist() {
    state.version = SAVE_VERSION;
    const slot = activeSlot();
    if (slot) slot.updatedAt = Date.now();
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(state)); }
    catch { notify('当前浏览器无法保存数据，本次打开期间仍可继续体验。'); }
  }
  function woodcraftResearch(slot = activeSlot()) {
    if (!slot) return { status: 'available', startedAt: 0, completedAt: 0 };
    slot.research ||= normalizeResearch(null);
    slot.research.woodcraft ||= { status: 'available', startedAt: 0, completedAt: 0 };
    return slot.research.woodcraft;
  }
  function syncWoodcraftResearch(slot = activeSlot()) {
    const research = woodcraftResearch(slot);
    if (research.status === 'researching' && Date.now() - research.startedAt >= WOODCRAFT_RESEARCH_MS) {
      research.status = 'ready';
      research.completedAt = Date.now();
      persist();
    }
    return research;
  }
  function currentGatherDuration() {
    return Math.max(500, GATHER_DURATION_MS - (woodcraftResearch()?.status === 'active' ? 500 : 0));
  }
  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
  }
  function notify(message, target = toast) {
    if (!target) return;
    target.textContent = message;
    target.classList.add('is-visible');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => target.classList.remove('is-visible'), 2300);
  }
  function setAssistantPortrait(expression) {
    const assetPath = MINA_PORTRAITS[expression] || MINA_PORTRAITS.welcoming;
    const assetUrl = window.LINGJING_ASSETS?.[assetPath] || assetPath;
    if (assistantAdvisorPortrait.getAttribute('src') !== assetUrl) assistantAdvisorPortrait.setAttribute('src', assetUrl);
    assistantAdvisorPortrait.dataset.expression = expression;
  }
  function stopAssistantSpeech() {
    clearInterval(assistantTypingTimer);
    clearInterval(assistantSpeechTimer);
    assistantTypingTimer = 0;
    assistantSpeechTimer = 0;
    assistantDialog.classList.remove('is-speaking');
    assistantContinueButton.disabled = false;
  }
  function presentAssistantDialogue(mood = 'welcoming', line = '', options = {}) {
    stopAssistantSpeech();
    const fullLine = line || assistantDialogLine.dataset.fullLine || assistantDialogLine.textContent.trim();
    assistantDialogLine.dataset.fullLine = fullLine;
    assistantDialogLine.textContent = '';
    assistantDialog.dataset.mood = mood;
    assistantDialog.hidden = false;
    setAssistantPortrait(mood);
    if (options.typewriter === false) {
      assistantDialogLine.textContent = fullLine;
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      let isMouthOpen = false;
      const speechStartedAt = Date.now();
      assistantDialog.classList.add('is-speaking');
      assistantSpeechTimer = setInterval(() => {
        if (Date.now() - speechStartedAt >= (options.speechDuration || 1500)) {
          stopAssistantSpeech();
          setAssistantPortrait(mood);
          return;
        }
        isMouthOpen = !isMouthOpen;
        setAssistantPortrait(isMouthOpen ? 'speaking' : mood);
      }, 210);
      return;
    }
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      assistantDialogLine.textContent = fullLine;
      return;
    }
    const characters = Array.from(fullLine);
    let cursor = 0;
    let isMouthOpen = false;
    assistantContinueButton.disabled = true;
    assistantDialog.classList.add('is-speaking');
    assistantSpeechTimer = setInterval(() => {
      isMouthOpen = !isMouthOpen;
      setAssistantPortrait(isMouthOpen ? 'speaking' : mood);
    }, 210);
    assistantTypingTimer = setInterval(() => {
      assistantDialogLine.textContent += characters[cursor++] || '';
      if (cursor >= characters.length) {
        stopAssistantSpeech();
        setAssistantPortrait(mood);
        assistantContinueButton.focus({ preventScroll: true });
      }
    }, 43);
  }
  function dismissAssistantDialogue() {
    stopAssistantSpeech();
    assistantDialog.hidden = true;
  }
  function prepareResearchDialogue() {
    assistantDialog.dataset.mode = 'research';
    assistantDialog.classList.remove('assistant-dialog--intro');
    assistantSceneKicker.textContent = '初始营地 · 研究纪事';
    assistantSceneCaption.textContent = 'A NEW TOOL · 01';
    assistantDialogLabel.textContent = '新发现 · 木器研究';
    assistantDialogTitle.textContent = '米娜 · 领主助理';
    assistantDialogNote.hidden = false;
    assistantDialogNote.textContent = '木制工具即将投入使用。确认后，研究成果将写入这份存档。';
    assistantContinueButton.dataset.action = 'activate-woodcraft';
    assistantContinueButton.querySelector('span').textContent = '记下这项发现';
    assistantContinueButton.querySelector('b').textContent = '确认并激活研究 →';
    assistantDialogFootnote.textContent = '点击后，木制工具将解锁';
    assistantDialogLine.dataset.fullLine = '领主，我们发现了一种工具，看来野兽也会惧怕我们了吧。';
  }
  function prepareIntroDialogue(index) {
    const chapter = String(index + 1).padStart(2, '0');
    assistantDialog.dataset.mode = 'intro';
    assistantDialog.classList.add('assistant-dialog--intro');
    assistantSceneKicker.textContent = '新旅程 · 初次相逢';
    assistantSceneCaption.textContent = 'A NEW CHRONICLE · ' + chapter + ' / ' + String(INTRO_DIALOGUE.length).padStart(2, '0');
    assistantDialogLabel.textContent = '开拓纪事 · 序章';
    assistantDialogTitle.textContent = '米娜 · 领主助理';
    assistantDialogNote.hidden = true;
    assistantContinueButton.dataset.action = 'advance-intro';
    assistantContinueButton.querySelector('span').textContent = '继续';
    assistantContinueButton.querySelector('b').textContent = '点击屏幕继续 →';
    assistantDialogFootnote.textContent = '点击任意位置，继续聆听米娜的话';
  }
  function startIntroDialogue() {
    introLineIndex = 0;
    const entry = INTRO_DIALOGUE[introLineIndex];
    prepareIntroDialogue(introLineIndex);
    assistantContinueButton.focus({ preventScroll: true });
    presentAssistantDialogue(entry.mood, entry.line, { typewriter: false });
  }
  function advanceIntroDialogue() {
    if (assistantDialog.hidden || assistantDialog.dataset.mode !== 'intro') return;
    introLineIndex += 1;
    if (introLineIndex >= INTRO_DIALOGUE.length) {
      const slot = activeSlot();
      if (slot) {
        slot.introSeen = true;
        slot.screen = 'lord';
        persist();
      }
      introLineIndex = -1;
      dismissAssistantDialogue();
      setScreen('lord');
      return;
    }
    const entry = INTRO_DIALOGUE[introLineIndex];
    prepareIntroDialogue(introLineIndex);
    presentAssistantDialogue(entry.mood, entry.line, { typewriter: false });
  }
  function setScreen(name) {
    const next = document.getElementById('screen-' + name);
    if (!next) return;
    currentScreen = name;
    screens.forEach((screen) => {
      const visible = screen === next;
      screen.hidden = !visible;
      screen.classList.toggle('is-active', visible);
    });
    if (name !== 'local') {
      if (unitMoveTimer) clearTimeout(unitMoveTimer);
      if (unitMoving) persist();
      unitMoveTimer = 0;
      unitMoving = false;
      if (researchTicker) clearInterval(researchTicker);
      researchTicker = 0;
      dismissAssistantDialogue();
      technologyOverlay.hidden = true;
      orientationPrompt.hidden = true;
      resetJoystick();
      cancelGather(false);
      pressedKeys.clear();
      localPlayer.classList.remove('is-moving');
      interactionPrompt.hidden = true;
      buildingGhost.hidden = true;
      buildMode = false;
      chosenBuilding = null;
    }
    if (name === 'lord') document.getElementById('lordSaveLabel').textContent = activeSlot() ? '存档 ' + String(activeSlot().id).padStart(2, '0') : '未选择存档';
    if (name === 'worlds') {
      document.getElementById('worldLordLabel').textContent = activeSlot()?.lordName || LORD_NAME;
      renderWorldCarousel();
    }
    if (name === 'regions') {
      document.getElementById('regionLordLabel').textContent = activeSlot()?.lordName || LORD_NAME;
      requestAnimationFrame(sizeAndCenterRegionMap);
    }
    if (name === 'local') {
      if (mapCameraSlotId !== state.activeSlot) {
        mapCamera.initialized = false;
        mapCameraSlotId = state.activeSlot;
      }
      const world = currentWorldData();
      playerHex = world ? { ...world.player } : { q: 0, r: 0 };
      selectedUnitId = 'lord';
      selectedBuildingKey = null;
      selectedHexId = hexId(playerHex.q, playerHex.r);
      buildPanel.hidden = true;
      document.getElementById('warehousePanel').hidden = true;
      tutorialPanel.dataset.dismissed = 'false';
      renderLocalWorld();
      requestAnimationFrame(() => { sizeAndCenterMap(); updateOrientationPrompt(); });
    }
  }
  function recordScreen(name) { const slot = activeSlot(); if (slot) { slot.screen = name; persist(); } }
  function showSaves() {
    modeOverlay.hidden = true;
    renderSlots();
    saveOverlay.hidden = false;
    requestAnimationFrame(() => saveOverlay.querySelector('.save-slot')?.focus());
  }
  function closeSaves() { saveOverlay.hidden = true; document.querySelector('[data-action="open-mode"]')?.focus(); }
  function showModePicker() {
    modeOverlay.hidden = false;
    modeOverlay.querySelector('[data-mode="' + inputMode + '"]')?.focus();
  }
  function closeModePicker() {
    modeOverlay.hidden = true;
    document.querySelector('[data-action="open-mode"]')?.focus();
  }
  function applyInputMode() {
    gameShell.dataset.controlMode = inputMode;
    mobileControls.hidden = inputMode !== 'mobile';
    modeOverlay.querySelectorAll('[data-action="choose-mode"]').forEach((card) => {
      const selected = card.dataset.mode === inputMode;
      card.classList.toggle('is-selected', selected);
      card.setAttribute('aria-pressed', String(selected));
    });
    if (inputMode !== 'mobile') {
      resetJoystick();
      portraitPromptDismissed = false;
    }
    updateOrientationPrompt();
  }
  function requestMobileDisplay() {
    let fullscreenRequest;
    try {
      if (!document.fullscreenElement && document.documentElement.requestFullscreen) {
        fullscreenRequest = document.documentElement.requestFullscreen();
      }
    } catch { /* Continue without fullscreen if the browser declines. */ }
    const lockLandscape = () => {
      try {
        if (screen.orientation?.lock) screen.orientation.lock('landscape').catch(() => {});
      } catch { /* Portrait play remains available. */ }
    };
    if (fullscreenRequest?.then) fullscreenRequest.then(lockLandscape).catch(lockLandscape);
    else lockLandscape();
  }
  function chooseInputMode(mode) {
    if (mode !== 'desktop' && mode !== 'mobile') return;
    inputMode = mode;
    try { localStorage.setItem(CONTROL_MODE_KEY, mode); } catch { /* The choice lasts for this page session. */ }
    applyInputMode();
    modeOverlay.hidden = true;
    if (mode === 'mobile') {
      portraitPromptDismissed = false;
      requestMobileDisplay();
    } else {
      try { screen.orientation?.unlock?.(); } catch { /* Ignore unsupported orientation controls. */ }
      if (document.fullscreenElement && document.exitFullscreen) document.exitFullscreen().catch(() => {});
    }
    showSaves();
  }
  function updateOrientationPrompt() {
    orientationPrompt.hidden = currentScreen !== 'local' || inputMode !== 'mobile' || portraitPromptDismissed || window.innerWidth >= window.innerHeight;
  }
  function resetJoystick() {
    if (joystickPointerId !== null && mobileJoystick.hasPointerCapture?.(joystickPointerId)) {
      try { mobileJoystick.releasePointerCapture(joystickPointerId); } catch { /* Pointer may already be released. */ }
    }
    joystickPointerId = null;
    joystickVector = { x: 0, y: 0 };
    joystickKnob.style.transform = 'translate(0,0)';
    mobileJoystick.classList.remove('is-active');
  }
  function updateJoystick() { /* Hex movement uses direct taps on both touch and desktop. */ }
  function mobileInteract() {
    resetJoystick();
    pressedKeys.clear();
    endTurn();
  }
  function toggleObjective() {
    tutorialPanel.dataset.dismissed = tutorialPanel.hidden ? 'false' : 'true';
    tutorialPanel.hidden = tutorialPanel.dataset.dismissed === 'true';
  }
  function formatDate(time) {
    if (!time) return '尚未开启';
    try { return new Intl.DateTimeFormat('zh-CN', { month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', hour12: false }).format(new Date(time)); }
    catch { return '已保存'; }
  }
  function renderSlots() {
    saveGrid.innerHTML = state.slots.map((slot) => {
      const occupied = Boolean(slot.updatedAt || slot.lordId);
      const title = '存档 ' + String(slot.id).padStart(2, '0');
      const status = occupied ? (slot.screen === 'local' ? '旅程进行中 · 初始营地' : slot.lordName ? '领主 · ' + escapeHTML(slot.lordName) : '等待选择领主') : '空存档 · 开始一段新旅程';
      return '<div class="save-slot' + (occupied ? ' save-slot--occupied' : '') + '" role="button" tabindex="0" data-slot-id="' + slot.id + '" aria-label="' + title + '">' +
        '<span class="slot-number">' + String(slot.id).padStart(2, '0') + '</span><span class="slot-title">' + title + '</span>' +
        '<span class="slot-status">' + status + '</span><span class="slot-meta">' + (occupied ? '最近记录　' + formatDate(slot.updatedAt) : '点击创建独立旅程') + '</span>' +
        '<span class="slot-open" aria-hidden="true">' + (occupied ? '↗' : '+') + '</span>' +
        (occupied ? '<button class="slot-delete" data-action="delete-slot" data-slot-id="' + slot.id + '" aria-label="删除' + title + '">×</button>' : '') + '</div>';
    }).join('');
  }
  function chooseSlot(id) {
    const slot = state.slots.find((item) => item.id === id);
    if (!slot) return;
    state.activeSlot = id;
    const isNewJourney = !slot.updatedAt && !slot.lordId;
    const shouldPlayIntro = slot.introSeen !== true && !slot.lordId;
    if (isNewJourney) { slot.screen = 'lord'; slot.updatedAt = Date.now(); }
    const destination = slot.screen || (slot.lordId ? (slot.worldId ? 'regions' : 'worlds') : 'lord');
    persist();
    closeSaves();
    if (shouldPlayIntro) { startIntroDialogue(); return; }
    setScreen(destination);
  }
  function deleteSlot(id) {
    const slot = state.slots.find((item) => item.id === id);
    if (!slot || !slot.updatedAt) return;
    if (!window.confirm('确定删除存档 ' + String(id).padStart(2, '0') + ' 吗？此操作无法撤销。')) return;
    state.slots = state.slots.map((item) => item.id === id ? emptySlot(id) : item);
    if (state.activeSlot === id) state.activeSlot = null;
    persist();
    renderSlots();
  }
  function confirmLord() {
    const slot = activeSlot();
    if (!slot) { notify('请先选择一份存档。'); return; }
    slot.lordId = LORD_ID;
    slot.lordName = LORD_NAME;
    slot.worldId = null;
    slot.screen = 'worlds';
    persist();
    setScreen('worlds');
  }
  function enterWorld() {
    const slot = activeSlot();
    const world = WORLDS[selectedWorldIndex];
    if (!slot?.lordId) { notify('先选择一位领主，再开启世界旅程。'); return; }
    if (!world?.open) { notify('这个世界坐标尚未开放，后续可以在世界目录中扩展。'); return; }
    slot.worldId = world.id;
    slot.screen = 'regions';
    persist();
    setScreen('regions');
  }
  function openCamp() { campDialog.hidden = false; requestAnimationFrame(() => campDialog.querySelector('[data-action="enter-camp"]')?.focus()); }
  function closeCamp() { campDialog.hidden = true; document.querySelector('[data-action="open-camp"]')?.focus(); }
  function enterCamp() {
    campDialog.hidden = true;
    const slot = activeSlot();
    if (slot) { slot.screen = 'local'; persist(); }
    setScreen('local');
  }

  function renderWorldCarousel() {
    selectedWorldIndex = clamp(selectedWorldIndex, 0, WORLDS.length - 1);
    const positions = [{ offset: -1, cls: 'world-island-slot--left' }, { offset: 0, cls: 'world-island-slot--front' }, { offset: 1, cls: 'world-island-slot--right' }];
    worldStage.innerHTML = positions.map(({ offset, cls }) => {
      const index = (selectedWorldIndex + offset + WORLDS.length) % WORLDS.length;
      const world = WORLDS[index];
      return '<button class="world-island-slot ' + cls + (world.open ? '' : ' is-locked') + '" data-world-index="' + index + '" aria-label="' + escapeHTML(world.name) + '">' +
        '<img src="' + world.image + '" alt=""><span class="island-slot-label"><b>' + escapeHTML(world.name) + '</b><small>' + (world.open ? '可进入' : '尚未开放') + '</small></span></button>';
    }).join('');
    const world = WORLDS[selectedWorldIndex];
    document.getElementById('worldCounter').textContent = 'WORLD / ' + String(selectedWorldIndex + 1).padStart(2, '0');
    document.getElementById('worldTitle').textContent = world.name;
    document.getElementById('worldDescription').textContent = world.description;
    document.getElementById('worldCountSummary').innerHTML = '已开放世界 <b>' + String(WORLDS.filter((item) => item.open).length).padStart(2, '0') + '</b>';
    document.getElementById('worldCountTotal').textContent = '共 ' + String(WORLDS.length).padStart(2, '0') + ' 个世界坐标';
    document.getElementById('enterWorldButton').disabled = !world.open;
    renderWorldDirectory();
  }
  function renderWorldDirectory() {
    document.getElementById('worldDirectoryList').innerHTML = WORLDS.map((world, index) =>
      '<button class="directory-row' + (index === selectedWorldIndex ? ' is-current' : '') + '" data-action="world-directory-select" data-world-index="' + index + '">' +
      '<span class="directory-row-index">' + String(index + 1).padStart(2, '0') + '</span><span class="directory-row-copy"><b>' + escapeHTML(world.name) +
      '</b><small>' + escapeHTML(world.description) + '</small></span><span class="directory-row-state">' + (world.open ? '已开放' : '未开放') + '</span></button>'
    ).join('');
  }
  function rotateWorld(direction) {
    if (worldTurning || WORLDS.length < 2) return;
    worldTurning = true;
    worldStage.classList.add('is-rotating');
    worldStage.style.transform = direction > 0 ? 'translateX(-18px) rotateY(-9deg)' : 'translateX(18px) rotateY(9deg)';
    setTimeout(() => {
      selectedWorldIndex = (selectedWorldIndex + direction + WORLDS.length) % WORLDS.length;
      renderWorldCarousel();
      requestAnimationFrame(() => {
        worldStage.style.transform = '';
        setTimeout(() => {
          worldStage.classList.remove('is-rotating');
          worldTurning = false;
        }, 580);
      });
    }, 230);
  }
  function worldDown(event) {
    if (event.target.closest('.carousel-arrow, .world-bottom-panel, .world-heading, .world-count, .screen-topline')) return;
    worldCarousel.setPointerCapture(event.pointerId);
    worldCarousel.dataset.startX = String(event.clientX);
    worldCarousel.dataset.moved = 'false';
    worldCarousel.classList.add('is-dragging');
  }
  function worldMove(event) {
    if (!worldCarousel.hasPointerCapture(event.pointerId)) return;
    const delta = event.clientX - Number(worldCarousel.dataset.startX);
    if (Math.abs(delta) > 10) worldCarousel.dataset.moved = 'true';
    worldStage.style.transform = 'translateX(' + clamp(delta * .28, -90, 90) + 'px)';
  }
  function worldUp(event) {
    if (!worldCarousel.hasPointerCapture(event.pointerId)) return;
    const delta = event.clientX - Number(worldCarousel.dataset.startX);
    const moved = worldCarousel.dataset.moved === 'true';
    worldCarousel.releasePointerCapture(event.pointerId);
    worldCarousel.classList.remove('is-dragging');
    worldStage.style.transform = '';
    if (moved && Math.abs(delta) > 44) rotateWorld(delta < 0 ? 1 : -1);
    else if (!moved) {
      const island = document.elementFromPoint(event.clientX, event.clientY)?.closest('[data-world-index]');
      if (island) {
        const index = Number(island.dataset.worldIndex);
        if (index !== selectedWorldIndex) {
          const previous = (selectedWorldIndex - 1 + WORLDS.length) % WORLDS.length;
          rotateWorld(index === previous ? -1 : 1);
        }
        else if (!WORLDS[index].open) notify('该世界坐标尚未开放。');
      }
    }
  }

  function sizeAndCenterRegionMap() {
    if (currentScreen !== 'regions') return;
    const vw = regionViewport.clientWidth;
    const vh = regionViewport.clientHeight;
    const width = Math.max(vw * 1.65, 1600);
    const height = width * 9 / 16;
    regionMetrics = { width, height };
    regionMapPlane.style.width = width + 'px';
    regionMapPlane.style.height = height + 'px';
    regionPan = { x: vw / 2 - width * .48, y: vh / 2 - height * .75 };
    clampRegionPan();
    positionRegionMap();
  }
  function clampRegionPan() {
    regionPan.x = clamp(regionPan.x, Math.min(0, regionViewport.clientWidth - regionMetrics.width), 0);
    regionPan.y = clamp(regionPan.y, Math.min(0, regionViewport.clientHeight - regionMetrics.height), 0);
  }
  function positionRegionMap() {
    regionMapPlane.style.transform = 'translate3d(' + regionPan.x + 'px,' + regionPan.y + 'px,0)';
  }
  function regionDown(event) {
    if (event.target.closest('.region-point')) return;
    regionPointer = { id: event.pointerId, x: event.clientX, y: event.clientY, panX: regionPan.x, panY: regionPan.y, moved: false };
    regionViewport.setPointerCapture(event.pointerId);
    regionViewport.classList.add('is-dragging');
    regionMapPlane.classList.add('is-dragging');
  }
  function regionMove(event) {
    if (!regionPointer || regionPointer.id !== event.pointerId) return;
    const dx = event.clientX - regionPointer.x;
    const dy = event.clientY - regionPointer.y;
    if (Math.hypot(dx, dy) > 5) regionPointer.moved = true;
    if (!regionPointer.moved) return;
    regionPan = { x: regionPointer.panX + dx, y: regionPointer.panY + dy };
    clampRegionPan();
    positionRegionMap();
  }
  function regionUp(event) {
    if (!regionPointer || regionPointer.id !== event.pointerId) return;
    if (regionPointer.moved) regionDraggedUntil = Date.now() + 320;
    regionPointer = null;
    regionViewport.classList.remove('is-dragging');
    regionMapPlane.classList.remove('is-dragging');
    if (regionViewport.hasPointerCapture(event.pointerId)) regionViewport.releasePointerCapture(event.pointerId);
  }

  function renderLocalWorld() {
    const slot = activeSlot();
    const world = currentWorldData(slot);
    if (!slot || !world) return;
    world.tiles ||= {};
    revealHexes(world);
    worldObjects.innerHTML = HEX_TILES.map((tile) => {
      const stateForTile = world.tiles[tile.id] || { discovered: false, owned: false };
      const visible = stateForTile.discovered;
      const owned = stateForTile.owned;
      const current = selectedHexId === tile.id;
      const label = visible ? (tile.resource?.name || HEX_TERRAIN_NAMES[tile.visualTerrain]) : '未探索';
      const point = hexPosition(tile.q, tile.r);
      const terrainClass = 'world-hex--' + tile.visualTerrain;
      const yieldValue = tile.resource?.yield || 0;
      const improvement = world.buildings.find((building) => building.q === tile.q && building.r === tile.r);
      const improvementDefinition = improvement && BUILDING_BY_ID.get(improvement.id);
      const tooltip = visible ? (tile.resource
        ? tile.resource.name + ' · ' + (improvementDefinition?.production ? improvementDefinition.name + '每回合产出 ' + Object.values(improvementDefinition.production)[0] : '建造对应设施后按回合产出')
        : HEX_TERRAIN_NAMES[tile.visualTerrain]) : '未探索地块';
      const accessibleName = visible ? tooltip + (owned ? '，已控制' : '') : '未探索地块';
      const groveX = 20 + Math.abs(tile.q * 37 + tile.r * 19) % 61;
      const groveY = 20 + Math.abs(tile.q * 17 - tile.r * 29) % 55;
      const groveAltX = 19 + Math.abs(tile.q * 13 - tile.r * 31) % 63;
      const groveAltY = 21 + Math.abs(tile.q * 23 + tile.r * 11) % 53;
      return '<button type="button" class="world-hex ' + terrainClass + (visible ? '' : ' is-fogged') + (owned ? ' is-owned' : '') + (current ? ' is-current' : '') + '" data-hex-id="' + tile.id + '" style="--hex-x:' + point.x + 'px;--hex-y:' + point.y + 'px;--grove-x:' + groveX + '%;--grove-y:' + groveY + '%;--grove-alt-x:' + groveAltX + '%;--grove-alt-y:' + groveAltY + '%;z-index:' + Math.round(point.y / 100 + 5) + '" aria-label="' + accessibleName + '" title="' + accessibleName + '">' +
        '<span class="world-hex-surface"></span>' +
        (visible && tile.resource ? '<span class="hex-resource-marker hex-resource-marker--' + tile.resource.kind + '">' + HEX_RESOURCE_GLYPHS[tile.resource.kind] + '<b>+' + yieldValue + '</b></span>' : '') +
        (visible && tile.terrain === 'camp' ? '<span class="hex-camp-marker">⌂</span><span class="hex-camp-label">初始营地</span>' : '') +
        (visible && current && tile.terrain !== 'camp' ? '<span class="hex-label">' + label + '</span>' : '') +
        (owned && current && tile.terrain !== 'camp' ? '<span class="hex-owned-mark">已控制</span>' : '') +
        '</button>';
    }).join('') + world.buildings.map((building) => {
      const point = hexPosition(Number.isInteger(building.q) ? building.q : 0, Number.isInteger(building.r) ? building.r : 0);
      const definition = BUILDING_BY_ID.get(building.id);
      if (!definition) return '';
      const key = buildingKey(building);
      return '<button type="button" class="placed-building placed-building--' + building.id + (selectedBuildingKey === key ? ' is-selected' : '') + '" data-building-key="' + key + '" style="left:' + point.x + 'px;top:' + point.y + 'px;z-index:' + Math.round(point.y / 100 + 6) + '" aria-label="查看' + escapeHTML(definition.name) + '">' +
        '<img src="' + definition.image + '" alt=""><span>' + escapeHTML(definition.name) + '</span></button>';
    }).join('') + world.units.filter((unit) => unit.type !== 'lord').map((unit) => {
      const point = hexPosition(unit.q, unit.r);
      return '<button type="button" class="unit-token unit-token--militia' + (selectedUnitId === unit.id ? ' is-selected' : '') + '" data-unit-id="' + escapeHTML(unit.id) + '" style="left:' + point.x + 'px;top:' + point.y + 'px;z-index:' + Math.round(point.y / 100 + 12) + '" aria-label="选中' + escapeHTML(unit.name) + '"><span class="unit-token-shadow"></span><span class="unit-token-body"><i>⚔</i></span><span class="unit-token-caption">' + escapeHTML(unit.name) + '</span></button>';
    }).join('');
    updateInventoryDisplay(world);
    tutorialPanel.hidden = tutorialPanel.dataset.dismissed === 'true';
    updateTutorial();
    renderSelectionPanel(world);
    updateHexVisualState(world);
    updatePrompt();
  }
  function getNode(id) { return NODES.find((node) => node.id === id) || null; }
  function getNodeState(world, node) {
    world.nodes[node.id] ||= { status: 'available', readyAt: 0 };
    return world.nodes[node.id];
  }
  function syncNodeTimers(world) {
    let changed = false;
    NODES.forEach((node) => {
      const current = world.nodes[node.id];
      if (current?.status === 'cooldown' && current.readyAt <= Date.now()) {
        world.nodes[node.id] = { status: 'available', readyAt: 0 };
        changed = true;
      }
    });
    if (changed) persist();
  }
  function remainingCooldown(world, node) {
    const current = getNodeState(world, node);
    return current.status === 'cooldown' ? Math.max(0, current.readyAt - Date.now()) : 0;
  }
  function formatCooldown(milliseconds) {
    const seconds = Math.max(0, Math.ceil(milliseconds / 1000));
    if (seconds >= 60) return Math.ceil(seconds / 60) + 'm';
    return seconds + 's';
  }
  function updateInventoryDisplay(world = currentWorldData()) {
    if (!world) return;
    document.getElementById('woodCount').textContent = world.inventory.wood;
    document.getElementById('stoneCount').textContent = world.inventory.stone;
    document.getElementById('foodCount').textContent = world.inventory.food;
    document.getElementById('warehouseWood').textContent = world.inventory.wood;
    document.getElementById('warehouseStone').textContent = world.inventory.stone;
    document.getElementById('warehouseFood').textContent = world.inventory.food;
    document.getElementById('populationCount').textContent = world.population.citizens + ' / ' + world.population.housing;
    document.getElementById('manpowerCount').textContent = '可征募 ' + world.population.citizens;
    const yields = currentTileYields(world);
    document.getElementById('woodRate').textContent = '+' + yields.wood + ' / 日';
    document.getElementById('stoneRate').textContent = '+' + yields.stone + ' / 日';
    document.getElementById('foodRate').textContent = '+' + yields.food + ' / 日';
    updateTurnStatus(world);
  }
  function hexPosition(q, r) {
    return { x: HEX_MAP_WIDTH / 2 + HEX_WIDTH * (q + r / 2), y: HEX_MAP_HEIGHT / 2 + HEX_HEIGHT * .75 * r };
  }
  function tileState(world, id) {
    world.tiles ||= {};
    world.tiles[id] ||= { discovered: false, owned: false };
    return world.tiles[id];
  }
  function revealHexes(world, origin = world.player) {
    const center = { q: origin.q, r: origin.r };
    HEX_TILES.forEach((tile) => {
      if (hexDistance(center, tile) <= MAP_VISION_RADIUS) tileState(world, tile.id).discovered = true;
    });
    const camp = tileState(world, '0,0');
    camp.discovered = true;
    camp.owned = true;
  }
  function currentTileYields(world = currentWorldData()) {
    const yields = { wood: 0, stone: 0, food: 0 };
    if (!world) return yields;
    const bonus = woodcraftResearch().status === 'active' ? 1 : 0;
    (world.buildings || []).forEach((building) => {
      const definition = BUILDING_BY_ID.get(building.id);
      if (!definition?.production) return;
      Object.entries(definition.production).forEach(([kind, amount]) => { yields[kind] += amount + bonus; });
    });
    return yields;
  }
  function updateTurnStatus(world = currentWorldData()) {
    if (!world) return;
    document.getElementById('turnCount').textContent = world.turn;
    document.querySelectorAll('[data-action="end-turn"]').forEach((button) => { button.disabled = unitMoving; });
  }
  function renderSelectionPanel(world = currentWorldData()) {
    if (!world || !selectionPanel) return;
    const building = selectedBuilding(world);
    const unit = selectedUnit(world);
    if (building) {
      const definition = BUILDING_BY_ID.get(building.id) || { name: building.name || '建筑', detail: '建筑详情待补充。' };
      selectionKind.textContent = definition.fixed ? '文明核心 · 固定建筑' : '建筑 · 不可移动';
      selectionName.textContent = definition.name;
      const output = definition.production
        ? Object.entries(definition.production).map(([kind, amount]) => RESOURCE_NAMES[kind] + ' +' + amount + ' / 回合').join(' · ')
        : definition.housing ? '人口容量 +' + definition.housing : (definition.fixed ? '仓储 · 建造 · 人口管理' : '招募基础卫队');
      const canRecruit = world.population.citizens > 0 && world.inventory.food >= 2;
      const recruit = definition.id === 'barracks'
        ? '<button type="button" class="selection-action" data-action="recruit-unit"' + (canRecruit ? '' : ' disabled') + '>招募原始民兵 <small>粮食 2 · 人口 1</small></button>' : '';
      selectionDetails.innerHTML = '<p class="selection-description">' + escapeHTML(definition.detail || '设施功能待补充。') + '</p><div class="selection-stat-grid"><span><small>地块产出</small><b>' + escapeHTML(output) + '</b></span><span><small>所在坐标</small><b>' + building.q + ' · ' + building.r + '</b></span></div>' + recruit;
      selectionPanel.hidden = false;
      return;
    }
    if (unit) {
      if (unit.type === 'lord') unit.name = activeSlot()?.lordName || LORD_NAME;
      selectionKind.textContent = unit.type === 'lord' ? '单位 · 领主' : '单位 · 近战步兵';
      selectionName.textContent = unit.name;
      selectionDetails.innerHTML = '<div class="selection-stat-grid"><span><small>生命</small><b>' + unit.health + ' / ' + unit.maxHealth + '</b></span><span><small>攻击</small><b>' + unit.attack + '</b></span><span><small>攻击距离</small><b>' + unit.range + ' 格</b></span><span><small>行动力</small><b>' + unit.actionPoints + ' / ' + unit.maxActionPoints + '</b></span></div><p class="selection-trait"><small>特性</small><b>后续设定</b></p>';
      selectionPanel.hidden = false;
      return;
    }
    selectionPanel.hidden = true;
  }
  function updateHexVisualState(world = currentWorldData()) {
    if (!world) return;
    const unit = selectedUnit(world);
    const reachable = unit ? reachableHexIds(world, unit) : new Set();
    worldObjects.querySelectorAll('[data-hex-id]').forEach((element) => {
      const stateForTile = world.tiles?.[element.dataset.hexId] || {};
      element.classList.toggle('is-fogged', !stateForTile.discovered);
      element.classList.toggle('is-owned', Boolean(stateForTile.owned));
      element.classList.toggle('is-current', unit && hexId(unit.q, unit.r) === element.dataset.hexId);
      element.classList.toggle('is-selected', selectedHexId === element.dataset.hexId);
      element.classList.toggle('is-reachable', reachable.has(element.dataset.hexId) && hexId(unit.q, unit.r) !== element.dataset.hexId);
      element.disabled = unitMoving || !unit || unit.actionPoints <= 0;
    });
    localPlayer.classList.toggle('is-selected', selectedUnitId === 'lord');
    worldObjects.querySelectorAll('[data-unit-id]').forEach((element) => element.classList.toggle('is-selected', element.dataset.unitId === selectedUnitId));
    worldObjects.querySelectorAll('[data-building-key]').forEach((element) => element.classList.toggle('is-selected', element.dataset.buildingKey === selectedBuildingKey));
  }
  function hexPassable(tile) { return Boolean(tile?.passable); }
  function reachableHexIds(world, unit) {
    const start = hexId(unit.q, unit.r);
    const distances = new Map([[start, 0]]);
    const queue = [start];
    while (queue.length) {
      const id = queue.shift();
      const distance = distances.get(id);
      if (distance >= unit.actionPoints) continue;
      const tile = HEX_TILE_BY_ID.get(id);
      HEX_DIRECTIONS.forEach((direction) => {
        const nextId = hexId(tile.q + direction.q, tile.r + direction.r);
        const next = HEX_TILE_BY_ID.get(nextId);
        if (!next || !hexPassable(next) || distances.has(nextId)) return;
        if (world.units?.some((other) => other.id !== unit.id && hexId(other.q, other.r) === nextId)) return;
        if (!world.tiles?.[nextId]?.discovered && distance > 0) return;
        distances.set(nextId, distance + 1);
        queue.push(nextId);
      });
    }
    return new Set(distances.keys());
  }
  function findHexPath(world, target, origin = world.player) {
    const start = hexId(origin.q, origin.r);
    const queue = [start];
    const previous = new Map([[start, null]]);
    while (queue.length) {
      const id = queue.shift();
      if (id === target.id) break;
      const tile = HEX_TILE_BY_ID.get(id);
      HEX_DIRECTIONS.forEach((direction) => {
        const nextId = hexId(tile.q + direction.q, tile.r + direction.r);
        const next = HEX_TILE_BY_ID.get(nextId);
        if (!next || !hexPassable(next) || previous.has(nextId)) return;
        if (world.units?.some((unit) => hexId(unit.q, unit.r) === nextId && nextId !== start)) return;
        if (!world.tiles?.[nextId]?.discovered && nextId !== target.id) return;
        previous.set(nextId, id);
        queue.push(nextId);
      });
    }
    if (!previous.has(target.id)) return null;
    const path = [];
    let cursor = target.id;
    while (cursor && cursor !== start) { path.unshift(HEX_TILE_BY_ID.get(cursor)); cursor = previous.get(cursor); }
    return path;
  }
  function claimHex(tile, world) {
    const stateForTile = tileState(world, tile.id);
    if (stateForTile.owned) return false;
    stateForTile.owned = true;
    stateForTile.discovered = true;
    return Boolean(tile.resource);
  }
  function moveSelectedUnitToHex(targetId) {
    const slot = activeSlot();
    const world = currentWorldData(slot);
    const unit = selectedUnit(world);
    const target = HEX_TILE_BY_ID.get(targetId);
    if (!slot || !world || !unit || !target || unitMoving) return;
    const start = { q: unit.q, r: unit.r };
    if (targetId === hexId(start.q, start.r)) { selectedHexId = targetId; updatePrompt(); updateHexVisualState(world); return; }
    const path = findHexPath(world, target, start);
    if (!path?.length) { notify('只能沿已探索的相邻地块逐格前进。', localToast); return; }
    if (path.length > unit.actionPoints) { notify('行动力不足：结束回合后可以继续移动。', localToast); return; }
    if (!world.tiles?.[targetId]?.discovered && path.length !== 1) { notify('先探索相邻地块，再继续前进。', localToast); return; }
    selectedHexId = targetId;
    unitMoving = true;
    updateTurnStatus(world);
    updateHexVisualState(world);
    let index = 0;
    const step = () => {
      const tile = path[index];
      unit.q = tile.q;
      unit.r = tile.r;
      unit.actionPoints = Math.max(0, unit.actionPoints - 1);
      if (unit.type === 'lord') {
        world.player = { q: unit.q, r: unit.r };
        world.movement = unit.actionPoints;
        playerHex = { ...world.player };
      }
      const claimedResource = claimHex(tile, world);
      revealHexes(world, unit);
      selectedHexId = tile.id;
      if (unit.type === 'lord') positionMapAndPlayer();
      else {
        const marker = [...worldObjects.querySelectorAll('[data-unit-id]')].find((element) => element.dataset.unitId === unit.id);
        const point = hexPosition(unit.q, unit.r);
        if (marker) { marker.style.left = point.x + 'px'; marker.style.top = point.y + 'px'; }
      }
      renderSelectionPanel(world);
      updatePrompt();
      if (index < path.length - 1) {
        index += 1;
        unitMoveTimer = window.setTimeout(step, 210);
      } else {
        unitMoving = false;
        unitMoveTimer = 0;
        persist();
        renderLocalWorld();
        updateHexVisualState(world);
        if (claimedResource) notify('已控制' + tile.resource.name + '。建造对应设施后，资源会按回合产出。', localToast);
        else if (hexDistance(start, unit) > 0) notify(unit.name + ' 已抵达新地块。', localToast);
      }
      updateTurnStatus(world);
    };
    step();
  }
  function endTurn() {
    const slot = activeSlot();
    const world = currentWorldData(slot);
    if (!world || unitMoving) return;
    const yields = currentTileYields(world);
    Object.keys(yields).forEach((kind) => { world.inventory[kind] += yields[kind]; });
    world.turn += 1;
    world.units.forEach((unit) => { unit.actionPoints = unit.maxActionPoints; });
    world.movement = world.units.find((unit) => unit.type === 'lord')?.actionPoints ?? MOVEMENT_PER_TURN;
    if (world.population.citizens < world.population.housing && world.inventory.food >= 3) {
      world.population.growthProgress += 1;
      if (world.population.growthProgress >= 3) {
        world.population.citizens += 1;
        world.inventory.food -= 3;
        world.population.growthProgress = 0;
      }
    }
    persist();
    renderLocalWorld();
    notify('第 ' + (world.turn - 1) + ' 日结算完成：木材 +' + yields.wood + '，石料 +' + yields.stone + '，粮食 +' + yields.food + '。', localToast);
  }
  function updateCooldowns() { /* Turn-based territory yields replace gathering cooldowns. */ }
  function advanceTask(slot, world) {
    while (slot.tutorialStep < TASKS.length - 1) {
      const task = TASKS[slot.tutorialStep];
      const complete = task.key === 'building' ? world.buildings.some((building) => building.id === task.target) :
        task.key === 'unit' ? world.units.filter((unit) => unit.type === 'militia').length >= task.target : true;
      if (!complete) break;
      slot.tutorialStep++;
    }
  }
  function updateTutorial() {
    const slot = activeSlot();
    const world = currentWorldData(slot);
    if (!slot || !world) return;
    advanceTask(slot, world);
    const task = TASKS[slot.tutorialStep];
    const value = task.key === 'building' ? (world.buildings.some((building) => building.id === task.target) ? 1 : 0) :
      task.key === 'unit' ? world.units.filter((unit) => unit.type === 'militia').length : 1;
    document.getElementById('objectiveIndex').textContent = String(slot.tutorialStep + 1).padStart(2, '0');
    const progressTarget = Number.isFinite(task.target) ? task.target : 1;
    document.getElementById('objectiveCounter').textContent = '· ' + Math.min(value, progressTarget) + ' / ' + progressTarget;
    document.getElementById('objectiveText').textContent = task.title;
    document.getElementById('objectiveProgress').style.width = Math.min(100, value / progressTarget * 100) + '%';
    tutorialPanel.title = task.hint;
  }
  function updatePrompt() {
    const slot = activeSlot();
    const world = currentWorldData(slot);
    if (currentScreen !== 'local' || !slot || !world || !technologyOverlay.hidden || !document.getElementById('warehousePanel').hidden) {
      interactionPrompt.hidden = true;
      return;
    }
    const tile = HEX_TILE_BY_ID.get(selectedHexId) || HEX_TILE_BY_ID.get(hexId(playerHex.q, playerHex.r));
    if (!tile) { interactionPrompt.hidden = true; return; }
    const stateForTile = world.tiles?.[tile.id] || { discovered: false, owned: false };
    const hasTileName = stateForTile.discovered;
    const tileName = hasTileName ? (tile.resource?.name || HEX_TERRAIN_NAMES[tile.terrain]) : '未探索地块';
    const ownerText = stateForTile.owned ? '已控制' : tile.terrain === 'camp' ? '营地' : '尚未控制';
    const outputText = hasTileName && tile.resource
      ? (stateForTile.owned ? '已控制 · 建造' + (tile.resource.kind === 'wood' ? '伐木场' : tile.resource.kind === 'stone' ? '矿场' : '农田') + '后开始产出' : '探索并控制后可建设生产设施')
      : ownerText + ' · 点选相邻地块逐格推进';
    const unit = selectedUnit(world);
    document.getElementById('interactionKey').textContent = unit ? unit.actionPoints + ' / ' + unit.maxActionPoints : '—';
    document.getElementById('interactionText').textContent = tileName + ' · ' + ownerText;
    interactionPrompt.querySelector('.interaction-tip').textContent = outputText;
    interactionPrompt.hidden = false;
  }
  function cancelGather() { /* Legacy save cooldowns remain readable but have no active gather action. */ }
  function renderBuildOptions(world = currentWorldData()) {
    const options = document.getElementById('buildOptions');
    if (!options || !world) return;
    options.innerHTML = BUILDINGS.filter((building) => !building.fixed).map((building) => {
      const alreadyBuilt = false;
      const affordable = world.inventory.wood >= building.wood && world.inventory.stone >= building.stone;
      const requirement = building.resource === 'wood' ? '需要已控制林地' : building.resource === 'stone' ? '需要已控制丘陵' : building.resource === 'food' ? '需要已控制草原' : '需要已控制空地';
      const cost = ['木材 ' + building.wood, '石料 ' + building.stone].filter((value) => !value.endsWith(' 0')).join(' · ');
      return '<button type="button" class="build-option' + (alreadyBuilt ? ' is-built' : '') + '" data-action="choose-building" data-building-id="' + building.id + '"' + (alreadyBuilt ? ' disabled' : '') + '>' +
        '<span class="build-option-art"><img src="' + building.image + '" alt=""></span>' +
        '<span class="build-option-copy"><b>' + escapeHTML(building.name) + (alreadyBuilt ? ' <i>已建成</i>' : '') + '</b><small>' + escapeHTML(requirement) + (building.production ? ' · 每回合 +' + Object.values(building.production)[0] : '') + '</small><span><em' + (!affordable ? ' class="is-unaffordable"' : '') + '>' + cost + '</em></span></span>' +
        '<span class="build-option-arrow">→</span></button>';
    }).join('');
  }
  function openBuildPanel() {
    const slot = activeSlot();
    if (!slot) return;
    resetJoystick();
    pressedKeys.clear();
    cancelGather(false);
    document.getElementById('warehousePanel').hidden = true;
    const world = currentWorldData(slot);
    renderBuildOptions(world);
    buildPanel.hidden = false;
    buildMode = false;
    chosenBuilding = null;
    buildingGhost.hidden = true;
    document.getElementById('buildModeLabel').textContent = '选择建筑查看位置要求';
  }
  function closeBuildPanel() {
    buildPanel.hidden = true;
    buildMode = false;
    chosenBuilding = null;
    buildingGhost.hidden = true;
    updatePrompt();
  }
  function renderTechnologyTree() {
    techEraNav.innerHTML = TECH_ERAS.map((era, index) => '<button class="technology-era-tab' + (index === currentTechEra ? ' is-active' : '') + '" data-action="tech-jump" data-era-index="' + index + '" aria-current="' + (index === currentTechEra ? 'step' : 'false') + '"><span>' + String(index + 1).padStart(2, '0') + '</span><b>' + era + '</b></button>').join('');
    techEraTrack.innerHTML = TECH_ERAS.map((era, index) => '<article class="technology-era" data-era-index="' + index + '" aria-label="' + era + '"><header class="technology-era-heading"><span class="technology-era-seal">' + String(index + 1).padStart(2, '0') + '</span><div><small>ERA ' + String(index + 1).padStart(2, '0') + ' · 研究框架</small><h3>' + era + '</h3></div><span class="technology-era-status">' + (index === 0 ? '1 项研究开放' : '内容待设定') + '</span></header><div class="technology-tree">' + (index === 0 ? '<button type="button" class="technology-root technology-root--research" data-action="tech-woodcraft" aria-label="木器研究"><span class="technology-node-mark">✧</span><span class="technology-root-copy"><b>木器研究</b><small id="woodcraftDescription">消耗木材 3 · 研究 10 秒</small></span><span class="technology-root-state" id="woodcraftStatus">待研究</span><span class="technology-research-meter" id="woodcraftMeter" hidden aria-hidden="true"><i id="woodcraftProgress"></i></span></button>' : '<div class="technology-root"><span class="technology-node-mark">✧</span><span><b>时代研究</b><small>研究方向待补充</small></span></div>') + '<div class="technology-branches">' + [1, 2, 3].map((branch) => '<section class="technology-branch"><span class="technology-branch-label">发展支脉 <b>' + String(branch).padStart(2, '0') + '</b></span><div class="technology-branch-nodes"><button class="technology-node" data-action="tech-placeholder"><span class="technology-node-symbol">◇</span><span><b>待设定研究</b><small>研究内容待后续补充</small></span><span class="technology-node-state">未设定</span></button><span class="technology-branch-link" aria-hidden="true"></span><button class="technology-node technology-node--future" data-action="tech-placeholder"><span class="technology-node-symbol">＋</span><span><b>后续节点</b><small>分支内容待补充</small></span></button></div></section>').join('') + '</div></div></article>').join('');
    updateWoodcraftResearchUI();
    updateTechnologyEraPosition();
  }
  function updateWoodcraftResearchUI() {
    const research = syncWoodcraftResearch();
    const root = document.querySelector('.technology-root--research');
    if (!root) return;
    const description = document.getElementById('woodcraftDescription');
    const status = document.getElementById('woodcraftStatus');
    const meter = document.getElementById('woodcraftMeter');
    const progressBar = document.getElementById('woodcraftProgress');
    const elapsed = research.status === 'researching' ? clamp(Date.now() - research.startedAt, 0, WOODCRAFT_RESEARCH_MS) : 0;
    const progress = elapsed / WOODCRAFT_RESEARCH_MS;
    root.classList.toggle('is-researching', research.status === 'researching');
    root.classList.toggle('is-ready', research.status === 'ready');
    root.classList.toggle('is-researched', research.status === 'active');
    root.disabled = research.status === 'researching' || research.status === 'active';
    meter.hidden = research.status !== 'researching';
    progressBar.style.width = (progress * 100) + '%';
    if (research.status === 'researching') {
      description.textContent = '研究进行中 · 剩余 ' + Math.max(0, (WOODCRAFT_RESEARCH_MS - elapsed) / 1000).toFixed(1) + ' 秒';
      status.textContent = '研究中';
      root.setAttribute('aria-label', '木器研究，研究中，剩余 ' + Math.max(0, Math.ceil((WOODCRAFT_RESEARCH_MS - elapsed) / 1000)) + ' 秒');
    } else if (research.status === 'ready') {
      description.textContent = '研究完成 · 点击听取助理的发现';
      status.textContent = '待确认';
      root.setAttribute('aria-label', '木器研究已完成，点击听取助理的发现');
    } else if (research.status === 'active') {
      description.textContent = '已解锁木制工具 · 资源地块产出 +1 / 日';
      status.textContent = '已激活';
      root.setAttribute('aria-label', '木器研究已激活，控制的资源地块每日额外产出 1 单位资源');
    } else {
      description.textContent = '消耗木材 3 · 研究 10 秒';
      status.textContent = '待研究';
      root.setAttribute('aria-label', '木器研究，消耗木材 3，研究时间 10 秒');
    }
  }
  function updateWoodcraftResearchProgress() {
    const research = syncWoodcraftResearch();
    if (research.status !== 'researching') {
      if (researchTicker) clearInterval(researchTicker);
      researchTicker = 0;
      renderTechnologyTree();
      return;
    }
    updateWoodcraftResearchUI();
  }
  function startWoodcraftResearchTicker() {
    if (researchTicker) clearInterval(researchTicker);
    researchTicker = 0;
    if (woodcraftResearch()?.status === 'researching') researchTicker = setInterval(updateWoodcraftResearchProgress, 100);
  }
  function startWoodcraftResearch() {
    const slot = activeSlot();
    const world = currentWorldData(slot);
    if (!slot || !world) return;
    const research = syncWoodcraftResearch(slot);
    if (research.status === 'researching') { notify('木器研究正在进行中。', localToast); return; }
    if (research.status === 'ready') {
      prepareResearchDialogue();
      presentAssistantDialogue('relieved', '领主，我们发现了一种工具，看来野兽也会惧怕我们了吧。');
      return;
    }
    if (research.status === 'active') return;
    if (world.inventory.wood < WOODCRAFT_COST) { notify('木材不足：木器研究需要 3 块木材。', localToast); return; }
    world.inventory.wood -= WOODCRAFT_COST;
    research.status = 'researching';
    research.startedAt = Date.now();
    research.completedAt = 0;
    persist();
    updateInventoryDisplay(world);
    renderTechnologyTree();
    startWoodcraftResearchTicker();
    notify('木器研究开始，预计 10 秒后完成。', localToast);
  }
  function activateWoodcraftResearch() {
    const research = syncWoodcraftResearch();
    if (research.status !== 'ready') return;
    research.status = 'active';
    research.completedAt ||= Date.now();
    persist();
    dismissAssistantDialogue();
    renderLocalWorld();
    renderTechnologyTree();
    updatePrompt();
    notify('木制工具已解锁：控制的资源地块每日额外产出 1 单位资源。', localToast);
  }
  function updateTechnologyEraPosition() {
    if (!techEraTrack.children.length) return;
    const center = techEraTrack.getBoundingClientRect().left + techEraTrack.clientWidth / 2;
    let closest = 0;
    let distance = Infinity;
    [...techEraTrack.children].forEach((card, index) => {
      const rect = card.getBoundingClientRect();
      const nextDistance = Math.abs(rect.left + rect.width / 2 - center);
      if (nextDistance < distance) { closest = index; distance = nextDistance; }
    });
    currentTechEra = closest;
    techEraCounter.innerHTML = String(closest + 1).padStart(2, '0') + ' <i>/ ' + String(TECH_ERAS.length).padStart(2, '0') + '</i>';
    techEraNav.querySelectorAll('.technology-era-tab').forEach((tab, index) => {
      tab.classList.toggle('is-active', index === closest);
      tab.setAttribute('aria-current', index === closest ? 'step' : 'false');
    });
  }
  function jumpToTechnologyEra(index) {
    const era = Math.max(0, Math.min(TECH_ERAS.length - 1, index));
    techEraTrack.children[era]?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
  function openTechnologyTree() {
    closeBuildPanel();
    resetJoystick();
    document.getElementById('warehousePanel').hidden = true;
    cancelGather(false);
    pressedKeys.clear();
    const era = currentTechEra;
    renderTechnologyTree();
    technologyOverlay.hidden = false;
    currentTechEra = era;
    requestAnimationFrame(() => jumpToTechnologyEra(era));
    startWoodcraftResearchTicker();
  }
  function closeTechnologyTree() {
    if (researchTicker) clearInterval(researchTicker);
    researchTicker = 0;
    dismissAssistantDialogue();
    technologyOverlay.hidden = true;
    document.querySelector('[data-action="open-tech"]')?.focus();
  }
  function chooseBuilding(buildingId) {
    const slot = activeSlot();
    if (!slot) return;
    const world = currentWorldData(slot);
    const definition = BUILDING_BY_ID.get(buildingId);
    if (!definition || definition.fixed) return;
    if (world.inventory.wood < definition.wood || world.inventory.stone < definition.stone) { notify('资源不足，无法建造' + definition.name + '。', localToast); return; }
    buildMode = true;
    chosenBuilding = definition;
    buildingGhost.hidden = false;
    buildingGhost.querySelector('img').src = definition.image;
    buildingGhost.querySelector('span').textContent = definition.name;
    document.getElementById('buildModeLabel').textContent = (definition.resource === 'wood' ? '选择已控制林地' : definition.resource === 'stone' ? '选择已控制丘陵' : definition.resource === 'food' ? '选择已控制草原' : '选择已控制空地') + ' · Esc 取消';
    updatePrompt();
  }
  function updateGhost(event) {
    if (!buildMode || currentScreen !== 'local') return;
    const hex = event.target.closest('[data-hex-id]');
    if (!hex) { buildingGhost.hidden = true; return; }
    const tile = HEX_TILE_BY_ID.get(hex.dataset.hexId);
    if (!tile) return;
    const point = hexPosition(tile.q, tile.r);
    buildingGhost.hidden = false;
    buildingGhost.style.left = point.x + 'px';
    buildingGhost.style.top = point.y + 'px';
    buildingGhost.classList.toggle('is-invalid', !canBuildOnTile(chosenBuilding, tile, currentWorldData()));
  }
  function canBuildOnTile(definition, tile, world) {
    if (!definition || !tile || !world || !hexPassable(tile)) return false;
    const stateForTile = world.tiles?.[tile.id];
    if (!stateForTile?.discovered || !stateForTile.owned) return false;
    if (world.buildings.some((building) => building.q === tile.q && building.r === tile.r)) return false;
    if (definition.resource === 'wood') return tile.visualTerrain === 'forest';
    if (definition.resource === 'stone') return tile.visualTerrain === 'hills';
    if (definition.resource === 'food') return tile.visualTerrain === 'plains';
    return !tile.resource && ['plains', 'forest', 'hills'].includes(tile.visualTerrain);
  }
  function placeBuilding(event) {
    if (!buildMode || !chosenBuilding || currentScreen !== 'local') return;
    const hex = event.target.closest('[data-hex-id]');
    if (!hex) return;
    event.preventDefault();
    event.stopPropagation();
    const tile = HEX_TILE_BY_ID.get(hex.dataset.hexId);
    const slot = activeSlot();
    const world = currentWorldData(slot);
    if (!canBuildOnTile(chosenBuilding, tile, world)) { notify('这类建筑需要放在符合条件的已控制空地上。', localToast); return; }
    if (!slot || !world || world.inventory.wood < chosenBuilding.wood || world.inventory.stone < chosenBuilding.stone) { notify('资源不足，无法建造。', localToast); closeBuildPanel(); return; }
    world.inventory.wood -= chosenBuilding.wood;
    world.inventory.stone -= chosenBuilding.stone;
    world.buildings.push({ id: chosenBuilding.id, name: chosenBuilding.name, q: tile.q, r: tile.r });
    if (chosenBuilding.housing) world.population.housing += chosenBuilding.housing;
    const completedName = chosenBuilding.name;
    closeBuildPanel();
    updateInventoryDisplay(world);
    renderLocalWorld();
    persist();
    notify(completedName + '已建成。', localToast);
  }

  function recruitMilitia() {
    const slot = activeSlot();
    const world = currentWorldData(slot);
    const building = selectedBuilding(world);
    if (!slot || !world || building?.id !== 'barracks') { notify('请先选中一座兵营。', localToast); return; }
    if (world.population.citizens < 1) { notify('可征募人口不足。', localToast); return; }
    if (world.inventory.food < 2) { notify('招募需要粮食 2。', localToast); return; }
    const candidates = HEX_TILES.filter((tile) => hexDistance(tile, building) > 0 && hexDistance(tile, building) <= 2 && hexPassable(tile))
      .filter((tile) => !world.units.some((unit) => unit.q === tile.q && unit.r === tile.r))
      .filter((tile) => !world.buildings.some((placed) => placed.q === tile.q && placed.r === tile.r))
      .sort((a, b) => Number(Boolean(world.tiles?.[b.id]?.owned)) - Number(Boolean(world.tiles?.[a.id]?.owned)) ||
        Number(Boolean(world.tiles?.[b.id]?.discovered)) - Number(Boolean(world.tiles?.[a.id]?.discovered)) || hexDistance(a, building) - hexDistance(b, building));
    const spawn = candidates[0];
    if (!spawn) { notify('兵营周围没有可部署的空地。', localToast); return; }
    world.inventory.food -= 2;
    world.population.citizens -= 1;
    const unit = {
      id: 'militia-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 6),
      type: 'militia', name: '原始民兵', q: spawn.q, r: spawn.r,
      health: 14, maxHealth: 14, attack: 3, range: 1,
      actionPoints: 0, maxActionPoints: MOVEMENT_PER_TURN,
    };
    world.units.push(unit);
    tileState(world, spawn.id).discovered = true;
    selectUnit(unit.id);
    revealHexes(world, unit);
    persist();
    renderLocalWorld();
    notify('原始民兵已集结。本回合不会自行移动，结束回合后可由你下令行动。', localToast);
  }

  function sizeAndCenterMap() {
    if (currentScreen !== 'local') return;
    mapMetrics = { width: HEX_MAP_WIDTH, height: HEX_MAP_HEIGHT };
    mapPlane.style.width = HEX_MAP_WIDTH + 'px';
    mapPlane.style.height = HEX_MAP_HEIGHT + 'px';
    mapPlane.style.setProperty('--ground-tile-size', HEX_MAP_WIDTH + 'px');
    mapPlane.style.setProperty('--ground-tile-height', HEX_MAP_HEIGHT + 'px');
    if (!mapCamera.initialized) {
      const vw = localViewport.clientWidth;
      const vh = localViewport.clientHeight;
      const point = hexPosition(playerHex.q, playerHex.r);
      mapCamera.zoom = MAP_ZOOM_DEFAULT;
      mapCamera.x = vw / 2 - point.x * mapCamera.zoom;
      mapCamera.y = vh / 2 - point.y * mapCamera.zoom;
      mapCamera.initialized = true;
    }
    positionMapAndPlayer();
  }
  function clampMapCamera() {
    const vw = localViewport.clientWidth;
    const vh = localViewport.clientHeight;
    const scaledWidth = mapMetrics.width * mapCamera.zoom;
    const scaledHeight = mapMetrics.height * mapCamera.zoom;
    mapCamera.x = scaledWidth <= vw ? (vw - scaledWidth) / 2 : clamp(mapCamera.x, vw - scaledWidth, 0);
    mapCamera.y = scaledHeight <= vh ? (vh - scaledHeight) / 2 : clamp(mapCamera.y, vh - scaledHeight, 0);
  }
  function updateMapZoomReadout() {
    const readout = document.getElementById('mapZoomReadout');
    if (readout) readout.textContent = Math.round(mapCamera.zoom * 100) + '%';
  }
  function positionMapAndPlayer() {
    if (currentScreen !== 'local') return;
    const point = hexPosition(playerHex.q, playerHex.r);
    clampMapCamera();
    mapPlane.style.transform = 'translate3d(' + mapCamera.x + 'px,' + mapCamera.y + 'px,0) scale(' + mapCamera.zoom + ')';
    localPlayer.style.left = point.x + 'px';
    localPlayer.style.top = point.y + 'px';
    localPlayer.style.zIndex = String(Math.round(point.y / 100 + 10));
    updateMapZoomReadout();
  }
  function zoomMapTo(nextZoom, focusX = localViewport.clientWidth / 2, focusY = localViewport.clientHeight / 2) {
    if (currentScreen !== 'local') return;
    if (!mapCamera.initialized) sizeAndCenterMap();
    const previousZoom = mapCamera.zoom;
    const zoom = clamp(nextZoom, MAP_ZOOM_MIN, MAP_ZOOM_MAX);
    if (Math.abs(zoom - previousZoom) < .001) return;
    const worldX = (focusX - mapCamera.x) / previousZoom;
    const worldY = (focusY - mapCamera.y) / previousZoom;
    mapCamera.zoom = zoom;
    mapCamera.x = focusX - worldX * zoom;
    mapCamera.y = focusY - worldY * zoom;
    positionMapAndPlayer();
  }
  function centerMapOnLeader() {
    if (currentScreen !== 'local') return;
    if (!mapCamera.initialized) sizeAndCenterMap();
    const point = hexPosition(playerHex.q, playerHex.r);
    mapCamera.x = localViewport.clientWidth / 2 - point.x * mapCamera.zoom;
    mapCamera.y = localViewport.clientHeight / 2 - point.y * mapCamera.zoom;
    positionMapAndPlayer();
  }
  function mapWheel(event) {
    if (currentScreen !== 'local' || !localViewport.clientWidth) return;
    event.preventDefault();
    const rect = localViewport.getBoundingClientRect();
    zoomMapTo(mapCamera.zoom + (event.deltaY < 0 ? .06 : -.06), event.clientX - rect.left, event.clientY - rect.top);
  }
  function mapPointerDown(event) {
    if (currentScreen !== 'local' || (event.pointerType === 'mouse' && event.button !== 0)) return;
    const captureTarget = event.target.closest('[data-hex-id],[data-unit-id],[data-building-key]') || mapPlane;
    mapCamera.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, cameraX: mapCamera.x, cameraY: mapCamera.y, moved: false, captureTarget };
    try { captureTarget.setPointerCapture(event.pointerId); } catch { /* Keep panning available when pointer capture is unsupported. */ }
  }
  function mapPointerMove(event) {
    const pointer = mapCamera.pointer;
    if (pointer?.id === event.pointerId) {
      const dx = event.clientX - pointer.x;
      const dy = event.clientY - pointer.y;
      if (Math.hypot(dx, dy) > 5) {
        pointer.moved = true;
        localViewport.classList.add('is-dragging');
        mapPlane.classList.add('is-dragging');
      }
      if (pointer.moved) {
        mapCamera.x = pointer.cameraX + dx;
        mapCamera.y = pointer.cameraY + dy;
        positionMapAndPlayer();
        event.preventDefault();
      }
    }
    updateGhost(event);
  }
  function mapPointerUp(event) {
    const pointer = mapCamera.pointer;
    if (!pointer || pointer.id !== event.pointerId) return;
    if (pointer.moved) localDraggedUntil = Date.now() + 320;
    mapCamera.pointer = null;
    localViewport.classList.remove('is-dragging');
    mapPlane.classList.remove('is-dragging');
    try {
      if (pointer.captureTarget.hasPointerCapture(event.pointerId)) pointer.captureTarget.releasePointerCapture(event.pointerId);
    } catch { /* The pointer may already have been cancelled by the browser. */ }
  }
  function mapWheelZoomAction(direction) {
    zoomMapTo(mapCamera.zoom + direction * .1);
  }

  function backToSaves() { recordScreen('lord'); setScreen('title'); showSaves(); }
  document.addEventListener('click', (event) => {
    if (currentScreen === 'local' && Date.now() < localDraggedUntil && event.target.closest('#localViewport')) {
      event.preventDefault();
      event.stopImmediatePropagation();
    }
  }, true);
  document.addEventListener('click', (event) => {
    if (currentScreen === 'regions' && Date.now() < regionDraggedUntil) { event.preventDefault(); event.stopPropagation(); return; }
    const actionTarget = event.target.closest('[data-action]');
    if (actionTarget) {
      const action = actionTarget.dataset.action;
      switch (action) {
        case 'open-mode': showModePicker(); break;
        case 'close-mode': closeModePicker(); break;
        case 'choose-mode': chooseInputMode(actionTarget.dataset.mode); break;
        case 'back-to-mode': saveOverlay.hidden = true; showModePicker(); break;
        case 'close-saves': closeSaves(); break;
        case 'delete-slot': event.stopPropagation(); deleteSlot(Number(actionTarget.dataset.slotId)); break;
        case 'back-saves': backToSaves(); break;
        case 'select-lord':
          document.querySelectorAll('.lord-card:not(.lord-card--future)').forEach((card) => { card.classList.remove('is-selected'); card.setAttribute('aria-pressed', 'false'); });
          actionTarget.classList.add('is-selected'); actionTarget.setAttribute('aria-pressed', 'true'); break;
        case 'confirm-lord': confirmLord(); break;
        case 'back-lord': recordScreen('lord'); setScreen('lord'); break;
        case 'world-prev': rotateWorld(-1); break;
        case 'world-next': rotateWorld(1); break;
        case 'open-world-directory': worldDirectory.hidden = false; renderWorldDirectory(); break;
        case 'close-world-directory': worldDirectory.hidden = true; break;
        case 'world-directory-select': {
          const index = Number(actionTarget.dataset.worldIndex);
          selectedWorldIndex = index;
          renderWorldCarousel();
          if (WORLDS[index]?.open) worldDirectory.hidden = true;
          else notify('该世界坐标尚未开放。');
          break;
        }
        case 'enter-world': enterWorld(); break;
        case 'back-worlds': recordScreen('worlds'); setScreen('worlds'); break;
        case 'open-camp': openCamp(); break;
        case 'show-unknown': notify('这片区域仍笼罩在迷雾之中。'); break;
        case 'close-camp': closeCamp(); break;
        case 'enter-camp': enterCamp(); break;
        case 'back-regions': recordScreen('regions'); setScreen('regions'); pressedKeys.clear(); break;
        case 'map-zoom-out': mapWheelZoomAction(-1); break;
        case 'map-center': centerMapOnLeader(); break;
        case 'map-zoom-in': mapWheelZoomAction(1); break;
        case 'hide-objective': tutorialPanel.dataset.dismissed = 'true'; tutorialPanel.hidden = true; break;
        case 'toggle-objective': toggleObjective(); break;
        case 'end-turn': endTurn(); break;
        case 'continue-portrait': portraitPromptDismissed = true; updateOrientationPrompt(); break;
        case 'toggle-build':
          if (buildMode || !buildPanel.hidden) closeBuildPanel(); else openBuildPanel(); break;
        case 'close-build': closeBuildPanel(); break;
        case 'close-selection':
          selectedUnitId = null;
          selectedBuildingKey = null;
          renderSelectionPanel(currentWorldData());
          updateHexVisualState();
          updatePrompt();
          break;
        case 'open-warehouse':
          resetJoystick();
          pressedKeys.clear();
          cancelGather(false);
          closeBuildPanel();
          document.getElementById('warehousePanel').hidden = false;
          updateInventoryDisplay();
          break;
        case 'close-warehouse': document.getElementById('warehousePanel').hidden = true; break;
        case 'choose-building': chooseBuilding(actionTarget.dataset.buildingId); break;
        case 'recruit-unit': recruitMilitia(); break;
        case 'open-tech': openTechnologyTree(); break;
        case 'close-tech': closeTechnologyTree(); break;
        case 'tech-jump': jumpToTechnologyEra(Number(actionTarget.dataset.eraIndex)); break;
        case 'tech-prev': jumpToTechnologyEra(currentTechEra - 1); break;
        case 'tech-next': jumpToTechnologyEra(currentTechEra + 1); break;
        case 'tech-placeholder': notify('研究内容与效果将在后续版本设定。'); break;
        case 'tech-woodcraft': startWoodcraftResearch(); break;
        case 'activate-woodcraft': activateWoodcraftResearch(); break;
        case 'advance-intro': advanceIntroDialogue(); break;
        case 'landmark': notify((actionTarget.dataset.name || '地点') + '：后续可接入探索与采集。', localToast); break;
      }
      return;
    }
    const unitToken = event.target.closest('[data-unit-id]');
    if (unitToken && currentScreen === 'local' && !buildMode && !unitMoving) {
      selectUnit(unitToken.dataset.unitId);
      return;
    }
    const buildingToken = event.target.closest('[data-building-key]');
    if (buildingToken && currentScreen === 'local' && !buildMode && !unitMoving) {
      const building = currentWorldData()?.buildings.find((item) => buildingKey(item) === buildingToken.dataset.buildingKey);
      if (building) selectBuilding(building);
      return;
    }
    const hex = event.target.closest('[data-hex-id]');
    if (hex && currentScreen === 'local') {
      if (!buildMode && technologyOverlay.hidden && document.getElementById('warehousePanel').hidden) moveSelectedUnitToHex(hex.dataset.hexId);
      return;
    }
    const slot = event.target.closest('[data-slot-id]');
    if (slot) chooseSlot(Number(slot.dataset.slotId));
  });
  saveGrid.addEventListener('keydown', (event) => {
    if ((event.key === 'Enter' || event.key === ' ') && event.target.matches('.save-slot')) { event.preventDefault(); chooseSlot(Number(event.target.dataset.slotId)); }
  });
  assistantDialog.addEventListener('click', (event) => {
    if (assistantDialog.dataset.mode === 'intro' && !event.target.closest('[data-action]')) advanceIntroDialogue();
  });
  worldCarousel.addEventListener('pointerdown', worldDown);
  worldCarousel.addEventListener('pointermove', worldMove);
  worldCarousel.addEventListener('pointerup', worldUp);
  worldCarousel.addEventListener('pointercancel', worldUp);
  regionViewport.addEventListener('pointerdown', regionDown);
  regionViewport.addEventListener('pointermove', regionMove);
  regionViewport.addEventListener('pointerup', regionUp);
  regionViewport.addEventListener('pointercancel', regionUp);
  localViewport.addEventListener('pointerdown', mapPointerDown);
  localViewport.addEventListener('pointermove', mapPointerMove);
  localViewport.addEventListener('pointerup', mapPointerUp);
  localViewport.addEventListener('pointercancel', mapPointerUp);
  localViewport.addEventListener('wheel', mapWheel, { passive: false });
  mapPlane.addEventListener('click', placeBuilding);
  techEraTrack.addEventListener('scroll', updateTechnologyEraPosition, { passive: true });
  techEraTrack.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowLeft') { event.preventDefault(); jumpToTechnologyEra(currentTechEra - 1); }
    else if (event.key === 'ArrowRight') { event.preventDefault(); jumpToTechnologyEra(currentTechEra + 1); }
  });
  /* Touch input follows the same tile taps and end-turn control as the desktop map. */

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!worldDirectory.hidden) worldDirectory.hidden = true;
      else if (!campDialog.hidden) closeCamp();
      else if (!modeOverlay.hidden) closeModePicker();
      else if (!saveOverlay.hidden) closeSaves();
      else if (currentScreen === 'local' && !orientationPrompt.hidden) { portraitPromptDismissed = true; updateOrientationPrompt(); }
      else if (currentScreen === 'local' && assistantDialog && !assistantDialog.hidden) dismissAssistantDialogue();
      else if (currentScreen === 'local' && !technologyOverlay.hidden) closeTechnologyTree();
      else if (currentScreen === 'local' && !document.getElementById('warehousePanel').hidden) document.getElementById('warehousePanel').hidden = true;
      else if (buildMode || !buildPanel.hidden) closeBuildPanel();
      else if (currentScreen === 'local') { recordScreen('regions'); setScreen('regions'); }
      else if (currentScreen === 'regions') { recordScreen('worlds'); setScreen('worlds'); }
      else if (currentScreen === 'worlds') { recordScreen('lord'); setScreen('lord'); }
      else if (currentScreen === 'lord') backToSaves();
      return;
    }
    if (event.altKey || event.ctrlKey || event.metaKey || event.target.matches('input,textarea,select,[contenteditable="true"]')) return;
    const key = event.key.toLowerCase();
    if (currentScreen === 'worlds' && !worldDirectory.hidden) return;
    if (currentScreen === 'worlds' && (key === 'a' || key === 'arrowleft')) { event.preventDefault(); rotateWorld(-1); return; }
    if (currentScreen === 'worlds' && (key === 'd' || key === 'arrowright')) { event.preventDefault(); rotateWorld(1); return; }
    if (currentScreen !== 'local') return;
    if (key === ' ' || key === 'enter') { event.preventDefault(); endTurn(); return; }
    if (!technologyOverlay.hidden) {
      if (key === 't') { event.preventDefault(); closeTechnologyTree(); }
      else if (key === 'a' || key === 'arrowleft') { event.preventDefault(); jumpToTechnologyEra(currentTechEra - 1); }
      else if (key === 'd' || key === 'arrowright') { event.preventDefault(); jumpToTechnologyEra(currentTechEra + 1); }
      return;
    }
    if (key === 't') { event.preventDefault(); openTechnologyTree(); return; }
    if (key === 'b') {
      event.preventDefault();
      if (buildMode || !buildPanel.hidden) closeBuildPanel(); else openBuildPanel();
      return;
    }
    if (key === 'i') {
      event.preventDefault();
      const warehousePanel = document.getElementById('warehousePanel');
      warehousePanel.hidden = !warehousePanel.hidden;
      if (!warehousePanel.hidden) { closeBuildPanel(); updateInventoryDisplay(); }
      return;
    }
    const hexKeyDirections = {
      q: { q: -1, r: 0 }, w: { q: 0, r: -1 }, e: { q: 1, r: -1 },
      a: { q: -1, r: 1 }, s: { q: 0, r: 1 }, d: { q: 1, r: 0 },
      arrowup: { q: 0, r: -1 }, arrowright: { q: 1, r: 0 }, arrowdown: { q: 0, r: 1 }, arrowleft: { q: -1, r: 0 },
    };
    if (hexKeyDirections[key] && !buildMode && technologyOverlay.hidden && document.getElementById('warehousePanel').hidden) {
      event.preventDefault();
      const direction = hexKeyDirections[key];
      const unit = selectedUnit();
      if (unit) moveSelectedUnitToHex(hexId(unit.q + direction.q, unit.r + direction.r));
    }
  });
  document.addEventListener('keyup', (event) => {
    pressedKeys.delete(event.key.toLowerCase());
    if (!pressedKeys.size) localPlayer.classList.remove('is-moving');
  });
  window.addEventListener('blur', () => { pressedKeys.clear(); resetJoystick(); localPlayer.classList.remove('is-moving'); });
  document.addEventListener('visibilitychange', () => { if (document.hidden) { pressedKeys.clear(); resetJoystick(); localPlayer.classList.remove('is-moving'); } });
  window.addEventListener('pagehide', () => {
    if (currentScreen !== 'local') return;
    const world = currentWorldData();
    if (world) { world.player = { ...playerHex }; persist(); }
  });
  window.addEventListener('resize', () => { sizeAndCenterMap(); sizeAndCenterRegionMap(); updateOrientationPrompt(); });
  window.addEventListener('orientationchange', updateOrientationPrompt);
  document.addEventListener('fullscreenchange', updateOrientationPrompt);
  screen.orientation?.addEventListener?.('change', updateOrientationPrompt);
  screen.orientation?.addEventListener?.('change', updateOrientationPrompt);
  setInterval(() => { if (currentScreen === 'local') updatePrompt(); }, 500);
  modeOverlay.addEventListener('click', (event) => { if (event.target.matches('.mode-scrim')) closeModePicker(); });
  saveOverlay.addEventListener('click', (event) => { if (event.target.matches('.overlay-scrim')) closeSaves(); });
  campDialog.addEventListener('click', (event) => { if (event.target.matches('.overlay-scrim')) closeCamp(); });

  persist();
  applyInputMode();
  setScreen('title');
})();

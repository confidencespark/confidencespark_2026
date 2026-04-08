/**
 * Step hero images: situation × vibe × step (mantra, body, grounding, reframe, ritual, bonus).
 * Each step type uses a distinct Unsplash photo ID per combo index (0–18).
 * Six thematic pools (meditation, movement, nature, work/thinking, connection/closure, celebration).
 */

const U = id =>
  `https://images.unsplash.com/photo-${id}?w=800&q=80&auto=format&fit=crop`;

const MANTRA_IDS = [
  '1508672019048-805c876b67e2',
  '1506126613408-eca07ce68773',
  '1512438248247-f0f2a5a8b7f0',
  '1522075782449-e45a34f1ddfb',
  '1528715471579-d1bcf0ba5e83',
  '1559595500-e15296bdbb48',
  '1593811167562-9cef47bfc4d7',
  '1536623975707-c4b3b2af565d',
  '1605515593579-d01f4678feca',
  '1758518730655-30a3cc3a4c68',
  '1444312645910-ffa973656eba',
  '1676277755239-c160872ccca3',
  '1690191927885-5a4b0d734741',
  '1762341120746-37b4ebad0c99',
  '1577344718665-3e7c0c1ecf6b',
  '1492562080023-ab3db95bfbce',
  '1506905925346-21bda4d32df4',
  '1537444532052-2afbf769b76c',
  '1522071820081-009f0129c71c',
];

const BODY_IDS = [
  '1544367567-0f2fcb009e0b',
  '1599901860904-17e6ed7083a0',
  '1552196563-55cd4e45efb3',
  '1575052814086-f385e2e2ad1b',
  '1698059133660-8b18399b6880',
  '1552196527-bffef41ef674',
  '1545389336-cf090694435e',
  '1588286840104-8957b019727f',
  '1524863479829-916d8e77f114',
  '1545205597-3d9d02c29597',
  '1447452001602-7090c7ab2db3',
  '1593164842264-854604db2260',
  '1600618528240-fb9fc964b853',
  '1713947505435-b79c33c6c91a',
  '1625334583355-463900ec13df',
  '1554415955-6813948f7318',
  '1698891668295-13c6de80aab5',
  '1547961326-83ef661fc045',
  '1696453423785-727e165462c1',
];

const GROUNDING_IDS = [
  '1554629947-334ff61d85dc',
  '1464822759023-fed622ff2c3b',
  '1454496522488-7a8e488e8606',
  '1480497490787-505ec076689f',
  '1483728642387-6c3bdd6c93e5',
  '1502085671122-2d218cd434e6',
  '1519681393784-d120267933ba',
  '1478059299873-f047d8c5fe1a',
  '1501785888041-af3ef285b470',
  '1540979388789-6cee28a1cdc9',
  '1465056836041-7f43ac27dcb5',
  '1534067783941-51c9c23ecefd',
  '1516655855035-d5215bcb5604',
  '1501786223405-6d024d7c3b8d',
  '1515310787031-25ac2d68610d',
  '1675434303097-210c75b61d3f',
  '1630673287511-4d477913d7a0',
  '1438761681033-6461ffad8d80',
  '1762341118883-13bbd9d79927',
];

const REFRAME_IDS = [
  '1499914485622-a88fac536970',
  '1508780709619-79562169bc64',
  '1486312338219-ce68d2c6f44d',
  '1579389083046-e3df9c2b3325',
  '1541560052-5e137f229371',
  '1448932223592-d1fc686e76ea',
  '1501504905252-473c47e087f8',
  '1631248082035-507d0fe8a8e2',
  '1611095973763-414019e72400',
  '1535957998253-26ae1ef29506',
  '1527689368864-3a821dbccc34',
  '1573164574230-db1d5e960238',
  '1453928582365-b6ad33cbcf64',
  '1612831197872-e4e4ca7f623f',
  '1487611459768-bd414656ea10',
  '1499750310107-5fef28a66643',
  '1552664730-d307ca884978',
  '1516321318423-f06f85e504b3',
  '1698047681469-8e0c19e80a66',
];

/** 16 handshake / agreement + closure / confident exit */
const RITUAL_IDS = [
  '1675629630050-c6fea8cd824e',
  '1672380135241-c024f7fbfa13',
  '1521791136064-7986c2920216',
  '1578357078586-491adf1aa5ba',
  '1496115965489-21be7e6e59a0',
  '1600880292089-90a7e086ee0c',
  '1580893246395-52aead8960dc',
  '1623661587015-f78594599b9b',
  '1665072204431-b3ba11bd6d06',
  '1518135714426-c18f5ffb6f4d',
  '1591453214154-c95db71dbd83',
  '1681505531034-8d67054e07f6',
  '1521790797524-b2497295b8a0',
  '1596633607590-7156877ef734',
  '1698047682091-782b1e5c6536',
  '1524758631624-e2822e304c36',
  '1521119989659-a83eee488004',
  '1717500251894-e127a481632e',
  '1628154797703-0192b1caf994',
];

/** Celebration / growth / win (19 unique; last five = confetti / fireworks / toast / sparkler / fireworks) */
const BONUS_IDS = [
  '1771924368572-2ba8c7f6c79d',
  '1758518731027-78a22c8852ec',
  '1758691737584-a8f17fb34475',
  '1740818576518-0c873d356122',
  '1758691737538-220c1902b1ca',
  '1760348082205-8bda5fbdd7b5',
  '1692158962119-8103c7d78c86',
  '1643537243683-a61ba2e77cf1',
  '1758873268783-967d13f0c163',
  '1758874384556-ad48ed1c946c',
  '1768767099805-4b07e76094d8',
  '1758691737138-7b9b1884b1db',
  '1758691737492-48e8fdd336f7',
  '1611224923853-80b023f02d71',
  '1513151233558-d860c5398176',
  '1531686264889-56fdcabd163f',
  '1527529482837-4698179dc6ce',
  '1467810563316-b5476525c0f9',
  '1498931299472-f7a63a5a1cfa',
];

function normalizeSituationKey(key) {
  if (!key) return 'daily';
  const k = String(key).toLowerCase();
  if (k === 'interview_career') return 'interview';
  return k;
}

function normalizeVibeKey(vibeKey, situationKey) {
  const sk = normalizeSituationKey(situationKey);
  let vk = (vibeKey || 'any').toLowerCase();
  if (sk === 'daily') return 'any';
  if (vk === 'any') return 'calm';
  return vk;
}

/**
 * 0 = daily+any; 1–18 = six situations × three vibes (pitch…difficult × calm/power/playful).
 */
export function comboIndexForStepHeroes(situationKey, vibeKey) {
  const sk = normalizeSituationKey(situationKey);
  const vk = normalizeVibeKey(vibeKey, situationKey);
  if (sk === 'daily') return 0;
  const situations = [
    'pitch',
    'interview',
    'performance',
    'negotiation',
    'presentation',
    'difficult',
  ];
  const si = situations.indexOf(sk);
  if (si < 0) return 0;
  const vi = ['calm', 'power', 'playful'].indexOf(vk);
  const v = vi >= 0 ? vi : 0;
  return 1 + si * 3 + v;
}

export function getStepHeroUrls(situationKey, vibeKey) {
  const idx = comboIndexForStepHeroes(situationKey, vibeKey);
  return {
    mantra: U(MANTRA_IDS[idx]),
    body: U(BODY_IDS[idx]),
    grounding: U(GROUNDING_IDS[idx]),
    reframe: U(REFRAME_IDS[idx]),
    ritual: U(RITUAL_IDS[idx]),
    bonus: U(BONUS_IDS[idx]),
  };
}

/**
 * @param {object|null} data - kit-shaped API data
 * @returns {object|null}
 */
export function applyStepHeroImagesToKit(data, situationKey, vibeKey) {
  if (!data) return data;
  const urls = getStepHeroUrls(situationKey, vibeKey);
  const patch = (arr, url, imageKey) =>
    arr?.length
      ? [{...arr[0], [imageKey]: {url}}]
      : arr;

  return {
    ...data,
    _mantra_sc: patch(
      data._mantra_sc,
      urls.mantra,
      'mantra_step_image',
    ),
    _body_reset_sc: patch(
      data._body_reset_sc,
      urls.body,
      'bodyreset_step_images',
    ),
    _grounding_belief_sc: patch(
      data._grounding_belief_sc,
      urls.grounding,
      'groundingbelief_step_image',
    ),
    _mental_reframe_sc: patch(
      data._mental_reframe_sc,
      urls.reframe,
      'mentalreframe_step_image',
    ),
    _ending_ritual_sc: patch(
      data._ending_ritual_sc,
      urls.ritual,
      'endingritual_step_image',
    ),
    _bonus_tip_sc: patch(
      data._bonus_tip_sc,
      urls.bonus,
      'bonustip_step_image',
    ),
  };
}

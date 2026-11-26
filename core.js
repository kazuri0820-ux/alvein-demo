(function (root, factory) {
  const api = factory();
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  if (root) root.AlveinCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function () {
  'use strict';

  const SAVE_VERSION = 2;
  const MAX_MEDALS = 1_000_000;
  const MAX_INFANTRY_LEVEL = 100_000;
  const MAX_ARCHERS = 100_000;
  const MAX_TRAINING = 100_000;
  const OFFLINE_CAP_SECONDS = 8 * 60 * 60;
  const MAX_DEFEATS_PER_SECOND = 15000;
  const ZONES = ['霧の街道', '朽ちた見張り塔', '黒樹の森', '灰狼の峡谷', '忘れられた祭壇'];
  const ENEMIES = [
    { id: 'mist-wolf', name: '霧牙狼', hp: 26, gold: 15, honor: 4, color: '#76545b' },
    { id: 'ruin-sentinel', name: '遺跡の番兵', hp: 34, gold: 20, honor: 5, color: '#667b83' },
    { id: 'thorn-wisp', name: '棘森の灯霊', hp: 42, gold: 25, honor: 6, color: '#688b76' },
    { id: 'ash-stag', name: '灰角獣', hp: 52, gold: 31, honor: 7, color: '#806b50' },
    { id: 'altar-guardian', name: '祭壇守護者', hp: 66, gold: 40, honor: 9, color: '#75658c' }
  ];

  const finite = (value, fallback) => Number.isFinite(value) ? value : fallback;
  const boundedInt = (value, fallback, min, max) => {
    if (!Number.isFinite(value)) return fallback;
    return Math.min(max, Math.max(min, Math.floor(value)));
  };


  function isValidCurrentSave(raw) {
    const integerRanges = [
      ['gold', 0, 1_000_000_000_000],
      ['honor', 0, 1_000_000_000_000],
      ['stage', 1, 1_000_000],
      ['infLv', 1, MAX_INFANTRY_LEVEL],
      ['arch', 0, MAX_ARCHERS],
      ['training', 0, MAX_TRAINING],
      ['kills', 0, 1_000_000_000],
      ['medals', 0, MAX_MEDALS],
      ['lastSeen', 0, Number.MAX_SAFE_INTEGER]
    ];
    return raw.version === SAVE_VERSION
      && typeof raw.mage === 'boolean'
      && integerRanges.every(([key, min, max]) =>
        Number.isInteger(raw[key]) && raw[key] >= min && raw[key] <= max
      )
      && Number.isFinite(raw.enemyHp)
      && raw.enemyHp >= 0
      && raw.enemyHp <= 1_000_000_000;
  }

  function createInitialState(now) {
    const timestamp = finite(now, Date.now());
    return {
      version: SAVE_VERSION,
      gold: 80,
      honor: 0,
      stage: 1,
      infLv: 1,
      arch: 0,
      mage: false,
      training: 0,
      kills: 0,
      medals: 0,
      enemyHp: 0,
      lastSeen: timestamp
    };
  }

  function sanitizeState(raw, now) {
    const timestamp = finite(now, Date.now());
    const fresh = createInitialState(timestamp);
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
      return { state: fresh, status: 'corrupt' };
    }

    const legacy = raw.version === undefined || raw.version === 1;
    if (!legacy && raw.version !== SAVE_VERSION) {
      return { state: fresh, status: 'unsupported' };
    }

    const state = {
      version: SAVE_VERSION,
      gold: boundedInt(raw.gold, fresh.gold, 0, 1_000_000_000_000),
      honor: boundedInt(raw.honor, 0, 0, 1_000_000_000_000),
      stage: boundedInt(raw.stage, 1, 1, 1_000_000),
      infLv: boundedInt(raw.infLv, 1, 1, MAX_INFANTRY_LEVEL),
      arch: boundedInt(raw.arch, 0, 0, MAX_ARCHERS),
      mage: raw.mage === true,
      training: boundedInt(raw.training, 0, 0, MAX_TRAINING),
      kills: boundedInt(raw.kills, 0, 0, 1_000_000_000),
      medals: boundedInt(raw.medals, legacy ? boundedInt(raw.rebirths, 0, 0, MAX_MEDALS) : 0, 0, MAX_MEDALS),
      enemyHp: Math.min(1_000_000_000, Math.max(0, finite(raw.enemyHp, 0))),
      lastSeen: boundedInt(raw.lastSeen, boundedInt(raw.last, timestamp, 0, Number.MAX_SAFE_INTEGER), 0, Number.MAX_SAFE_INTEGER)
    };

    const currentMax = enemyForState(state).maxHp;
    if (state.enemyHp <= 0 || state.enemyHp > currentMax) state.enemyHp = currentMax;
    return { state, status: legacy ? 'migrated' : (isValidCurrentSave(raw) ? 'loaded' : 'corrupt') };
  }

  function loadSave(serialized, now) {
    if (serialized == null) {
      return { state: createInitialState(now), status: 'new' };
    }
    if (serialized === '') {
      return { state: createInitialState(now), status: 'corrupt' };
    }
    try {
      return sanitizeState(JSON.parse(serialized), now);
    } catch (_) {
      return { state: createInitialState(now), status: 'corrupt' };
    }
  }

  function serializeState(state) {
    const clean = sanitizeState(state, Date.now()).state;
    return JSON.stringify(clean);
  }

  function getCosts(state) {
    return {
      infantry: 20 + state.infLv * 15,
      archer: 35,
      mage: 180,
      training: 75 + state.training * 40
    };
  }

  function calculateDps(state) {
    const base = 1.4 + Math.max(0, state.infLv - 1) * 0.9 + state.arch * 2.6
      + (state.mage ? 6.5 : 0) + state.medals * 2;
    return Math.max(0.1, base * (1 + state.training * 0.15));
  }

  function enemyForState(state) {
    const enemy = ENEMIES[state.kills % ENEMIES.length];
    const scaling = 1 + Math.max(0, state.stage - 1) * 0.045;
    return {
      ...enemy,
      maxHp: Math.max(1, Math.round(enemy.hp * scaling)),
      goldReward: enemy.gold + Math.max(0, state.stage - 1) * 2,
      honorReward: enemy.honor + Math.floor(Math.max(0, state.stage - 1) / 2),
      zone: ZONES[Math.floor((state.stage - 1) / 3) % ZONES.length]
    };
  }

  function ensureEnemy(state) {
    const enemy = enemyForState(state);
    if (!Number.isFinite(state.enemyHp) || state.enemyHp <= 0 || state.enemyHp > enemy.maxHp) {
      state.enemyHp = enemy.maxHp;
    }
    return enemy;
  }

  function advanceCombat(state, elapsedSeconds) {
    let remaining = Math.min(60, Math.max(0, finite(elapsedSeconds, 0)));
    const dps = calculateDps(state);
    const startStage = state.stage;
    let defeated = 0;
    // Preserve the former 250-defeat/60Hz work ceiling while making it time-based.
    const previousBudget = Math.max(0, Math.min(1, finite(state._combatDefeatBudget, 0)));
    const defeatBudget = previousBudget + remaining * MAX_DEFEATS_PER_SECOND;
    const maxDefeats = remaining > 0 ? Math.floor(defeatBudget + 1e-9) : 0;
    let goldEarned = 0;
    let honorEarned = 0;
    ensureEnemy(state);

    // Keep partial damage during sub-slot ticks, but hold a lethal hit until a defeat slot is available.
    if (remaining > 0 && maxDefeats === 0) {
      state.enemyHp = Math.max(Number.MIN_VALUE, state.enemyHp - dps * remaining);
      state._combatDefeatBudget = Math.min(1, Math.max(0, defeatBudget));
      return { defeated, goldEarned, honorEarned, stageUps: state.stage - startStage, dps };
    }

    while (remaining > 0 && defeated < maxDefeats) {
      const enemy = enemyForState(state);
      if (state.enemyHp <= 0 || state.enemyHp > enemy.maxHp) state.enemyHp = enemy.maxHp;
      const secondsToDefeat = state.enemyHp / dps;
      if (remaining + 1e-9 < secondsToDefeat) {
        state.enemyHp = Math.max(0, state.enemyHp - dps * remaining);
        remaining = 0;
      } else {
        remaining = Math.max(0, remaining - secondsToDefeat);
        state.enemyHp = 0;
        const goldBefore = state.gold;
        const honorBefore = state.honor;
        state.gold = Math.min(1_000_000_000_000, state.gold + enemy.goldReward);
        state.honor = Math.min(1_000_000_000_000, state.honor + enemy.honorReward);
        goldEarned += Math.max(0, state.gold - goldBefore);
        honorEarned += Math.max(0, state.honor - honorBefore);
        state.kills = Math.min(1_000_000_000, state.kills + 1);
        defeated += 1;
        if (state.kills % 3 === 0) state.stage = Math.min(1_000_000, state.stage + 1);
        state.enemyHp = enemyForState(state).maxHp;
      }
    }

    // Preserve time left after the final allowed defeat as damage on the next enemy, not another kill.
    if (remaining > 0 && defeated >= maxDefeats) {
      state.enemyHp = Math.max(Number.MIN_VALUE, state.enemyHp - dps * remaining);
    }
    // Carry at most one unused defeat slot; never bank minutes of idle capacity.
    state._combatDefeatBudget = Math.min(1, Math.max(0, defeatBudget - defeated));

    return {
      defeated,
      goldEarned,
      honorEarned,
      stageUps: state.stage - startStage,
      dps
    };
  }

  function purchase(state, kind) {
    const costs = getCosts(state);
    const cost = costs[kind];
    if (!Number.isFinite(cost)) return { ok: false, reason: 'unknown' };
    if (kind === 'infantry' && state.infLv >= MAX_INFANTRY_LEVEL) return { ok: false, reason: 'cap' };
    if (kind === 'archer' && state.arch >= MAX_ARCHERS) return { ok: false, reason: 'cap' };
    if (kind === 'training' && state.training >= MAX_TRAINING) return { ok: false, reason: 'cap' };
    if (kind === 'mage' && state.mage) return { ok: false, reason: 'owned' };
    if (state.gold < cost) return { ok: false, reason: 'funds', cost };

    state.gold -= cost;
    if (kind === 'infantry') state.infLv += 1;
    else if (kind === 'archer') state.arch += 1;
    else if (kind === 'mage') state.mage = true;
    else if (kind === 'training') state.training += 1;
    else return { ok: false, reason: 'unknown' };
    return { ok: true, cost };
  }

  function applyPrestige(state) {
    const honor = boundedInt(state.honor, 0, 0, 1_000_000_000_000);
    if (honor < 500) return { ok: false, reason: 'honor' };
    const currentMedals = boundedInt(state.medals, 0, 0, MAX_MEDALS);
    const gain = Math.min(Math.floor(honor / 500), MAX_MEDALS - currentMedals);
    if (gain <= 0) return { ok: false, reason: 'cap' };
    state.medals = currentMedals + gain;
    state.gold = 80;
    state.honor = 0;
    state.stage = 1;
    state.infLv = 1;
    state.arch = 0;
    state.mage = false;
    state.training = 0;
    state.kills = 0;
    state.enemyHp = enemyForState(state).maxHp;
    state._combatDefeatBudget = 0;
    return { ok: true, gain };
  }

  function applyOfflineProgress(state, now) {
    const timestamp = finite(now, Date.now());
    const lastSeen = finite(state.lastSeen, timestamp);
    const elapsedSeconds = Math.min(OFFLINE_CAP_SECONDS, Math.max(0, (timestamp - lastSeen) / 1000));
    const ratePerMinute = Math.max(1, Math.floor(calculateDps(state) * 0.25));
    const requestedGold = elapsedSeconds >= 60 ? Math.floor(elapsedSeconds / 60) * ratePerMinute : 0;
    const goldBefore = state.gold;
    state.gold = Math.min(1_000_000_000_000, state.gold + requestedGold);
    const goldEarned = Math.max(0, state.gold - goldBefore);
    // Keep the persisted clock watermark monotonic if the device clock moves backward.
    state.lastSeen = Math.max(lastSeen, timestamp);
    return { elapsedSeconds, goldEarned, ratePerMinute };
  }

  return {
    SAVE_VERSION,
    MAX_MEDALS,
    MAX_INFANTRY_LEVEL,
    MAX_ARCHERS,
    MAX_TRAINING,
    OFFLINE_CAP_SECONDS,
    MAX_DEFEATS_PER_SECOND,
    ZONES,
    ENEMIES,
    createInitialState,
    sanitizeState,
    loadSave,
    serializeState,
    getCosts,
    calculateDps,
    enemyForState,
    ensureEnemy,
    advanceCombat,
    purchase,
    applyPrestige,
    applyOfflineProgress
  };
});
export const generatePorts = (count, type) =>
  Array.from({ length: count }, (_, i) => ({
    id: i + 1,
    type,
    active: false,
    name: '',
  }));

const panel = (name, type, count) => ({
  name,
  type,
  ports: generatePorts(count, type === 'rj45' ? 'rj45' : 'fiber'),
});

const row = (name, panels) => ({ name, panels });

const aisle = (id, rows) => ({ id, rows });

const LTR_SLOTS = ['D', 'F', 'I', 'K', 'M', 'O', 'Q', 'S', 'U', 'W'];

const getAisleCode = (id) => {
  const codes = {
    1: '09',
    2: '14',
    3: '19',
    4: '24',
    5: '28',
    6: '33',
    7: '38',
    8: '43',
  };

  return codes[id] || '43';
};

const format2 = (n) => String(n).padStart(2, '0');

const createRj45FoSet = (prefix, id, start = 1) => {
  const first = format2(start);
  const second = format2(start + 1);
  return [
    panel(`${prefix}.${id} C-${first}`, 'rj45', 24),
    panel(`${prefix}.${id} C-${second}`, 'rj45', 24),
    panel(`${prefix}.${id} F-${first}`, 'fo', 12),
    panel(`${prefix}.${id} F-${second}`, 'fo', 12),
  ];
};

const createCop7Aisle = (id) => {
  const code = getAisleCode(id);

  const ltrRows = LTR_SLOTS.map((slot, index) => {
    const start = (LTR_SLOTS.length - index - 1) * 2 + 1;
    return row(`Rangée LTR-${slot}${code}`, createRj45FoSet('5.R', id, start));
  });

  const ltiRow = row(`Rangée LTI-${code}`, createRj45FoSet('5.I', id));

  return aisle(id, [...ltrRows, ltiRow]);
};

export function ensureCop7HasEightAisles(data) {
  const next = structuredClone(data);

  if (!next.COP7) {
    next.COP7 = { name: 'Salle COP7', aisles: [] };
  }

  if (!Array.isArray(next.COP7.aisles)) {
    next.COP7.aisles = [];
  }

  const existingAislesById = new Map(
    next.COP7.aisles
      .filter((a) => Number.isInteger(a?.id))
      .map((a) => [a.id, a])
  );

  next.COP7.aisles = Array.from({ length: 8 }, (_, i) => {
    const id = i + 1;
    const existing = existingAislesById.get(id);

    if (existing && Array.isArray(existing.rows)) {
      return existing;
    }

    return createCop7Aisle(id);
  });

  return next;
}

export function createDefaultData() {
  return ensureCop7HasEightAisles({
    IBM: {
      name: 'Salle IBM',
      aisles: [
        aisle(1, [
          row('Rangée LTI-E10', [
            panel('2.I.1 C-1', 'rj45', 48),
            panel('2.I.1 F-1', 'fo', 12),
          ]),
          row('Rangée LTR-M10', [
            panel('2.R.1 C-1', 'rj45', 24),
            panel('2.R.1 F-1', 'fo', 12),
          ]),
        ]),
        aisle(2, [
          row('Rangée LTI-E11', [
            panel('2.I.2 C-1', 'rj45', 48),
            panel('2.I.2 F-1', 'fo', 12),
          ]),
          row('Rangée LTR-M11', [panel('2.R.2 C-1', 'rj45', 24)]),
        ]),
      ],
    },
    COP7: {
      name: 'Salle COP7',
      aisles: Array.from({ length: 8 }, (_, i) => createCop7Aisle(i + 1)),
    },
  });
}

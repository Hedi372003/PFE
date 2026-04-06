const { randomUUID } = require("crypto");
const { Pool } = require("pg");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const VALID_STATUSES = new Set(["online", "offline", "maintenance"]);
const SELECT_COLUMNS = `
  id,
  name,
  "robotId" AS "robotId",
  latitude,
  longitude,
  status,
  "createdAt" AS "createdAt",
  "updatedAt" AS "updatedAt"
`;

function normalizeString(value) {
  return String(value || "").trim();
}

function normalizeStatus(value, fallback = "offline") {
  const normalized = normalizeString(value).toLowerCase();
  return VALID_STATUSES.has(normalized) ? normalized : fallback;
}

function parseCoordinate(value, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function mapRobot(row) {
  return {
    id: row.id,
    name: row.name,
    robotId: row.robotId,
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    status: row.status,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
  };
}

async function listRobots() {
  const result = await pool.query(
    `SELECT ${SELECT_COLUMNS}
     FROM robots
     ORDER BY "createdAt" DESC`,
  );

  return result.rows.map(mapRobot);
}

async function getRobotById(id) {
  const result = await pool.query(
    `SELECT ${SELECT_COLUMNS}
     FROM robots
     WHERE id = $1
     LIMIT 1`,
    [normalizeString(id)],
  );

  return result.rows[0] ? mapRobot(result.rows[0]) : null;
}

async function getRobotByRobotId(robotId) {
  const result = await pool.query(
    `SELECT ${SELECT_COLUMNS}
     FROM robots
     WHERE "robotId" = $1
     LIMIT 1`,
    [normalizeString(robotId)],
  );

  return result.rows[0] ? mapRobot(result.rows[0]) : null;
}

async function createRobot(payload) {
  const now = new Date();
  const robot = {
    id: randomUUID(),
    name: normalizeString(payload.name),
    robotId: normalizeString(payload.robotId),
    latitude: parseCoordinate(payload.latitude),
    longitude: parseCoordinate(payload.longitude),
    status: normalizeStatus(payload.status),
    createdAt: now,
    updatedAt: now,
  };

  const result = await pool.query(
    `INSERT INTO robots (
      id,
      name,
      "robotId",
      latitude,
      longitude,
      status,
      "createdAt",
      "updatedAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING ${SELECT_COLUMNS}`,
    [
      robot.id,
      robot.name,
      robot.robotId,
      robot.latitude,
      robot.longitude,
      robot.status,
      robot.createdAt,
      robot.updatedAt,
    ],
  );

  return mapRobot(result.rows[0]);
}

async function updateRobot(id, payload) {
  const updates = [];
  const values = [];

  if (payload.name !== undefined) {
    updates.push(`name = $${values.length + 1}`);
    values.push(normalizeString(payload.name));
  }

  if (payload.robotId !== undefined) {
    updates.push(`"robotId" = $${values.length + 1}`);
    values.push(normalizeString(payload.robotId));
  }

  if (payload.latitude !== undefined) {
    updates.push(`latitude = $${values.length + 1}`);
    values.push(parseCoordinate(payload.latitude));
  }

  if (payload.longitude !== undefined) {
    updates.push(`longitude = $${values.length + 1}`);
    values.push(parseCoordinate(payload.longitude));
  }

  if (payload.status !== undefined) {
    updates.push(`status = $${values.length + 1}`);
    values.push(normalizeStatus(payload.status, ""));
  }

  if (updates.length === 0) {
    return null;
  }

  updates.push(`"updatedAt" = $${values.length + 1}`);
  values.push(new Date());
  values.push(normalizeString(id));

  const result = await pool.query(
    `UPDATE robots
     SET ${updates.join(", ")}
     WHERE id = $${values.length}
     RETURNING ${SELECT_COLUMNS}`,
    values,
  );

  return result.rows[0] ? mapRobot(result.rows[0]) : null;
}

async function deleteRobot(id) {
  const result = await pool.query(
    `DELETE FROM robots
     WHERE id = $1
     RETURNING ${SELECT_COLUMNS}`,
    [normalizeString(id)],
  );

  return result.rows[0] ? mapRobot(result.rows[0]) : null;
}

async function upsertRobot(payload) {
  const now = new Date();
  const robot = {
    id: randomUUID(),
    name: normalizeString(payload.name),
    robotId: normalizeString(payload.robotId),
    latitude: parseCoordinate(payload.latitude),
    longitude: parseCoordinate(payload.longitude),
    status: normalizeStatus(payload.status),
    createdAt: now,
    updatedAt: now,
  };

  const result = await pool.query(
    `INSERT INTO robots (
      id,
      name,
      "robotId",
      latitude,
      longitude,
      status,
      "createdAt",
      "updatedAt"
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    ON CONFLICT ("robotId")
    DO UPDATE SET
      name = EXCLUDED.name,
      latitude = EXCLUDED.latitude,
      longitude = EXCLUDED.longitude,
      status = EXCLUDED.status,
      "updatedAt" = EXCLUDED."updatedAt"
    RETURNING ${SELECT_COLUMNS}`,
    [
      robot.id,
      robot.name,
      robot.robotId,
      robot.latitude,
      robot.longitude,
      robot.status,
      robot.createdAt,
      robot.updatedAt,
    ],
  );

  return mapRobot(result.rows[0]);
}

function isUniqueViolation(error) {
  return error && error.code === "23505";
}

module.exports = {
  VALID_STATUSES,
  listRobots,
  getRobotById,
  getRobotByRobotId,
  createRobot,
  updateRobot,
  deleteRobot,
  upsertRobot,
  isUniqueViolation,
};

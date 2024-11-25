const db = require('../../infrastructure/database');

const getAllMessages = async () => {
  const query = `
    SELECT s.sensor_name, sa.value, sa.message, sa.event_time
    FROM Sensors s
    JOIN SensorActivity sa ON s.sensor_id = sa.sensor_id
    ORDER BY sa.event_time DESC
  `;
  const [rows] = await db.execute(query);
  return rows;
};

module.exports = { getAllMessages };

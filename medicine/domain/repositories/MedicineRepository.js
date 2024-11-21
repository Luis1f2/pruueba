const db = require('../../infrastructure/database');

class MedicineRepository {
  // Guardar un medicamento
  async save(medicine) {
    const query = `
      INSERT INTO Medicamento 
      (id_paciente, id_medicamento_rfid, nombre_medicamento, horario_medicamento, fecha_inicio, fecha_final, dosis, frecuencias, notas_adicionales)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    const values = [
      medicine.id_paciente,
      medicine.id_medicamento_rfid,
      medicine.nombre_medicamento,
      medicine.horario_medicamento,
      medicine.fecha_inicio,
      medicine.fecha_final,
      medicine.dosis,
      medicine.frecuencias,
      medicine.notas_adicionales,
    ];
    const [result] = await db.execute(query, values);
    return result.insertId;
  }

  async getLatestRFID() {
    const query = `SELECT id_medicamento_rfid FROM RFIDsPendientes ORDER BY fecha_registro DESC LIMIT 1`;
    const [rows] = await db.execute(query);
    return rows.length > 0 ? rows[0].id_medicamento_rfid : null;
  }


  // Obtener todos los medicamentos
  async findAll() {
    const query = `SELECT * FROM Medicamento`;
    const [rows] = await db.execute(query);
    return rows;
  }

  // Obtener un medicamento por ID o RFID
  async findByIdOrRFID(identifier) {
    const query = `
      SELECT * FROM Medicamento
      WHERE id_medicamento = ? OR id_medicamento_rfid = ?
    `;
    const [rows] = await db.execute(query, [identifier, identifier]);
    return rows.length > 0 ? rows[0] : null;
  }

  // Obtener medicamentos por ID de paciente
  async findByIdPatient(id_paciente) {
    const query = `SELECT * FROM Medicamento WHERE id_paciente = ?`;
    const [rows] = await db.execute(query, [id_paciente]);
    return rows;
  }

  // Actualizar un medicamento por ID
  async update(id, medicine) {
    const query = `
      UPDATE Medicamento
      SET id_paciente = ?, id_medicamento_rfid = ?, nombre_medicamento = ?, horario_medicamento = ?, fecha_inicio = ?, fecha_final = ?, dosis = ?, frecuencias = ?, notas_adicionales = ?
      WHERE id_medicamento = ?
    `;
    const values = [
      medicine.id_paciente,
      medicine.id_medicamento_rfid,
      medicine.nombre_medicamento,
      medicine.horario_medicamento,
      medicine.fecha_inicio,
      medicine.fecha_final,
      medicine.dosis,
      medicine.frecuencias,
      medicine.notas_adicionales,
      id,
    ];
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }

  // Eliminar un medicamento por ID
  async delete(id) {
    const query = `DELETE FROM Medicamento WHERE id_medicamento = ?`;
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0;
  }
  async savePendingRFID(data) {
    const query = `
      INSERT INTO RFIDsPendientes (id_medicamento_rfid)
      VALUES (?)
    `;
    const values = [data.id_medicamento_rfid];
    const [result] = await db.execute(query, values);
    return result.insertId;
  }
  
  async findPending() {
    const query = `
      SELECT id_medicamento_rfid FROM Medicamento
      WHERE nombre_medicamento IS NULL
    `;
    const [rows] = await db.execute(query);
    return rows;
  }
  
  async findAllPendingRFIDs() {
    const query = `SELECT * FROM RFIDsPendientes`;
    const [rows] = await db.execute(query);
    return rows;
  }
  
  async savePendingRFID(data) {
    const query = `
      INSERT INTO RFIDsPendientes (id_medicamento_rfid)
      VALUES (?)
    `;
    const values = [data.id_medicamento_rfid];
    const [result] = await db.execute(query, values);
    return result.insertId;
  }

  // Obtener todos los RFIDs pendientes
  async findAllPendingRFIDs() {
    const query = `SELECT * FROM RFIDsPendientes`;
    const [rows] = await db.execute(query);
    return rows;
  }

  
  async updateByRFID(id_medicamento_rfid, medicine) {
    const query = `
      UPDATE Medicamento
      SET nombre_medicamento = ?, horario_medicamento = ?, fecha_inicio = ?, fecha_final = ?, dosis = ?, frecuencias = ?, notas_adicionales = ?
      WHERE id_medicamento_rfid = ?
    `;
    const values = [
      medicine.nombre_medicamento,
      medicine.horario_medicamento,
      medicine.fecha_inicio,
      medicine.fecha_final,
      medicine.dosis,
      medicine.frecuencias,
      medicine.notas_adicionales,
      id_medicamento_rfid,
    ];
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0;
  }
}

module.exports = MedicineRepository;

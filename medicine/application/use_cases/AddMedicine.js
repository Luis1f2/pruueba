class AddMedicine {
  constructor(medicineRepository) {
    this.medicineRepository = medicineRepository;
  }

  async execute(medicineData) {
    const Medicine = require('../../domain/entities/medicine');
    const medicine = new Medicine(
      null, 
      medicineData.id_paciente,
      medicineData.id_medicamento_rfid || null,
      medicineData.nombre_medicamento,
      medicineData.horario_medicamento,
      medicineData.fecha_inicio,
      medicineData.fecha_final,
      medicineData.dosis,
      medicineData.frecuencias,
      medicineData.notas_adicionales
    );
    return await this.medicineRepository.save(medicine);
  }
}

module.exports = AddMedicine;

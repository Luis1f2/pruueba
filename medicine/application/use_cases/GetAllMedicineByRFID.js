class GetMedicineByRFID {
    constructor(medicineRepository) {
      this.medicineRepository = medicineRepository;
    }
  
    async execute(id_medicamento_rfid) {
      return await this.medicineRepository.findByIdOrRFID(id_medicamento_rfid);
    }
  }
  
  module.exports = GetMedicineByRFID;
  
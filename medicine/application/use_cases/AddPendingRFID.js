class AddPendingRFID {
    constructor(medicineRepository) {
      this.medicineRepository = medicineRepository;
    }
  
    async execute(data) {
      // Llama al repositorio para guardar el RFID pendiente
      return await this.medicineRepository.savePendingRFID(data);
    }
  }
  
  module.exports = AddPendingRFID;
  
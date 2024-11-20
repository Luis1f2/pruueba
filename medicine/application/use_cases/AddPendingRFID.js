class AddPendingRFID {
    constructor(medicineRepository) {
      this.medicineRepository = medicineRepository;
    }
  
    async execute(data) {
      const { id_medicamento_rfid } = data;
  
      if (!id_medicamento_rfid) {
        throw new Error('El ID RFID es obligatorio');
      }
  
      return await this.medicineRepository.savePendingRFID(data);
    }
  }
  
  module.exports = AddPendingRFID;
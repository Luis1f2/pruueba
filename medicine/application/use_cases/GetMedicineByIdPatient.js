class GetMedicineByIdPatient {
    constructor(medicineRepository) {
      this.medicineRepository = medicineRepository;
    }
  
    async execute(id_paciente) {
      const medicine = await this.medicineRepository.findByIdPatient(id_paciente);
      if (!medicine) {
        throw new Error('Medicine not found');
      }
  
      return medicine;
    }
  }
  
  module.exports = GetMedicineByIdPatient;
  
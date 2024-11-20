class GetAllMedicines {
  constructor(medicineRepository) {
    this.medicineRepository = medicineRepository;
  }

  async execute() {
    return await this.medicineRepository.findAll();
  }
}

module.exports = GetAllMedicines;

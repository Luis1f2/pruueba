class UpdateMedicine {
  constructor(medicineRepository) {
    this.medicineRepository = medicineRepository;
  }

  async execute(id, medicineData) {
    return await this.medicineRepository.update(id, medicineData);
  }
}

module.exports = UpdateMedicine;

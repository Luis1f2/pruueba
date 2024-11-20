class DeleteMedicine {
  constructor(medicineRepository) {
    this.medicineRepository = medicineRepository;
  }

  async execute(id) {
    return await this.medicineRepository.delete(id);
  }
}

module.exports = DeleteMedicine;

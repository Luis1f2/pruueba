class GetPatientById {
  constructor(patientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(id) {
    if (!id) {
      throw new Error('El ID del paciente es requerido');
    }
    return await this.patientRepository.findById(id);
  }
}

module.exports = GetPatientById;

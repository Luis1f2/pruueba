class UpdatePatient {
  constructor(patientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(id, patientData) {
    const patient = await this.patientRepository.findById(id);

    if (!patient) {
      throw new Error('Paciente no encontrado');
    }

    return await this.patientRepository.update(id, patientData);
  }
}

module.exports = UpdatePatient;

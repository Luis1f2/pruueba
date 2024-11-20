class GetPatientByIdUser {
  constructor(patientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(userId) {
    if (!userId) {
      throw new Error('El ID de usuario es requerido');
    }
    return await this.patientRepository.findByIdUser(userId);

  }
}

module.exports = GetPatientByIdUser;
  
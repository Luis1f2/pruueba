class DeletePatient {
    constructor(patientRepository) {
      this.patientRepository = patientRepository;
    }
  
    async execute(patientId) {
      const patient = await this.patientRepository.findById(patientId);
      if (!patient) {
        throw new Error('Patient not found');
      }
  
      return await this.patientRepository.delete(patientId);
    }
  }
  
  module.exports = DeletePatient;
  
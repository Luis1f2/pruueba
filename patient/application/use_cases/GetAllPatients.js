class GetAllPatients {
    constructor(patientRepository) {
      this.patientRepository = patientRepository;
    }
  
    async execute() {
      return await this.patientRepository.findAll();
    }
  }
  
  module.exports = GetAllPatients;
  
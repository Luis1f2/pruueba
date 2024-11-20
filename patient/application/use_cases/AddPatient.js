const Patient = require('../../domain/entities/Patient');

class AddPatient {
  constructor(patientRepository) {
    this.patientRepository = patientRepository;
  }

  async execute(patientData) {
    const {
      id_usuario,
      nombre_completo,
      genero,
      edad,
      direccion,
      telefono,
      condicion,
      enfermedades_pers,
      alergias,
      grupo_sanguineo,
      peso,
      diagnostico_reciente
    } = patientData;

    if (!id_usuario || !nombre_completo) {
      throw new Error('Faltan campos obligatorios: id_usuario y nombre_completo');
    }

    // Instancia de la clase Patient
    const patient = new Patient(
      null, // id_paciente se genera automáticamente en la base de datos
      id_usuario,
      nombre_completo,
      genero,
      edad,
      direccion,
      telefono,
      condicion,
      enfermedades_pers,
      alergias,
      grupo_sanguineo,
      peso,
      diagnostico_reciente
    );

    // Guardar el paciente en el repositorio
    return await this.patientRepository.save(patient);
  }
}

module.exports = AddPatient;

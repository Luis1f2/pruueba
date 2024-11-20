class Patient {
  constructor(
    id_paciente,
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
  ) {
    this.id_paciente = id_paciente;
    this.id_usuario = id_usuario;
    this.nombre_completo = nombre_completo;
    this.genero = genero;
    this.edad = edad;
    this.direccion = direccion;
    this.telefono = telefono;
    this.condicion = condicion;
    this.enfermedades_pers = enfermedades_pers;
    this.alergias = alergias;
    this.grupo_sanguineo = grupo_sanguineo;
    this.peso = peso;
    this.diagnostico_reciente = diagnostico_reciente;
  }
}

module.exports = Patient;

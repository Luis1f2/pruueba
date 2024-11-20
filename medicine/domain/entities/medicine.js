class Medicine {
  constructor(
    id_medicamento,
    id_paciente,
    id_medicamento_rfid,
    nombre_medicamento,
    horario_medicamento,
    fecha_inicio,
    fecha_final,
    dosis,
    frecuencias,
    notas_adicionales
  ) {
    this.id_medicamento = id_medicamento;
    this.id_paciente = id_paciente;
    this.id_medicamento_rfid = id_medicamento_rfid;
    this.nombre_medicamento = nombre_medicamento;
    this.horario_medicamento = horario_medicamento;
    this.fecha_inicio = fecha_inicio;
    this.fecha_final = fecha_final;
    this.dosis = dosis;
    this.frecuencias = frecuencias;
    this.notas_adicionales = notas_adicionales;
  }
}

module.exports = Medicine;

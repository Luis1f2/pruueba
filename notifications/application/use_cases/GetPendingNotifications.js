class GetPendingNotifications {
  constructor(notificationRepository) {
    this.notificationRepository = notificationRepository;
  }

  async execute({ idPaciente, idMedicamento = null }) {
    if (!idPaciente) {
      throw new Error('El idPaciente es requerido');
    }

    if (idMedicamento) {
      // Consultar por paciente y medicamento
      return await this.notificationRepository.findPendingByPacienteAndMedicamento(idPaciente, idMedicamento);
    }

    // Consultar solo por paciente
    return await this.notificationRepository.findPendingByPaciente(idPaciente);
  }
}

module.exports = GetPendingNotifications;

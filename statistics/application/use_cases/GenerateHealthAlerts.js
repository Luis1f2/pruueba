class GenerateHealthAlerts {
  constructor(statisticsRepository, eventRepository) {
    if (!statisticsRepository || !eventRepository) {
      throw new Error('StatisticsRepository and EventRepository are required');
    }
    this.statisticsRepository = statisticsRepository;
    this.eventRepository = eventRepository;
  }

  async execute(idPaciente) {
    try {
      // Llamar al repositorio para obtener la adherencia del paciente
      const adherenceData = await this.statisticsRepository.getAdherence(idPaciente);
      
      // Si la adherencia es baja, generar una alerta
      if (adherenceData.dosis_tomadas / adherenceData.dosis_programadas < 0.5) {
        const alertMessage = 'Alerta: La adherencia al tratamiento es baja. Por favor, contacte con su médico.';
        
        // Crear una alerta médica en la base de datos
        await this.createHealthAlert(idPaciente, alertMessage);
        
        return {
          idPaciente,
          alerts: [{ tipo_alerta: 'Baja adherencia', mensaje: alertMessage }]
        };
      }

      // Verificar si existen eventos médicos (como incumplimientos o reacciones adversas)
      const healthAlerts = await this.eventRepository.getHealthAlerts(idPaciente);

      if (healthAlerts && healthAlerts.length > 0) {
        return {
          idPaciente,
          alerts: healthAlerts.map(alert => ({
            tipo_alerta: alert.tipo_evento,
            mensaje: alert.descripcion
          }))
        };
      }

      return {
        idPaciente,
        alerts: [] // No hay alertas médicas
      };

    } catch (error) {
      console.error('Error en GenerateHealthAlerts:', error.message);
      throw new Error('Unable to generate health alerts: ' + error.message);
    }
  }

  // Función para crear una alerta médica en la base de datos
  async createHealthAlert(idPaciente, mensaje) {
    const currentDate = new Date();
    const alertData = {
      id_paciente: idPaciente,
      fecha_hora: currentDate,
      tipo_evento: 'Adherencia baja', // Tipo de alerta: Adherencia baja
      descripcion: mensaje
    };

    // Guardar la alerta médica en la base de datos
    await this.eventRepository.create(alertData);
    console.log('Alerta médica creada:', mensaje);
  }
}

module.exports = GenerateHealthAlerts;

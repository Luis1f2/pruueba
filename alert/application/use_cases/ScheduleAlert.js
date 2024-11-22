const Alert = require('../../domain/entities/Alert');

class ScheduleAlert {
  constructor(alertRepository) {
    this.alertRepository = alertRepository;
  }

  async execute(alertData) {
    const { id_usuario, mensaje, fecha_alerta } = alertData;

    const alerts = [
      new Alert(null, id_usuario, mensaje, 'pendiente', fecha_alerta),
    ];

    for (const alert of alerts) {
      await this.alertRepository.save(alert);
    }

    return alerts;
  }
}

module.exports = ScheduleAlert;

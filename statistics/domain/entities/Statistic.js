class Statistic {
    constructor({ userId, adherence, probability, alert }) {
      this.userId = userId;
      this.adherence = adherence; // Adherencia al tratamiento (en porcentaje)
      this.probability = probability; // Probabilidad de incumplimiento
      this.alert = alert; // Alertas de salud generadas
    }
  }
  
  module.exports = Statistic;
  
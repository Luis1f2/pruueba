class Statistic {
    constructor({ idPaciente, adherence, probability, alert }) {
      // Validación de idPaciente
      if (typeof idPaciente !== 'number' || isNaN(idPaciente) || idPaciente <= 0) {
        throw new Error('Invalid idPaciente: must be a positive number');
      }
  
      // Validación de adherence
      if (adherence !== undefined && (typeof adherence !== 'number' || adherence < 0 || adherence > 1)) {
        throw new Error('Invalid adherence: must be a number between 0 and 1');
      }
  
      // Validación de probability
      if (probability !== undefined && (typeof probability !== 'number' || probability < 0 || probability > 1)) {
        throw new Error('Invalid probability: must be a number between 0 and 1');
      }
  
      // Validación de alert
      if (alert !== undefined && !Array.isArray(alert) && typeof alert !== 'object') {
        throw new Error('Invalid alert: must be an array or a JSON object');
      }
  
      // Asignación de valores
      this.idPaciente = idPaciente;
      this.adherence = adherence || 0; // Default: 0
      this.probability = probability || 0; // Default: 0
      this.alert = alert || []; // Default: empty array
    }
  
    // Método para convertir a JSON (útil para la base de datos o APIs)
    toJSON() {
      return {
        idPaciente: this.idPaciente,
        adherence: parseFloat(this.adherence.toFixed(2)), // Formatear a 2 decimales
        probability: parseFloat(this.probability.toFixed(2)), // Formatear a 2 decimales
        alert: this.alert,
      };
    }
  }
  
  module.exports = Statistic;
  
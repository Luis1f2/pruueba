const database = require('../../infrastructure/routes/database'); // Trae el pool de conexiones
const StatisticsRepository = require('../../domain/repositories/StatisticsRepository');
const GetStatisticsData = require('../../application/use_cases/GetStatisticsData');
const GenerateHealthAlerts = require('../../application/use_cases/GenerateHealthAlerts');  // Nuevo
const Statistic = require('../../domain/entities/Statistic'); // Importamos el modelo

class StatisticsController {

static async getStatistics(req, res) {
  const { idPaciente } = req.params;

  const statisticsRepository = new StatisticsRepository(database);
  const getStatisticsData = new GetStatisticsData(statisticsRepository);
  const generateHealthAlerts = new GenerateHealthAlerts(statisticsRepository, eventRepository);  // Crear instancia de GenerateHealthAlerts

  try {
    // Obtener las estadísticas de adherencia
    const statistics = await getStatisticsData.execute(idPaciente);

    // Calcular la probabilidad de que no tome el medicamento
    const adherence = statistics.adherence;  // Suponiendo que adherencia es un número entre 0 y 1
    const probability = 1 - adherence;  // Probabilidad de no adherirse (si adherencia es 0.75, probabilidad es 0.25)

    // Verificar si la adherencia es baja y generar alertas
    if (adherence < 0.5) {  // Si la adherencia es menor al 50%
      const healthAlerts = await generateHealthAlerts.execute(idPaciente);
      console.log('Alertas generadas:', healthAlerts.alerts);
    }

    // Responder con la adherencia y la probabilidad
    res.status(200).json({
      idPaciente,
      adherencia: (adherence * 100).toFixed(2) + '%',  // Convertir adherencia a porcentaje
      probabilidad: (probability * 100).toFixed(2) + '%',  // Convertir probabilidad a porcentaje
      alertas: statistics.alerts || []  // Incluye las alertas si las hay
    });

  } catch (err) {
    console.error('Error en StatisticsController (getStatistics):', err.message);
    res.status(500).json({ error: 'Unable to fetch statistics data: ' + err.message });
  }
}


static async saveStatistics(req, res) {
  const { idPaciente, adherence, probability, alert } = req.body;

  if (!idPaciente || adherence === undefined || probability === undefined || alert === undefined) {
    return res.status(400).json({ error: 'Datos incompletos: idPaciente, adherence, probability y alert son requeridos.' });
  }

  const statisticsRepository = new StatisticsRepository(database);
  const generateHealthAlerts = new GenerateHealthAlerts(statisticsRepository, eventRepository);  // Crear instancia de GenerateHealthAlerts

  try {
    const statistic = new Statistic({ idPaciente, adherence, probability, alert });
    await statisticsRepository.saveStatistic(statistic);

    // Verificar si la adherencia es baja y generar alertas
    if (adherence < 0.5) {
      const healthAlerts = await generateHealthAlerts.execute(idPaciente);
      console.log('Alertas generadas:', healthAlerts.alerts);
    }

    res.status(201).json({
      message: 'Estadísticas guardadas exitosamente',
      adherencia: (adherence * 100).toFixed(2) + '%',  // Mostrar adherencia como porcentaje
      probabilidad: ((1 - adherence) * 100).toFixed(2) + '%',  // Mostrar probabilidad como porcentaje
    });

  } catch (err) {
    console.error('Error en StatisticsController (saveStatistics):', err.message);
    res.status(500).json({ error: err.message });
  }
}

// Método para agregar un registro y calcular estadísticas en tiempo real
static async addRegister(req, res) {
  const { id_paciente, a_tiempo, fecha_toma } = req.body; // Cambiado de usuario_id a id_paciente

  if (!id_paciente || a_tiempo === undefined || !fecha_toma) {
    return res.status(400).json({ error: 'Datos incompletos: id_paciente, a_tiempo y fecha_toma son requeridos.' });
  }

  const statisticsRepository = new StatisticsRepository(database);
  const generateHealthAlerts = new GenerateHealthAlerts(statisticsRepository, eventRepository);  // Crear instancia de GenerateHealthAlerts

  try {
    // 1. Registrar el medicamento tomado
    await statisticsRepository.addRegister({ id_paciente, a_tiempo, fecha_toma });

    // 2. Obtener la adherencia actualizada
    const adherenceData = await statisticsRepository.getAdherence(id_paciente);
    const adherence = adherenceData.dosis_tomadas / adherenceData.dosis_programadas;
    const probability = 1 - adherence;

    // 3. Actualizar la base de datos con los nuevos valores de adherencia y probabilidad (si es necesario)
    await statisticsRepository.updateAdherenceAndProbability(id_paciente, adherence, probability);

    // 4. Si la adherencia es baja, generar alertas
    if (adherence < 0.5) {
      const healthAlerts = await generateHealthAlerts.execute(id_paciente);
      console.log('Alertas generadas:', healthAlerts.alerts);

      // Emitir alertas en tiempo real a través de sockets
      io.to(`paciente_${id_paciente}`).emit('alertas', healthAlerts.alerts);
    }

    // 5. Enviar la respuesta con las estadísticas y probabilidad
    res.status(201).json({
      message: 'Registro agregado exitosamente',
      adherencia: (adherence * 100).toFixed(2) + '%',  // Mostrar adherencia como porcentaje
      probabilidad: (probability * 100).toFixed(2) + '%',  // Mostrar probabilidad como porcentaje
    });

  } catch (err) {
    console.error('Error en StatisticsController (addRegister):', err.message);
    res.status(500).json({ error: err.message });
  }
}


}

module.exports = StatisticsController;

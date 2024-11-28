class Statistic {
  
  constructor({ userId, adherence, probability, alert }) {
      if (!userId || typeof userId !== 'number') {
          throw new Error('Invalid userId');
      }
      this.userId = userId;
      this.adherence = adherence || 0;
      this.probability = probability || 0;
      this.alert = alert || [];
  }
  
  }
  
  module.exports = Statistic;
  
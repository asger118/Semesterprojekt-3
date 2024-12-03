class PlantLog {
  constructor(
    id = 0,
    humidity = 0,
    waterlevel = 0,
    fertilization = 0,
    conductivity = 0
  ) {
    this.id = id;
    this.humidity = humidity;
    this.waterlevel = waterlevel;
    this.fertilization = fertilization;
    this.conductivity = conductivity;
  }
}

module.exports = { PlantLog };
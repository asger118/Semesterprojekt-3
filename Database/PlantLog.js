class PlantLog{
    constructor(id = 0, humidity = 0, temp = 0, fertilization = 0) {
        this.id = id;
        this.humidity = humidity;
        this.temp = temp;
        this.fertilization = fertilization;
    }
}

module.exports = { PlantLog };
//Object that contains the value saved in the databased, and is used to send data between server and database
class PlantSetting{
    constructor(name = '', humidityLow = 0, humidityHigh = 0, fertilizer = 0, id = 0) {
        this.name = name;
        this.humidityLow = humidityLow;
        this.humidityHigh = humidityHigh;
        this.fertilizer = fertilizer;
        this.id = id;
    }
}

module.exports = {PlantSetting};



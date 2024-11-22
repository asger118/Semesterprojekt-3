class PlantSetting{
    constructor(name = '', humidityLow = 0, humidityHigh = 0, fertilizer = 0) {
        this.name = name;
        this.humidityLow = humidityLow;
        this.humidityHigh = humidityHigh;
        this.fertilizer = fertilizer;
    }
}

module.exports = {PlantSetting};



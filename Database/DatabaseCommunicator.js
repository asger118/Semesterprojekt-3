const {PlantSetting} = require('./PlantSetting');
const {PlantLog} = require('./PlantLog');
const Database = require('./Database');

class DatabaseCommunicator {
    // Constructor for PlantSetting
    constructor(Database){
        this.db = Database;
    }

    getAllSettings() {
        //sql command that runs in sqlite
        const sql = 'SELECT name, humidityLow, humidityHigh, fertilizer FROM PlantSettings';
        
        //Runs sql on the whole database, return an array of rows
        // [] er parameter, gør det muligt at sende noget med hvis man leder efter noget bestemt (Skal skrives om før det virker)
        this.db.all(sql, [], (err, rows) => {
            if (err) {
                throw err;
            }
            //Goes through all rows in the database, and maps them to a PlantSetting Object
            //plant is an array of PlantSettings
            const plants = rows.map(row => new PlantSetting(row.name, row.humidityLow, row.humidityHigh, row.fertilizer));
            console.log('All plant settings:', plants); 
            return plants; 
            //callback(plants);   //call back (returns) the array
        });
    }

    getSettingById(id){
        const sql = 'SELECT * FROM PlantSettings WHERE id = ?';

        this.db.get(sql,[id],(err,row)=>{
            if(err){
                throw err;
            }
            const Plant = row;
            console.log('Found setting with name: ',id, ' ', Plant); 
            return Plant;
        })
    }

    addSetting(newSetting) {
        //sql command that runs in sqlite
        const sql = 'INSERT INTO PlantSettings (name, humidityLow, humidityHigh, fertilizer) VALUES (?, ?, ?, ?)';
        //Sets the parameters
        const params = [newSetting.name, newSetting.humidityLow, newSetting.humidityHigh, newSetting.fertilizer];
    
        //Runs the sql function with the params
        this.db.run(sql, params, function (err) {
            if (err) {
                throw err; 
            }
            
            console.log('Plant saved:', newSetting.name);
        });
    }

    updateSettingById(id, updatedSetting) { //Lortet virker ikke helt som jeg vil, så kommentar må blive en anden dag ;D
        const sql = 'UPDATE PlantSettings SET name = ?, humidityLow = ?, humidityHigh = ?, fertilizer = ? WHERE id = ?' ;
        const params = [updatedSetting.name, updatedSetting.humidityLow, updatedSetting.humidityHigh, updatedSetting.fertilizer, oldName];
        
        this.db.run(sql, params, function (err) {
            if (err) {
                throw err;
            }
            console.log("Updated id: ", id, " with new settings");
        });
    }

    deleteSetting(id) {
        //sql command that runs with id as parameter
        const sql = 'DELETE FROM PlantSettings WHERE id = ?';
        
        //run it with the id
        this.db.run(sql, [id], function (err) {
            if (err) {
                console.error('Error deleting plant:', err.message);
                if (callback) callback(err); // Pass the error to the callback if provided
                return;
            }
            console.log(`Setting with name ${id} has been deleted.`);
        });
    }

    saveLog(PlantLog){
        const sql = 'INSERT INTO PlantLog (id, humidity, temp, fertilization) VALUES (?,?, ?, ?)';

        const params = [PlantLog.id, PlantLog.humidity, PlantLog.temp, PlantLog.fertilization];

         //Runs the sql function with the params
         this.db.run(sql, params, function (err) {
            if (err) {
                throw err; 
            }
            
            console.log('PlantLog saved, ID: ', PlantLog.id);
        });
    }

    getLogByName(name){
        const sql = 'SELECT * FROM PlantLog WHERE name = ?';

        this.db.all(sql,[name],(err,row)=>{
            if(err){
                throw err;
            }
            const Plant = row;
            console.log('Found Log with name: ',name, ' ', Plant); 
            return Plant;
        })
    }
}

module.exports = {DatabaseCommunicator, PlantSetting, PlantLog, Database};



const sqlite3 = require('sqlite3').verbose();


function connectAndSetupDatabase(dbFile, callback) {

    const db = new sqlite3.Database(dbFile, (err) => {      //
        if (err) {
            console.error('Error opening database', err.message);
            return callback(err);  
        }

        console.log(`Connected to the SQLite database: ${dbFile}`);

        //Create database, IF NOT EXISTS insures that it doesn't duplicate
        const createSettingTableSQL = `                       
            CREATE TABLE IF NOT EXISTS PlantSettings (
                name TEXT UNIQUE NOT NULL,
                humidityLow INTEGER NOT NULL,
                humidityHigh INTEGER NOT NULL,
                fertilizer REAL NOT NULL
            )`;
        const createLogTableSQL = `
           CREATE TABLE IF NOT EXISTS PlantLog (
                id INTEGER,
                humidity REAL NOT NULL,
                temp REAL NOT NULL,
                fertilization REAL NOT NULL,
                time TEXT NOT NULL DEFAULT (datetime('now','localtime'))
            )
            `;

        let completedTables = 0;

        function checkAndCallback() {
            completedTables++;
            if (completedTables === 2) {
                console.log('Both tables are created or already exist.');
                callback(null, db);
            }
        }

        db.run(createLogTableSQL, (err) => {
            if (err) {
                console.error('Error creating PlantLog table', err.message);
                return callback(err);
            }
            console.log('PlantLog Table created or already exists.');
            checkAndCallback();
        });

        db.run(createSettingTableSQL, (err) => {
            if (err) {
                console.error('Error creating PlantSetting table', err.message);
                return callback(err);
            }
            console.log('PlantSetting Table created or already exists.');
            checkAndCallback();
        });
    });
}

function closeDatabase(db) {
    db.close((err) => {    //Closes the database
        if (err) {
            console.error('Error closing database', err.message);
        } else {
            console.log('Database connection closed.');
        }
    });
}

module.exports = {      //Exports the functions ie makes them "public"
    connectAndSetupDatabase,
    closeDatabase,
};
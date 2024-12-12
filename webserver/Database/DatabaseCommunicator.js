const { PlantSetting } = require("./PlantSetting");
const { PlantLog } = require("./PlantLog");
const sqlite3 = require("sqlite3").verbose();

class DatabaseCommunicator {

  /*
  Function: constructor()
  Description: Creates a new database called "Database.db"
  */
  constructor() {
    //Create new database
    this.db = new sqlite3.Database("Database.db", (err) => {
      if (err) {
        //Checks for error
        console.error("Error opening database", err.message);
        return callback(err);
      }
      console.log(`Connected to the Database`);
    });
  }

  /*
  Function: destroy()
  Description: Ensuring that when DatabaseCommunicator goes out of scope database is closed
  */
  destroy() {
    //Closes the database
    this.db.close((err) => {
      if (err) {
        //Checks for errors
        console.error("Error closing database", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  }


 /*
  Function: runQuery(method, sql, params)
  Description: Runs SQL Queries, and have them return a promise (Making it synchronous)
  Parameters: method, specifies how the SQL squery should be run. SQL, the actual SQL query.
  Params, parameters need for the SQL query
  Return value: None 
  */
  // Utility function to wrap db.all in a Promise
  async runQuery(method, sql, params = []) {
    // Creating the promise object
    return new Promise((resolve, reject) => {
      //switch cases that checks with method is used
      switch (method) {
        //Runs SQL query on all rows in table
        case "all":
          this.db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
          });
          break;
        case "get":
        //Runs SQL query until it finds a match, or don't
          this.db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
          break;
        case "run":
        //Simply runs the SQL query
          this.db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ changes: this.changes, lastID: this.lastID });
          });
          break;
        default:
          //Checks if the method is allow else set error
          reject(new Error(`Unsupported method: ${method}`));
      }
    });
  }

  
  /*
  Function: SetupDatabase()
  Description: Creates the tabels containing the specified data
  Parameters: None
  Return value: None 
  */
  async SetupDatabase() {
    //Create table PlantSetting, IF NOT EXISTS insures that it doesn't duplicate
    const createSettingTableSQL = `                       
                      CREATE TABLE IF NOT EXISTS PlantSettings (
                          name TEXT UNIQUE NOT NULL, 
                          humidityLow INTEGER NOT NULL,
                          humidityHigh INTEGER NOT NULL,
                          fertilizer REAL NOT NULL
                      )`;
    //Create table PlantLog, IF NOT EXISTS insures that it doesn't duplicate
    const createLogTableSQL = `
                     CREATE TABLE IF NOT EXISTS PlantLog (
                          id INTEGER,
                          humidity REAL NOT NULL,
                          waterlevel REAL NOT NULL,
                          fertilization REAL NOT NULL,
                          conductivity REAL NOT NULL,
                          time TEXT NOT NULL DEFAULT (datetime('now','localtime'))
                      )
                      `;

    try {
      //Try to run SQL query for PlantSetting
      await this.runQuery("run", createSettingTableSQL);  
    } catch (err) {
      //Throws error if SQL query failed
      console.error("Error creating PlantSettings table", err.message);
    }

    try {
      //Try to run SQL query for PlantLog
      await this.runQuery("run", createLogTableSQL);
    } catch (err) {
      //Throws error if SQL query failed
      console.error("Error creating PlantLog table", err.message);
    }
  }

  
  /*
  Function: getAllSettings()
  Description: Gets a list of all the settings from the database
  Parameters: None
  Return value: Array of PlantSettings
  */
  async getAllSettings() {
    //SQL query for finding all elements from PlantSettings
    const sql =
      "SELECT rowid, name, humidityLow, humidityHigh, fertilizer FROM PlantSettings";
    try {
      //Try to run SQL query with key word "all" meaning the SQL query checks all rows
      const rows = await this.runQuery("all", sql);
      //Translate SQL rows to PlantSetting objects, using map
      const plants = rows.map(
        (row) =>
          //Create new PlantSetting and setting its values
          new PlantSetting(
            row.name,    
            row.humidityLow,
            row.humidityHigh,
            row.fertilizer,
            row.rowid
          )
      );
      //After mapping all rows return the array of PlantSettings
      return plants;
    } catch (err) {
      //If SQL query failed, throw error
      console.error("Error fetching plant settings:", err);
      throw err;
    }
  }


  /*
  Function: getSettingsById(id)
  Description: gets a specific PlantSetting using its id to search
  Parameters: id, every PlantSetting has a unique id
  Return value: PlantSetting obkjekt
  */
  async getSettingById(id) {
    //SQL for finding PlantSetting with id
    const sql = "SELECT * FROM PlantSettings WHERE rowid = ?";
    try {
      //Runs the SQL Query using keyword "get", meaning it only gets one
      const row = await this.runQuery("get", sql, [id]);
      //Maps the row to a PlantSetting object
      const setting =    
        new PlantSetting(
            row.name,    
            row.humidityLow,
            row.humidityHigh,
            row.fertilizer,
            row.rowid
          );
      console.log("Found setting with name: ", id, " ", Plant);
      //Returns the PlantSetting object
      return setting;
    } catch (err) {
      //If SQL query fails throw error
      console.error("Error fetching setting by ID:", err);
      throw err;
    }
  }


  /*
  Function: addSetting(newSetting)
  Description: adds a new setting to the database
  Parameters: newSetting, a PlantSetting object the contains the new values
  Return value: None
  */
  async addSetting(newSetting) {
    //SQL query to insert a new PlantSetting
    const sql =
      "INSERT INTO PlantSettings (name, humidityLow, humidityHigh, fertilizer) VALUES (?, ?, ?, ?)";

    //Sets the parameters
    const params = [
      newSetting.name,
      newSetting.humidityLow,
      newSetting.humidityHigh,
      newSetting.fertilizer,
    ];

    try {
      //Runs the SQL query, with params
      this.runQuery("run", sql, params);
      console.log("Plant saved:", newSetting.name);
    } catch (err) {
      //If SQL query failed throw error
      console.error("Error when adding new setting", err);
      throw err;
    }
  }


  /*
  Function: updateSettingById(id,updatedSetting)
  Description: Updates values of a setting, found by a given id 
  Parameters: id, the PlantSetting that needs an update. updatedSetting, contains the new values
  Return value: None
  */
  async updateSettingById(id, updatedSetting) {
    //SQL query to updated a PlantSetting found by id
    const sql =
      "UPDATE PlantSettings SET name = ?, humidityLow = ?, humidityHigh = ?, fertilizer = ? WHERE rowid = ?";
    //Sets the new parameters
    const params = [
      updatedSetting.name,
      updatedSetting.humidityLow,
      updatedSetting.humidityHigh,
      updatedSetting.fertilizer,
      id,
    ];

    try {
      //Runs SQL query with params
      await this.runQuery("run", sql, params);
    } catch (err) {
      //If SQL query failed throw error
      console.error("Error when updating setting", err);
      throw err;
    }
  }


  /*
  Function: deleteSetting(id)
  Description: deletes a PlantSetting found using id
  Parameters: id, the PlantSetting to be deleted
  Return value: None
  */
  async deleteSetting(id) {
    //SQL Query that deletes PlantSetting using id
    const sql = "DELETE FROM PlantSettings WHERE rowid = ?";
    try {
      //Runs SQL Query with id as param
      await this.runQuery("run", sql, [id]);
    } catch (err) {
      //If SQL Query failed throw error
      console.error("Error when adding new setting", err);
      throw err;
    }
  }


  /*
  Function: saveLog(PlantLog)
  Description: Adds a new PlantLog to the database
  Parameters: PlantLog: PlantLog objekt that contains values which needs to be added
  Return value: None
  */
  async saveLog(PlantLog) {
    //SQL query to insert new PlantLog in database
    const sql =
      "INSERT INTO PlantLog (id, humidity, waterlevel, fertilization,conductivity) VALUES (?,?,?,?,?)";

    //Sets param of new PlantLog
    const params = [
      PlantLog.id,
      PlantLog.humidity,
      PlantLog.waterlevel,
      PlantLog.fertilization,
      PlantLog.conductivity,
    ];
    try {
      //Runs SQL query with new params
      await this.runQuery("run", sql, params);
    } catch (err) {
      //if SQL query failed throw error
      console.error("Error when adding new log", err);
      throw err;
    }
  }


  /*
  Function: getLogByid(id)
  Description: Gets all Logs connected to the same Id ie. same regulation
  Parameters: id, the id of regulation
  Return value: Array of PLantLogs
  */
  async getLogById(id) {
    //SQL query the finds all PlantLogs connected to a specifik id
    const sql = "SELECT * FROM PlantLog WHERE id = ?";

    try {
      //Runs SQL query with id as parameter
      const rows = await this.runQuery("all", sql, [id]);
      //Translate logs to PlantLog objects using map
      const log = rows.map(
        (row) =>
          //Creating new PlantLog and setting its values
          new PlantLog(
            row.id,
            row.humidity,
            row.waterlevel,
            row.fertilization,
            row.conductivity,
            row.time
          )
      );
      //Returns array of PlantLog objects
      return log;
    } catch (err) {
      //If SQL query failed throw error
      console.error("Error when getting log by id", err);
      throw err;
    }
  }
}

module.exports = { DatabaseCommunicator, PlantSetting, PlantLog };

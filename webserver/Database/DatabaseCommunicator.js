const { PlantSetting } = require("./PlantSetting");
const { PlantLog } = require("./PlantLog");
const sqlite3 = require("sqlite3").verbose();

class DatabaseCommunicator {
  constructor() {
    this.db = new sqlite3.Database("Database.db", (err) => {
      if (err) {
        console.error("Error opening database", err.message);
        return callback(err);
      }
      console.log(`Connected to the Database`);
    });
  }

  destroy() {
    this.db.close((err) => {
      //Closes the database
      if (err) {
        console.error("Error closing database", err.message);
      } else {
        console.log("Database connection closed.");
      }
    });
  }
  // Utility function to wrap db.all in a Promise
  async runQuery(method, sql, params = []) {
    // Creating the promise object
    return new Promise((resolve, reject) => {
      switch (method) {
        case "all":
          this.db.all(sql, params, (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
          });
          break;
        case "get":
          this.db.get(sql, params, (err, row) => {
            if (err) return reject(err);
            resolve(row);
          });
          break;
        case "run":
          this.db.run(sql, params, function (err) {
            if (err) return reject(err);
            resolve({ changes: this.changes, lastID: this.lastID });
          });
          break;
        default:
          reject(new Error(`Unsupported method: ${method}`));
      }
    });
  }

  async SetupDatabase() {
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
                          waterlevel REAL NOT NULL,
                          fertilization REAL NOT NULL,
                          conductivity REAL NOT NULL,
                          time TEXT NOT NULL DEFAULT (datetime('now','localtime'))
                      )
                      `;

    try {
      await this.runQuery("run", createSettingTableSQL);
    } catch (err) {
      console.error("Error creating PlantSettings table", err.message);
    }

    try {
      await this.runQuery("run", createLogTableSQL);
    } catch (err) {
      console.error("Error creating PlantLog table", err.message);
    }
  }

  async getAllSettings() {
    const sql =
      "SELECT rowid, name, humidityLow, humidityHigh, fertilizer FROM PlantSettings";
    try {
      const rows = await this.runQuery("all", sql);
      const plants = rows.map(
        (row) =>
          new PlantSetting(
            row.name,
            row.humidityLow,
            row.humidityHigh,
            row.fertilizer,
            row.rowid
          )
      );
      return plants;
    } catch (err) {
      console.error("Error fetching plant settings:", err);
      throw err;
    }
  }

  async getSettingById(id) {
    const sql = "SELECT * FROM PlantSettings WHERE rowid = ?";
    try {
      const row = await this.runQuery("get", sql, [id]);
      const setting = row;
      return setting;
      console.log("Found setting with name: ", id, " ", Plant);
    } catch (err) {
      console.error("Error fetching setting by ID:", err);
      throw err;
    }
  }

  async addSetting(newSetting) {
    //sql command that runs in sqlite
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
      this.runQuery("run", sql, params);
      console.log("Plant saved:", newSetting.name);
    } catch (err) {
      console.error("Error when adding new setting", err);
      throw err;
    }
  }

  async updateSettingById(id, updatedSetting) {
    const sql =
      "UPDATE PlantSettings SET name = ?, humidityLow = ?, humidityHigh = ?, fertilizer = ? WHERE rowid = ?";
    const params = [
      updatedSetting.name,
      updatedSetting.humidityLow,
      updatedSetting.humidityHigh,
      updatedSetting.fertilizer,
      id,
    ];

    try {
      await this.runQuery("run", sql, params);
    } catch (err) {
      console.error("Error when updating setting", err);
      throw err;
    }
  }

  async deleteSetting(id) {
    //sql command that runs with id as parameter
    const sql = "DELETE FROM PlantSettings WHERE rowid = ?";
    try {
      await this.runQuery("run", sql, [id]);
    } catch (err) {
      console.error("Error when adding new setting", err);
      throw err;
    }
  }

  async saveLog(PlantLog) {
    const sql =
      "INSERT INTO PlantLog (id, humidity, waterlevel, fertilization,conductivity) VALUES (?,?,?,?,?)";

    const params = [
      PlantLog.id,
      PlantLog.humidity,
      PlantLog.waterlevel,
      PlantLog.fertilization,
      PlantLog.conductivity,
    ];
    try {
      await this.runQuery("run", sql, params);
    } catch (err) {
      console.error("Error when adding new log", err);
      throw err;
    }
  }

  async getLogById(id) {
    const sql = "SELECT * FROM PlantLog WHERE id = ?";

    try {
      const rows = await this.runQuery("all", sql, [id]);
      const log = rows.map(
        (row) =>
          new PlantLog(
            row.id,
            row.humidity,
            row.waterlevel,
            row.fertilization,
            row.conductivity
          )
      );
      return log;
    } catch (err) {
      console.error("Error when getting log by id", err);
      throw err;
    }
  }
}

module.exports = { DatabaseCommunicator, PlantSetting, PlantLog };

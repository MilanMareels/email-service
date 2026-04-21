const fs = require("fs");
const path = require("path");
const cron = require("node-cron");
const Client = require("../models/Client");
const CorsOrigin = require("../models/CorsOrigin");
const Admin = require("../models/Admin");

const runBackup = async () => {
  try {
    console.log("Starting weekly backup...");

    const clients = await Client.find({});
    const cors = await CorsOrigin.find({});
    const admins = await Admin.find({});

    const backupData = {
      timestamp: new Date().toISOString(),
      clients,
      cors,
      admins,
    };

    const backupDir = path.join(__dirname, "../backups");
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }

    const fileName = `backup-${new Date().toISOString().split("T")[0]}.json`;
    const filePath = path.join(backupDir, fileName);

    fs.writeFileSync(filePath, JSON.stringify(backupData, null, 2));

    console.log(`Backup succesvol opgeslagen: ${filePath}`);
  } catch (error) {
    console.error("Backup mislukt:", error);
  }
};

cron.schedule("0 0 * * 0", () => {
  runBackup();
});

module.exports = { runBackup };

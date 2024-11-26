const { app, BrowserWindow, ipcMain, dialog } = require('electron/main')
const path = require('node:path')
const fs = require("fs");
const { renameBackupFile } = require('./utils')

const plist = require("plist");
const { exec } = require("child_process");

async function handleFileOpen () {
  const { canceled, filePaths } = await dialog.showOpenDialog()
  if (!canceled) {
    return filePaths[0]
  }
}

function createWindow () {
  const mainWindow = new BrowserWindow({
    webPreferences: {
      preload: path.join(__dirname, 'preload.js')
    }
  })
  mainWindow.loadFile('index.html')
}

async function getDeviceInfo() {
  return new Promise((resolve, reject) => {
    const exePath = path.join(__dirname, "./ios-bin/bin/ideviceinfo.exe");

    console.log("Exe Path:", exec);
    exec(exePath, (error, stdout, stderr) => {
      if (error) {
        reject(`Error executing exe: ${error}`);
        return;
      }
      if (stderr) {
        reject(`stderr: ${stderr}`);
        return;
      }
      console.log('stdout=====',stdout);
      
      resolve(stdout); // 将 exe 输出返回给前端
    });
  });
}

app.whenReady().then(() => {
  ipcMain.handle('dialog:openFile', handleFileOpen)
  ipcMain.handle("get:deviceInfo", getDeviceInfo);
  createWindow()
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})


// backupTwo2
ipcMain.on("send-unique-device-id", (event, uniqueDeviceID, lang) => {
  console.log("Received UniqueDeviceID:", uniqueDeviceID, "Language:", lang);

  // // 模拟恢复过程并更新进度
  // let progress = 0;
  
  // // 发送开始恢复的消息
  // event.reply('restore-progress', { type: 'info', message: `设备 ID: ${uniqueDeviceID} 恢复操作开始...` });

  // // 模拟恢复过程的输出
  // const interval = setInterval(() => {
  //   progress += 20;
  //   if (progress <= 100) {
  //     event.reply('restore-progress', { type: 'stdout', message: `恢复进度: ${progress}%` });
  //   } else {
  //     clearInterval(interval);
  //     // 模拟恢复完成
  //     event.reply('restore-progress', { type: 'complete', message: '恢复完成' });
  //   }
  // }, 1000);  
  每1秒更新一次进度
  const backup = path.join(__dirname, "./ios-bin/backup/backupTwo");
  // TODO: 判断中英文 选择恢复文件
  let exePath;
  if(lang == 'zh'){
    exePath = path.join(__dirname, "./ios-bin/bin/idevicebackup2.exe");
  }else{
    exePath = path.join(__dirname, "./ios-bin/bin/idevicebackup2_en.exe");
  }

  // 修改文件 uniqueDeviceID
  renameBackupFile(backup, uniqueDeviceID);

  // 执行恢复指令
  const args = [
    "restore", // 命令
    "--system", // 参数1
    "--settings", // 参数2
    backup, // 备份路径
    "-d", // 参数3
  ];

  const cmd = `"${exePath}" ${args.join(" ")}`;

  const process = exec(cmd);

  // 更新前端进度
  event.reply("restore-progress", { type: "info", message: "恢复操作开始..." });

  process.stdout.on("data", (data) => {
    console.log("stdout:", data);
    event.reply("restore-progress", { type: "stdout", message: data });
  });

  process.stderr.on("data", (data) => {
    console.error("stderr:", data);
    event.reply("restore-progress", { type: "stderr", message: data });
  });

  process.on("close", (code) => {
    if (code === 0) {
      console.log("Restore completed successfully.");
      event.reply("restore-progress", { type: "complete", message: "恢复完成" });
    } else {
      console.error(`Process exited with code ${code}`);
      event.reply("restore-progress", { type: "error", message: `恢复失败，退出码：${code}` });
    }

      renameBackupFile(backup, generateRandomNumber());
  });
  
  process.on("error", (error) => {
    console.error("Error during restore process:", error);
    event.reply("restore-progress", { type: "error", message: `执行过程中出错：${error.message}` });
 
      renameBackupFile(backup, generateRandomNumber());
  });
});
// 生成15位随机数字
function generateRandomNumber() {
  return crypto.randomInt(100000000000000, 999999999999999); // 生成一个15位的随机数字
}
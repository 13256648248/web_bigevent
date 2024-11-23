let folderName = "";
let deviceInfo = {};
let UniqueDeviceID = "";
/** 定时去取设备信息 如果取到就关闭，没取到继续 */
const fetchDeviceInfoInterval = setInterval(fetchDeviceInfo, 1000);

async function fetchDeviceInfo() { 
  try {
    // 获取纯字符串数据
    const fetchedInfoString = await window.electronAPI.getDeviceInfo();
    // console.log(fetchedInfoString); // 查看原始字符串

    // 提取所有字段的信息
    deviceInfo = extractAllData(fetchedInfoString);


    clearInterval(fetchDeviceInfoInterval);

    for (const [key, value] of Object.entries(deviceInfo)) {
      const elementId = key.toLowerCase(); // 将驼峰命名转换为小写连字符命名
      const element = document.getElementById(elementId);
      if (element) {
        element.textContent = value;
      }
    }


  } catch (error) {
    console.error("Failed to fetch device info:", error);
  }
}


/**
 * 提取所有设备信息并返回一个对象
 * @param {string} str - 设备信息字符串
 * @returns {object} - 提取出的设备信息对象
 */
function extractAllData(str) {
  const regex = /(\w+):\s*([^\n]+)/g;
  let match;
  const deviceInfo = {};

  // 使用正则表达式提取所有键值对
  while ((match = regex.exec(str)) !== null) {
    const key = match[1].trim(); // 字段名
    const value = match[2].trim(); // 字段值
    deviceInfo[key] = value;
  }

  return deviceInfo;
}


async function deviceBackUp2() {
  const UniqueDeviceID = deviceInfo.UniqueDeviceID
  console.log('UniqueDeviceID', UniqueDeviceID);
  
  try {
    if (!UniqueDeviceID) return window.alert('请先连接设备')
    // 在此可以模拟将 UniqueDeviceID 发送到主线程或其他服务
    window.electronAPI.sendUniqueDeviceID(UniqueDeviceID)
    console.log(`设备ID: ${UniqueDeviceID} 备份开始`);
  } catch (error) {
    console.error("备份设备信息时出错:", error); 
  }
}


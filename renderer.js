let deviceInfo = {};
const BASIC_COST = 5;
const fetchDeviceInfoInterval = setInterval(fetchDeviceInfo, 1000);

/**
 * 定时尝试获取设备信息，成功后更新 UI，失败则继续尝试
 */
async function fetchDeviceInfo() {
  try {
    const fetchedInfoString = await window.electronAPI.getDeviceInfo();
    deviceInfo = extractDeviceData(fetchedInfoString);
    console.log("getDeviceInfo", deviceInfo);

    updateDeviceInfoUI(deviceInfo);
    toggleBox("card-box");
  } catch (error) {
    // window.alert("获取设备信息失败:", error);
    toggleBox("normal-box");
  }
}

function updateDeviceInfoUI(deviceInfo) {
  Object.entries(deviceInfo).forEach(([key, value]) => {
    const element = document.getElementById(key.toLowerCase());
    if (element) {
      element.textContent = value;
    }
  });
}

function extractDeviceData(rawData) {
  const regex = /(\w+):\s*([^\n]+)/g;
  const result = {};
  let match;

  while ((match = regex.exec(rawData)) !== null) {
    result[match[1].trim()] = match[2].trim(); // 提取键值对
  }

  return result;
}

/**
 * 备份设备信息：先检查登录状态或设备注册状态
 * @param {string} lang - 语言参数
 */
async function deviceBackup(lang) {
  const uniqueDeviceID = deviceInfo.UniqueDeviceID;

  if (!uniqueDeviceID) {
    return window.alert("请先连接设备");
  }
  window.alert('请断网, id退出 关闭屏幕锁')
  try {
    await handleAuthentication(lang);
  } catch (error) {
    console.error("备份设备信息时出错:", error);
    showErrorMessage("备份失败，请稍后再试。");
  }
}

/**
 * 检查登录状态或设备注册状态
 * @param {string} lang - 语言参数
 */
async function handleAuthentication(lang) {
  const token = localStorage.getItem("token");

  if (token) {
    await processLoggedInUser(token, lang);
  } else {
    await checkDeviceRegistrationStatus(lang);
  }
}

/**
 * 已登录用户处理逻辑
 * @param {string} token - 用户 token
 */
async function processLoggedInUser(token, lang) {
  try {
    const userInfo = await fetchUserInfo(token);

    coinCount.textContent = `$ ${userInfo.data.coin}`;
    coinCount.style.display = "block";
    if (userInfo.data.coin >= BASIC_COST) {
      await  deviceRecord(token, lang);
    } else {
      showErrorMessage("金币不足，无法升级！");
    }
  } catch (error) {
    console.error("处理登录用户时出错:", error);
    showErrorMessage("获取用户信息失败，请稍后再试。");
  }
}

/**
 * 未登录状态检查设备注册
 * @param {string} lang - 语言参数
 */
async function checkDeviceRegistrationStatus(lang) {
  try {
    const registration = await checkDeviceRegistration(
      deviceInfo.SerialnNmber
    );

    if (registration.data.code == 0) {
      window.electronAPI.sendUniqueDeviceID(deviceInfo.UniqueDeviceID, lang);
    } else {
      showErrorMessage("设备未注册，请先完成注册。", registration);
    }
  } catch (error) {
    console.error("设备注册检查失败:", error);
    showErrorMessage("设备注册检查失败，请稍后再试。");
  }
}
/**
 * 检查设备是否已注册
 * @param {string} deviceId - 设备 ID
 */
async function checkDeviceRegistration(deviceId) {
  const response = await axios.get(
    "https://restore.msgqu.com/api/v1/device/verify",
    {
      params: {
        device_serial_number: deviceId,
      },
    }
  );

  return response;
}
/**
 * 获取用户信息
 * @param {string} token - 用户 token
 */
async function fetchUserInfo(token) {
  const response = await axios.get(
    "https://restore.msgqu.com/api/v1/user/info",
    {
      headers: { Authorization: `Bearer ${token}` },
    }
  );

  if (response.status !== 200 || response.data.code !== 0) {
    throw new Error("获取用户信息失败");
  }

  return response.data;
}

/**
 * 调用升级接口
 * @param {string|null} token - 用户 token，可选
 * @param {string} lang - 语言参数
 */


/**
 * 切换显示的盒子
 * @param {string} boxId - 要显示的盒子 ID
 */
function toggleBox(boxId) {
  const boxes = ["card-box", "normal-box"];
  boxes.forEach((id) => {
    document.getElementById(id).style.display = id === boxId ? "block" : "none";
  });
}

/**
 * 显示错误消息
 * @param {string} message - 错误信息
 */
function showErrorMessage(message) {
  alert(message);
}

// 默认显示普通盒子
toggleBox("normal-box");

/**
 * 注册设备
 * @param {string} token - 用户 token
 */
async function deviceRecord(token, lang) {

    if (!token) {
      window.alert("Token is required");
    }
    if (!deviceInfo || !deviceInfo.UniqueDeviceID) {
      window.alert("Device information is incomplete");
    }

    const uniqueDeviceID = deviceInfo.UniqueDeviceID;

    const response = await axios.post(
      "https://restore.msgqu.com/api/v1/device/record",
      {
        device_serial_number: uniqueDeviceID,
        device_name: deviceInfo.DeviceName,
        device_activation: deviceInfo.ActivationState,
        device_type: "BACK_UP",
        device_model_number: deviceInfo.ModelNumber,
        device_udid: uniqueDeviceID,
      },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    console.log("Response from server:", response);
    
    if (response.data.code == 0) {
      console.log("Device registered successfully:", response);
      window.electronAPI.sendUniqueDeviceID(uniqueDeviceID, lang);
    } else {
      window.alert("Error response from server:", response.msg);
    }

}

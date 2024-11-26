let deviceInfo = {};
const BASIC_COST = 5;
const fetchDeviceInfoInterval = setInterval(fetchDeviceInfo, 1000);

/**
 * 定时尝试获取设备信息，成功后更新 UI，失败则继续尝试
 */
async function fetchDeviceInfo() {
  try {
    const fetchedInfoString = await window.electronAPI.getDeviceInfo(); // 获取设备信息字符串
    deviceInfo = extractDeviceData(fetchedInfoString); // 解析设备信息
    console.log('getDeviceInfo', deviceInfo);
    
    clearInterval(fetchDeviceInfoInterval); // 停止定时器
    updateDeviceInfoUI(deviceInfo); // 更新设备信息到 UI
    toggleBox('card-box'); // 显示卡片盒子
  } catch (error) {
    // console.error('获取设备信息失败:', error);
    toggleBox('normal-box'); // 切换到默认盒子视图
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
    return window.alert('请先连接设备');
  }
  try {
    await handleAuthentication(lang);
  } catch (error) {
    console.error('备份设备信息时出错:', error);
    showErrorMessage('备份失败，请稍后再试。');
  }
}

/**
 * 检查登录状态或设备注册状态
 * @param {string} lang - 语言参数
 */
async function handleAuthentication(lang) {
  const token = localStorage.getItem('token');

  if (!token) {
    await processLoggedInUser(token);
  } else {
    await checkDeviceRegistrationStatus(lang);
  }
}

/**
 * 已登录用户处理逻辑
 * @param {string} token - 用户 token
 */
async function processLoggedInUser(token) {
  try {
    const userInfo = await fetchUserInfo(token);
    console.log('userInfo', userInfo)
    coinCount.textContent = `$ ${userInfo.data.coin}`;
    coinCount.style.display = "block";
    if (userInfo.data.coin >= BASIC_COST) {
      await initiateUpgrade(token);
    } else {
      showErrorMessage('金币不足，无法升级！');
    }
  } catch (error) {
    console.error('处理登录用户时出错:', error);
    showErrorMessage('获取用户信息失败，请稍后再试。');
  }
}

/**
 * 未登录状态检查设备注册
 * @param {string} lang - 语言参数
 */
async function checkDeviceRegistrationStatus(lang) {
  try {
    const registration = await checkDeviceRegistration(deviceInfo.UniqueDeviceID);

    if (registration.data.code == 0) {
      window.electronAPI.sendUniqueDeviceID(deviceInfo.UniqueDeviceID, lang);
    } else {
      showErrorMessage('设备未注册，请先完成注册。', registration);
    }
  } catch (error) {
    console.error('设备注册检查失败:', error);
    showErrorMessage('设备注册检查失败，请稍后再试。');
  }
}

/**
 * 获取用户信息
 * @param {string} token - 用户 token
 */
async function fetchUserInfo(token) {
  const response = await axios.get('https://restore.msgqu.com/api/v1/user/info', {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (response.status !== 200 || response.data.code !== 0) {
    throw new Error('获取用户信息失败');
  }

  return response.data;
}

/**
 * 检查设备是否已注册
 * @param {string} deviceId - 设备 ID
 */
async function checkDeviceRegistration(deviceId) {

    // 发送设备注册请求
    const response = await axios.get('https://restore.msgqu.com/api/v1/device/verify', {
      params: {
        device_serial_number: deviceId, // 将 device_serial_number 放在 query 参数中
      }
    });

  return response;
}

/**
 * 调用升级接口
 * @param {string|null} token - 用户 token，可选
 * @param {string} lang - 语言参数
 */
async function initiateUpgrade(token = null, lang) {
  const { UniqueDeviceID } = deviceInfo;
  deviceRecord(token);
  window.electronAPI.sendUniqueDeviceID(UniqueDeviceID, lang);
}

/**
 * 切换显示的盒子
 * @param {string} boxId - 要显示的盒子 ID
 */
function toggleBox(boxId) {
  const boxes = ['card-box', 'normal-box'];
  boxes.forEach((id) => {
    document.getElementById(id).style.display = id === boxId ? 'block' : 'none';
  });
}

/**
 * 显示错误消息
 * @param {string} message - 错误信息
 */
function showErrorMessage(message) {
  alert(message); // 替换为更友好的错误提示逻辑（如弹窗或页面提示）
}

// 默认显示普通盒子
toggleBox('normal-box');

/**
 * 注册设备
 * @param {string} token - 用户 token
 */
async function deviceRecord(token) {
  try {
    // 检查 token 和 deviceInfo 是否有效
    if (!token) {
      throw new Error('Token is required');
    }
    if (!deviceInfo || !deviceInfo.UniqueDeviceID) {
      throw new Error('Device information is incomplete');
    }

    const uniqueDeviceID = deviceInfo.UniqueDeviceID;
    console.log('deviceInfo', deviceInfo);
    
    // 发送设备注册请求
    const response = await axios.post('https://restore.msgqu.com/api/v1/device/record', {
      device_serial_number: uniqueDeviceID,
      device_name: deviceInfo.DeviceName,
      device_activation: deviceInfo.ActivationState,
      device_type: 'BACK_UP',
      device_model_number: deviceInfo.ModelNumber,
      device_udid: uniqueDeviceID
    }, {
      headers: { Authorization: `Bearer ${token}` },
    });

    // 处理请求成功后的响应
    if (response.data.code === 0) {
      console.log('Device registered successfully:', response.data);
    } else {
      window.alert('Device registration failed with status:', response.status);
    }
  } catch (error) {
    // 捕获请求中的错误
    if (error.response) {
      // 服务器响应错误
      window.alert('Error response from server:', error.response.data.msg);
    } else if (error.request) {
      // 请求没有收到响应
      window.alert('No response received:', error.request);
    } else {
      // 其他类型的错误（例如设置错误）
      window.alert('Error during device registration:', error.message);
    }
  }
}

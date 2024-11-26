// 监听恢复进度消息
window.electronAPI.onRestoreProgress(({ type, message }) => {
  const progressContainer = document.getElementById('progress-container');

  // 清除旧的进度消息
  const progressMessage = document.createElement('div');
  progressMessage.textContent = message;

  // 设置不同类型的消息样式
  switch (type) {
    case 'stdout':
      progressMessage.style.color = '#28a745';  // 成功的绿色
      progressMessage.style.fontWeight = 'bold';
      progressMessage.style.animation = 'fadeIn 1s ease';
      break;
    case 'stderr':
      progressMessage.style.color = '#dc3545';  // 错误的红色
      progressMessage.style.fontWeight = 'bold';
      progressMessage.style.animation = 'fadeIn 1s ease';
      break;
    case 'error':
      progressMessage.style.color = '#e74c3c';  // 错误提示的红色
      progressMessage.style.fontWeight = 'bold';
      progressMessage.style.animation = 'fadeIn 1s ease';
      break;
    case 'complete':
      progressMessage.style.color = '#007bff';  // 完成的蓝色
      progressMessage.style.fontWeight = 'bold';
      progressMessage.style.animation = 'fadeIn 1s ease';
      break;
    default:
      progressMessage.style.color = '#333';  // 默认文本颜色
      break;
  }

  // 将消息添加到进度容器中
  progressContainer.appendChild(progressMessage);

  // 滚动到进度底部
  progressContainer.scrollTop = progressContainer.scrollHeight;
});

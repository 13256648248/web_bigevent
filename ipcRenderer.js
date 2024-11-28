// const btnZh = document.getElementById("btn-zh");
// const btnEn = document.getElementById("btn-en");

window.electronAPI.onRestoreProgress(({ type, message }) => {
  // const progressContainer = document.getElementById("progress-container");

  // const progressMessage = document.createElement("div");
  // progressMessage.textContent = message;

  switch (type) {
    case "stdout":
      // progressMessage.style.color = "#28a745";
      // progressMessage.style.fontWeight = "bold";
      // progressMessage.style.animation = "fadeIn 1s ease";
      break;
    case "stderr":
      // progressMessage.style.color = "#dc3545";
      // progressMessage.style.fontWeight = "bold";
      // progressMessage.style.animation = "fadeIn 1s ease";
      break;
    case "error":
      // progressMessage.style.color = "#e74c3c";
      // progressMessage.style.fontWeight = "bold";
      // progressMessage.style.animation = "fadeIn 1s ease";
      break;
    case "complete":
      // progressMessage.style.color = "#007bff";
      // progressMessage.style.fontWeight = "bold";
      // progressMessage.style.animation = "fadeIn 1s ease";
      
      window.alert('✅已完成请耐心等待开机');

      // // 延迟3秒后清空内容
      // setTimeout(() => {
      //   // progressContainer.innerHTML = ''; // 清空progressContainer的内容
      // }, 3000);
      break;
    default:
      // progressMessage.style.color = "#333";
      break;
  }

  // progressContainer.appendChild(progressMessage);
  // progressContainer.scrollTop = progressContainer.scrollHeight;
});

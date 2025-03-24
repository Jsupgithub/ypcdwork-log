// 设置页面标题为当日日期
function setPageTitle() {
    const today = new Date();
    const year = today.getFullYear().toString().slice(2);
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    const formattedDate = `${year}.${month}.${day}`;
    document.getElementById("pageTitle").innerText = `测试工作日志 ${formattedDate}`;
}

// 打开选项卡
function openTab(event, tabName) {
    let i, tabcontent, tablinks;
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    document.getElementById(tabName).style.display = "block";
    event.currentTarget.className += " active";
}

// 读取 CSV 文件
function readCSVFile(file) {
    const reader = new FileReader();

    reader.onload = function(e) {
        const text = e.target.result;
        // 使用 Papa.parse 解析 CSV 数据
        Papa.parse(text, {
            header: false, // 不将第一行作为标题
            dynamicTyping: false, // 不自动转换数据类型
            skipEmptyLines: true, // 跳过空行
            complete: function(results) {
                console.log("CSV 数据读取成功：", results.data);
                processCRMData(results.data); // 处理 CSV 数据
            }
        });
    };

    reader.readAsText(file); // 以文本形式读取文件
}

// 处理 CRM 数据 (手动处理可能的"合并单元格")
function processCRMData(data) {
    const contractSelect = document.getElementById("contractSelect");

    // 清空下拉选择框
    contractSelect.innerHTML = '<option value="">请选择合同编号 (可选)</option>';

    // 遍历数据，跳过第一行（标题行）
    for (let i = 1; i < data.length; i++) {
        const row = data[i];

        // 检查行是否存在, 并且至少有4列
        if (row && row.length >= 4) {
            let contractNumber = row[0]; // 第1列数据 (合同编号)
            let projectContent = row[3]; // 第4列数据 (项目内容)

            // "手动"处理可能的"合并单元格" (合同编号) -  CSV 中通常不会有，但为了健壮性，保留此逻辑
            if (!contractNumber && i > 1) {
                for (let j = i - 1; j > 0; j--) {
                    if (data[j][0]) {
                        contractNumber = data[j][0];
                        break;
                    }
                }
            }

            // "手动"处理可能的"合并单元格" (项目内容) - CSV 中通常不会有，但为了健壮性，保留此逻辑
            if (!projectContent && i > 1) {
                for (let j = i - 1; j > 0; j--) {
                    if (data[j][3]) {
                        projectContent = data[j][3];
                        break;
                    }
                }
            }
            // 检查合同编号是否为空, 如果不为空，则处理
            if (contractNumber) {
                console.log("合同编号：", contractNumber, "项目内容：", projectContent);

                const option = document.createElement("option");
                option.value = contractNumber;
                option.text = contractNumber;
                option.setAttribute('data-project-content', projectContent);
                contractSelect.appendChild(option);
            }
        } else {
            console.warn("跳过行 (i=" + i + "):", row, "行不存在或长度小于4");
        }
    }
}

// 记录任务 (根据复选框状态决定是否显示合同编号, 处理预计时间)
// recordTask, insertTask, clearRecords, showOngoingTask  这几个函数添加了复选框和进度条
function recordTask() {
    const taskInput = document.getElementById("taskInput");
    const timeEstimateValue = document.getElementById("timeEstimateValue").value;
    const timeEstimateUnit = document.getElementById("timeEstimateUnit").value;
    const contractSelect = document.getElementById("contractSelect");
    const selectedContract = contractSelect.options[contractSelect.selectedIndex];
    const projectContent = selectedContract.getAttribute('data-project-content');
    const recordContainer = document.getElementById("recordContainer");
    const unknownContractCheckbox = document.getElementById("unknownContractCheckbox");
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const taskText = taskInput.value || projectContent;
    const timeEstimate = timeEstimateValue + timeEstimateUnit;

    const recordCard = document.createElement("div");
    recordCard.classList.add("record-card");

    let content = `<p>${time}</p>`;
    if (!unknownContractCheckbox.checked && selectedContract.value) {
        content += `<p>合同编号：${selectedContract.value}</p>`;
    }
    if (taskText) {
        content += `<p>项目内容：${taskText}</p>`;
    }
    if (timeEstimate) {
        content += `<p><i>预计：${timeEstimate}</i></p>`;
    }

    // 添加复选框组、进度条和“全部完成”按钮, 添加删除按钮
    content += `
        <div class="checkbox-group">
            <label><input type="checkbox" name="taskCheckbox">参数明晰</label>
            <label><input type="checkbox" name="taskCheckbox">设备齐全</label>
            <label><input type="checkbox" name="taskCheckbox">外观检查</label>
            <label><input type="checkbox" name="taskCheckbox">电气参数</label>
            <label><input type="checkbox" name="taskCheckbox">磁场参数</label>
            <label><input type="checkbox" name="taskCheckbox">温升测试</label>
            <label><input type="checkbox" name="taskCheckbox">多方确认</label>
        </div>
        <div class="progress-bar"></div>
        <button class="complete-button">全部完成</button>
        <button class="delete-button">删除</button>
    `;

    recordCard.innerHTML = content;
    recordContainer.appendChild(recordCard);
     // 添加事件监听器
     addCardListeners(recordCard);
}

function insertTask() {
    const taskInput = document.getElementById("taskInput");
    const timeEstimateValue = document.getElementById("timeEstimateValue").value;
    const timeEstimateUnit = document.getElementById("timeEstimateUnit").value;
    const contractSelect = document.getElementById("contractSelect");
    const selectedContract = contractSelect.options[contractSelect.selectedIndex];
    const projectContent = selectedContract.getAttribute('data-project-content');
    const insertIndexInput = document.getElementById("insertIndex");
    const recordContainer = document.getElementById("recordContainer");
    const insertIndex = parseInt(insertIndexInput.value);
    const unknownContractCheckbox = document.getElementById("unknownContractCheckbox");
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const taskText = taskInput.value || projectContent;
    const timeEstimate = timeEstimateValue + timeEstimateUnit;

    const recordCard = document.createElement("div");
    recordCard.classList.add("record-card");

    let content = `<p>${time}</p>`;
    if (!unknownContractCheckbox.checked && selectedContract.value) {
        content += `<p>合同编号：${selectedContract.value}</p>`;
    }
    if (taskText) {
        content += `<p>项目内容：${taskText}</p>`;
    }
    if (timeEstimate) {
        content += `<p><i>预计：${timeEstimate}</i></p>`;
    }

      // 添加复选框组、进度条和“全部完成”按钮, 添加删除按钮
      content += `
        <div class="checkbox-group">
            <label><input type="checkbox" name="taskCheckbox">参数明晰</label>
            <label><input type="checkbox" name="taskCheckbox">设备齐全</label>
            <label><input type="checkbox" name="taskCheckbox">外观检查</label>
            <label><input type="checkbox" name="taskCheckbox">电气参数</label>
            <label><input type="checkbox" name="taskCheckbox">磁场参数</label>
            <label><input type="checkbox" name="taskCheckbox">温升测试</label>
            <label><input type="checkbox" name="taskCheckbox">多方确认</label>
        </div>
        <div class="progress-bar"></div>
        <button class="complete-button">全部完成</button>
        <button class="delete-button">删除</button>
    `;

    recordCard.innerHTML = content;

    if (isNaN(insertIndex) || insertIndex < 1 || insertIndex > recordContainer.children.length) {
        recordContainer.appendChild(recordCard);
    } else {
        recordContainer.insertBefore(recordCard, recordContainer.children[insertIndex - 1]);
    }
     // 添加事件监听器
     addCardListeners(recordCard);
}

function clearRecords() {
    const recordContainer = document.getElementById("recordContainer");
    const completedTasksContainer = document.getElementById("completed-tasks");
     // 清空所有任务卡片
    recordContainer.innerHTML = '';
    document.getElementById("ongoingRecordContainer").innerHTML = '';
    completedTasksContainer.innerHTML = '<h2>已完成任务</h2>'; // 重新添加标题
}

function showOngoingTask() {
    const taskInput = document.getElementById("taskInput");
    const timeEstimateValue = document.getElementById("timeEstimateValue").value;
    const timeEstimateUnit = document.getElementById("timeEstimateUnit").value;
    const contractSelect = document.getElementById("contractSelect");
    const selectedContract = contractSelect.options[contractSelect.selectedIndex];
    const projectContent = selectedContract.getAttribute('data-project-content');
    const ongoingRecordContainer = document.getElementById("ongoingRecordContainer");
    const unknownContractCheckbox = document.getElementById("unknownContractCheckbox");
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const taskText = taskInput.value || projectContent;
    const timeEstimate = timeEstimateValue + timeEstimateUnit;

    ongoingRecordContainer.innerHTML = '';

    const recordCard = document.createElement("div");
    recordCard.classList.add("record-card");
    recordCard.classList.add("ongoing");

    let content = `<p>${time}</p>`;
    if (!unknownContractCheckbox.checked && selectedContract.value) {
        content += `<p>合同编号：${selectedContract.value}</p>`;
    }
    if (taskText) {
        content += `<p>正在进行：${taskText}</p>`;
    }
    if (timeEstimate) {
        content += `<p><i>预计：${timeEstimate}</i></p>`;
    }
      // 添加复选框组、进度条和“全部完成”按钮, 添加删除按钮
      content += `
        <div class="checkbox-group">
            <label><input type="checkbox" name="taskCheckbox">参数明晰</label>
            <label><input type="checkbox" name="taskCheckbox">设备齐全</label>
            <label><input type="checkbox" name="taskCheckbox">外观检查</label>
            <label><input type="checkbox" name="taskCheckbox">电气参数</label>
            <label><input type="checkbox" name="taskCheckbox">磁场参数</label>
            <label><input type="checkbox" name="taskCheckbox">温升测试</label>
            <label><input type="checkbox" name="taskCheckbox">多方确认</label>
        </div>
        <div class="progress-bar"></div>
        <button class="complete-button">全部完成</button>
        <button class="delete-button">删除</button>
    `;
    recordCard.innerHTML = content;
    ongoingRecordContainer.appendChild(recordCard);
     // 添加事件监听器
     addCardListeners(recordCard);
}
// 添加所有监听事件
function addCardListeners(card) {
    addCheckboxListeners(card);  //复选框
    addCompleteButtonListener(card); //完成按钮
    addDeleteButtonListener(card); //删除按钮
}

// 添加复选框的事件监听器
function addCheckboxListeners(card) {
    const checkboxes = card.querySelectorAll('input[name="taskCheckbox"]');
    checkboxes.forEach(checkbox => {
        checkbox.addEventListener('change', () => {
            updateProgressBar(card);
        });
    });
}

// 添加“全部完成”按钮的事件监听器
function addCompleteButtonListener(card) {
    const completeButton = card.querySelector('.complete-button');
    completeButton.addEventListener('click', () => {
        completeTask(card);
    });
}

// 添加“删除”按钮的事件监听器
function addDeleteButtonListener(card) {
    const deleteButton = card.querySelector('.delete-button');
    deleteButton.addEventListener('click', () => {
        card.remove(); // 直接从 DOM 中移除卡片
    });
}

// 更新进度条
function updateProgressBar(card) {
    const checkboxes = card.querySelectorAll('input[name="taskCheckbox"]');
    const progressBar = card.querySelector('.progress-bar');
    const checkedCount = Array.from(checkboxes).filter(checkbox => checkbox.checked).length;
    const progress = (checkedCount / checkboxes.length) * 100;

    progressBar.style.width = `${progress}%`;

    if (progress === 100) {
        progressBar.classList.add('completed');
    } else {
        progressBar.classList.remove('completed');
    }
}

// 完成任务，移动到“已完成任务”区域
function completeTask(card) {
    const checkboxes = card.querySelectorAll('input[name="taskCheckbox"]');
    const progressBar = card.querySelector('.progress-bar');
    const completedTasksContainer = document.getElementById('completed-tasks');

    // 勾选所有复选框
    checkboxes.forEach(checkbox => {
        checkbox.checked = true;
    });

    // 更新进度条
    progressBar.style.width = '100%';
    progressBar.classList.add('completed');

    // 添加 completed 类（用于样式修改）
    card.classList.add('completed');
    card.classList.remove('ongoing');

    // 移除事件监听器（防止重复触发）
    const checkboxesInCard = card.querySelectorAll('input[name="taskCheckbox"]');
    checkboxesInCard.forEach(cb => {
      cb.removeEventListener('change', updateProgressBar);
    });
     card.querySelector('.complete-button').removeEventListener('click', completeTask);

    // 将卡片移动到“已完成任务”容器
    completedTasksContainer.appendChild(card);
}

// 导出 CSV 文件 (修正乱码问题, 处理预计时间, 添加任务状态)
function exportToCSV() {
  const recordCards = document.querySelectorAll(
    "#recordContainer .record-card, #ongoingRecordContainer .record-card, #completed-tasks .record-card"
  );
  const csvRows = [];

  // 添加表头
  csvRows.push(["任务状态", "合同编号", "项目内容", "预计时间"]);

  // 遍历所有卡片
  recordCards.forEach((card) => {
    let contractNumber = "";
    let projectContent = "";
    let estimatedTime = "";
    let taskStatus = "";

    // 确定任务状态
    if (card.classList.contains("ongoing")) {
      taskStatus = "正在进行";
    } else if (card.classList.contains("completed")) {
      taskStatus = "已完成";
    } else {
      taskStatus = "记录"; // 默认状态
    }

    // 查找合同编号
    const contractNumberElement = card.querySelector("p:nth-child(2)");
    if (
      contractNumberElement &&
      contractNumberElement.textContent.startsWith("合同编号：")
    ) {
      contractNumber = contractNumberElement.textContent
        .replace("合同编号：", "")
        .trim();
    }

    // 查找项目内容/正在进行
    const projectContentElement = card.querySelector("p:nth-child(3)");
    if (projectContentElement) {
      const text = projectContentElement.textContent;
      if (text.startsWith("项目内容：")) {
        projectContent = text.replace("项目内容：", "").trim();
      } else if (text.startsWith("正在进行：")) {
        projectContent = text.replace("正在进行：", "").trim();
      }
    }

    // 查找预计时间
    const estimateTimeElement = card.querySelector("p:nth-child(4)");
    if (estimateTimeElement) {
      estimatedTime = estimateTimeElement.textContent.replace("预计：", "").trim();
    }

    // 添加到 CSV 行, 包括任务状态
    csvRows.push([taskStatus, contractNumber, projectContent, estimatedTime]);
  });

  // 使用 Papa.unparse 将数据转换为 CSV 字符串
  const csvString = Papa.unparse(csvRows);

  // 创建下载链接 (修正乱码)
  const blob = new Blob(["\ufeff", csvString], {
    type: "text/csv;charset=utf-8;",
  }); // 添加 BOM
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", "工作日志.csv");
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// 页面加载完成后的操作
document.addEventListener("DOMContentLoaded", function() {
    setPageTitle();

    // 默认显示任务选项卡
    document.getElementById("Tasks").style.display = "block";
    document.querySelector(".tablinks").classList.add("active");

    // 绑定按钮点击事件
    document.getElementById("recordButton").addEventListener("click", recordTask);
    document.getElementById("insertButton").addEventListener("click", insertTask);
    document.getElementById("clearButton").addEventListener("click", clearRecords);
    document.getElementById("ongoingButton").addEventListener("click", showOngoingTask);
    document.getElementById("exportButton").addEventListener("click", exportToCSV);

    // 绑定文件选择事件 (修改为调用 readCSVFile)
    document.getElementById("crmFile").addEventListener("change", function(event) {
        const file = event.target.files[0];
        if (file) {
            readCSVFile(file);
        }
    });

    // 绑定合同编号选择事件
    document.getElementById("contractSelect").addEventListener("change", function() {
        const selectedContract = this.options[this.selectedIndex];
        const projectContent = selectedContract.getAttribute('data-project-content');
        const taskInput = document.getElementById("taskInput");
        taskInput.value = projectContent || ""; // 将项目内容填充到 "我正在做…" 输入框中
    });
     // 时间格式化（只显示小时和分钟）
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

});

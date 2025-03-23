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
function recordTask() {
    const taskInput = document.getElementById("taskInput");
    const timeEstimateValue = document.getElementById("timeEstimateValue").value; // 获取数值
    const timeEstimateUnit = document.getElementById("timeEstimateUnit").value;   // 获取单位
    const contractSelect = document.getElementById("contractSelect");
    const selectedContract = contractSelect.options[contractSelect.selectedIndex];
    const projectContent = selectedContract.getAttribute('data-project-content');
    const recordContainer = document.getElementById("recordContainer");
    const unknownContractCheckbox = document.getElementById("unknownContractCheckbox");
    const now = new Date();
    const time = now.toLocaleTimeString();

    const taskText = taskInput.value || projectContent;
    const timeEstimate = timeEstimateValue + timeEstimateUnit; // 组合时间和单位

    const recordCard = document.createElement("div");
    recordCard.classList.add("record-card");

    let content = `<p>时间：${time}</p>`;
    // 根据复选框状态添加合同编号
    if (!unknownContractCheckbox.checked && selectedContract.value) {
        content += `<p>合同编号：${selectedContract.value}</p>`;
    }
    if (taskText) {
        content += `<p>项目内容：${taskText}</p>`;
    }
    if (timeEstimate) {
        content += `<p><i>预计：${timeEstimate}</i></p>`; // 显示组合后的时间
    }
    recordCard.innerHTML = content;
    recordContainer.appendChild(recordCard);
}

// 插入任务 (根据复选框状态决定是否显示合同编号, 处理预计时间)
function insertTask() {
    const taskInput = document.getElementById("taskInput");
    const timeEstimateValue = document.getElementById("timeEstimateValue").value; // 获取数值
    const timeEstimateUnit = document.getElementById("timeEstimateUnit").value;   // 获取单位
    const contractSelect = document.getElementById("contractSelect");
    const selectedContract = contractSelect.options[contractSelect.selectedIndex];
    const projectContent = selectedContract.getAttribute('data-project-content');
    const insertIndexInput = document.getElementById("insertIndex");
    const recordContainer = document.getElementById("recordContainer");
    const insertIndex = parseInt(insertIndexInput.value);
    const unknownContractCheckbox = document.getElementById("unknownContractCheckbox");
    const now = new Date();
    const time = now.toLocaleTimeString();

    const taskText = taskInput.value || projectContent;
    const timeEstimate = timeEstimateValue + timeEstimateUnit; // 组合时间和单位

    const recordCard = document.createElement("div");
    recordCard.classList.add("record-card");

    let content = `<p>时间：${time}</p>`;
    // 根据复选框状态添加合同编号
    if (!unknownContractCheckbox.checked && selectedContract.value) {
        content += `<p>合同编号：${selectedContract.value}</p>`;
    }
    if (taskText) {
        content += `<p>项目内容：${taskText}</p>`;
    }
    if (timeEstimate) {
        content += `<p><i>预计：${timeEstimate}</i></p>`; // 显示组合后的时间
    }
    recordCard.innerHTML = content;

    if (isNaN(insertIndex) || insertIndex < 1 || insertIndex > recordContainer.children.length) {
        recordContainer.appendChild(recordCard);
    } else {
        recordContainer.insertBefore(recordCard, recordContainer.children[insertIndex - 1]);
    }
}

// 清空记录
function clearRecords() {
    const recordContainer = document.getElementById("recordContainer");
    recordContainer.innerHTML = '';
}

// 显示"正在进行"的任务 (根据复选框状态决定是否显示合同编号, 处理预计时间)
function showOngoingTask() {
    const taskInput = document.getElementById("taskInput");
    const timeEstimateValue = document.getElementById("timeEstimateValue").value; // 获取数值
    const timeEstimateUnit = document.getElementById("timeEstimateUnit").value;   // 获取单位
    const contractSelect = document.getElementById("contractSelect");
    const selectedContract = contractSelect.options[contractSelect.selectedIndex];
    const projectContent = selectedContract.getAttribute('data-project-content');
    const ongoingRecordContainer = document.getElementById("ongoingRecordContainer");
    const unknownContractCheckbox = document.getElementById("unknownContractCheckbox");
    const now = new Date();
    const time = now.toLocaleTimeString();

    const taskText = taskInput.value || projectContent;
    const timeEstimate = timeEstimateValue + timeEstimateUnit; // 组合时间和单位

    // 清空之前的"正在进行"记录
    ongoingRecordContainer.innerHTML = '';

    const recordCard = document.createElement("div");
    recordCard.classList.add("record-card");
    recordCard.classList.add("ongoing");

    let content = `<p>时间：${time}</p>`;
    // 根据复选框状态添加合同编号
    if (!unknownContractCheckbox.checked && selectedContract.value) {
        content += `<p>合同编号：${selectedContract.value}</p>`;
    }
    if (taskText) {
        content += `<p>正在进行：${taskText}</p>`;
    }
    if (timeEstimate) {
        content += `<p><i>预计：${timeEstimate}</i></p>`; // 显示组合后的时间
    }
    recordCard.innerHTML = content;
    ongoingRecordContainer.appendChild(recordCard);
}

// 上传 CRM 文件 (修改为调用 readCSVFile)
function uploadCRMFile() {
    const crmFile = document.getElementById("crmFile");
    const file = crmFile.files[0];

    if (file) {
        readCSVFile(file);
        alert("上传成功！");
    } else {
        alert("请选择文件！");
    }
}

// 导出 CSV 文件 (修正乱码问题, 处理预计时间)
function exportToCSV() {
    const recordCards = document.querySelectorAll("#recordContainer .record-card, #ongoingRecordContainer .record-card");
    const csvRows = [];

    // 添加表头
    csvRows.push(["合同编号", "项目内容", "预计时间"]);

    // 遍历所有卡片
    recordCards.forEach(card => {
        let contractNumber = "";
        let projectContent = "";
        let estimatedTime = "";

        // 查找合同编号
        const contractNumberElement = card.querySelector("p:nth-child(2)");
        if (contractNumberElement && contractNumberElement.textContent.startsWith("合同编号：")) {
            contractNumber = contractNumberElement.textContent.replace("合同编号：", "").trim();
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

        // 添加到 CSV 行
        csvRows.push([contractNumber, projectContent, estimatedTime]);
    });

    // 使用 Papa.unparse 将数据转换为 CSV 字符串
    const csvString = Papa.unparse(csvRows);

    // 创建下载链接 (修正乱码)
    const blob = new Blob(["\ufeff", csvString], { type: "text/csv;charset=utf-8;" }); // 添加 BOM
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "工作日志.csv");
    link.style.visibility = 'hidden';
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
    document.getElementById("uploadButton").addEventListener("click", uploadCRMFile);
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
});

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

// 任务卡和标签定义
const COLUMNS = {
    inProgress: { id: 'in-progress-cards', name: '正在进行' },
    pending: { id: 'pending-cards', name: '待进行' },
    partial: { id: 'partial-cards', name: '部分完成' },
    completed: { id: 'completed-cards', name: '全部完成' }
};

const TAGS = {
    urgent: { text: '紧急', class: 'tag-urgent', color: '#d9534f' },
    problem: { text: '遇到问题', class: 'tag-problem', color: '#9b59b6' },
    inProgress: { text: '进行中', class: 'tag-in-progress', color: '#5cb85c' },
    pending: { text: '待进行', class: 'tag-pending', color: '#777' },
    waiting: { text: '待确认', class: 'tag-waiting', color: '#f0ad4e' },
    partial: { text: '部分完成', class: 'tag-partial', color: '#5bc0de' },
    completed: { text: '已完成', class: 'tag-completed', color: '#337ab7' }
};

// 存储合同信息
let contractData = [];

// 生成随机ID (只用于演示)
function generateId() {
    const letters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const prefix = letters.charAt(Math.floor(Math.random() * letters.length)) + 
                  letters.charAt(Math.floor(Math.random() * letters.length));
    const numbers = String(Math.floor(100000 + Math.random() * 900000));
    return prefix + numbers.slice(0, 6) + '-' + Math.floor(100 + Math.random() * 900);
}

// 创建任务卡
function createTaskCard(contractNumber, content, column = 'pending', tags = []) {
    // 只有当提供了合同编号时才使用它，否则生成一个内部ID但不显示
    const internalId = contractNumber || generateId();
    const showId = !!contractNumber; // 只有传入合同编号时才显示ID
    
    const card = document.createElement('div');
    card.className = 'task-card';
    card.dataset.id = internalId; // 内部仍然保持ID用于识别卡片
    
    // 添加菜单触发按钮
    const menuTrigger = document.createElement('div');
    menuTrigger.className = 'card-menu-trigger';
    menuTrigger.innerHTML = '<i class="fa-solid fa-ellipsis-vertical"></i>';
    card.appendChild(menuTrigger);
    
    // 创建标签区域
    const tagsContainer = document.createElement('div');
    tagsContainer.className = 'card-tags';
    
    // 添加标签
    tags.forEach(tagName => {
        if (TAGS[tagName]) {
            const tag = document.createElement('span');
            tag.className = 'card-tag ' + TAGS[tagName].class;
            tag.textContent = TAGS[tagName].text;
            tagsContainer.appendChild(tag);
        }
    });
    
    // 添加列对应的状态标签 (如果还没有)
    const columnTagMap = {
        inProgress: 'inProgress',
        pending: 'pending',
        partial: 'partial',
        completed: 'completed'
    };
    
    if (columnTagMap[column]) {
        const tagClass = TAGS[columnTagMap[column]].class;
        if (!card.querySelector('.' + tagClass)) {
            const tag = document.createElement('span');
            tag.className = 'card-tag ' + tagClass;
            tag.textContent = TAGS[columnTagMap[column]].text;
            tagsContainer.appendChild(tag);
        }
    }
    
    // 创建卡片ID和标题区域
    const cardHeader = document.createElement('div');
    cardHeader.className = 'card-header';
    
    // 创建标题（如果有）
    const projectContent = getProjectContent(internalId);
    
    // 如果没有项目内容且有用户输入的内容，取前五个字作为标题
    if (!projectContent && content) {
        const titleDiv = document.createElement('div');
        titleDiv.className = 'card-title';
        titleDiv.textContent = content.substring(0, 5) + (content.length > 5 ? '...' : '');
        cardHeader.appendChild(titleDiv);
    }
    
    // 只有当应该显示ID时才添加
    if (showId) {
        const cardId = document.createElement('div');
        cardId.className = 'card-id';
        cardId.textContent = internalId;
        cardHeader.appendChild(cardId);
    }
    
    // 创建内容区域（带占位符）
    const cardContent = document.createElement('div');
    cardContent.className = 'card-content';
    
    if (projectContent) {
        // 显示项目内容
        cardContent.textContent = projectContent;
    } else if (content) {
        // 显示用户输入的内容
        cardContent.textContent = content;
    } else {
        // 占位符，但不显示在列表视图中
        cardContent.textContent = '';
        cardContent.dataset.placeholder = '请输入描述...';
        cardContent.classList.add('card-placeholder');
    }
    
    // 组装卡片
    card.appendChild(tagsContainer);
    card.appendChild(cardHeader);
    card.appendChild(cardContent);
    
    // 添加到对应列
    const columnElement = document.getElementById(COLUMNS[column].id);
    columnElement.appendChild(card);
    
    // 更新计数
    updateColumnCount(column);
    
    // 添加点击事件
    card.addEventListener('click', function(e) {
        // 如果点击的是菜单触发按钮或菜单项，不打开对话框
        if (e.target.closest('.card-menu-trigger') || e.target.closest('.card-menu')) {
            e.stopPropagation();
            return;
        }
        
        showCardTagDialog(this);
    });
    
    // 添加菜单触发按钮点击事件
    menuTrigger.addEventListener('click', (e) => {
        e.stopPropagation();
        showCardMenu(card, menuTrigger);
    });
    
    return card;
}

// 获取合同对应的项目内容
function getProjectContent(contractId) {
    for (const contract of contractData) {
        if (contract.id === contractId) {
            return contract.content;
        }
    }
    return null;
}

// 显示标签对话框
function showCardTagDialog(card) {
    // 获取卡片ID和当前列
    const cardId = card.dataset.id;
    const currentColumn = getCardColumn(card);
    const columnName = COLUMNS[currentColumn]?.name || '待进行';
    
    // 获取卡片内容
    const cardContent = card.querySelector('.card-content');
    const cardDescription = cardContent ? (cardContent.textContent || cardContent.dataset.placeholder || '') : '';
    
    // 创建对话框容器
    const dialog = document.createElement('div');
    dialog.className = 'task-dialog';
    
    // 创建对话框内容
    dialog.innerHTML = `
    <div class="dialog-content">
        <div class="dialog-header">
            <div class="dialog-header-left">
                <div class="dialog-checkbox"></div>
                <div class="dialog-path">
                    <span>日常任务同步</span>
                    <span class="dialog-path-icon">/</span>
                    <span>${columnName}</span>
                </div>
            </div>
            <div class="dialog-header-right">
                <i class="fa-solid fa-xmark dialog-header-icon dialog-close"></i>
            </div>
        </div>
        <div class="dialog-body">
            <div class="dialog-contract-select">
                <select id="dialog-contract-id">
                    <option value="">选择合同编号</option>
                    ${generateContractOptions(cardId)}
                </select>
            </div>
            
            <div class="dialog-tools">
                <div class="dialog-tool" id="tool-time"><i class="fa-regular fa-clock"></i></div>
                <div class="dialog-tool" id="tool-tag"><i class="fa-solid fa-tag"></i></div>
            </div>
            
            <div class="dialog-time-setting" style="display:none;">
                <input type="number" id="time-value" min="1" placeholder="数值">
                <select id="time-unit">
                    <option value="h">小时</option>
                    <option value="d">天</option>
                </select>
                <button id="time-save">确定</button>
            </div>
            
            <div class="dialog-tags">
                ${getCardTagsHtml(card)}
                <div class="dialog-tag-plus" id="add-tag-btn">+</div>
            </div>
            
            <div class="dialog-description" contenteditable="true">
                ${getProjectContent(cardId) || cardDescription || '请输入描述...'}
            </div>
        </div>
    </div>
    `;
    
    // 添加事件监听器
    document.body.appendChild(dialog);
    
    // 关闭按钮事件
    dialog.querySelector('.dialog-close').addEventListener('click', () => {
        // 保存描述内容
        const newDescription = dialog.querySelector('.dialog-description').textContent.trim();
        if (newDescription && newDescription !== '请输入描述...') {
            saveCardDescription(card, newDescription);
        }
        
        dialog.remove();
    });
    
    // 选择合同事件
    const contractSelect = dialog.querySelector('#dialog-contract-id');
    contractSelect.addEventListener('change', () => {
        handleContractSelect(card, contractSelect, dialog);
    });
    
    // 时间工具事件
    dialog.querySelector('#tool-time').addEventListener('click', () => {
        const timeSettings = dialog.querySelector('.dialog-time-setting');
        timeSettings.style.display = timeSettings.style.display === 'none' ? 'flex' : 'none';
    });
    
    // 保存时间按钮事件
    dialog.querySelector('#time-save').addEventListener('click', () => {
        const timeValue = dialog.querySelector('#time-value').value;
        const timeUnit = dialog.querySelector('#time-unit').value;
        
        if (timeValue) {
            // 添加到卡片上的时间显示 (如果已有则更新)
            let timeElement = card.querySelector('.card-time');
            if (!timeElement) {
                timeElement = document.createElement('div');
                timeElement.className = 'card-time';
                card.appendChild(timeElement);
            }
            
            timeElement.textContent = `预计时间: ${timeValue}${timeUnit}`;
            dialog.querySelector('.dialog-time-setting').style.display = 'none';
        }
    });
    
    // 标签工具事件
    dialog.querySelector('#tool-tag').addEventListener('click', (e) => {
        e.stopPropagation();
        showTagsMenu(card, e.target);
    });
    
    // 标签添加按钮事件
    dialog.querySelector('#add-tag-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        showTagsMenu(card, e.target);
    });
    
    // 状态切换事件（点击路径中的状态）
    const pathStatus = dialog.querySelector('.dialog-path span:last-child');
    pathStatus.style.cursor = 'pointer';
    pathStatus.addEventListener('click', (e) => {
        e.stopPropagation();
        showStatusMenu(card, e.target);
    });
    
    // 点击对话框外部关闭
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            // 保存描述内容
            const newDescription = dialog.querySelector('.dialog-description').textContent.trim();
            if (newDescription && newDescription !== '请输入描述...') {
                saveCardDescription(card, newDescription);
            }
            
            dialog.remove();
        }
    });
}

// 生成合同选项HTML
function generateContractOptions(selectedId) {
    let optionsHtml = '';
    contractData.forEach(contract => {
        const selected = contract.id === selectedId ? 'selected' : '';
        optionsHtml += `<option value="${contract.id}" ${selected}>${contract.id}</option>`;
    });
    return optionsHtml;
}

// 获取卡片标签HTML
function getCardTagsHtml(card) {
    const tagsContainer = card.querySelector('.card-tags');
    if (!tagsContainer) return '';
    
    let tagsHtml = '';
    const tags = tagsContainer.querySelectorAll('.card-tag');
    
    tags.forEach(tag => {
        const tagText = tag.textContent;
        const tagClass = Array.from(tag.classList)
            .find(className => className.startsWith('tag-'));
        
        if (tagClass) {
            tagsHtml += `<div class="dialog-tag ${tagClass}">${tagText}</div>`;
        }
    });
    
    return tagsHtml;
}

// 更新列计数
function updateColumnCount(column) {
    const columnEl = document.getElementById(COLUMNS[column].id);
    if (!columnEl) return;
    
    const header = columnEl.parentElement.querySelector('.column-header span');
    if (!header) return;
    
    const count = columnEl.querySelectorAll('.task-card').length;
    header.textContent = `${COLUMNS[column].name} (${count})`;
}

// 获取卡片所在列
function getCardColumn(card) {
    for (const column in COLUMNS) {
        const columnElement = document.getElementById(COLUMNS[column].id);
        if (columnElement && columnElement.contains(card)) {
            return column;
        }
    }
    return null;
}

// 显示标签菜单
function showTagsMenu(card, target) {
    // 检查是否已存在标签菜单
    const existingMenu = document.querySelector('.tags-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const menu = document.createElement('div');
    menu.className = 'tags-menu';
    
    // 获取卡片上已有的标签
    const existingTags = [];
    const cardTags = card.querySelectorAll('.card-tag');
    cardTags.forEach(tag => {
        const className = Array.from(tag.classList).find(c => c.startsWith('tag-'));
        if (className) {
            const tagName = className.replace('tag-', '');
            existingTags.push(tagName);
        }
    });
    
    // 添加标签选项
    for (const tagKey in TAGS) {
        if (['inProgress', 'pending', 'partial', 'completed'].includes(tagKey)) {
            continue; // 跳过状态标签
        }
        
        const isSelected = existingTags.includes(tagKey);
        const tagItem = document.createElement('div');
        tagItem.className = `tag-item ${isSelected ? 'selected' : ''}`;
        tagItem.style.borderColor = TAGS[tagKey].color;
        
        const tagDot = document.createElement('span');
        tagDot.className = 'tag-dot';
        tagDot.style.backgroundColor = TAGS[tagKey].color;
        
        const tagText = document.createElement('span');
        tagText.textContent = TAGS[tagKey].text;
        
        tagItem.appendChild(tagDot);
        tagItem.appendChild(tagText);
        menu.appendChild(tagItem);
        
        // 添加点击事件
        tagItem.addEventListener('click', () => {
            toggleTag(card, tagKey);
            menu.remove();
            
            // 更新对话框中的标签
            const dialog = document.querySelector('.task-dialog');
            if (dialog) {
                const dialogTags = dialog.querySelector('.dialog-tags');
                dialogTags.innerHTML = getCardTagsHtml(card) + '<div class="dialog-tag-plus" id="add-tag-btn">+</div>';
                
                // 重新绑定添加标签按钮事件
                dialog.querySelector('#add-tag-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    showTagsMenu(card, e.target);
                });
            }
        });
    }
    
    // 定位菜单
    const rect = target.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menu.style.left = `${rect.left + window.scrollX - 100}px`;
    
    document.body.appendChild(menu);
    
    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== target) {
            menu.remove();
        }
    }, { once: true });
}

// 显示状态菜单
function showStatusMenu(card, target) {
    // 检查是否已存在状态菜单
    const existingMenu = document.querySelector('.status-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const menu = document.createElement('div');
    menu.className = 'status-menu';
    
    // 添加状态选项
    for (const column in COLUMNS) {
        const item = document.createElement('div');
        item.className = 'status-item';
        item.textContent = COLUMNS[column].name;
        
        item.addEventListener('click', () => {
            moveCardToColumn(card, column);
            menu.remove();
            
            // 更新对话框
            const dialog = document.querySelector('.task-dialog');
            if (dialog) {
                const pathStatus = dialog.querySelector('.dialog-path span:last-child');
                pathStatus.textContent = COLUMNS[column].name;
                
                // 更新标签
                updateCardStatusTag(card, column);
                
                // 刷新对话框中的标签
                const dialogTags = dialog.querySelector('.dialog-tags');
                dialogTags.innerHTML = getCardTagsHtml(card) + '<div class="dialog-tag-plus" id="add-tag-btn">+</div>';
                
                // 重新绑定添加标签按钮事件
                dialog.querySelector('#add-tag-btn').addEventListener('click', (e) => {
                    e.stopPropagation();
                    showTagsMenu(card, e.target);
                });
            }
        });
        
        menu.appendChild(item);
    }
    
    // 定位菜单
    const rect = target.getBoundingClientRect();
    menu.style.top = `${rect.bottom + window.scrollY + 5}px`;
    menu.style.left = `${rect.left + window.scrollX - 50}px`;
    
    document.body.appendChild(menu);
    
    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== target) {
            menu.remove();
        }
    }, { once: true });
}

// 更新卡片状态标签
function updateCardStatusTag(card, column) {
    const tagsContainer = card.querySelector('.card-tags');
    if (!tagsContainer) return;
    
    // 移除所有状态标签
    const statusTags = ['tag-in-progress', 'tag-pending', 'tag-partial', 'tag-completed'];
    statusTags.forEach(statusClass => {
        const statusTag = tagsContainer.querySelector('.' + statusClass);
        if (statusTag) {
            statusTag.remove();
        }
    });
    
    // 添加新的状态标签
    const columnTagMap = {
        inProgress: 'inProgress',
        pending: 'pending',
        partial: 'partial',
        completed: 'completed'
    };
    
    if (columnTagMap[column]) {
        const tagName = columnTagMap[column];
        const tag = document.createElement('span');
        tag.className = 'card-tag ' + TAGS[tagName].class;
        tag.textContent = TAGS[tagName].text;
        tagsContainer.appendChild(tag);
    }
}

// 移动卡片到指定列
function moveCardToColumn(card, column) {
    const currentColumn = getCardColumn(card);
    if (currentColumn === column) return;
    
    const columnElement = document.getElementById(COLUMNS[column].id);
    columnElement.appendChild(card);
    
    // 更新状态标签
    updateCardStatusTag(card, column);
    
    // 更新计数
    updateColumnCount(currentColumn);
    updateColumnCount(column);
}

// 切换标签
function toggleTag(card, tagName) {
    const tagsContainer = card.querySelector('.card-tags');
    if (!tagsContainer) return;
    
    // 检查标签是否已存在
    const tagClass = TAGS[tagName].class;
    const existingTag = tagsContainer.querySelector('.' + tagClass);
    
    if (existingTag) {
        // 如果标签已存在，移除它
        existingTag.remove();
    } else {
        // 如果不存在，添加它
        const tag = document.createElement('span');
        tag.className = 'card-tag ' + tagClass;
        tag.textContent = TAGS[tagName].text;
        tagsContainer.appendChild(tag);
    }
}

// 添加新卡片事件
function setupAddButtons() {
    const columns = Object.keys(COLUMNS);
    
    columns.forEach(column => {
        const addButton = document.querySelector(`#${COLUMNS[column].id}-add-btn`);
        
        addButton.addEventListener('click', () => {
            // 创建一个空卡片，带占位符提示
            const card = createTaskCard(null, '', column);
            
            // 自动打开编辑对话框
            showCardTagDialog(card);
        });
    });
}

// 初始化拖放功能
function initDragAndDrop() {
    const cards = document.querySelectorAll('.task-card');
    const columns = document.querySelectorAll('.board-column');
    
    // 添加拖放事件到卡片
    cards.forEach(card => {
        card.setAttribute('draggable', true);
        card.addEventListener('dragstart', handleDragStart);
        card.addEventListener('dragend', handleDragEnd);
    });
    
    // 添加拖放事件到列
    columns.forEach(column => {
        column.addEventListener('dragover', handleDragOver);
        column.addEventListener('drop', handleDrop);
    });
}

// 拖放事件处理程序
function handleDragStart(e) {
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', e.target.dataset.id);
    e.target.classList.add('dragging');
}

function handleDragEnd(e) {
    e.target.classList.remove('dragging');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function handleDrop(e) {
    e.preventDefault();
    const cardId = e.dataTransfer.getData('text/plain');
    const card = document.querySelector(`.task-card[data-id="${cardId}"]`);
    
    if (!card) return;
    
    // 获取目标列和当前列
    const targetColumn = e.currentTarget;
    const targetColumnId = targetColumn.id;
    const currentColumn = getCardColumn(card);
    
    // 找到目标列对应的列名
    let newColumn = null;
    for (const column in COLUMNS) {
        if (COLUMNS[column].id === targetColumnId) {
            newColumn = column;
            break;
        }
    }
    
    if (newColumn && newColumn !== currentColumn) {
        // 移动卡片
        targetColumn.appendChild(card);
        
        // 更新状态标签
        updateCardStatusTag(card, newColumn);
        
        // 更新计数
        updateColumnCount(currentColumn);
        updateColumnCount(newColumn);
    }
}

// 导入CRM数据
function handleCRMImport() {
    const importBtn = document.getElementById('crm-import-btn');
    const fileInput = document.getElementById('crm-file');
    
    importBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        // 读取CSV文件
        const reader = new FileReader();
        reader.onload = (event) => {
            processCSVData(event.target.result);
        };
        reader.readAsText(file);
    });
}

// 处理CSV数据
function processCSVData(csvData) {
    // 分割行，处理不同的行分隔符
    const rows = csvData.split(/\r\n|\n|\r/);
    if (rows.length < 2) return; // 检查是否至少有标题行+一行数据
    
    // 解析数据行
    contractData = [];
    let idIdx = 0;   // 第1列 - 合同编号
    let contentIdx = 3;  // 第4列 - 项目内容
    
    // 遍历行（跳过标题行）
    for (let i = 1; i < rows.length; i++) {
        // 处理Excel导出的CSV，可能包含引号和逗号
        let row = parseCSVRow(rows[i]);
        if (!row || row.length <= 1) continue; // 跳过空行
        
        // 提取合同编号和项目内容
        const id = row[idIdx] ? row[idIdx].trim() : '';
        const content = row[contentIdx] ? row[contentIdx].trim() : '';
        
        if (id && content) {
            contractData.push({ id, content });
        }
    }
    
    // 显示导入成功信息
    if (contractData.length > 0) {
        alert(`成功导入 ${contractData.length} 条合同数据`);
    } else {
        alert('未找到有效数据，请检查CSV文件格式');
    }
}

// 解析CSV行，处理引号和逗号
function parseCSVRow(row) {
    if (!row || row.trim() === '') return null;
    
    let result = [];
    let inQuotes = false;
    let currentValue = '';
    
    for (let i = 0; i < row.length; i++) {
        const char = row[i];
        
        if (char === '"') {
            inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
            result.push(currentValue);
            currentValue = '';
        } else {
            currentValue += char;
        }
    }
    
    // 添加最后一个值
    result.push(currentValue);
    return result;
}

// 选择合同事件处理函数
function handleContractSelect(card, contractSelect, dialog) {
    const selectedContractId = contractSelect.value;
    
    if (selectedContractId) {
        // 更新卡片ID
        card.dataset.id = selectedContractId;
        
        // 创建或更新ID显示
        let cardIdElement = card.querySelector('.card-id');
        const cardHeader = card.querySelector('.card-header');
        
        if (!cardIdElement && cardHeader) {
            cardIdElement = document.createElement('div');
            cardIdElement.className = 'card-id';
            cardHeader.appendChild(cardIdElement);
        }
        
        if (cardIdElement) {
            cardIdElement.textContent = selectedContractId;
        }
        
        // 更新描述内容
        const projectContent = getProjectContent(selectedContractId);
        if (projectContent) {
            // 更新对话框中的描述
            const dialogDescription = dialog.querySelector('.dialog-description');
            if (dialogDescription) {
                dialogDescription.textContent = projectContent;
            }
            
            // 更新卡片中的内容
            const cardContent = card.querySelector('.card-content');
            if (cardContent) {
                cardContent.textContent = projectContent;
                cardContent.classList.remove('card-placeholder');
            }
            
            // 移除自定义标题（如果有）
            const cardTitle = card.querySelector('.card-title');
            if (cardTitle) {
                cardTitle.remove();
            }
        }
    } else {
        // 如果用户取消选择合同编号，则移除ID显示
        const cardIdElement = card.querySelector('.card-id');
        if (cardIdElement) {
            cardIdElement.remove();
        }
    }
}

// 保存卡片描述
function saveCardDescription(card, description) {
    if (!description || description === '请输入描述...') return;
    
    const cardContent = card.querySelector('.card-content');
    if (!cardContent) return;
    
    cardContent.textContent = description;
    cardContent.classList.remove('card-placeholder');
    
    // 检查是否有合同编号
    const cardId = card.dataset.id;
    const projectContent = getProjectContent(cardId);
    
    // 如果没有项目内容（即用户自定义描述），则添加标题
    if (!projectContent) {
        // 更新或添加标题
        let cardTitle = card.querySelector('.card-title');
        const cardHeader = card.querySelector('.card-header');
        
        if (!cardTitle && cardHeader) {
            cardTitle = document.createElement('div');
            cardTitle.className = 'card-title';
            cardHeader.insertBefore(cardTitle, cardHeader.firstChild);
        }
        
        if (cardTitle) {
            cardTitle.textContent = description.substring(0, 5) + (description.length > 5 ? '...' : '');
        }
    }
}

// 显示卡片菜单
function showCardMenu(card, trigger) {
    // 检查是否已存在菜单
    const existingMenu = document.querySelector('.card-menu');
    if (existingMenu) {
        existingMenu.remove();
        return;
    }
    
    const menu = document.createElement('div');
    menu.className = 'card-menu';
    
    // 获取当前列
    const currentColumn = getCardColumn(card);
    
    // 创建完成卡片选项（如果卡片不在完成列）
    if (currentColumn !== 'completed') {
        const completeItem = document.createElement('div');
        completeItem.className = 'card-menu-item';
        completeItem.innerHTML = '<i class="fa-solid fa-check"></i> 完成卡片';
        completeItem.addEventListener('click', () => {
            moveCardToColumn(card, 'completed');
            menu.remove();
        });
        menu.appendChild(completeItem);
    }
    
    // 创建移动卡片选项
    const moveItem = document.createElement('div');
    moveItem.className = 'card-menu-item';
    moveItem.innerHTML = '<i class="fa-solid fa-arrow-right"></i> 移动卡片';
    moveItem.addEventListener('click', (e) => {
        e.stopPropagation();
        showStatusMenu(card, e.target);
        menu.remove();
    });
    menu.appendChild(moveItem);
    
    // 创建复制卡片选项
    const copyItem = document.createElement('div');
    copyItem.className = 'card-menu-item';
    copyItem.innerHTML = '<i class="fa-regular fa-copy"></i> 复制';
    copyItem.addEventListener('click', () => {
        duplicateCard(card);
        menu.remove();
    });
    menu.appendChild(copyItem);
    
    // 添加分隔线
    const separator = document.createElement('div');
    separator.className = 'card-menu-separator';
    menu.appendChild(separator);
    
    // 创建删除卡片选项
    const deleteItem = document.createElement('div');
    deleteItem.className = 'card-menu-item';
    deleteItem.innerHTML = '<i class="fa-regular fa-trash-can"></i> 删除';
    deleteItem.addEventListener('click', () => {
        deleteCard(card);
        menu.remove();
    });
    menu.appendChild(deleteItem);
    
    // 添加菜单到卡片
    card.appendChild(menu);
    
    // 点击外部关闭菜单
    document.addEventListener('click', (e) => {
        if (!menu.contains(e.target) && e.target !== trigger) {
            menu.remove();
        }
    }, { once: true });
}

// 复制卡片
function duplicateCard(sourceCard) {
    const cardId = sourceCard.dataset.id;
    const column = getCardColumn(sourceCard);
    const content = sourceCard.querySelector('.card-content').textContent;
    
    // 获取标签
    const tags = [];
    const tagElements = sourceCard.querySelectorAll('.card-tag');
    tagElements.forEach(tagElement => {
        const tagClass = Array.from(tagElement.classList).find(cls => cls.startsWith('tag-'));
        if (tagClass) {
            for (const key in TAGS) {
                if (TAGS[key].class === tagClass && !['inProgress', 'pending', 'partial', 'completed'].includes(key)) {
                    tags.push(key);
                }
            }
        }
    });
    
    // 创建新卡片
    createTaskCard(null, content, column, tags);
}

// 删除卡片
function deleteCard(card) {
    if (!card) return;
    
    const column = getCardColumn(card);
    card.remove();
    
    // 更新计数
    updateColumnCount(column);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    setPageTitle();
    
    // 设置添加卡片按钮事件
    setupAddButtons();
    
    // 添加CRM导入功能
    handleCRMImport();
    
    // 初始化拖放功能
    initDragAndDrop();
    
    // 初始化设计说明面板功能
    setupDesignNotes();
});

// 设计说明面板功能
function setupDesignNotes() {
    const toggleButton = document.getElementById('toggle-design-notes');
    const closeButton = document.getElementById('close-design-notes');
    const designPanel = document.querySelector('.design-notes-panel');
    
    // 切换显示设计说明面板
    toggleButton.addEventListener('click', () => {
        designPanel.classList.toggle('active');
        
        // 更新按钮文本
        if (designPanel.classList.contains('active')) {
            toggleButton.innerHTML = '<i class="fa-solid fa-xmark"></i> 隐藏设计说明';
        } else {
            toggleButton.innerHTML = '<i class="fa-solid fa-lightbulb"></i> 显示设计说明';
        }
    });
    
    // 关闭设计说明面板
    closeButton.addEventListener('click', () => {
        designPanel.classList.remove('active');
        toggleButton.innerHTML = '<i class="fa-solid fa-lightbulb"></i> 显示设计说明';
    });
}

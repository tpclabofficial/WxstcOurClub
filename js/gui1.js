// === 全局变量 ===
let rawData = '';
let cleanedData = '';
let transformedData = '';
let currentData = [];
let currentPage = 1;
let pageSize = 10;
let headers = [];

// === 数据处理 ===
function processData() {
    const fileInput = document.getElementById('dataInput');
    const dataType = document.getElementById('dataType').value;
    
    if (!fileInput.files.length) {
        alert('请选择要处理的数据文件');
        return;
    }
    
    const file = fileInput.files[0];
    const reader = new FileReader();
    
    reader.onload = function(e) {
        rawData = e.target.result;
        headers = rawData.split('\n')[0].split(',');
        displayPaginatedData(rawData);
        buildFieldMappingUI(headers);
        
        // 清洗数据
        cleanedData = cleanData(rawData, dataType);
        updateTabContent('cleaned', cleanedData);
        
        // 转换数据
        transformedData = standardizeData(cleanedData, dataType);
        updateTabContent('transformed', transformedData);
        drawChart();
    };
    
    reader.readAsText(file);
}

function displayPaginatedData(data) {
    currentData = data.split('\n');
    currentPage = 1;
    updatePagination();
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, currentData.length);
    const pageData = currentData.slice(start, end).join('\n');
    updateTabContent('raw', pageData);
}

function updatePagination() {
    const totalPages = Math.ceil(currentData.length / pageSize);
    document.getElementById('pageInfo').innerHTML = `第 ${currentPage} 页 / 共 <span id="totalPages">${totalPages}</span> 页`;
    document.getElementById('pageSizeSelector').value = pageSize;
}

function prevPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, currentData.length);
        const pageData = currentData.slice(start, end).join('\n');
        updateTabContent('raw', pageData);
    }
}

function nextPage() {
    const totalPages = Math.ceil(currentData.length / pageSize);
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
        const start = (currentPage - 1) * pageSize;
        const end = Math.min(start + pageSize, currentData.length);
        const pageData = currentData.slice(start, end).join('\n');
        updateTabContent('raw', pageData);
    }
}

function changePageSize() {
    pageSize = parseInt(document.getElementById('pageSizeSelector').value);
    currentPage = 1;
    updatePagination();
    const start = (currentPage - 1) * pageSize;
    const end = Math.min(start + pageSize, currentData.length);
    const pageData = currentData.slice(start, end).join('\n');
    updateTabContent('raw', pageData);
}

function updateTabContent(tabId, content) {
    const preElement = document.getElementById(tabId + 'Data');
    preElement.textContent = content.substring(0, 2000);
}

function openTab(evt, tabName) {
    const tabcontent = document.getElementsByClassName("tabcontent");
    for (let i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    
    const tablinks = document.getElementsByClassName("tablink");
    for (let i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    
    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
}

// === 批量处理 ===
function processAllFiles() {
    const files = document.getElementById('batchInput').files;
    if (!files.length) {
        alert('请先选择多个文件');
        return;
    }
    
    const results = [];
    Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(e) {
            const data = e.target.result;
            results.push({name: file.name, data: data});
            if(results.length === files.length) {
                // 显示所有结果
                console.log('所有文件处理完成:', results);
                alert('批量处理完成，结果已输出到控制台');
            }
        };
        reader.readAsText(file);
    });
}

// === 字段映射 ===
function buildFieldMappingUI(headers) {
    const container = document.getElementById('mappingFields');
    container.innerHTML = '';
    headers.forEach((header, index) => {
        const div = document.createElement('div');
        div.className = 'field-mapping-row';
        div.innerHTML = `
            <label>字段 "${header}" → </label>
            <input type="text" placeholder="目标字段名" data-index="${index}">
        `;
        container.appendChild(div);
    });
}

function applyCustomMapping() {
    const inputs = document.querySelectorAll('.field-mapping-row input');
    const mapping = {};
    inputs.forEach(input => {
        const idx = input.dataset.index;
        const name = input.value.trim();
        if (name) mapping[idx] = name;
    });

    if (Object.keys(mapping).length === 0) return;

    // 应用映射逻辑（示例：CSV）
    const rows = transformedData.split('\n');
    const newRows = rows.map(row => {
        const fields = row.split(',');
        const mappedFields = Object.entries(mapping).map(([idx, newName]) => {
            return `${newName}:${fields[idx]}`;
        });
        return mappedFields.join(', ');
    });

    transformedData = newRows.join('\n');
    updateTabContent('transformed', transformedData);
    drawChart();
}

// === 数据过滤 ===
function filterData() {
    const keyword = document.getElementById('searchInput').value.toLowerCase();
    const lines = transformedData.split('\n');
    const filtered = lines.filter(line => line.toLowerCase().includes(keyword));
    updateTabContent('transformed', filtered.join('\n'));
    drawChart();
}

// === 数据导出 ===
function exportToCSV() {
    const blob = new Blob([transformedData], { type: 'text/csv' });
    downloadBlob(blob, 'processed_data.csv');
}

function exportToJSON() {
    try {
        const json = JSON.stringify(JSON.parse(transformedData), null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        downloadBlob(blob, 'processed_data.json');
    } catch {
        alert('当前数据无法转换为 JSON 格式');
    }
}

function exportToTXT() {
    const blob = new Blob([transformedData], { type: 'text/plain' });
    downloadBlob(blob, 'processed_data.txt');
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
}

// === 数据可视化 ===
function drawChart() {
    const ctx = document.getElementById('dataChart').getContext('2d');
    const lines = transformedData.split('\n').filter(Boolean);
    const data = lines.map(line => {
        const parts = line.split(/[\s,:]+/);
        const value = parseFloat(parts[1]);
        return isNaN(value) ? 0 : value;
    }).slice(0, 10); // 取前10个数据

    const labels = lines.map(line => {
        const parts = line.split(/[\s,:]+/);
        return parts[0];
    }).slice(0, 10);

    const maxValue = Math.max(...data);
    const barWidth = 40;
    const spacing = 20;
    let x = 50;

    ctx.clearRect(0, 0, 600, 300);
    ctx.fillStyle = '#00c6ff';
    ctx.font = '12px Arial';

    data.forEach((value, i) => {
        const height = (value / maxValue) * 200;
        ctx.fillRect(x, 300 - height, barWidth, height);
        ctx.fillText(labels[i], x, 300 + 10);
        x += barWidth + spacing;
    });
}

// === 页面初始化 ===
document.addEventListener('DOMContentLoaded', function() {
    document.querySelector('.tablink').click();
});
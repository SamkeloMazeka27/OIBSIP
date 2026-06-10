// ========== DOM ELEMENTS ==========
const taskInput = document.getElementById('taskInput');
const addTaskBtn = document.getElementById('addTaskBtn');
const pendingTasksList = document.getElementById('pendingTasksList');
const completedTasksList = document.getElementById('completedTasksList');
const totalTasksSpan = document.getElementById('totalTasks');
const pendingCountSpan = document.getElementById('pendingCount');
const completedCountSpan = document.getElementById('completedCount');
const pendingBadge = document.getElementById('pendingBadge');
const completedBadge = document.getElementById('completedBadge');

// ========== TASKS ARRAY ==========
let tasks = [];

// ========== TOAST NOTIFICATION FUNCTION ==========
function showToast(message, type = 'success') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Set icon based on type
    let icon = '';
    if (type === 'success') icon = '✓';
    if (type === 'error') icon = '✗';
    if (type === 'info') icon = 'ℹ';
    if (type === 'warning') icon = '⚠';
    
    toast.innerHTML = `
        <span class="toast-icon">${icon}</span>
        <span class="toast-message">${message}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Trigger animation
    setTimeout(() => {
        toast.classList.add('show');
    }, 10);
    
    // Remove after 3 seconds
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => {
            toast.remove();
        }, 300);
    }, 3000);
}

// ========== LOAD FROM LOCAL STORAGE ==========
function loadTasks() {
    const savedTasks = localStorage.getItem('todoTasks');
    if (savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    renderAllTasks();
}

// ========== SAVE TO LOCAL STORAGE ==========
function saveTasks() {
    localStorage.setItem('todoTasks', JSON.stringify(tasks));
}

// ========== UPDATE STATS ==========
function updateStats() {
    const total = tasks.length;
    const pending = tasks.filter(task => !task.completed).length;
    const completed = tasks.filter(task => task.completed).length;
    
    totalTasksSpan.textContent = total;
    pendingCountSpan.textContent = pending;
    completedCountSpan.textContent = completed;
    pendingBadge.textContent = pending;
    completedBadge.textContent = completed;
}

// ========== FORMAT DATE ==========
function formatDate() {
    const now = new Date();
    return now.toLocaleDateString() + ' ' + now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// ========== ADD NEW TASK ==========
function addTask() {
    const taskText = taskInput.value.trim();
    
    if (taskText === '') {
        showToast('Please enter a task', 'error');
        return;
    }
    
    const newTask = {
        id: Date.now(),
        text: taskText,
        completed: false,
        createdAt: formatDate(),
        completedAt: null
    };
    
    tasks.push(newTask);
    taskInput.value = '';
    saveTasks();
    renderAllTasks();
    showToast(`Task "${taskText}" added successfully`, 'success');
}

// ========== DELETE TASK ==========
function deleteTask(id) {
    const task = tasks.find(t => t.id === id);
    const taskText = task ? task.text : '';
    
    tasks = tasks.filter(task => task.id !== id);
    saveTasks();
    renderAllTasks();
    showToast(`Task "${taskText}" deleted`, 'warning');
}

// ========== TOGGLE COMPLETE ==========
function toggleComplete(id) {
    const task = tasks.find(task => task.id === id);
    if (task) {
        task.completed = !task.completed;
        task.completedAt = task.completed ? formatDate() : null;
        saveTasks();
        renderAllTasks();
        
        if (task.completed) {
            showToast(`Task "${task.text}" marked as completed`, 'success');
        } else {
            showToast(`Task "${task.text}" moved back to pending`, 'info');
        }
    }
}

// ========== EDIT TASK ==========
function editTask(id, newText) {
    const task = tasks.find(task => task.id === id);
    const oldText = task ? task.text : '';
    
    if (task && newText.trim() !== '') {
        task.text = newText.trim();
        saveTasks();
        renderAllTasks();
        showToast(`Task updated from "${oldText}" to "${newText}"`, 'success');
    }
}

// ========== RENDER TASKS ==========
function renderAllTasks() {
    const pendingTasks = tasks.filter(task => !task.completed);
    const completedTasks = tasks.filter(task => task.completed);
    
    updateStats();
    
    if (pendingTasks.length === 0) {
        pendingTasksList.innerHTML = `
            <div class="empty-state">
                <p>No pending tasks</p>
                <small>Add a new task to get started</small>
            </div>
        `;
    } else {
        pendingTasksList.innerHTML = pendingTasks.map(task => renderTaskItem(task)).join('');
    }
    
    if (completedTasks.length === 0) {
        completedTasksList.innerHTML = `
            <div class="empty-state">
                <p>No completed tasks</p>
                <small>Complete tasks to see them here</small>
            </div>
        `;
    } else {
        completedTasksList.innerHTML = completedTasks.map(task => renderTaskItem(task)).join('');
    }
    
    attachEventListeners();
}

// ========== RENDER SINGLE TASK ITEM ==========
function renderTaskItem(task) {
    return `
        <div class="task-item" data-id="${task.id}">
            <div class="task-content">
                <div class="task-title ${task.completed ? 'completed-text' : ''}">${escapeHtml(task.text)}</div>
                <div class="task-meta">
                    <span>Added: ${task.createdAt}</span>
                    ${task.completedAt ? `<span>Completed: ${task.completedAt}</span>` : ''}
                </div>
            </div>
            <div class="task-actions">
                <button class="task-btn complete-btn" data-action="complete">${task.completed ? '↩️' : '✓'}</button>
                <button class="task-btn edit-btn" data-action="edit">✎</button>
                <button class="task-btn delete-btn" data-action="delete">🗑</button>
            </div>
        </div>
    `;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function attachEventListeners() {
    document.querySelectorAll('[data-action="complete"]').forEach(btn => {
        btn.removeEventListener('click', handleComplete);
        btn.addEventListener('click', handleComplete);
    });
    
    document.querySelectorAll('[data-action="edit"]').forEach(btn => {
        btn.removeEventListener('click', handleEdit);
        btn.addEventListener('click', handleEdit);
    });
    
    document.querySelectorAll('[data-action="delete"]').forEach(btn => {
        btn.removeEventListener('click', handleDelete);
        btn.addEventListener('click', handleDelete);
    });
}

function handleComplete(e) {
    e.stopPropagation();
    const taskItem = e.currentTarget.closest('.task-item');
    const taskId = parseInt(taskItem.dataset.id);
    toggleComplete(taskId);
}

function handleEdit(e) {
    e.stopPropagation();
    const taskItem = e.currentTarget.closest('.task-item');
    const taskId = parseInt(taskItem.dataset.id);
    const task = tasks.find(t => t.id === taskId);
    
    const taskContent = taskItem.querySelector('.task-content');
    const originalText = task.text;
    
    taskContent.innerHTML = `
        <input type="text" class="edit-input" value="${escapeHtml(originalText)}">
        <div style="margin-top: 8px; display: flex; gap: 8px;">
            <button class="save-edit">Save</button>
            <button class="cancel-edit">Cancel</button>
        </div>
    `;
    
    const editInput = taskContent.querySelector('.edit-input');
    editInput.focus();
    
    const saveBtn = taskContent.querySelector('.save-edit');
    const cancelBtn = taskContent.querySelector('.cancel-edit');
    
    saveBtn.addEventListener('click', () => {
        const newText = editInput.value.trim();
        if (newText) {
            editTask(taskId, newText);
        } else {
            showToast('Task cannot be empty', 'error');
            renderAllTasks();
        }
    });
    
    cancelBtn.addEventListener('click', () => {
        renderAllTasks();
    });
    
    editInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            const newText = editInput.value.trim();
            if (newText) {
                editTask(taskId, newText);
            }
        }
    });
}

function handleDelete(e) {
    e.stopPropagation();
    const taskItem = e.currentTarget.closest('.task-item');
    const taskId = parseInt(taskItem.dataset.id);
    deleteTask(taskId);
}

addTaskBtn.addEventListener('click', addTask);
taskInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        addTask();
    }
});

loadTasks();
// TODO:
// nao sei kkkkkkkkkk to maluco ja de sono segunda 3:31am



// estado das tarefas
let tasks = loadTasks();

// salvar tarefas no localStorage
function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}
// carregar tarefas do localStorage
function loadTasks() {
    const data = localStorage.getItem('tasks');
    return data ? JSON.parse(data) : [];
}

// criar tarefa:
// cada tarefa tem seu id, título, descrição, e seu status
function createTask(title, description = '') {
    return {
        id: Date.now(), // usar timestamp como id pq sim
        title,
        description,
        status: 'todo'
    };
}

// renderizar na tela as tarefas de acordo com seu status
// sempre que o status muda > chamar render()
function render() {
    document.querySelectorAll('.column').forEach(column => {
        const status = column.dataset.status;
        const taskList = column.querySelector('.task-list');

        const filteredTasks = tasks.filter(t => t.status === status);

        taskList.innerHTML = filteredTasks.map(task => `
            <div class="task" draggable="true" data-id="${task.id}">
                <div class="task-title">${task.title}</div>
                ${task.description ? `<div class="task-desc">${task.description}</div>` : ''}
                <div class="task-actions">
                    <button class="btn-edit" data-id="${task.id}" title="Editar">✏️</button>
                    <button class="btn-delete" data-id="${task.id}" title="Excluir">🗑️</button>
                </div>
            </div>
        `).join('');
    });
    initTaskEvents();
}

// setup eventos: drag&drop, edit, delete
let draggedId = null;
let draggedEl = null;

function initTaskEvents() {
    document.querySelectorAll('.task').forEach(taskEl => {
        taskEl.addEventListener('dragstart', e => {
            draggedId = Number(taskEl.dataset.id);
            draggedEl = taskEl;
            taskEl.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        taskEl.addEventListener('dragend', () => {
            taskEl.classList.remove('dragging');
            draggedEl = null;
        });

        taskEl.addEventListener('dragover', e => {
            e.preventDefault();
            e.stopPropagation();
            taskEl.classList.add('drag-target');
        });
        taskEl.addEventListener('dragleave', () => {
            taskEl.classList.remove('drag-target');
        });

        taskEl.addEventListener('drop', e => {
            e.preventDefault();
            e.stopPropagation();
            taskEl.classList.remove('drag-target');

            const targetId = Number(taskEl.dataset.id);
            if (draggedId === targetId) {
                return;
            }

            const fromIndex = tasks.findIndex(t => t.id === draggedId);
            const toIndex   = tasks.findIndex(t => t.id === targetId);

            const [removed] = tasks.splice(fromIndex, 1);
            tasks.splice(toIndex, 0, removed);

            removed.status = tasks[toIndex + 1]?.status || taskEl.closest('.column').dataset.status;

            saveTasks();
            render();
            draggedId = null;
        });

        taskEl.querySelector('.btn-edit').addEventListener('click', () => {
            openModal(Number(taskEl.dataset.id));
        });
        taskEl.querySelector('.btn-delete').addEventListener('click', () => {
            openConfirm(Number(taskEl.dataset.id));
        });
    });
}

function openConfirm(taskId) {
    const modal = document.getElementById('confirmModal');
    modal.dataset.deleteId = taskId;
    modal.classList.add('open');
}

function closeConfirm() {
    document.getElementById('confirmModal').classList.remove('open');
}

function deleteTask() {
    const modal = document.getElementById('confirmModal');
    const id = Number(modal.dataset.deleteId);
    tasks = tasks.filter(t => t.id !== id);
    saveTasks();
    render();
    closeConfirm();
}

function dragAndDrop() {
    document.querySelectorAll('.column').forEach(column => {
        column.addEventListener('dragover', e => {
            e.preventDefault();
            column.classList.add('drag-over');
        });
        column.addEventListener('dragleave', e => {
            if (!column.contains(e.relatedTarget)) {
                column.classList.remove('drag-over');
            }
        });

        column.addEventListener('drop', e => {
            e.preventDefault();
            column.classList.remove('drag-over');

            if (draggedId === null) {
                return;
            }

            const task = tasks.find(t => t.id === draggedId);
            if (task) {
                task.status = column.dataset.status;
                saveTasks();
                render();
            }
            draggedId = null;
        });
    });
}

// modal
function openModal(taskId = null) {
    const modal = document.getElementById('taskModal');
    const titleInput = document.getElementById('modalTitle');
    const descInput = document.getElementById('modalDesc');
    const heading = document.getElementById('modalHeading');

    if (taskId) {
        const task = tasks.find(t => t.id === taskId);
        titleInput.value = task.title;
        descInput.value = task.description;
        heading.textContent = 'Editar tarefa';
        modal.dataset.editId = taskId;
    } else {
        titleInput.value = '';
        descInput.value = '';
        heading.textContent = 'Nova tarefa';
        delete modal.dataset.editId;
    }
    modal.classList.add('open');
    titleInput.focus();
}

function closeModal() {
    document.getElementById('taskModal').classList.remove('open');
}

function saveModal() {
    const modal = document.getElementById('taskModal');
    const title = document.getElementById('modalTitle').value.trim();
    const description = document.getElementById('modalDesc').value.trim();

    if (!title) {
        const input = document.getElementById('modalTitle');
        input.classList.add('error');
        input.placeholder = 'O título é obrigatório!';
        input.focus();
        return;
    }

    if (modal.dataset.editId) {
        const id = Number(modal.dataset.editId);
        const task = tasks.find(t => t.id === id);
        task.title = title;
        task.description = description;
    } else {
        tasks.push(createTask(title, description));
    }

    saveTasks();
    render();
    closeModal();
}

// INIT:
function init() {
    document.getElementById('addTaskBtn').addEventListener('click', () => openModal());

    document.getElementById('modalSave').addEventListener('click', saveModal);
    document.getElementById('modalCancel').addEventListener('click', closeModal);
    document.getElementById('taskModal').addEventListener('click', e => {
        if (e.target.id === 'taskModal') closeModal();
    });

    document.getElementById('confirmDelete').addEventListener('click', deleteTask);
    document.getElementById('confirmCancel').addEventListener('click', closeConfirm);
    document.getElementById('confirmModal').addEventListener('click', e => {
        if (e.target.id === 'confirmModal') closeConfirm();
    });

    document.addEventListener('keydown', e => {
        if (e.key === 'Escape') { closeModal(); closeConfirm(); }
        if (e.key === 'Enter') saveModal();
    });

    document.getElementById('modalTitle').addEventListener('input', e => {
        e.target.classList.remove('error');
        e.target.placeholder = 'Título da tarefa *';
    });

    dragAndDrop();
    render();
}

document.addEventListener('DOMContentLoaded', init);
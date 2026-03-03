// TODO:
// darkmode
// sub tasks



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
        id: Date.now(), // usar timestamp como id pq sim -> futuramente criar uma função aonde o usuário possa ver a timestamp de criação da sua tarefa
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
                    <button class="btn-edit" data-id="${task.id}" title="Editar"><svg width="16px" height="16px" viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" aria-hidden="true" role="img" class="iconify iconify--emojione" preserveAspectRatio="xMidYMid meet"><path fill="#ffce31" d="M7.934 41.132L39.828 9.246l14.918 14.922l-31.895 31.886z"></path><path d="M61.3 4.6l-1.9-1.9C55.8-.9 50-.9 46.3 2.7l-6.5 6.5l15 15l6.5-6.5c3.6-3.6 3.6-9.5 0-13.1" fill="#ed4c5c"></path><path fill="#93a2aa" d="M35.782 13.31l4.1-4.102l14.92 14.92l-4.1 4.101z"></path><path fill="#c7d3d8" d="M37.338 14.865l4.1-4.101l11.739 11.738l-4.102 4.1z"></path><path fill="#fed0ac" d="M7.9 41.1l-6.5 17l4.5 4.5l17-6.5z"></path><path d="M.3 61.1c-.9 2.4.3 3.5 2.7 2.6l8.2-3.1l-7.7-7.7l-3.2 8.2" fill="#333"></path><path fill="#ffdf85" d="M7.89 41.175l27.86-27.86l4.95 4.95l-27.86 27.86z"></path><path fill="#ff8736" d="M17.904 51.142l27.86-27.86l4.95 4.95l-27.86 27.86z"></path></svg></button>
                    <button class="btn-delete" data-id="${task.id}" title="Excluir"><svg width="16px" height"16px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"
                    viewBox="0 0 280.028 280.028" style="enable-background:new 0 0 280.028 280.028;" xml:space="preserve">
               <g>
                   <path style="fill:#CCD0D2;" d="M39.379,70.007v192.519c0,9.661,7.841,17.502,17.502,17.502h166.266
                       c9.661,0,17.502-7.841,17.502-17.502V70.007H39.379z"/>
                   <path style="fill:#CCD0D2;" d="M100.635,0h78.758c9.661,0,17.502,7.841,17.502,17.502v17.502h-17.502v-8.751
                       c0-4.83-3.912-8.751-8.751-8.751h-61.256c-4.839,0-8.751,3.92-8.751,8.751v8.751H83.133V17.502C83.133,7.841,90.974,0,100.635,0z"
                       />
                   <path style="fill:#AEB1B3;" d="M74.382,240.648c0,7.254,5.881,13.126,13.126,13.126c7.246,0,13.126-5.872,13.126-13.126V113.49
                       H74.382V240.648z M179.393,113.49v127.159c0,7.246,5.881,13.126,13.126,13.126c7.246,0,13.126-5.881,13.126-13.126V113.49H179.393z
                        M126.887,240.648c0,7.246,5.881,13.126,13.126,13.126c7.246,0,13.126-5.881,13.126-13.126V113.49h-26.253L126.887,240.648
                       L126.887,240.648z"/>
                   <path style="fill:#AEB1B3;" d="M39.379,78.758h201.27V96.26H39.379V78.758z"/>
                   <path style="fill:#D1D5D7;" d="M39.379,35.003h201.27c9.661,0,17.502,7.841,17.502,17.502v26.253H21.877V52.505
                       C21.877,42.844,29.718,35.003,39.379,35.003z"/>
               </g>
               </svg>
               </button>
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
            const toIndex = tasks.findIndex(t => t.id === targetId);

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
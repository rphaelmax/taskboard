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
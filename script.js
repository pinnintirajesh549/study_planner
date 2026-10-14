/**
 * ==============================================================================
 * CAMPUS BUDDY - STUDENT TASK MANAGER
 * JavaScript Logic for Task Management
 * ==============================================================================
 */

(function() {
  // If already initialized by inline script, do not run a second time
  if (window.campusBuddyInitialized) return;
  window.campusBuddyInitialized = true;

  // 1. SELECT DOM (HTML) ELEMENTS
  const taskForm = document.getElementById("taskForm");
  const taskTitleInput = document.getElementById("taskTitle");
  const taskDueDateInput = document.getElementById("taskDueDate");
  const taskCategoryInput = document.getElementById("taskCategory");
  const taskPriorityInput = document.getElementById("taskPriority");
  const taskListContainer = document.getElementById("taskList");
  const emptyState = document.getElementById("emptyState");
  const filterButtons = document.querySelectorAll(".filter-btn");

  // Counter elements
  const totalTasksCount = document.getElementById("totalTasksCount");
  const pendingTasksCount = document.getElementById("pendingTasksCount");
  const completedTasksCount = document.getElementById("completedTasksCount");
  const currentDateText = document.getElementById("currentDateText");

  // 2. STATE (DATA) MANAGEMENT
  let tasks = JSON.parse(localStorage.getItem("campusBuddyTasks")) || [];
  let currentFilter = "all"; // 'all', 'pending', 'completed'

  // Set today's date in header and default input date
  function setupDates() {
    const today = new Date();
    const options = { month: "short", day: "numeric", year: "numeric" };
    currentDateText.textContent = today.toLocaleDateString("en-US", options);

    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    taskDueDateInput.value = `${yyyy}-${mm}-${dd}`;
  }

  // Save tasks array to the browser's local storage
  function saveTasks() {
    localStorage.setItem("campusBuddyTasks", JSON.stringify(tasks));
  }

  // 3. CORE FUNCTIONS

  // Update top count badges
  function updateStats() {
    const total = tasks.length;
    const completed = tasks.filter((t) => t.isCompleted).length;
    const pending = total - completed;

    totalTasksCount.textContent = total;
    completedTasksCount.textContent = completed;
    pendingTasksCount.textContent = pending;
  }

  // Add new task
  function addTask(event) {
    event.preventDefault();

    const title = taskTitleInput.value.trim();
    const dueDate = taskDueDateInput.value;
    const category = taskCategoryInput.value;
    const priority = taskPriorityInput.value;

    if (!title || !dueDate) {
      alert("Please fill in both the task name and the due date!");
      return;
    }

    const newTask = {
      id: Date.now().toString(),
      title: title,
      dueDate: dueDate,
      category: category,
      priority: priority,
      isCompleted: false,
      createdAt: new Date().toISOString(),
    };

    tasks.unshift(newTask);
    saveTasks();
    renderTasks();
    updateStats();

    taskTitleInput.value = "";
    taskTitleInput.focus();
  }

  // Toggle completion
  function toggleTask(id) {
    tasks = tasks.map((task) => {
      if (task.id === id) {
        return { ...task, isCompleted: !task.isCompleted };
      }
      return task;
    });

    saveTasks();
    renderTasks();
    updateStats();
  }

  // Delete task
  function deleteTask(id) {
    const confirmDelete = confirm("Are you sure you want to delete this task?");
    if (!confirmDelete) return;

    tasks = tasks.filter((task) => task.id !== id);
    saveTasks();
    renderTasks();
    updateStats();
  }

  // Format date for display
  function formatDisplayDate(dateStr) {
    if (!dateStr) return "";
    const parts = dateStr.split("-");
    if (parts.length === 3) {
      const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
      return dateObj.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    return dateStr;
  }

  // Check overdue
  function isDateOverdue(dateStr, isCompleted) {
    if (isCompleted || !dateStr) return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const parts = dateStr.split("-");
    const dueDate = new Date(parts[0], parts[1] - 1, parts[2]);
    return dueDate < today;
  }

  // Render task list
  function renderTasks() {
    taskListContainer.innerHTML = "";

    const filteredTasks = tasks.filter((task) => {
      if (currentFilter === "pending") return !task.isCompleted;
      if (currentFilter === "completed") return task.isCompleted;
      return true;
    });

    if (filteredTasks.length === 0) {
      emptyState.classList.add("show");
    } else {
      emptyState.classList.remove("show");
    }

    filteredTasks.forEach((task) => {
      const taskItem = document.createElement("div");
      taskItem.className = `task-item ${task.isCompleted ? "completed" : ""}`;

      const overdue = isDateOverdue(task.dueDate, task.isCompleted);
      const priorityClass = `priority-${task.priority.toLowerCase()}`;

      taskItem.innerHTML = `
        <div class="task-left">
          <input 
            type="checkbox" 
            class="custom-checkbox" 
            ${task.isCompleted ? "checked" : ""} 
            title="Mark task as ${task.isCompleted ? "pending" : "completed"}"
          />
          <div class="task-details">
            <span class="task-title">${escapeHTML(task.title)}</span>
            <div class="task-meta">
              <span class="task-badge category-badge">
                ${escapeHTML(task.category)}
              </span>
              <span class="task-badge ${priorityClass}">
                ${escapeHTML(task.priority)}
              </span>
              <span class="date-badge ${overdue ? "overdue" : ""}">
                <i class="fa-regular fa-clock"></i> 
                ${overdue ? "Overdue: " : "Due: "} ${formatDisplayDate(task.dueDate)}
              </span>
            </div>
          </div>
        </div>
        <div class="task-actions">
          <button class="btn-icon-danger delete-btn" title="Delete task">
            <i class="fa-regular fa-trash-can"></i>
          </button>
        </div>
      `;

      const checkbox = taskItem.querySelector(".custom-checkbox");
      checkbox.addEventListener("change", () => toggleTask(task.id));

      const deleteBtn = taskItem.querySelector(".delete-btn");
      deleteBtn.addEventListener("click", () => deleteTask(task.id));

      taskListContainer.appendChild(taskItem);
    });
  }

  function escapeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  // 4. EVENT LISTENERS
  taskForm.addEventListener("submit", addTask);

  filterButtons.forEach((btn) => {
    btn.addEventListener("click", () => {
      filterButtons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      currentFilter = btn.dataset.filter;
      renderTasks();
    });
  });

  // INITIALIZE APP
  setupDates();
  renderTasks();
  updateStats();
})();

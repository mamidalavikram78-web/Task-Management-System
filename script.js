/**
 * ==============================================================================
 * TASK MANAGEMENT SYSTEM (TaskFlow)
 * Vanilla JavaScript (ES6+) Implementation for College Project Review
 * ==============================================================================
 * Architecture Overview:
 * 1. StorageService: Handles localStorage operations and data serialization
 * 2. TaskModel: Business logic, sample initial data generation & date utilities
 * 3. AppState: Centralized state store for tasks, filters, views, and settings
 * 4. UIController: DOM rendering, modal handling, animations, toasts & event binding
 * ==============================================================================
 */

// Strict mode for cleaner code and prevention of accidental global variables
'use strict';

/* ==============================================================================
   1. STORAGE SERVICE (LocalStorage API Wrapper)
   ============================================================================== */
const StorageService = {
  KEYS: {
    TASKS: 'taskflow_tasks',
    THEME: 'taskflow_theme',
    COMPACT: 'taskflow_compact'
  },

  /**
   * Retrieves tasks from localStorage. Returns null if no record exists.
   */
  loadTasks() {
    try {
      const data = localStorage.getItem(this.KEYS.TASKS);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Error reading tasks from LocalStorage:', error);
      return null;
    }
  },

  /**
   * Saves task collection to localStorage as JSON string.
   */
  saveTasks(tasks) {
    try {
      localStorage.setItem(this.KEYS.TASKS, JSON.stringify(tasks));
      return true;
    } catch (error) {
      console.error('Error writing tasks to LocalStorage:', error);
      return false;
    }
  },

  /**
   * Retrieves theme preference ('light' | 'dark').
   */
  loadTheme() {
    return localStorage.getItem(this.KEYS.THEME) || 'light';
  },

  /**
   * Persists theme preference.
   */
  saveTheme(theme) {
    localStorage.setItem(this.KEYS.THEME, theme);
  },

  /**
   * Retrieves compact view boolean setting.
   */
  loadCompactSetting() {
    return localStorage.getItem(this.KEYS.COMPACT) === 'true';
  },

  /**
   * Persists compact view boolean setting.
   */
  saveCompactSetting(isCompact) {
    localStorage.setItem(this.KEYS.COMPACT, isCompact ? 'true' : 'false');
  },

  /**
   * Erases all tasks from localStorage.
   */
  clearAllTasks() {
    localStorage.removeItem(this.KEYS.TASKS);
  }
};

/* ==============================================================================
   2. DATE UTILITIES & HELPER FUNCTIONS
   ============================================================================== */
const DateUtils = {
  /**
   * Formats a Date object to YYYY-MM-DD for standard input[type="date"]
   */
  formatISODate(date) {
    const d = new Date(date);
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${d.getFullYear()}-${month}-${day}`;
  },

  /**
   * Returns today's date formatted as YYYY-MM-DD
   */
  getTodayISO() {
    return this.formatISODate(new Date());
  },

  /**
   * Returns a future or past date formatted as YYYY-MM-DD relative to today
   */
  getOffsetDateISO(dayOffset) {
    const d = new Date();
    d.setDate(d.getDate() + dayOffset);
    return this.formatISODate(d);
  },

  /**
   * Formats current date for display in the header (e.g. "Tuesday, Oct 6, 2026")
   */
  formatHeaderDate() {
    const options = { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' };
    return new Date().toLocaleDateString('en-US', options);
  },

  /**
   * Formats a YYYY-MM-DD string into a human readable label with status info
   * (e.g. "Overdue", "Today", "Tomorrow", "Oct 12")
   */
  getDueStatus(isoString) {
    if (!isoString) return { label: 'No date', className: '' };

    const todayStr = this.getTodayISO();
    const tomorrowStr = this.getOffsetDateISO(1);
    const yesterdayStr = this.getOffsetDateISO(-1);

    if (isoString === todayStr) {
      return { label: 'Due Today', className: 'is-today' };
    }
    if (isoString === tomorrowStr) {
      return { label: 'Tomorrow', className: '' };
    }
    if (isoString < todayStr) {
      return { label: 'Overdue', className: 'is-overdue' };
    }

    // Format future date (e.g., "Oct 15")
    const parts = isoString.split('-');
    if (parts.length === 3) {
      const d = new Date(parts[0], parts[1] - 1, parts[2]);
      const formatted = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { label: formatted, className: '' };
    }

    return { label: isoString, className: '' };
  }
};

/* ==============================================================================
   3. SAMPLE DATA GENERATOR
   Realistic pre-populated tasks for college demonstration
   ============================================================================== */
function getInitialSampleTasks() {
  return [
    {
      id: 'task_' + (Date.now() - 5000),
      title: 'Complete Frontend Assignment',
      description: 'Implement responsive layout, modern CSS components, and event handling for the web lab assignment.',
      dueDate: DateUtils.getTodayISO(),
      priority: 'High',
      category: 'College',
      completed: false,
      important: true,
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
    },
    {
      id: 'task_' + (Date.now() - 4000),
      title: 'Study JavaScript Concepts',
      description: 'Revise ES6+ syntax, asynchronous programming, closures, and DOM manipulation APIs.',
      dueDate: DateUtils.getOffsetDateISO(1),
      priority: 'High',
      category: 'Coding',
      completed: false,
      important: true,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: 'task_' + (Date.now() - 3000),
      title: 'Submit College Assignment',
      description: 'Upload verified source code and project documentation PDF to the college portal.',
      dueDate: DateUtils.getOffsetDateISO(2),
      priority: 'Medium',
      category: 'College',
      completed: false,
      important: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    },
    {
      id: 'task_' + (Date.now() - 2000),
      title: 'Prepare for Upcoming Exam',
      description: 'Go through previous year question papers and solve practice problem sets.',
      dueDate: DateUtils.getOffsetDateISO(4),
      priority: 'High',
      category: 'College',
      completed: false,
      important: true,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
    },
    {
      id: 'task_' + (Date.now() - 1000),
      title: 'Review Project Documentation',
      description: 'Verify system architecture diagram, feature checklist, and setup instructions in README.',
      dueDate: DateUtils.getOffsetDateISO(-1),
      priority: 'Low',
      category: 'Presentation',
      completed: true,
      important: false,
      createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
    }
  ];
}

/* ==============================================================================
   4. CENTRAL APPLICATION STATE
   ============================================================================== */
const AppState = {
  tasks: [],
  currentView: 'dashboard', // 'dashboard' | 'tasks' | 'settings'
  filters: {
    status: 'all',          // 'all' | 'pending' | 'completed' | 'important'
    priority: 'all',        // 'all' | 'High' | 'Medium' | 'Low'
    category: 'all',        // 'all' | 'College' | 'Coding' | 'Work' | 'Personal' | 'Presentation'
    searchQuery: '',
    sortBy: 'date-asc'      // 'date-asc' | 'date-desc' | 'priority-desc' | 'title-asc' | 'created-desc'
  },
  theme: 'light',
  isCompactView: false,

  /**
   * Initializes application state from localStorage or sets sample data
   */
  init() {
    const storedTasks = StorageService.loadTasks();
    const hasOldSampleTasks = storedTasks && storedTasks.some(t => t.title === 'Complete Frontend Project');
    if (storedTasks && Array.isArray(storedTasks) && !hasOldSampleTasks) {
      this.tasks = storedTasks;
    } else {
      this.tasks = getInitialSampleTasks();
      StorageService.saveTasks(this.tasks);
    }

    this.theme = StorageService.loadTheme();
    this.isCompactView = StorageService.loadCompactSetting();
  },

  /**
   * Persists current tasks to storage
   */
  persist() {
    StorageService.saveTasks(this.tasks);
  },

  /**
   * Computes statistics dynamically based on current task list
   */
  getStats() {
    const total = this.tasks.length;
    const completed = this.tasks.filter(t => t.completed).length;
    const pending = total - completed;
    const important = this.tasks.filter(t => t.important).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    return { total, pending, completed, important, percentage };
  },

  /**
   * Adds a new task to state
   */
  addTask(taskData) {
    const newTask = {
      id: 'task_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      title: taskData.title.trim(),
      description: (taskData.description || '').trim(),
      dueDate: taskData.dueDate,
      priority: taskData.priority,
      category: taskData.category,
      completed: false,
      important: !!taskData.important,
      createdAt: new Date().toISOString()
    };
    this.tasks.unshift(newTask);
    this.persist();
    return newTask;
  },

  /**
   * Updates an existing task
   */
  updateTask(taskId, updatedFields) {
    const index = this.tasks.findIndex(t => t.id === taskId);
    if (index !== -1) {
      this.tasks[index] = {
        ...this.tasks[index],
        ...updatedFields
      };
      this.persist();
      return this.tasks[index];
    }
    return null;
  },

  /**
   * Deletes a task by ID
   */
  deleteTask(taskId) {
    const initialLen = this.tasks.length;
    this.tasks = this.tasks.filter(t => t.id !== taskId);
    if (this.tasks.length !== initialLen) {
      this.persist();
      return true;
    }
    return false;
  },

  /**
   * Toggles task completion state
   */
  toggleCompleted(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.completed = !task.completed;
      this.persist();
      return task;
    }
    return null;
  },

  /**
   * Toggles task important / starred state
   */
  toggleImportant(taskId) {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.important = !task.important;
      this.persist();
      return task;
    }
    return null;
  },

  /**
   * Returns filtered and sorted tasks according to active filter state
   */
  getFilteredTasks() {
    let result = [...this.tasks];

    // 1. Status Filter
    if (this.filters.status === 'pending') {
      result = result.filter(t => !t.completed);
    } else if (this.filters.status === 'completed') {
      result = result.filter(t => t.completed);
    } else if (this.filters.status === 'important') {
      result = result.filter(t => t.important);
    }

    // 2. Priority Filter
    if (this.filters.priority !== 'all') {
      result = result.filter(t => t.priority === this.filters.priority);
    }

    // 3. Category Filter
    if (this.filters.category !== 'all') {
      result = result.filter(t => t.category === this.filters.category);
    }

    // 4. Search Query Filter (Title, Description, Category)
    const query = (this.filters.searchQuery || '').trim().toLowerCase();
    if (query) {
      result = result.filter(t => {
        const titleMatch = t.title.toLowerCase().includes(query);
        const descMatch = (t.description || '').toLowerCase().includes(query);
        const catMatch = (t.category || '').toLowerCase().includes(query);
        return titleMatch || descMatch || catMatch;
      });
    }

    // 5. Sorting
    const priorityWeight = { 'High': 3, 'Medium': 2, 'Low': 1 };

    result.sort((a, b) => {
      switch (this.filters.sortBy) {
        case 'date-asc':
          return (a.dueDate || '9999').localeCompare(b.dueDate || '9999');
        case 'date-desc':
          return (b.dueDate || '').localeCompare(a.dueDate || '');
        case 'priority-desc':
          return (priorityWeight[b.priority] || 0) - (priorityWeight[a.priority] || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        case 'created-desc':
          return new Date(b.createdAt) - new Date(a.createdAt);
        default:
          return 0;
      }
    });

    return result;
  }
};

/* ==============================================================================
   5. UI CONTROLLER (Rendering, DOM Manipulation, Interactions)
   ============================================================================== */
const UIController = {
  // DOM Element References Cache
  elements: {},

  /**
   * Queries and caches all needed DOM elements
   */
  cacheElements() {
    this.elements = {
      // Body & Layout
      body: document.body,
      sidebar: document.getElementById('sidebar'),
      sidebarOverlay: document.getElementById('sidebarOverlay'),
      sidebarCloseBtn: document.getElementById('sidebarCloseBtn'),
      mobileMenuToggle: document.getElementById('mobileMenuToggle'),

      // Navigation Links
      navLinks: document.querySelectorAll('.nav-link'),
      navDashboard: document.getElementById('navDashboard'),
      navAllTasks: document.getElementById('navAllTasks'),
      navPending: document.getElementById('navPending'),
      navCompleted: document.getElementById('navCompleted'),
      navImportant: document.getElementById('navImportant'),
      navSettings: document.getElementById('navSettings'),

      // Badges
      badgeAll: document.getElementById('badgeAll'),
      badgePending: document.getElementById('badgePending'),
      badgeCompleted: document.getElementById('badgeCompleted'),
      badgeImportant: document.getElementById('badgeImportant'),
      sidebarProgressFill: document.getElementById('sidebarProgressFill'),
      sidebarProgressText: document.getElementById('sidebarProgressText'),

      // Header Elements
      dateText: document.getElementById('dateText'),
      globalSearchInput: document.getElementById('globalSearchInput'),
      searchClearBtn: document.getElementById('searchClearBtn'),
      quickThemeToggle: document.getElementById('quickThemeToggle'),
      headerAddTaskBtn: document.getElementById('headerAddTaskBtn'),
      sidebarAddTaskBtn: document.getElementById('sidebarAddTaskBtn'),

      // Views
      viewDashboard: document.getElementById('viewDashboard'),
      viewTasks: document.getElementById('viewTasks'),
      viewSettings: document.getElementById('viewSettings'),

      // Dashboard View Elements
      statCards: document.querySelectorAll('.stat-card'),
      statTotalCount: document.getElementById('statTotalCount'),
      statPendingCount: document.getElementById('statPendingCount'),
      statCompletedCount: document.getElementById('statCompletedCount'),
      statImportantCount: document.getElementById('statImportantCount'),
      progressHeadline: document.getElementById('progressHeadline'),
      progressSummaryText: document.getElementById('progressSummaryText'),
      dashboardCircleFill: document.getElementById('dashboardCircleFill'),
      dashboardPercentText: document.getElementById('dashboardPercentText'),
      dashboardLinearFill: document.getElementById('dashboardLinearFill'),
      todayTaskCountBadge: document.getElementById('todayTaskCountBadge'),
      upcomingTaskCountBadge: document.getElementById('upcomingTaskCountBadge'),
      dashboardTodayTaskList: document.getElementById('dashboardTodayTaskList'),
      dashboardUpcomingTaskList: document.getElementById('dashboardUpcomingTaskList'),
      dashboardRecentCompletedList: document.getElementById('dashboardRecentCompletedList'),
      dashViewAllCompletedBtn: document.getElementById('dashViewAllCompletedBtn'),

      // Tasks View Elements
      tasksViewTitle: document.getElementById('tasksViewTitle'),
      tasksViewSubtitle: document.getElementById('tasksViewSubtitle'),
      resetFiltersBtn: document.getElementById('resetFiltersBtn'),
      tasksViewAddBtn: document.getElementById('tasksViewAddBtn'),
      statusPills: document.querySelectorAll('.filter-pill'),
      priorityFilterSelect: document.getElementById('priorityFilterSelect'),
      categoryFilterSelect: document.getElementById('categoryFilterSelect'),
      sortBySelect: document.getElementById('sortBySelect'),
      filteredTasksCount: document.getElementById('filteredTasksCount'),
      activeFilterChips: document.getElementById('activeFilterChips'),
      tasksListContainer: document.getElementById('tasksListContainer'),

      // Settings View Elements
      settingDarkModeToggle: document.getElementById('settingDarkModeToggle'),
      settingCompactViewToggle: document.getElementById('settingCompactViewToggle'),
      settingReloadSampleBtn: document.getElementById('settingReloadSampleBtn'),
      settingExportTasksBtn: document.getElementById('settingExportTasksBtn'),
      importTasksFileInput: document.getElementById('importTasksFileInput'),
      settingClearAllBtn: document.getElementById('settingClearAllBtn'),

      // Add/Edit Task Modal Elements
      taskModalBackdrop: document.getElementById('taskModalBackdrop'),
      taskModalCloseBtn: document.getElementById('taskModalCloseBtn'),
      taskModalCancelBtn: document.getElementById('taskModalCancelBtn'),
      taskForm: document.getElementById('taskForm'),
      modalTitle: document.getElementById('modalTitle'),
      modalSubtitle: document.getElementById('modalSubtitle'),
      taskModalSubmitBtn: document.getElementById('taskModalSubmitBtn'),
      taskIdInput: document.getElementById('taskIdInput'),
      taskTitleInput: document.getElementById('taskTitleInput'),
      taskDescInput: document.getElementById('taskDescInput'),
      taskDueDateInput: document.getElementById('taskDueDateInput'),
      taskCategoryInput: document.getElementById('taskCategoryInput'),
      taskImportantInput: document.getElementById('taskImportantInput'),

      // Confirm Modal Elements
      confirmModalBackdrop: document.getElementById('confirmModalBackdrop'),
      confirmTitle: document.getElementById('confirmTitle'),
      confirmMessage: document.getElementById('confirmMessage'),
      confirmCancelBtn: document.getElementById('confirmCancelBtn'),
      confirmActionBtn: document.getElementById('confirmActionBtn'),

      // Toast Notification Container
      toastContainer: document.getElementById('toastContainer')
    };
  },

  /**
   * Initializes application UI, sets default values and binds events
   */
  init() {
    this.cacheElements();
    this.applyTheme(AppState.theme);
    this.applyCompactMode(AppState.isCompactView);
    this.renderHeaderDate();
    this.renderAll();
    this.bindEvents();
  },

  /**
   * Renders today's date in the header
   */
  renderHeaderDate() {
    if (this.elements.dateText) {
      this.elements.dateText.textContent = DateUtils.formatHeaderDate();
    }
  },

  /**
   * Applies the theme ('light' or 'dark') to body and updates toggles
   */
  applyTheme(theme) {
    AppState.theme = theme;
    this.elements.body.setAttribute('data-theme', theme);
    StorageService.saveTheme(theme);
    if (this.elements.settingDarkModeToggle) {
      this.elements.settingDarkModeToggle.checked = (theme === 'dark');
    }
  },

  /**
   * Applies compact view styling class to body
   */
  applyCompactMode(isCompact) {
    AppState.isCompactView = isCompact;
    if (isCompact) {
      this.elements.body.classList.add('compact-mode');
    } else {
      this.elements.body.classList.remove('compact-mode');
    }
    StorageService.saveCompactSetting(isCompact);
    if (this.elements.settingCompactViewToggle) {
      this.elements.settingCompactViewToggle.checked = isCompact;
    }
  },

  /**
   * Master render method: updates statistics, active view and lists
   */
  renderAll() {
    this.renderStatistics();
    this.renderView();
  },

  /**
   * Renders numeric statistics in cards, sidebar badges, and progress dials
   */
  renderStatistics() {
    const stats = AppState.getStats();

    // 1. Dashboard Stat Cards
    this.elements.statTotalCount.textContent = stats.total;
    this.elements.statPendingCount.textContent = stats.pending;
    this.elements.statCompletedCount.textContent = stats.completed;
    this.elements.statImportantCount.textContent = stats.important;

    // 2. Sidebar Badges
    this.elements.badgeAll.textContent = stats.total;
    this.elements.badgePending.textContent = stats.pending;
    this.elements.badgeCompleted.textContent = stats.completed;
    this.elements.badgeImportant.textContent = stats.important;

    // 3. Sidebar Progress Bar
    this.elements.sidebarProgressFill.style.width = `${stats.percentage}%`;
    this.elements.sidebarProgressText.textContent = `${stats.percentage}% tasks completed`;

    // 4. Dashboard Progress Card
    this.elements.dashboardPercentText.textContent = `${stats.percentage}%`;
    this.elements.dashboardLinearFill.style.width = `${stats.percentage}%`;
    this.elements.progressSummaryText.textContent = `${stats.completed} of ${stats.total} tasks completed`;

    // Circular SVG Progress Ring (circumference is 2 * PI * 42 ≈ 263.89)
    const maxDash = 264;
    const offset = maxDash - (stats.percentage / 100) * maxDash;
    this.elements.dashboardCircleFill.style.strokeDashoffset = offset;

    // Motivating Headline
    if (stats.total === 0) {
      this.elements.progressHeadline.textContent = "Start by adding your first task!";
    } else if (stats.percentage === 100) {
      this.elements.progressHeadline.textContent = "Outstanding! All tasks are completed!";
    } else if (stats.percentage >= 75) {
      this.elements.progressHeadline.textContent = "Almost there! Keep up the momentum.";
    } else if (stats.percentage >= 50) {
      this.elements.progressHeadline.textContent = "Halfway through! Great progress.";
    } else {
      this.elements.progressHeadline.textContent = "Keep going! You're making progress.";
    }
  },

  /**
   * Switches views and re-renders view content
   */
  renderView() {
    // Hide all view panels
    this.elements.viewDashboard.classList.remove('active');
    this.elements.viewTasks.classList.remove('active');
    this.elements.viewSettings.classList.remove('active');

    // Update active state on sidebar nav
    this.elements.navLinks.forEach(link => {
      const view = link.dataset.view;
      const filter = link.dataset.filter;

      if (AppState.currentView === 'tasks' && view === 'tasks') {
        if (filter === AppState.filters.status) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      } else if (AppState.currentView === view && !filter) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Render active view
    if (AppState.currentView === 'dashboard') {
      this.elements.viewDashboard.classList.add('active');
      this.renderDashboardSections();
    } else if (AppState.currentView === 'tasks') {
      this.elements.viewTasks.classList.add('active');
      this.renderTasksView();
    } else if (AppState.currentView === 'settings') {
      this.elements.viewSettings.classList.add('active');
    }
  },

  /**
   * Renders the 3 sections inside Dashboard: Today, Upcoming, and Recently Completed
   */
  renderDashboardSections() {
    const todayStr = DateUtils.getTodayISO();

    // 1. Today's Tasks (due today and pending, or completed today)
    const todayTasks = AppState.tasks.filter(t => t.dueDate === todayStr);
    this.elements.todayTaskCountBadge.textContent = todayTasks.length;
    this.renderTaskList(this.elements.dashboardTodayTaskList, todayTasks, 'No tasks scheduled for today. Take a breather or plan ahead!');

    // 2. Upcoming Tasks (due after today, pending)
    const upcomingTasks = AppState.tasks.filter(t => t.dueDate > todayStr && !t.completed);
    this.elements.upcomingTaskCountBadge.textContent = upcomingTasks.length;
    this.renderTaskList(this.elements.dashboardUpcomingTaskList, upcomingTasks, 'No upcoming pending tasks scheduled.');

    // 3. Recently Completed Tasks (up to 4 items)
    const completedTasks = AppState.tasks.filter(t => t.completed).slice(0, 4);
    this.renderTaskList(this.elements.dashboardRecentCompletedList, completedTasks, 'No tasks completed yet. Check off items as you finish them!');
  },

  /**
   * Renders the main Tasks View with current filter, search and sort state
   */
  renderTasksView() {
    // 1. Update Title and Subtitle
    const titleMap = {
      'all': { title: 'All Tasks', desc: 'Viewing all tasks in your productivity workspace' },
      'pending': { title: 'Pending Tasks', desc: 'Tasks waiting to be tackled and completed' },
      'completed': { title: 'Completed Tasks', desc: 'Archive of successfully completed items' },
      'important': { title: 'Important Tasks', desc: 'High-priority and starred critical tasks' }
    };

    const currentStatus = AppState.filters.status;
    this.elements.tasksViewTitle.textContent = titleMap[currentStatus]?.title || 'Tasks';
    this.elements.tasksViewSubtitle.textContent = titleMap[currentStatus]?.desc || '';

    // 2. Update Status Pills Active State
    this.elements.statusPills.forEach(pill => {
      if (pill.dataset.statusFilter === currentStatus) {
        pill.classList.add('active');
      } else {
        pill.classList.remove('active');
      }
    });

    // 3. Sync Filter Dropdowns with State
    this.elements.priorityFilterSelect.value = AppState.filters.priority;
    this.elements.categoryFilterSelect.value = AppState.filters.category;
    this.elements.sortBySelect.value = AppState.filters.sortBy;

    // 4. Query Filtered & Sorted Tasks
    const filteredTasks = AppState.getFilteredTasks();

    // 5. Update Results Count and Active Chips
    this.elements.filteredTasksCount.textContent = `Showing ${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'}`;
    this.renderFilterChips();

    // 6. Render Task List or Empty State
    this.renderTaskList(this.elements.tasksListContainer, filteredTasks, 'No tasks match your current filter criteria.', true);
  },

  /**
   * Renders active filter chips to give users clear context of active filters
   */
  renderFilterChips() {
    const container = this.elements.activeFilterChips;
    container.innerHTML = '';

    if (AppState.filters.priority !== 'all') {
      const chip = document.createElement('span');
      chip.className = 'filter-chip';
      chip.textContent = `Priority: ${AppState.filters.priority}`;
      container.appendChild(chip);
    }

    if (AppState.filters.category !== 'all') {
      const chip = document.createElement('span');
      chip.className = 'filter-chip';
      chip.textContent = `Category: ${AppState.filters.category}`;
      container.appendChild(chip);
    }

    if (AppState.filters.searchQuery.trim()) {
      const chip = document.createElement('span');
      chip.className = 'filter-chip';
      chip.textContent = `Search: "${AppState.filters.searchQuery.trim()}"`;
      container.appendChild(chip);
    }
  },

  /**
   * Renders an array of tasks into a given container element
   */
  renderTaskList(container, tasks, emptyMessage, showCreateBtnInEmpty = false) {
    container.innerHTML = '';

    if (!tasks || tasks.length === 0) {
      container.appendChild(this.createEmptyStateElement(emptyMessage, showCreateBtnInEmpty));
      return;
    }

    tasks.forEach(task => {
      const card = this.createTaskCardElement(task);
      container.appendChild(card);
    });
  },

  /**
   * Creates DOM element for a single task card
   */
  createTaskCardElement(task) {
    const card = document.createElement('article');
    card.className = `task-card ${task.completed ? 'is-completed' : ''}`;
    card.dataset.id = task.id;

    // Due date badge status
    const dueInfo = DateUtils.getDueStatus(task.dueDate);

    // Escape task text safely to avoid XSS
    const safeTitle = this.escapeHTML(task.title);
    const safeDesc = task.description ? this.escapeHTML(task.description) : '';

    card.innerHTML = `
      <!-- Checkbox -->
      <div class="task-check-wrap">
        <button class="task-checkbox-custom" data-action="toggle-complete" title="${task.completed ? 'Mark as Pending' : 'Mark as Completed'}" aria-label="Toggle Complete">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="20 6 9 17 4 12"></polyline>
          </svg>
        </button>
      </div>

      <!-- Main Content -->
      <div class="task-main">
        <div class="task-header-row">
          <h4 class="task-title" title="${safeTitle}">${safeTitle}</h4>
        </div>
        ${safeDesc ? `<p class="task-desc">${safeDesc}</p>` : ''}
        <div class="task-meta-row">
          <span class="badge badge-priority-${task.priority.toLowerCase()}">
            ${task.priority}
          </span>
          <span class="badge badge-category">
            ${task.category}
          </span>
          <span class="badge-due-date ${dueInfo.className}">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
            ${dueInfo.label}
          </span>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="task-actions">
        <!-- Star / Important Toggle -->
        <button class="btn-icon task-star-btn ${task.important ? 'is-active' : ''}" data-action="toggle-important" title="${task.important ? 'Remove from Important' : 'Mark as Important'}" aria-label="Toggle Important">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
          </svg>
        </button>

        <!-- Edit Task -->
        <button class="btn-icon task-action-btn edit-btn" data-action="edit-task" title="Edit Task" aria-label="Edit Task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>

        <!-- Delete Task -->
        <button class="btn-icon task-action-btn delete-btn" data-action="delete-task" title="Delete Task" aria-label="Delete Task">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    `;

    return card;
  },

  /**
   * Creates an empty state illustration/component
   */
  createEmptyStateElement(message, showCreateBtn = false) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = `
      <div class="empty-state-icon">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M16 16s-1.5-2-4-2-4 2-4 2"></path>
          <line x1="9" y1="9" x2="9.01" y2="9"></line>
          <line x1="15" y1="9" x2="15.01" y2="9"></line>
        </svg>
      </div>
      <h4 class="empty-state-title">No Tasks Found</h4>
      <p class="empty-state-desc">${message}</p>
      ${showCreateBtn ? `
        <button class="btn btn-primary" data-action="open-add-modal">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <line x1="12" y1="5" x2="12" y2="19"></line>
            <line x1="5" y1="12" x2="19" y2="12"></line>
          </svg>
          <span>Add New Task</span>
        </button>
      ` : ''}
    `;
    return empty;
  },

  /**
   * Opens the Add/Edit modal in "Create" mode
   */
  openAddModal() {
    this.elements.taskForm.reset();
    this.elements.taskIdInput.value = '';
    this.elements.modalTitle.textContent = 'Add New Task';
    this.elements.modalSubtitle.textContent = 'Fill in the details below to add to your task schedule.';
    this.elements.taskModalSubmitBtn.querySelector('span').textContent = 'Add Task';

    // Default due date to today or tomorrow
    this.elements.taskDueDateInput.value = DateUtils.getTodayISO();
    this.elements.taskDueDateInput.min = DateUtils.getTodayISO();

    // Default priority to Medium
    const mediumRadio = document.querySelector('input[name="taskPriority"][value="Medium"]');
    if (mediumRadio) mediumRadio.checked = true;

    // Reset validation visual states
    this.clearValidationErrors();

    this.elements.taskModalBackdrop.classList.add('is-open');
    setTimeout(() => this.elements.taskTitleInput.focus(), 100);
  },

  /**
   * Opens the Add/Edit modal populated with existing task data
   */
  openEditModal(taskId) {
    const task = AppState.tasks.find(t => t.id === taskId);
    if (!task) return;

    this.clearValidationErrors();
    this.elements.taskIdInput.value = task.id;
    this.elements.modalTitle.textContent = 'Edit Task';
    this.elements.modalSubtitle.textContent = 'Update the task parameters and save changes.';
    this.elements.taskModalSubmitBtn.querySelector('span').textContent = 'Save Changes';

    this.elements.taskTitleInput.value = task.title;
    this.elements.taskDescInput.value = task.description || '';
    this.elements.taskDueDateInput.value = task.dueDate || DateUtils.getTodayISO();
    this.elements.taskCategoryInput.value = task.category || 'College';
    this.elements.taskImportantInput.checked = !!task.important;

    // Check matching priority radio
    const radio = document.querySelector(`input[name="taskPriority"][value="${task.priority}"]`);
    if (radio) radio.checked = true;

    this.elements.taskModalBackdrop.classList.add('is-open');
    setTimeout(() => this.elements.taskTitleInput.focus(), 100);
  },

  /**
   * Closes Add/Edit modal
   */
  closeTaskModal() {
    this.elements.taskModalBackdrop.classList.remove('is-open');
    this.clearValidationErrors();
  },

  /**
   * Clears form validation error markers
   */
  clearValidationErrors() {
    this.elements.taskTitleInput.classList.remove('is-invalid');
    this.elements.taskDueDateInput.classList.remove('is-invalid');
  },

  /**
   * Validates form inputs before submission
   */
  validateTaskForm() {
    let isValid = true;
    const titleVal = this.elements.taskTitleInput.value.trim();
    const dateVal = this.elements.taskDueDateInput.value;

    if (!titleVal) {
      this.elements.taskTitleInput.classList.add('is-invalid');
      isValid = false;
    } else {
      this.elements.taskTitleInput.classList.remove('is-invalid');
    }

    if (!dateVal) {
      this.elements.taskDueDateInput.classList.add('is-invalid');
      isValid = false;
    } else {
      this.elements.taskDueDateInput.classList.remove('is-invalid');
    }

    return isValid;
  },

  /**
   * Handles task form submission for both CREATE and UPDATE operations
   */
  handleFormSubmit(e) {
    e.preventDefault();

    if (!this.validateTaskForm()) {
      return;
    }

    const taskId = this.elements.taskIdInput.value;
    const title = this.elements.taskTitleInput.value.trim();
    const description = this.elements.taskDescInput.value.trim();
    const dueDate = this.elements.taskDueDateInput.value;
    const category = this.elements.taskCategoryInput.value;
    const important = this.elements.taskImportantInput.checked;

    // Selected radio priority
    const priorityRadio = document.querySelector('input[name="taskPriority"]:checked');
    const priority = priorityRadio ? priorityRadio.value : 'Medium';

    if (taskId) {
      // UPDATE EXISTING TASK
      const updated = AppState.updateTask(taskId, {
        title,
        description,
        dueDate,
        priority,
        category,
        important
      });
      if (updated) {
        this.showToast('Task Updated', `"${title}" has been saved.`, 'success');
      }
    } else {
      // CREATE NEW TASK
      AppState.addTask({
        title,
        description,
        dueDate,
        priority,
        category,
        important
      });
      this.showToast('Task Created', `"${title}" was added to your schedule.`, 'success');
    }

    this.closeTaskModal();
    this.renderAll();
  },

  /**
   * Shows a custom confirmation modal dialog
   */
  showConfirmDialog(title, message, confirmBtnLabel, onConfirmCallback) {
    this.elements.confirmTitle.textContent = title;
    this.elements.confirmMessage.textContent = message;
    this.elements.confirmActionBtn.textContent = confirmBtnLabel;

    this.elements.confirmModalBackdrop.classList.add('is-open');

    // Remove any previously bound click handlers
    const newBtn = this.elements.confirmActionBtn.cloneNode(true);
    this.elements.confirmActionBtn.parentNode.replaceChild(newBtn, this.elements.confirmActionBtn);
    this.elements.confirmActionBtn = newBtn;

    this.elements.confirmActionBtn.addEventListener('click', () => {
      this.closeConfirmDialog();
      onConfirmCallback();
    });
  },

  /**
   * Closes confirmation dialog
   */
  closeConfirmDialog() {
    this.elements.confirmModalBackdrop.classList.remove('is-open');
  },

  /**
   * Displays modern toast notification
   */
  showToast(title, message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;

    let iconSvg = '';
    switch (type) {
      case 'success':
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>`;
        break;
      case 'danger':
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>`;
        break;
      case 'warning':
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`;
        break;
      default: // info
        iconSvg = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;
    }

    toast.innerHTML = `
      <div class="toast-icon">${iconSvg}</div>
      <div class="toast-body">
        <div class="toast-title">${title}</div>
        <div class="toast-msg">${message}</div>
      </div>
      <button class="toast-close-btn" aria-label="Dismiss toast">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="18" y1="6" x2="6" y2="18"></line>
          <line x1="6" y1="6" x2="18" y2="18"></line>
        </svg>
      </button>
    `;

    // Dismiss click
    toast.querySelector('.toast-close-btn').addEventListener('click', () => {
      this.dismissToast(toast);
    });

    this.elements.toastContainer.appendChild(toast);

    // Auto dismiss after 3.5 seconds
    setTimeout(() => {
      this.dismissToast(toast);
    }, 3500);
  },

  /**
   * Helper to fade out and remove a toast
   */
  dismissToast(toast) {
    if (!toast || !toast.parentNode) return;
    toast.classList.add('toast-hiding');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  },

  /**
   * Escapes HTML string to prevent script injection
   */
  escapeHTML(str) {
    if (!str) return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /* ==============================================================================
     6. EVENT LISTENERS SETUP
     ============================================================================== */
  bindEvents() {
    const el = this.elements;

    // --- NAVIGATION EVENTS ---
    el.navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        const targetView = link.dataset.view;
        const targetFilter = link.dataset.filter;

        AppState.currentView = targetView;
        if (targetFilter) {
          AppState.filters.status = targetFilter;
        }

        this.renderAll();

        // Close mobile drawer if open
        this.closeMobileDrawer();
      });
    });

    // Mobile Sidebar Drawer Toggle
    if (el.mobileMenuToggle) {
      el.mobileMenuToggle.addEventListener('click', () => this.openMobileDrawer());
    }
    if (el.sidebarCloseBtn) {
      el.sidebarCloseBtn.addEventListener('click', () => this.closeMobileDrawer());
    }
    if (el.sidebarOverlay) {
      el.sidebarOverlay.addEventListener('click', () => this.closeMobileDrawer());
    }

    // --- QUICK ADD TASK BUTTONS ---
    if (el.headerAddTaskBtn) {
      el.headerAddTaskBtn.addEventListener('click', () => this.openAddModal());
    }
    if (el.sidebarAddTaskBtn) {
      el.sidebarAddTaskBtn.addEventListener('click', () => this.openAddModal());
    }
    if (el.tasksViewAddBtn) {
      el.tasksViewAddBtn.addEventListener('click', () => this.openAddModal());
    }

    // --- THEME TOGGLES ---
    if (el.quickThemeToggle) {
      el.quickThemeToggle.addEventListener('click', () => {
        const nextTheme = AppState.theme === 'light' ? 'dark' : 'light';
        this.applyTheme(nextTheme);
        this.showToast('Theme Updated', `Switched to ${nextTheme} theme.`, 'info');
      });
    }

    if (el.settingDarkModeToggle) {
      el.settingDarkModeToggle.addEventListener('change', (e) => {
        const nextTheme = e.target.checked ? 'dark' : 'light';
        this.applyTheme(nextTheme);
        this.showToast('Theme Updated', `Switched to ${nextTheme} theme.`, 'info');
      });
    }

    // Compact View Setting Toggle
    if (el.settingCompactViewToggle) {
      el.settingCompactViewToggle.addEventListener('change', (e) => {
        this.applyCompactMode(e.target.checked);
        this.showToast('Display Updated', `Compact view ${e.target.checked ? 'enabled' : 'disabled'}.`, 'info');
      });
    }

    // --- STAT CARDS CLICK (Navigates directly to filtered view) ---
    el.statCards.forEach(card => {
      card.addEventListener('click', () => {
        const filter = card.dataset.filterTarget;
        AppState.currentView = 'tasks';
        AppState.filters.status = filter;
        this.renderAll();
      });
    });

    // "View All Completed" button in Dashboard
    if (el.dashViewAllCompletedBtn) {
      el.dashViewAllCompletedBtn.addEventListener('click', () => {
        AppState.currentView = 'tasks';
        AppState.filters.status = 'completed';
        this.renderAll();
      });
    }

    // --- SEARCH EVENTS ---
    el.globalSearchInput.addEventListener('input', (e) => {
      const val = e.target.value;
      AppState.filters.searchQuery = val;

      if (val.trim()) {
        el.searchClearBtn.style.display = 'flex';
      } else {
        el.searchClearBtn.style.display = 'none';
      }

      // If user is searching while in dashboard/settings, jump to tasks view automatically
      if (AppState.currentView !== 'tasks') {
        AppState.currentView = 'tasks';
      }

      this.renderAll();
    });

    el.searchClearBtn.addEventListener('click', () => {
      el.globalSearchInput.value = '';
      AppState.filters.searchQuery = '';
      el.searchClearBtn.style.display = 'none';
      this.renderAll();
    });

    // Keyboard shortcut '/' or 'Ctrl+K' for instant search focus
    window.addEventListener('keydown', (e) => {
      if ((e.ctrlKey && e.key.toLowerCase() === 'k') || (e.key === '/' && document.activeElement.tagName !== 'INPUT' && document.activeElement.tagName !== 'TEXTAREA')) {
        e.preventDefault();
        el.globalSearchInput.focus();
      }
    });

    // --- FILTER BAR EVENTS ---
    // Status Pills
    el.statusPills.forEach(pill => {
      pill.addEventListener('click', () => {
        AppState.filters.status = pill.dataset.statusFilter;
        this.renderTasksView();
      });
    });

    // Priority Select
    el.priorityFilterSelect.addEventListener('change', (e) => {
      AppState.filters.priority = e.target.value;
      this.renderTasksView();
    });

    // Category Select
    el.categoryFilterSelect.addEventListener('change', (e) => {
      AppState.filters.category = e.target.value;
      this.renderTasksView();
    });

    // Sort By Select
    el.sortBySelect.addEventListener('change', (e) => {
      AppState.filters.sortBy = e.target.value;
      this.renderTasksView();
    });

    // Reset Filters
    el.resetFiltersBtn.addEventListener('click', () => {
      AppState.filters.priority = 'all';
      AppState.filters.category = 'all';
      AppState.filters.searchQuery = '';
      AppState.filters.sortBy = 'date-asc';
      el.globalSearchInput.value = '';
      el.searchClearBtn.style.display = 'none';
      this.renderTasksView();
      this.showToast('Filters Cleared', 'All filters reset to defaults.', 'info');
    });

    // --- TASK ACTION DELEGATION (Clicks on Checkbox, Star, Edit, Delete) ---
    // Event delegation on the content body to handle dynamically created task cards efficiently
    document.getElementById('mainContent').addEventListener('click', (e) => {
      const button = e.target.closest('[data-action]');
      if (!button) return;

      const action = button.dataset.action;

      if (action === 'open-add-modal') {
        this.openAddModal();
        return;
      }

      const card = button.closest('.task-card');
      if (!card) return;

      const taskId = card.dataset.id;

      if (action === 'toggle-complete') {
        const task = AppState.toggleCompleted(taskId);
        if (task) {
          this.renderAll();
          if (task.completed) {
            this.showToast('Task Completed', `"${task.title}" has been completed! 🎉`, 'success');
          } else {
            this.showToast('Task Reopened', `"${task.title}" marked as pending.`, 'info');
          }
        }
      } else if (action === 'toggle-important') {
        const task = AppState.toggleImportant(taskId);
        if (task) {
          this.renderAll();
          this.showToast('Important Status', `"${task.title}" ${task.important ? 'marked as important ★' : 'removed from important'}.`, 'info');
        }
      } else if (action === 'edit-task') {
        this.openEditModal(taskId);
      } else if (action === 'delete-task') {
        const task = AppState.tasks.find(t => t.id === taskId);
        const title = task ? task.title : 'this task';
        this.showConfirmDialog(
          'Delete Task?',
          `Are you sure you want to delete "${title}"? This action cannot be undone.`,
          'Delete Task',
          () => {
            AppState.deleteTask(taskId);
            this.renderAll();
            this.showToast('Task Deleted', `"${title}" was removed.`, 'danger');
          }
        );
      }
    });

    // --- FORM MODAL EVENTS ---
    el.taskForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
    el.taskModalCloseBtn.addEventListener('click', () => this.closeTaskModal());
    el.taskModalCancelBtn.addEventListener('click', () => this.closeTaskModal());

    // Close on backdrop click
    el.taskModalBackdrop.addEventListener('click', (e) => {
      if (e.target === el.taskModalBackdrop) {
        this.closeTaskModal();
      }
    });

    // Close confirm on cancel or backdrop
    el.confirmCancelBtn.addEventListener('click', () => this.closeConfirmDialog());
    el.confirmModalBackdrop.addEventListener('click', (e) => {
      if (e.target === el.confirmModalBackdrop) {
        this.closeConfirmDialog();
      }
    });

    // Escape Key to close modals
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (el.taskModalBackdrop.classList.contains('is-open')) {
          this.closeTaskModal();
        }
        if (el.confirmModalBackdrop.classList.contains('is-open')) {
          this.closeConfirmDialog();
        }
      }
    });

    // --- SETTINGS VIEW ACTIONS ---
    // 1. Reload Sample Tasks
    if (el.settingReloadSampleBtn) {
      el.settingReloadSampleBtn.addEventListener('click', () => {
        this.showConfirmDialog(
          'Reload Sample Data?',
          'This will overwrite your existing task list with the initial sample tasks. Continue?',
          'Reload Sample Data',
          () => {
            AppState.tasks = getInitialSampleTasks();
            AppState.persist();
            this.renderAll();
            this.showToast('Sample Data Loaded', 'Sample tasks restored successfully.', 'success');
          }
        );
      });
    }

    // 2. Export Tasks to JSON file
    if (el.settingExportTasksBtn) {
      el.settingExportTasksBtn.addEventListener('click', () => {
        try {
          const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(AppState.tasks, null, 2));
          const downloadAnchor = document.createElement('a');
          const fileName = `taskflow-tasks-${DateUtils.getTodayISO()}.json`;
          downloadAnchor.setAttribute("href", dataStr);
          downloadAnchor.setAttribute("download", fileName);
          document.body.appendChild(downloadAnchor);
          downloadAnchor.click();
          downloadAnchor.remove();
          this.showToast('Tasks Exported', `Downloaded backup file: ${fileName}`, 'success');
        } catch (error) {
          console.error('Export error:', error);
          this.showToast('Export Failed', 'An error occurred while creating JSON backup.', 'danger');
        }
      });
    }

    // 3. Import Tasks from JSON file
    if (el.importTasksFileInput) {
      el.importTasksFileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const imported = JSON.parse(event.target.result);
            if (Array.isArray(imported)) {
              AppState.tasks = imported;
              AppState.persist();
              this.renderAll();
              this.showToast('Import Successful', `Loaded ${imported.length} tasks from backup file.`, 'success');
            } else {
              this.showToast('Import Failed', 'The selected file is not a valid task backup.', 'danger');
            }
          } catch (err) {
            console.error('Import parse error:', err);
            this.showToast('Import Failed', 'Invalid JSON file format.', 'danger');
          }
          // Reset file input value so re-importing the same file works
          el.importTasksFileInput.value = '';
        };
        reader.readAsText(file);
      });
    }

    // 4. Clear All Tasks (Danger Zone)
    if (el.settingClearAllBtn) {
      el.settingClearAllBtn.addEventListener('click', () => {
        this.showConfirmDialog(
          'Clear all tasks?',
          'All tasks stored in your browser will be permanently removed. This action cannot be undone.',
          'Clear All Tasks',
          () => {
            AppState.tasks = [];
            StorageService.clearAllTasks();
            this.renderAll();
            this.showToast('All Tasks Cleared', 'Your workspace is now completely empty.', 'warning');
          }
        );
      });
    }
  },

  /**
   * Mobile navigation drawer helper functions
   */
  openMobileDrawer() {
    this.elements.sidebar.classList.add('is-mobile-open');
    this.elements.sidebarOverlay.classList.add('is-mobile-open');
  },

  closeMobileDrawer() {
    this.elements.sidebar.classList.remove('is-mobile-open');
    this.elements.sidebarOverlay.classList.remove('is-mobile-open');
  }
};

/* ==============================================================================
   7. APPLICATION ENTRY POINT
   Initializes on DOMContentLoaded
   ============================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  // Initialize App State
  AppState.init();

  // Initialize UI & Bind Events
  UIController.init();

  // Expose global references for browser debugging and viva demonstration
  window.AppState = AppState;
  window.UIController = UIController;

  console.log('TaskFlow Management System initialized successfully.');
});

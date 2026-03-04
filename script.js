// script.js
document.addEventListener('DOMContentLoaded', () => {
    const tabs = document.querySelectorAll('.tab-link');
    const contents = document.querySelectorAll('.tab-content');
    const adminBtn = document.getElementById('admin-btn');
    const adminPanel = document.getElementById('admin-panel');
    const closeAdmin = document.getElementById('close-admin');
    const statForm = document.getElementById('stat-form');
    const inputMessage = document.getElementById('input-message');
    const statsList = document.getElementById('stats-list');
    const totalEntries = document.getElementById('total-entries');
    const averageValue = document.getElementById('average-value');
    const statsChart = document.getElementById('stats-chart');
    const settingsForm = document.getElementById('settings-form');
    const adminMessage = document.getElementById('admin-message');
    const resetSettings = document.getElementById('reset-settings');
    const clearStats = document.getElementById('clear-stats');
    const exportStats = document.getElementById('export-stats');

    let stats = JSON.parse(localStorage.getItem('stats')) || [];
    let settings = JSON.parse(localStorage.getItem('settings')) || {
        bgColor: '#000000',
        textColor: '#00ff00',
        accentColor: '#ffffff',
        fontSize: '16px',
        fontFamily: 'monospace',
        animationSpeed: '300ms',
        terminalBorder: 'solid',
        maxStats: 100,
        autoSave: 60,
        themeMode: 'dark'
    };

    applySettings();

    // Tab switching
    tabs.forEach(tab => {
        tab.addEventListener('click', (e) => {
            e.preventDefault();
            const target = tab.getAttribute('href').substring(1);
            tabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            contents.forEach(c => {
                if (c.id === target) {
                    c.classList.add('active');
                } else {
                    c.classList.remove('active');
                }
            });
            if (target === 'view') loadStats();
            if (target === 'reports') generateReports();
        });
    });

    // Admin access
    adminBtn.addEventListener('click', () => {
        const password = prompt('Enter admin password:');
        if (password === 'admin') { // Simple password, change in production
            adminPanel.classList.remove('hidden');
            loadSettingsForm();
        } else {
            alert('Incorrect password');
        }
    });

    closeAdmin.addEventListener('click', () => {
        adminPanel.classList.add('hidden');
    });

    // Input stats
    statForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const date = document.getElementById('date').value;
        const metric = document.getElementById('metric').value;
        const value = parseInt(document.getElementById('value').value);
        stats.push({ date, metric, value });
        if (stats.length > settings.maxStats) stats.shift();
        saveStats();
        inputMessage.textContent = 'Stat added successfully!';
        statForm.reset();
    });

    // Settings form
    settingsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        settings.bgColor = document.getElementById('bg-color').value;
        settings.textColor = document.getElementById('text-color').value;
        settings.accentColor = document.getElementById('accent-color').value;
        settings.fontSize = document.getElementById('font-size').value + 'px';
        settings.fontFamily = document.getElementById('font-family').value;
        settings.animationSpeed = document.getElementById('animation-speed').value + 'ms';
        settings.terminalBorder = document.getElementById('terminal-border').value;
        settings.maxStats = parseInt(document.getElementById('max-stats').value);
        settings.autoSave = parseInt(document.getElementById('auto-save').value);
        settings.themeMode = document.getElementById('theme-mode').value;

        if (settings.themeMode === 'light') {
            settings.bgColor = '#ffffff';
            settings.textColor = '#000000';
            settings.accentColor = '#0000ff';
        }

        saveSettings();
        applySettings();
        adminMessage.textContent = 'Settings applied!';
    });

    resetSettings.addEventListener('click', () => {
        settings = {
            bgColor: '#000000',
            textColor: '#00ff00',
            accentColor: '#ffffff',
            fontSize: '16px',
            fontFamily: 'monospace',
            animationSpeed: '300ms',
            terminalBorder: 'solid',
            maxStats: 100,
            autoSave: 60,
            themeMode: 'dark'
        };
        saveSettings();
        applySettings();
        loadSettingsForm();
        adminMessage.textContent = 'Settings reset to default!';
    });

    clearStats.addEventListener('click', () => {
        if (confirm('Are you sure you want to clear all stats?')) {
            stats = [];
            saveStats();
            adminMessage.textContent = 'All stats cleared!';
        }
    });

    exportStats.addEventListener('click', () => {
        const data = JSON.stringify(stats);
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'stats.json';
        a.click();
        URL.revokeObjectURL(url);
    });

    function loadStats() {
        statsList.innerHTML = '';
        stats.forEach(stat => {
            const li = document.createElement('li');
            li.textContent = `${stat.date} - ${stat.metric}: ${stat.value}`;
            statsList.appendChild(li);
        });
    }

    function generateReports() {
        totalEntries.textContent = stats.length;
        const sum = stats.reduce((acc, stat) => acc + stat.value, 0);
        averageValue.textContent = stats.length ? (sum / stats.length).toFixed(2) : 0;

        // Simple line chart using Canvas
        const ctx = statsChart.getContext('2d');
        ctx.clearRect(0, 0, statsChart.width, statsChart.height);
        ctx.strokeStyle = var('--text-color');
        ctx.beginPath();
        const maxValue = Math.max(...stats.map(s => s.value), 1);
        stats.forEach((stat, i) => {
            const x = (i / (stats.length - 1)) * statsChart.width;
            const y = statsChart.height - (stat.value / maxValue) * statsChart.height;
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
        });
        ctx.stroke();
    }

    function applySettings() {
        document.documentElement.style.setProperty('--bg-color', settings.bgColor);
        document.documentElement.style.setProperty('--text-color', settings.textColor);
        document.documentElement.style.setProperty('--accent-color', settings.accentColor);
        document.documentElement.style.setProperty('--font-size', settings.fontSize);
        document.documentElement.style.setProperty('--font-family', settings.fontFamily);
        document.documentElement.style.setProperty('--animation-speed', settings.animationSpeed);
        document.documentElement.style.setProperty('--terminal-border', settings.terminalBorder);
    }

    function loadSettingsForm() {
        document.getElementById('bg-color').value = settings.bgColor;
        document.getElementById('text-color').value = settings.textColor;
        document.getElementById('accent-color').value = settings.accentColor;
        document.getElementById('font-size').value = parseInt(settings.fontSize);
        document.getElementById('font-family').value = settings.fontFamily;
        document.getElementById('animation-speed').value = parseInt(settings.animationSpeed);
        document.getElementById('terminal-border').value = settings.terminalBorder;
        document.getElementById('max-stats').value = settings.maxStats;
        document.getElementById('auto-save').value = settings.autoSave;
        document.getElementById('theme-mode').value = settings.themeMode;
    }

    function saveStats() {
        localStorage.setItem('stats', JSON.stringify(stats));
    }

    function saveSettings() {
        localStorage.setItem('settings', JSON.stringify(settings));
    }

    // Auto-save interval (not real auto-save, but demo)
    setInterval(saveStats, settings.autoSave * 1000);
});


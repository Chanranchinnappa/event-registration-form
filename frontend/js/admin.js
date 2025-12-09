const API_URL = 'http://localhost/api';

// Fetch and display registrations
async function loadRegistrations() {
    try {
        const response = await fetch(`${API_URL}/registrations`);
        const data = await response.json();
        
        if (!response.ok) {
            throw new Error('Failed to fetch registrations');
        }
        
        displayRegistrations(data.registrations);
        updateStats(data.registrations);
        
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('tableBody').innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center; color: red;">
                    Error loading registrations: ${error.message}
                </td>
            </tr>
        `;
    }
}

// Display registrations in table
function displayRegistrations(registrations) {
    const tableBody = document.getElementById('tableBody');
    
    if (registrations.length === 0) {
        tableBody.innerHTML = `
            <tr>
                <td colspan="5" style="text-align: center;">No registrations yet</td>
            </tr>
        `;
        return;
    }
    
    tableBody.innerHTML = registrations.map(reg => `
        <tr>
            <td>${reg.id}</td>
            <td>${reg.full_name}</td>
            <td>${reg.email}</td>
            <td>${new Date(reg.registered_at).toLocaleString()}</td>
            <td>${reg.ip_address || 'N/A'}</td>
        </tr>
    `).join('');
}

// Update statistics
function updateStats(registrations) {
    const totalCount = document.getElementById('totalCount');
    const todayCount = document.getElementById('todayCount');
    
    totalCount.textContent = registrations.length;
    
    const today = new Date().toDateString();
    const todayRegistrations = registrations.filter(reg => {
        return new Date(reg.registered_at).toDateString() === today;
    });
    
    todayCount.textContent = todayRegistrations.length;
}

// Export to CSV
function exportToCSV() {
    fetch(`${API_URL}/registrations`)
        .then(response => response.json())
        .then(data => {
            const registrations = data.registrations;
            
            if (registrations.length === 0) {
                alert('No data to export');
                return;
            }
            
            // Create CSV content
            const headers = ['ID', 'Full Name', 'Email', 'Registered At', 'IP Address'];
            const rows = registrations.map(reg => [
                reg.id,
                reg.full_name,
                reg.email,
                new Date(reg.registered_at).toLocaleString(),
                reg.ip_address || 'N/A'
            ]);
            
            let csvContent = headers.join(',') + '\n';
            rows.forEach(row => {
                csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
            });
            
            // Download file
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `registrations_${new Date().toISOString().split('T')[0]}.csv`;
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(error => {
            console.error('Export failed:', error);
            alert('Export failed: ' + error.message);
        });
}

// Load data on page load
document.addEventListener('DOMContentLoaded', loadRegistrations);

// Auto-refresh every 30 seconds
setInterval(loadRegistrations, 30000);

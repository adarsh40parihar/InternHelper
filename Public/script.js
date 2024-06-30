async function startAutomation() {
    const statusElement = document.getElementById('status');
    statusElement.innerText = 'Automation Status: Starting...';
    try {
        const response = await fetch('/start-automation');
        const result = await response.json();
        statusElement.innerText = `Automation Status: ${result.status}`;
    } catch (error) {
        statusElement.innerText = 'Automation Status: Error';
        console.error('Error starting automation:', error);
    }
}

const API_URL = 'http://localhost/api';

// Make functions global so HTML onclick can access them
window.changeLanguage = changeLanguage;
window.handleSubmit = handleSubmit;
window.shareEvent = shareEvent;

// Language initialization
document.addEventListener('DOMContentLoaded', () => {
    // Load saved language preference
    const savedLang = loadLanguage();
    currentLanguage = savedLang;
    
    // Set dropdown to saved language
    const langSelect = document.getElementById('languageSelect');
    if (langSelect) {
        langSelect.value = savedLang;
    }
    
    // Apply translations
    updatePageLanguage();
    
    // Check if returning from successful registration
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('success') === 'true') {
        const userName = urlParams.get('name') || 'Guest';
        showSuccess(userName);
    }
});

// Change language function
function changeLanguage(lang) {
    console.log('Changing language to:', lang);
    currentLanguage = lang;
    saveLanguage(lang);
    updatePageLanguage();
}

// Update all text on page
function updatePageLanguage() {
    console.log('Updating page to language:', currentLanguage);
    
    // Update all elements with data-i18n attribute
    document.querySelectorAll('[data-i18n]').forEach(element => {
        const key = element.getAttribute('data-i18n');
        
        // Handle special cases with HTML content
        if (key === 'participants') {
            element.innerHTML = t(key).replace('100,000+', '<strong>100,000+</strong>');
        } else if (key === 'quickInfo') {
            const text = t(key);
            // Find text between ✨ and end, make it bold
            element.innerHTML = text.replace(/✨\s*(.+)/, '✨ <strong>$1</strong>');
        } else {
            element.textContent = t(key);
        }
    });
    
    // Update placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
        const key = element.getAttribute('data-i18n-placeholder');
        element.placeholder = t(key);
    });
    
    // Update success subtitle with user name if present
    const userNameSpan = document.getElementById('userName');
    const successSubtitle = document.getElementById('successSubtitle');
    if (userNameSpan && userNameSpan.textContent && successSubtitle) {
        const userName = userNameSpan.textContent;
        const translatedText = t('successSubtitle', { name: userName });
        successSubtitle.textContent = translatedText;
    }
}

// Handle form submission
async function handleSubmit(event) {
    event.preventDefault();
    
    const submitBtn = document.getElementById('submitBtn');
    const btnText = document.getElementById('btnText');
    const btnLoader = document.getElementById('btnLoader');
    const errorMessage = document.getElementById('errorMessage');
    
    // Get form data
    const fullName = document.getElementById('fullName').value.trim();
    const email = document.getElementById('email').value.trim();
    
    // Disable button and show loader
    submitBtn.disabled = true;
    btnText.classList.add('hidden');
    btnLoader.classList.remove('hidden');
    errorMessage.classList.add('hidden');
    
    try {
        const response = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                fullName: fullName,
                email: email
            })
        });
        
        const data = await response.json();
        
        if (response.ok) {
            // Save user data for success page
            localStorage.setItem('registeredUser', JSON.stringify({
                name: fullName,
                email: email,
                timestamp: new Date().toISOString()
            }));
            
            // Show success message
            showSuccess(fullName);
        } else {
            // Show error message
            if (response.status === 409) {
                errorMessage.textContent = t('errorDuplicate');
            } else {
                errorMessage.textContent = data.error || t('errorFailed');
            }
            errorMessage.classList.remove('hidden');
            
            // Re-enable button
            submitBtn.disabled = false;
            btnText.classList.remove('hidden');
            btnLoader.classList.add('hidden');
        }
        
    } catch (error) {
        console.error('Registration error:', error);
        errorMessage.textContent = t('errorFailed');
        errorMessage.classList.remove('hidden');
        
        // Re-enable button
        submitBtn.disabled = false;
        btnText.classList.remove('hidden');
        btnLoader.classList.add('hidden');
    }
}

// Show success message
function showSuccess(userName) {
    const registrationForm = document.getElementById('registrationForm');
    const successMessage = document.getElementById('successMessage');
    const userNameSpan = document.getElementById('userName');
    const successSubtitle = document.getElementById('successSubtitle');
    
    // Hide form
    registrationForm.style.display = 'none';
    
    // Show success message
    successMessage.classList.remove('hidden');
    
    // Set user name
    const firstName = userName.split(' ')[0];
    userNameSpan.textContent = firstName;
    
    // Update success subtitle with translated text and actual name
    if (successSubtitle) {
        const translatedText = t('successSubtitle', { name: firstName });
        successSubtitle.textContent = translatedText;
    }
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Add animation
    successMessage.style.animation = 'slideIn 0.5s ease-out';
}

// Share event function
function shareEvent() {
    const shareData = {
        title: t('title'),
        text: t('subtitle'),
        url: window.location.origin
    };
    
    if (navigator.share) {
        navigator.share(shareData)
            .catch(err => console.log('Share failed:', err));
    } else {
        // Fallback: copy link to clipboard
        navigator.clipboard.writeText(window.location.origin)
            .then(() => alert('Link copied to clipboard!'))
            .catch(err => console.error('Copy failed:', err));
    }
}

// Add slide-in animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            opacity: 0;
            transform: translateY(30px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Common passwords list
const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
    'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master',
    'sunshine', 'ashley', 'bailey', 'passw0rd', 'shadow', '123123', '654321',
    'superman', 'qazwsx', 'michael', 'football', 'admin'
];

// DOM Elements
const passwordInput = document.getElementById('passwordInput');
const toggleBtn = document.getElementById('toggleBtn');
const progressBar = document.getElementById('progressBar');
const progressInner = document.getElementById('progressInner');
const strengthBadge = document.getElementById('strengthBadge');
const scoreValue = document.getElementById('scoreValue');
const crackTime = document.getElementById('crackTime');
const entropy = document.getElementById('entropy');
const criteriaList = document.getElementById('criteriaList');
const tipsCard = document.getElementById('tipsCard');
const tipsList = document.getElementById('tipsList');
const generateBtn = document.getElementById('generateBtn');
const lengthSlider = document.getElementById('lengthSlider');
const lengthValue = document.getElementById('lengthValue');
const generatedPasswordContainer = document.getElementById('generatedPasswordContainer');
const generatedPassword = document.getElementById('generatedPassword');
const copyBtn = document.getElementById('copyBtn');

// Checkboxes
const includeLowercase = document.getElementById('includeLowercase');
const includeUppercase = document.getElementById('includeUppercase');
const includeNumbers = document.getElementById('includeNumbers');
const includeSpecial = document.getElementById('includeSpecial');

let debounceTimer;

// Toggle password visibility
toggleBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    toggleBtn.textContent = type === 'password' ? '👁️' : '🙈';
});

// Password input with debounce
passwordInput.addEventListener('input', (e) => {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(updateUI, 120);
});

// Criteria Setup
const criteria = [
    { id: "length8", label: "Au moins 8 caractères", check: pwd => pwd.length >= 8 },
    { id: "length12", label: "Au moins 12 caractères", check: pwd => pwd.length >= 12 },
    { id: "length16", label: "Au moins 16 caractères (excellent)", check: pwd => pwd.length >= 16 },
    { id: "lowercase", label: "Contient des minuscules (a-z)", check: pwd => /[a-z]/.test(pwd) },
    { id: "uppercase", label: "Contient des majuscules (A-Z)", check: pwd => /[A-Z]/.test(pwd) },
    { id: "numbers", label: "Contient des chiffres (0-9)", check: pwd => /\d/.test(pwd) },
    { id: "special", label: "Contient des caractères spéciaux (!@#$%^&*)", check: pwd => /[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(pwd) },
    { id: "no_repeats", label: "Pas de caractères répétés 3x consécutifs", check: pwd => !/(.)\1\1/.test(pwd) },
];

function checkCriteria(pwd) {
    return criteria.map(c => ({...c, met: c.check(pwd)}));
}

function getStrength(pwd) {
    let score = 0, tips = [];

    // Longueur
    if (pwd.length >= 8 && pwd.length < 12) score += 15;
    else if (pwd.length >= 12 && pwd.length < 16) score += 25;
    else if (pwd.length >= 16) score += 35;

    // Complexité
    if (/[a-z]/.test(pwd)) score += 10;
    else tips.push("Ajoute des minuscules");
    if (/[A-Z]/.test(pwd)) score += 10;
    else tips.push("Ajoute des majuscules");
    if (/\d/.test(pwd)) score += 10;
    else tips.push("Ajoute des chiffres");
    if (/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(pwd)) score += 10;
    else tips.push("Ajoute des caractères spéciaux");

    // Bonus diversité
    let kinds = [/[a-z]/, /[A-Z]/, /\d/, /[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/];
    if (kinds.filter(r=>r.test(pwd)).length >= 3) score += 15;

    // Pas de répétitions
    if (!/(.)\1\1/.test(pwd)) score += 5;
    else tips.push("Évite les répétitions consécutives");

    // Pénalités
    if (/(abc|123|qwerty|azerty)/.test(pwd)) {
        score -= 15;
        tips.push("Évite les patterns courants");
    }
    if (commonPasswords.includes(pwd.toLowerCase())) {
        score -= 30;
        tips.push("N'utilise pas de mot de passe courant");
    }

    // Normalisation
    if (score < 0) score = 0;
    if (score > 100) score = 100;

    // Badge et couleur
    let level = { badge: "🔴 Faible", color: "#ef4444"};
    if (score > 70) level = { badge: "🟢 Fort", color: "#10b981"};
    else if (score > 40) level = { badge: "🟠 Moyen", color: "#f59e0b"};

    // Crack time
    let time = "< 1 seconde";
    if (score > 70) time = "plusieurs années";
    else if (score > 40) time = "quelques jours";

    // Entropie (simplifiée)
    let charsetSize = 0;
    if (/[a-z]/.test(pwd)) charsetSize += 26;
    if (/[A-Z]/.test(pwd)) charsetSize += 26;
    if (/\d/.test(pwd)) charsetSize += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(pwd)) charsetSize += 30;
    let entropyVal = pwd.length * Math.log2(charsetSize || 1);
    let entropyDisplay = Math.round(entropyVal) + " bits";

    return {score, ...level, time, entropy: entropyDisplay, tips};
}

function updateUI() {
    const pwd = passwordInput.value;
    const strength = getStrength(pwd);

    progressInner.style.width = strength.score + "%";
    progressInner.style.background = strength.color;
    strengthBadge.textContent = strength.badge;
    strengthBadge.style.background = strength.color;
    scoreValue.textContent = `${strength.score}/100`;
    crackTime.textContent = strength.time;
    entropy.textContent = strength.entropy;

    criteriaList.innerHTML = "";
    const checks = checkCriteria(pwd);
    for (const {label, met} of checks) {
        const li = document.createElement('li');
        li.textContent = (met ? "✅ " : "❌ ") + label;
        li.className = met ? "met" : "not-met";
        criteriaList.appendChild(li);
    }

    tipsList.innerHTML = "";
    for (const tip of strength.tips) {
        const li = document.createElement('li');
        li.textContent = "💡 " + tip;
        tipsList.appendChild(li);
    }
}

// Init at start
updateUI();

// Password generator
function generatePassword() {
    const length = Number(lengthSlider.value);
    const pools = [];
    if (includeLowercase.checked) pools.push('abcdefghijklmnopqrstuvwxyz');
    if (includeUppercase.checked) pools.push('ABCDEFGHIJKLMNOPQRSTUVWXYZ');
    if (includeNumbers.checked) pools.push('0123456789');
    if (includeSpecial.checked) pools.push('!@#$%^&*()-_=+[]{};:,.<>?');
    let all = pools.join('');
    if (!all) all = 'abcdefghijklmnopqrstuvwxyz';

    let pwd = '';
    for (let i=0; i<length; i++) {
        pwd += all.charAt(Math.floor(Math.random()*all.length));
    }
    return pwd;
}
generateBtn.addEventListener('click', () => {
    const pwd = generatePassword();
    generatedPassword.textContent = pwd;
    copyBtn.style.display = "inline-block";
});
copyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(generatedPassword.textContent);
    copyBtn.textContent = "✔️ Copié!";
    setTimeout(()=>copyBtn.textContent="📋 Copier",1500);
});
lengthSlider.addEventListener('input', () => lengthValue.textContent = lengthSlider.value);

// Service Worker for installable PWA (optionnel, à compléter selon besoin)
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(()=>{});
}

// Installation Progressive Web App (AUTO-INSTALL)
let deferredPrompt;
const installBtn = document.getElementById('installBtn');
const installContainer = document.getElementById('installContainer');

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    installBtn.style.display = "inline-block";
});
installBtn.addEventListener('click', () => {
    if (deferredPrompt) {
        deferredPrompt.prompt();
        deferredPrompt.userChoice.then((choiceResult) => {
            if(choiceResult.outcome === 'accepted') {
                installBtn.textContent = "✅ EasyPass installé !";
            }
            deferredPrompt = null;
        });
    }
});
window.addEventListener('appinstalled', () => {
    installBtn.style.display = "none";
});

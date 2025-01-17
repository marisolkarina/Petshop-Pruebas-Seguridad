export function checkPasswordStrength() {
    const password = document.getElementById('password').value;
    const strengthText = document.getElementById('password-strength-text');
    const strengthBar = document.getElementById('password-strength-bar');
    let strength = 0;

    // Criterios de fortaleza
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    // Actualizar barra de fortaleza y texto
    if (strength === 5) {
        strengthText.innerText = 'Muy fuerte';
        strengthBar.style.backgroundColor = 'green';
    } else if (strength >= 3) {
        strengthText.innerText = 'Fuerte';
        strengthBar.style.backgroundColor = 'orange';
    } else {
        strengthText.innerText = 'Débil';
        strengthBar.style.backgroundColor = 'red';
    }
    strengthBar.style.width = `${strength * 20}%`;
}

const validarEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
};

const validarPasswordFuerte = (password) => {
    // Mínimo 8 caracteres, al menos una mayúscula, una minúscula, un número y un carácter especial
    const re = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return re.test(password);
};

module.exports = {
    validarEmail,
    validarPasswordFuerte
};
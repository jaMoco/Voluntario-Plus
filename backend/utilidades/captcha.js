const axios = require('axios');

const verifyCaptcha = async (token) => {
    try {
        const response = await axios.post('https://www.google.com/recaptcha/api/siteverify', null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET,
                response: token
            }
        });
        return response.data.success;
    } catch (error) {
        console.error('Error verificando captcha:', error);
        return false;
    }
};

module.exports = { verifyCaptcha };
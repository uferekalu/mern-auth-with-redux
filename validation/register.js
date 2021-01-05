const Validator = require("validator");
const isEmpty = require("is-empty");

module.exports = function validateRegisterInput(data) {
    let errors = {};

    // Convert empty fields to an empty string so we can use validator functions
    data.name = !isEmpty(data.name) ? data.name : "";
    data.email = !isEmpty(data.email) ? data.email : "";
    data.password = !isEmpty(data.password) ? data.password : "";
    data.password2 = !isEmpty(data.password2) ? data.password2 : "";
    data.dept = !isEmpty(data.dept) ? data.dept : "";
    data.selectOptions = !isEmpty(data.selectOptions) ? data.selectOptions : "";
    data.textarea = !isEmpty(data.textarea) ? data.textarea : "";

    // Name checks
    if (Validator.isEmpty(data.name)) {
        errors.name = "Name field is required";
    }

    // Email checks
    if (Validator.isEmpty(data.email)) {
        errors.email = "Email field is required";
    } else if (!Validator.isEmail(data.email)) {
        errors.email = "Email is invalid";
    }

    // Password checks
    if (Validator.isEmpty(data.password)) {
        errors.password = "Password field is required";
    }

    if (Validator.isEmpty(data.password2)) {
        errors.password2 = "Confirm password field is required";
    }

    if (!Validator.isLength(data.password, { min:6, max: 30 })) {
        errors.passord = "Password must at least 6 characters";
    }

    if (!Validator.equals(data.password, data.password2)) {
        errors.password2 = "Passords must match";
    }

    // Dept checks
    if (Validator.isEmpty(data.dept)) {
        errors.dept = "Dept field is required";
    }

    // Courses check
    if (Validator.isEmpty(data.selectOptions)) {
        errors.selectOptions = "Courses field is required";
    }

    // Textarea checks
    if (Validator.isEmpty(data.textarea)) {
        errors.textarea = "Textarea field is required";
    }

    return {
        errors,
        isValid: isEmpty(errors)
    };
};
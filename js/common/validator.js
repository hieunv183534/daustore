function Validator(options) {

    const validate = (inputElement, rule) => {
        let value = (inputElement.value == null) ? inputElement.getAttribute('value') : inputElement.value;
        var error = rule.test(value);
        if (error) {
            inputElement.title = error;
            inputElement.classList.add('validate-field');
        }else{
            inputElement.title = null;
            inputElement.classList.remove('validate-field');
        }
        return !error;
    }

    var formElement = document.querySelector(options.form);
    var submitElement = formElement.querySelector(options.submitSelector);
    if (formElement) {
        // validate khi submit form
        submitElement.addEventListener('click',()=>{
            var formValid = true;

            options.rules.forEach(rule=>{
                var inputElement = formElement.querySelector(rule.selector);
                let valid = validate(inputElement,rule);
                if(!valid){
                    formValid = false;
                }
            });

            if(formValid){
                options.onSubmit();
            }else{
                showToastMessenger('danger',"Vui lòng hoàn thiện form trước khi submit!")
            }
        })

        // validate khi input, blur, vv
        options.rules.forEach(rule => {
            var inputElement = formElement.querySelector(rule.selector);
            if (inputElement) {
                inputElement.onblur = () => {
                    validate(inputElement, rule);
                }
            }
        });
    }
}

Validator.isRequired = (selector) => {
    return {
        selector: selector,
        test: (value) => {
            return value ? undefined : "Trường này bắt buộc nhập!";
        }
    };
}
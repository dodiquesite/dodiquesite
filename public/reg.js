/**
 * @typedef {{name: string, pass: string, email: string,
 * role: ('passenger'|'driver'), sex: ('man'|'woman'), sendNotifies: boolean}} UserCredentials
 */

/**
 * @param {string} name
 * @param {string} pass
 * @param {string} email
 * @param {'passenger'|'driver'} role
 * @param {'man'|'woman'} sex
 * @param {boolean} sendNotifies
 * @returns {UserCredentials}
 * @constructor
 */
function UserCredentials(name, pass, email, role, sex, sendNotifies) {
    return Object.assign(this, { name, pass, email, role, sex, sendNotifies });
}

/** @type { {role: {passenger: string, driver: string}, sex: {man: string, woman: string}} } */
UserCredentialsViews = {
    role: { 'passenger': 'Пассажир', 'driver': 'Водитель' },
    sex: { 'man': 'Мужчина', 'woman': 'Женщина' }
}

$( document ).ready(() => {
    $( '.input-error-label' ).hide();
    $( '.credentials-show' ).hide();

    $( '.reg-inputs input' ).on('change', (event) => {
        validateAllInputsValuesForCorrect();
        $( '.button-block button' ).attr("disabled", !isInputsCorrect());
    });

    $( '.button-block button' ).on('click', (event) => {

    });

    $( '.button-block' ).on('click', event => {
        validateAllInputsValuesForCorrect();
        if (isInputsCorrect()) {
            var credentials = collectCredentialsFromInputs();
            if (!credentials) {
                return alert('Указанные данные некорректны!');
            }
            showCredentials(credentials);
        }
    });
})

/** @param {UserCredentials} credentials */
function showCredentials(credentials) {
    $( '.reg-inputs' ).hide();
    $( '.credentials-show' ).show();

    $( '#name-show-label' ).text('Имя: ' + credentials.name);
    $( '#pass-show-label' ).text('Пароль: ' + credentials.pass);
    $( '#email-show-label' ).text('Почтовый адрес: ' + credentials.email);
    $( '#role-show-label' ).text('Роль: ' + UserCredentialsViews.role[credentials.role]);
    $( '#sex-show-label' ).text('Пол: ' + UserCredentialsViews.sex[credentials.sex]);
    $( '#notify-show-label' ).text('Присылать уведомления? ' + (credentials.sendNotifies ? 'Да' : 'Нет'));
}

/** @returns {UserCredentials} */
function collectCredentialsFromInputs() {
    var name = $( '#login-block input' ).val();
    var pass = $( '#pass-block input' ).val();
    var email = $( '#email-block input' ).val();

    if (typeof name !== "string" || typeof pass !== "string" || typeof email !== "string")
        throw new Error('one of name, pass or email is not string!');

    if (!name.length || !pass.length || !email.length) {
        throw new Error('credential inputs are empty');
    }

    /** @type {('passenger' | 'driver')} */
    var role = $( "#role-select option:selected" ).val();
    if (role !== 'passenger' && role !== 'driver')
        throw new Error('Selected role value is not one of valid');

    /** @type {('man' | 'woman')} */
    var sex = $('input[name="sex"]:checked').val();
    if (sex !== 'man' && sex !== 'woman')
        throw new Error('Selected sex value is not one of valid');

    var sendNotifies = $("#input-notifications").is(':checked');

    return new UserCredentials(
        name, pass, email, role, sex, sendNotifies
    )
}

function isInputsCorrect() {
    return !$( '.incorrect-input' ).length
}

function validateAllInputsValuesForCorrect() {
    validateInputBlockByRule($( '#login-block' ), /[^а-яА-Яa-zA-Z -]|  +|--+|^ $/,
        "Поле допускает использование латинских букв и кириллицы а так же тире.");
    validateInputBlockByRule($( '#pass-block' ), /[^a-zA-Z0-9-_@!#$%^&*]/,
        "Пароль может состоять только из латинских букв, цифр и символов: -_@!#$%^&*");
    validateInputBlockByRule($( '#email-block' ), /[^a-zA-Z0-9@.]/,
        "Пароль может состоять только из латинских букв, цифр и символов: @.");
}

function validateInputBlockByRule(inputBlock, regex, errorMessage) {
    var inputValue = $( 'input', inputBlock ).val();
    if (inputValue.match(regex)) {
        setInputBlockStatus(inputBlock, false);
        setInputBlockErrorText(inputBlock, errorMessage)
    }
    else
        setInputBlockStatus(inputBlock, true);
}

function setInputBlockStatus(blockElement, isCorrect) {
    $( '.input-status', blockElement ).css('background-color', isCorrect ? 'green' : 'red');
    var errorLabel = $( '.input-error-label', blockElement );
    isCorrect ? errorLabel.hide() : errorLabel.show();
    isCorrect ? blockElement.removeClass('incorrect-input') : blockElement.addClass('incorrect-input');
}

function setInputBlockErrorText(blockElement, errorText) {
    $( '.input-error-label', blockElement ).first().text(errorText);
}
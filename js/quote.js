(function initQuotePage () {
    var quoteForm = document.getElementById('quoteForm');
    if (!quoteForm) {
        return;
    }

    var typeRadios = document.querySelectorAll('input[name="insuranceType"]');
    var typeSections = document.querySelectorAll('[data-type-selection]');
    var typeError = document.getElementById('typeError');
    var step2Section = document.getElementById('step2Section');
    var quoteResults = document.getElementById('quoteResults');
    var breakdownBody = document.getElementById('quoteBreakdownBody');
    var resultName = document.getElementById('resultName');
    var resultType = document.getElementById('resultType');
    var monthlyPremium = document.getElementById('monthlyPremium');
    var annualPremium = document.getElementById('annualPremium');
    var resetQuoteBtn = document.getElementById('resetQuoteBtn');
    var quoteSpinner = document.getElementById('quoteSpinner');
    var saveQuoteBtn = document.getElementById('saveQuoteBtn');
    var printQuoteBtn = document.getElementById('printQuoteBtn');
    var savedQuotesSection = document.getElementById('savedQuotesSection');
    var savedQuotesList = document.getElementById('savedQuotesList');
    var lastQuote = null;

    function showSpinner() {
        if (quoteSpinner) {
            quoteSpinner.classList.remove('hidden');
        }
    }

    function hideSpinner() {
        if (quoteSpinner) {
            quoteSpinner.classList.add('hidden');
        }
    }

    function toCurrency(value) {
        return '$' + value.toFixed(2);
    }

    function getSelectedType() {
        var checked = document.querySelector('input[name="insuranceType"]:checked');
        return checked ? checked.value : '';
    }

    function getCoverageValue(type) {
        var checked = document.querySelector('input[name="' + type + 'Coverage"]:checked');
        return checked ? checked.value : '';
    }

    function getCoverageMultiplier(coverage) {
        if (coverage === 'basic') {
            return 0.8;
        }
        if (coverage === 'premium') {
            return 1.4;
        }
        return 1.0;
    }

    function getCoverageErrorEl(type) {
        return document.getElementById(type + 'CoverageError');
    }

    function showError(inputEl, message) {
        if (!inputEl) {
            return;
        }
        inputEl.classList.add('is-invalid');

        var feedback = inputEl.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = message;
        }
    }

    function clearError(inputEl) {
        if (!inputEl) {
            return;
        }
        inputEl.classList.remove('is-invalid');

        var feedback = inputEl.nextElementSibling;
        if (feedback && feedback.classList.contains('invalid-feedback')) {
            feedback.textContent = '';
        }
    }

    function setTypeError(message) {
        if (!typeError) {
            return;
        }

        if (message) {
            typeError.textContent = message;
            typeError.classList.remove('hidden');
            return;
        }

        typeError.textContent = '';
        typeError.classList.add('hidden');
    }

    function setCoverageError(type, message) {
        var errorEl = getCoverageErrorEl(type);
        if (!errorEl) {
            return;
        }

        if (message) {
            errorEl.textContent = message;
            errorEl.classList.remove('hidden');
            return;
        }

        errorEl.textContent = '';
        errorEl.classList.add('hidden');
    }

    function clearAllErrors() {
        quoteForm.querySelectorAll('.is-invalid').forEach(function (el) {
            el.classList.remove('is-invalid');
        });

        quoteForm.querySelectorAll('.invalid-feedback').forEach(function (el) {
            if (!el.id) {
                el.textContent = '';
            }
        });

        setTypeError('');
        setCoverageError('auto', '');
        setCoverageError('home', '');
        setCoverageError('life', '');
    }

    function hideAllTypeSections() {
        typeSections.forEach(function (section) {
            section.classList.add('hidden');
        });
    }

    function showSelectedTypeSection(type) {
        hideAllTypeSections();

        if (!type) {
            if (step2Section) {
                step2Section.classList.add('hidden');
            }
            return;
        }

        if (step2Section) {
            step2Section.classList.remove('hidden');
        }

        var selectedSection = document.getElementById(type + '-fields');
        if (selectedSection) {
            selectedSection.classList.remove('hidden');
        }
    }

    function handleTypeSelection(type) {
        clearAllErrors();
        showSelectedTypeSection(type);
        quoteResults.classList.add('hidden');
    }

    function addBreakdownRow(tbody, factor, userValue, impact) {
        var row = document.createElement('tr');
        var factorCell = document.createElement('td');
        var userCell = document.createElement('td');
        var impactCell = document.createElement('td');

        factorCell.textContent = factor;
        userCell.textContent = userValue;
        impactCell.textContent = impact;

        row.appendChild(factorCell);
        row.appendChild(userCell);
        row.appendChild(impactCell);
        tbody.appendChild(row);
    }

    function validateZipCode(zip) {
        return /^\d{5}$/.test(zip);
    }

    function requireText(id, label, minLength) {
        var input = document.getElementById(id);
        var value = (input.value || '').trim();
        clearError(input);

        if (!value) {
            showError(input, label + ' is required.');
            return { valid: false, value: '' };
        }

        // Only allow letters and spaces for name fields
        if (id.endsWith('FullName') && !/^[A-Za-z\s]+$/.test(value)) {
            showError(input, label + ' must contain only letters.');
            return { valid: false, value: value };
        }

        if (minLength && value.replace(/[^A-Za-z]/g, '').length < minLength) {
            showError(input, label + ' must be at least ' + minLength + ' letters.');
            return { valid: false, value: value };
        }
        return { valid: true, value: value };
    }

    function requireNumber(id, label, min, max) {
        var input = document.getElementById(id);
        var value = Number(input.value);
        clearError(input);

        if (input.value === '') {
            showError(input, label + ' is required.');
            return { valid: false, value: 0 };
        }

        if (Number.isNaN(value) || value < min || value > max) {
            showError(input, label + ' must be between ' + min + ' and ' + max + '.');
            return { valid: false, value: value };
        }
        return { valid: true, value: value };
    }

    function requireNumberMin(id, label, min) {
        var input = document.getElementById(id);
        var value = Number(input.value);
        clearError(input);

        if (input.value === '') {
            showError(input, label + ' is required.');
            return { valid: false, value: 0 };
        }

        if (Number.isNaN(value) || value < min) {
            showError(input, label + ' must be at least ' + min + '.');
            return { valid: false, value: value };
        }
        return { valid: true, value: value };
    }

    function requireSelect(id, label) {
        var input = document.getElementById(id);
        var value = input.value;
        clearError(input);

        if (!value) {
            showError(input, label + ' is required.');
            return { valid: false, value: '' };
        }
        return { valid: true, value: value };
    }

    function requireZip(id) {
        var input = document.getElementById(id);
        var value = (input.value || '').trim();
        clearError(input);

        if (!value) {
            showError(input, 'Zip Code is required.');
            return { valid: false, value: value };
        }

        if (!validateZipCode(value)) {
            showError(input, 'Zip Code must be exactly 5 digits.');
            return { valid: false, value: value };
        }
        return { valid: true, value: value };
    }

    function validateCoverage(type) {
        var coverage = getCoverageValue(type);
        setCoverageError(type, '');

        if (!coverage) {
            setCoverageError(type, 'Coverage level is required');
            return { valid: false, value: '' };
        }
        return { valid: true, value: coverage };
    }

    function validateSmoker() {
        var smoker = document.querySelector('input[name="smoker"]:checked');
        setCoverageError('life', '');

        if (!smoker) {
            var smokerError = document.getElementById('smokerError');
            if (smokerError) {
                smokerError.textContent = 'Smoker selection is required.';
                smokerError.classList.remove('hidden');
            }
            return { valid: false, value: '' };
        }
        var smokerErrorClear = document.getElementById('smokerError');
        if (smokerErrorClear) {
            smokerErrorClear.textContent = '';
            smokerErrorClear.classList.add('hidden');
        }
        return { valid: true, value: smoker.value };
    }

    function getAutoQuoteData() {
        var fullName = requireText('autoFullName', 'Full Name', 2);
        var age = requireNumber('autoAge', 'Age', 16, 100);
        var zipCode = requireZip('autoZip');
        var vehicleYear = requireNumber('vehicleYear', 'Vehicle Year', 1990, 2026);
        var vehicleMake = requireText('vehicleMake', 'Vehicle Make');
        var vehicleModel = requireText('vehicleModel', 'Vehicle Model', 1);
        var annualMileage = requireSelect('autoMileage', 'Annual Mileage');
        var drivingRecord = requireSelect('drivingRecord', 'Driving Record');
        var coverage = validateCoverage('auto');

        var valid = fullName.valid && age.valid && zipCode.valid && vehicleYear.valid && vehicleMake.valid && vehicleModel.valid && annualMileage.valid && drivingRecord.valid && coverage.valid;

        return {
            valid: valid,
            values : {
                fullName: fullName.value,
                age: age.value,
                zipCode: zipCode.value,
                vehicleYear: vehicleYear.value,
                vehicleMake: vehicleMake.value,
                vehicleModel: vehicleModel.value,
                annualMileage: annualMileage.value,
                drivingRecord: drivingRecord.value,
                coverage: coverage.value
            }
        };
    }

    function getHomeQuoteData() {
        var fullName = requireText('homeFullName', 'Full Name', 2);
        var age = requireNumber('homeAge', 'Age', 18, 100);
        var zipCode = requireZip('homeZip');
        var homeValue = requireNumberMin('homeValue', 'Home Value', 50000);
        var yearBuilt = requireNumber('yearBuilt', 'Year Built', 1900, 2026);
        var squareFootage = requireNumberMin('squareFootage', 'Square Footage', 500, 10000);
        var constructionType = requireSelect('constructionType', 'Construction Type');
        var coverage = validateCoverage('home');

        var valid = fullName.valid && age.valid && zipCode.valid && homeValue.valid && yearBuilt.valid && squareFootage.valid && constructionType.valid && coverage.valid;

        return {
            valid: valid,
            values: {
                fullName: fullName.value,
                age: age.value,
                zipCode: zipCode.value,
                homeValue: homeValue.value,
                yearBuilt: yearBuilt.value,
                squareFootage: squareFootage.value,
                constructionType: constructionType.value,
                securitySystem: document.getElementById('securitySystem').checked,
                fireSprinklers: document.getElementById('fireSprinklers').checked,
                coverage: coverage.value
            }
        };
    }

    function getLifeQuoteData() {
        var fullName = requireText('lifeFullName', 'Full Name', 2);
        var age = requireNumber('lifeAge', 'Age', 18, 85);
        var zipCode = requireZip('lifeZip');
        var gender = requireSelect('gender', 'Gender');
        var smoker = validateSmoker();
        var coverageAmount = requireSelect('coverageAmount', 'Coverage Amount');
        var exerciseFrequency = requireSelect('exerciseFrequency', 'Exercise Frequency');
        var coverage = validateCoverage('life');

        var valid = fullName.valid && age.valid && zipCode.valid && gender.valid && smoker.valid && coverageAmount.valid && exerciseFrequency.valid && coverage.valid;

        return {
            valid: valid,
            values: {
                fullName: fullName.value,
                age: age.value,
                zipCode: zipCode.value,
                gender: gender.value,
                smoker: smoker.value,
                coverageAmount: Number(coverageAmount.value),
                exerciseFrequency: exerciseFrequency.value,
                preExistingConditions: document.getElementById('preExistingConditions').checked,
                coverage: coverage.value
            }
        };
    }

    function getAutoFactors(values) {
        var currentYear = 2026;
        var vehicleAge = currentYear - values.vehicleYear;
        var ageFactor = values.age < 25 ? 1.5 : values.age > 65 ? 1.3 : 1.0;
        var vehicleAgeFactor = vehicleAge < 3? 1.3 : vehicleAge <= 10 ? 1.0 : 0.8;
        var mileageMap = {
            under5k: {factor: 0.8, label: 'Under 5,000'},
            '5to10k': {factor: 1.0, label: '5,000-10,000'},
            '10to15k': {factor: 1.1, label: '10,001-15,000'},
            '15to20k': {factor: 1.3, label: '15,001-20,000'},
            over20K: {factor: 1.5, label: 'Over 20,000'}
        };

        var drivingMap = {
            clean: {factor: 1.0, label: 'Clean'},
            '1ticket': {factor: 1.2, label: '1 Ticket'},
            '2plus': {factor: 1.5, label: '2+ Tickets'},
            accident: {factor: 1.8, label: 'Accident in Last 3 Years'}
        };

        var mileage = mileageMap[values.annualMileage];
        var driving = drivingMap[values.drivingRecord];
        var coverageFactor = getCoverageMultiplier(values.coverage);
        var baseRate = 75;
        var monthly = baseRate * ageFactor * vehicleAgeFactor * mileage.factor * driving.factor * coverageFactor;

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        return {
            typeLabel: 'Auto Insurance',
            monthly: monthly,
            annual: monthly * 12,
            breakdown: [
                { factor: 'Base monthly rate', userValue: '$75.00', impact: 'Starting rate' },
                { factor: 'Age factor', userValue: values.age + ' years', impact: 'x' + ageFactor.toFixed(2) },
                { factor: 'Vehicle age factor', userValue: vehicleAge + ' years old', impact: 'x' + vehicleAgeFactor.toFixed(2) },
                { factor: 'Mileage factor', userValue: mileage.label, impact: 'x' + mileage.factor.toFixed(2) },
                { factor: 'Driving record', userValue: driving.label, impact: 'x' + driving.factor.toFixed(2) },
                { factor: 'Coverage level', userValue: capitalize(values.coverage), impact: 'x' + coverageFactor.toFixed(2) }
            ]
        };
    }

    function getHomeFactors(values) {
        var baseRate = (values.homeValue * 0.003) / 12;
        var sizeMonthly = values.squareFootage * 0.01;
        var yearBuiltFactor = values.yearBuilt < 1970 ? 1.4 : values.yearBuilt <= 1999 ? 1.1 : 1.0;
        var constructionMap = {
            wood: {factor: 1.2, label: 'Wood Frame'},
            brick: {factor: 1.0, label: 'Brick'},
            concrete: {factor: 0.9, label: 'Concrete'},
            steel: {factor: 0.85, label: 'Steel'}
        };

        var construction = constructionMap[values.constructionType];
        var securityFactor = values.securitySystem ? 0.95 : 1.0;
        var sprinklerFactor = values.fireSprinklers ? 0.92 : 1.0;
        var coverageFactor = getCoverageMultiplier(values.coverage);
        var subtotal = baseRate + sizeMonthly;
        var monthly = subtotal * yearBuiltFactor * construction.factor * securityFactor * sprinklerFactor * coverageFactor;

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        return {
            typeLabel: 'Home Insurance',
            monthly: monthly,
            annual: monthly * 12,
            breakdown: [
                { factor: 'Base monthly rate', userValue: '$' + values.homeValue.toLocaleString() + ' home value', impact: toCurrency(baseRate) },
                { factor: 'Size factor', userValue: values.squareFootage + ' sq ft', impact: '+ ' + toCurrency(sizeMonthly) },
                { factor: 'Year built factor', userValue: String(values.yearBuilt), impact: 'x' + yearBuiltFactor.toFixed(2) },
                { factor: 'Construction factor', userValue: construction.label, impact: 'x' + construction.factor.toFixed(2) },
                { factor: 'Security discount', userValue: values.securitySystem ? 'Yes' : 'No', impact: 'x' + securityFactor.toFixed(2) },
                { factor: 'Sprinkler discount', userValue: values.fireSprinklers ? 'Yes' : 'No', impact: 'x' + sprinklerFactor.toFixed(2) },
                { factor: 'Coverage level', userValue: capitalize(values.coverage), impact: 'x' + coverageFactor.toFixed(2) }
            ]
        };
    }

    function getLifeFactors(values) {
        var baseRate = (values.coverageAmount * 0.0005) / 12;
        var ageFactor = values.age <= 30 ? 1.0 : values.age <= 45 ? 1.5 : values.age <= 60 ? 2.5 : 4.0;
        var smokerFactor = values.smoker === 'yes' ? 2.0 : 1.0;
        var exerciseMap = {
            rarely: { factor: 1.3, label: 'Rarely' },
            '1to2': { factor: 1.1, label: '1-2 times/week' },
            '3to4': { factor: 1.0, label: '3-4 times/week' },
            '5plus': { factor: 0.9, label: '5+ times/week' }
        };

        var genderMap = {
            male: { factor: 1.0, label: 'Male' },
            female: { factor: 1.0, label: 'Female' },
            'non-binary': { factor: 1.05, label: 'Non-binary' }
        };

        var exercise = exerciseMap[values.exerciseFrequency];
        var gender = genderMap[values.gender];
        var preExistingFactor = values.preExistingConditions ? 1.5 : 1.0;
        var coverageFactor = getCoverageMultiplier(values.coverage);
        var monthly = baseRate * ageFactor * smokerFactor * exercise.factor * gender.factor * preExistingFactor * coverageFactor;

        function capitalize(str) {
            return str.charAt(0).toUpperCase() + str.slice(1);
        }

        return {
            typeLabel: 'Life Insurance',
            monthly: monthly,
            annual: monthly * 12,
            breakdown: [
                { factor: 'Base monthly rate', userValue: '$' + values.coverageAmount.toLocaleString() + ' coverage', impact: toCurrency(baseRate) },
                { factor: 'Age factor', userValue: values.age + ' years', impact: 'x' + ageFactor.toFixed(2) },
                { factor: 'Smoker factor', userValue: values.smoker === 'yes' ? 'Yes' : 'No', impact: 'x' + smokerFactor.toFixed(2) },
                { factor: 'Exercise factor', userValue: exercise.label, impact: 'x' + exercise.factor.toFixed(2) },
                { factor: 'Pre-existing conditions', userValue: values.preExistingConditions ? 'Yes' : 'No', impact: 'x' + preExistingFactor.toFixed(2) },
                { factor: 'Gender factor', userValue: gender.label, impact: 'x' + gender.factor.toFixed(2) },
                { factor: 'Coverage level', userValue: capitalize(values.coverage), impact: 'x' + coverageFactor.toFixed(2) }
            ]
        };
    }

    function renderResults(fullName, quoteData) {
        resultName.textContent = fullName;
        resultType.textContent = quoteData.typeLabel;
        monthlyPremium.textContent = toCurrency(quoteData.monthly);
        annualPremium.textContent = toCurrency(quoteData.annual);

        breakdownBody.innerHTML = '';
        quoteData.breakdown.forEach(function (row) {
            addBreakdownRow(breakdownBody, row.factor, row.userValue, row.impact);
        });

        lastQuote = { fullName: fullName, quoteData: quoteData };

        quoteResults.classList.remove('hidden');
        quoteResults.style.animation = 'none';
        quoteResults.offsetHeight; // Trigger reflow to restart animation
        quoteResults.style.animation = '';
        quoteResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    typeRadios.forEach(function (radio) {
        radio.addEventListener('change', function () {
            handleTypeSelection(this.value);
        });

        radio.addEventListener('click', function () {
            handleTypeSelection(this.value);
        });
    });

    function saveCurrentQuote() {
        if (!lastQuote) {
            return;
        }

        var quotes = JSON.parse(localStorage.getItem('savedQuotes')) || [];
        quotes.push({
            id: Date.now(),
            fullName: lastQuote.fullName,
            typeLabel: lastQuote.quoteData.typeLabel,
            monthly: lastQuote.quoteData.monthly,
            annual: lastQuote.quoteData.annual,
            savedAt: new Date().toLocaleDateString()
        });
        localStorage.setItem('savedQuotes', JSON.stringify(quotes));
        renderSavedQuotes();
    }

    function deleteCurrentQuote(index) {
        var quotes = JSON.parse(localStorage.getItem('savedQuotes')) || [];
        quotes.splice(index, 1);
        localStorage.setItem('savedQuotes', JSON.stringify(quotes));
        renderSavedQuotes();
    }

    function renderSavedQuotes() {
        if(!savedQuotesSection || !savedQuotesList) {
            return;
        }

        var quotes = JSON.parse(localStorage.getItem('savedQuotes')) || [];
        if(quotes.length === 0) {
            savedQuotesSection.classList.add('hidden');
            return;
        }

        savedQuotesSection.classList.remove('hidden');
        savedQuotesList.innerHTML = '';

        quotes.forEach(function(q, index) {
            var card = document.createElement('div');
            card.className = 'card mb-2 shadow-sm';

            var cardBody = document.createElement('div');
            cardBody.className = 'card-body d-flex justify-content-between align-items-center flex-wrap gap-2';

            var infoDiv = document.createElement('div');
            var strong = document.createElement('strong');
            strong.textContent = q.typeLabel;
            infoDiv.appendChild(strong);
            infoDiv.appendChild(document.createTextNode(' - '));
            infoDiv.appendChild(document.createTextNode(q.fullName));
            infoDiv.appendChild(document.createElement('br'));

            var small = document.createElement('small');
            small.className = 'text-muted';
            small.textContent = 'Monthly: $' + Number(q.monthly).toFixed(2) +
                ' | Annual: $' + Number(q.annual).toFixed(2) +
                ' | Saved on: ' + q.savedAt;
            infoDiv.appendChild(small);

            var deleteBtn = document.createElement('button');
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.textContent = 'Delete';
            deleteBtn.dataset.index = String(index);
            deleteBtn.addEventListener('click', function() {
                deleteCurrentQuote(Number(this.dataset.index));
            });

            cardBody.appendChild(infoDiv);
            cardBody.appendChild(deleteBtn);
            card.appendChild(cardBody);
            savedQuotesList.appendChild(card);
        });
    }

    quoteForm.addEventListener('submit', function (e) {
        e.preventDefault();
        clearAllErrors();

        var selectedType = getSelectedType();
        if (!selectedType) {
            setTypeError('Please select an insurance type.');
            return;
        }

        var quoteInput;
        var quoteData;
        var fullName;

        if (selectedType === 'auto') {
            quoteInput = getAutoQuoteData();
            if (!quoteInput.valid) {
                return;
            }
            quoteData = getAutoFactors(quoteInput.values);
            fullName = quoteInput.values.fullName;
        } else if (selectedType === 'home') {
            quoteInput = getHomeQuoteData();
            if (!quoteInput.valid) {
                return;
            }
            quoteData = getHomeFactors(quoteInput.values);
            fullName = quoteInput.values.fullName;
        } else {
            quoteInput = getLifeQuoteData();
            if (!quoteInput.valid) {
                return;
            }
            quoteData = getLifeFactors(quoteInput.values);
            fullName = quoteInput.values.fullName;
        }

        showSpinner();
        setTimeout(function() {
            hideSpinner();
            renderResults(fullName, quoteData);
        }, 1200);
    });

    quoteForm.addEventListener('reset', function () {
        clearAllErrors();
        hideAllTypeSections();
        if (step2Section) step2Section.classList.add('hidden');
        quoteResults.classList.add('hidden');
        hideSpinner();
    });

    if (resetQuoteBtn) {
        resetQuoteBtn.addEventListener('click', function () {
            quoteForm.reset();
            clearAllErrors();
            hideAllTypeSections();
            if (step2Section) step2Section.classList.add('hidden');
            quoteResults.classList.add('hidden');
            hideSpinner();
        });
    }

    if(saveQuoteBtn) {
        saveQuoteBtn.addEventListener('click', saveCurrentQuote)
    }

    if(printQuoteBtn) {
        printQuoteBtn.addEventListener('click', function() {
            window.print();
        });
    }

    renderSavedQuotes();
    showSelectedTypeSection(getSelectedType());
})();
(function initQuotePage () {
    var quoteForm = document.getElementById('quote-form');
    if (!quoteForm) {
        return;
    }

    var typeInput = document.getElementById('insuranceType');
    var typeButtons = document.querySelectorAll('.type-option');
    var stepDetails = document.getElementById('stepDetails');
    var stepQuote = document.getElementById('stepQuote');
    var quoteResults = document.getElementById('quoteResults');
    var resultName = document.getElementById('resultName');
    var resultType = document.getElementById('resultType');
    var monthlyPremium = document.getElementById('monthlyPremium');
    var annualPremium = document.getElementById('annualPremium');
    var baseRateInfo = document.getElementById('baseRateInfo');
    var ageInfo = document.getElementById('ageInfo');
    var yearInfo = document.getElementById('yearInfo');
    var mileageInfo = document.getElementById('mileageInfo');
    var coverageInfo = document.getElementById('coverageInfo');
    var ageImpact = document.getElementById('ageImpact');
    var yearImpact = document.getElementById('yearImpact');
    var mileageImpact = document.getElementById('mileageImpact');
    var coverageImpact = document.getElementById('coverageImpact');
    var resetQuoteBtn = document.getElementById('resetQuoteBtn');
    var saveQuoteBtn = document.getElementById('saveQuoteBtn');
    var compareQuotesBtn = document.getElementById('compareQuotesBtn');
    var printQuoteBtn = document.getElementById('printQuoteBtn');
    var savedQuotesList = document.getElementById('savedQuotesList');
    var noSavedQuotes = document.getElementById('noSavedQuotesMsg');

    var currentQuote = null;

    function getBaseRate(type) {
        if (type === 'home') {
            return 68;
        }
        if (type === 'life') {
            return 54;
        }
        return 75;
    }

    function formatTypeLabel(type) {
        if (type === 'home') {
            return 'Home Insurance';
        }
        if (type === 'life') {
            return 'Life Insurance';
        }
        return 'Auto Insurance';
    }

    function setStepState(stepElement, active) {
        if (!stepElement) {
            return;
        }

        if (active) {
            stepElement.classList.add('is-active');
        } else {
            stepElement.classList.remove('is-active');
        }
    }

    function getImpactText(multiplier) {
        if (multiplier === 1) {
            return 'No impact (x1.0)';
        }
        if (multiplier > 1) {
            return 'Higher rate (x' + multiplier.toFixed(2) + ')';
        }
        return 'Lower rate (x' + multiplier.toFixed(2) + ')';
    }

    function createSavedQuoteCard(quote) {
        var col = document.createElement('div');
        col.className = 'col-md-6 col-lg-4';

        var card = document.createElement('article');
        card.className = 'card border-0 shadow-sm h-100';

        var body = document.createElement('div');
        body.className = 'card-body';

        var name = document.createElement('h3');
        name.className = 'h6 mb-1';
        name.textContent = quote.fullName;
        
        var type = document.createElement('p')
        type.className = 'mb-1 text-muted';
        type.textContent = quote.InsuranceTypeLabel;

        var premium = document.createElement('p');
        premium.className = 'mb-0 fw-semibold';
        premium.textContent = '$' + quote.monthly.toFixed(2) + ' / month';

        body.appendChild(name);
        body.appendChild(type);
        body.appendChild(premium);
        card.appendChild(body);
        col.appendChild(card);

        return col;
    }

    function renderSavedQuotes() {
        if (!savedQuotesList || !noSavedQuotesMsg) {
            return;
        }

        var stored = localStorage.getItem('pinnacleSavedQuotes');
        var quotes = stored ? JSON.parse(stored) : [];

        savedQuotesList.innerHTML = '';

        if (!quotes.length) {
            noSavedQuotesMsg.classList.remove('d-none');
            return;
        }

        noSavedQuotesMsg.classList.add('d-none');
        quotes.forEach(function (quote) {
            savedQuotesList.appendChild(createSavedQuoteCard(quote));
        });
    }

    typeButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            var selectedType = button.getAttribute('data-type');
            typeInput.value = selectedType;

            typeButtons.forEach(function (item) {
                item.classList.remove('is-selected');
                item.setAttribute('aria-pressed', 'false');
            });

            button.classList.add('is-selected');
            button.setAttribute('aria-pressed', 'true');
            setStepState(stepDetails, true);
        });
    });

    quoteForm.addEventListener('submit', function (e) {
        e.preventDefault();

        if (!quoteForm.checkValidity()) {
            quoteForm.classList.add('was-validated');
            return;
        }

        var fullName = (document.getElementById('fullName').value || '').trim();
        var age = Number(document.getElementById('age').value || 0);
        var year = Number(document.getElementById('vehicleYear').value || 0);
        var mileage = document.getElementById('annualMileage').value;
        var coverage = document.getElementById('coverageLevel').value;
        var type = typeInput.value;

        if (!type) {
            return;
        }

        var ageMultiplier = age < 25 ? 1.25 : age > 65 ? 1.15 : 1.0;
        var yearMultiplier = year < 2015 ? 1.12 : 1.0;
        var mileageMultiplier = mileage === 'high' ? 1.18 : mileage === 'low' ? 0.93 : 1.0;
        var coverageMultiplier = coverage === 'premium' ? 1.35 : coverage === 'basic' ? 0.88 : 1.0;

        var baseRate = getBaseRate(type);
        var monthly = baseRate * ageMultiplier * yearMultiplier * mileageMultiplier * coverageMultiplier;
        var annual = monthly * 12;

        var insuranceTypeLabel = formatTypeLabel(type);
        var coverageLabel = coverage.charAt(0).toUpperCase() + coverage.slice(1) + ' coverage';
        var mileageLabel = mileage === 'high' ? '10,000+ high mileage' : mileage === 'low' ? 'Under 5,000 low mileage' : '5,000-10,000 standard';

        currentQuote = {
            fullName: fullName,
            insuranceTypeLabel: insuranceTypeLabel,
            monthly: monthly,
            annual: annual
        };

        resultName.textContent = fullName;
        resultType.textContent = insuranceTypeLabel;
        monthlyPremium.textContent = '$' + monthly.toFixed(2);
        annualPremium.textContent = '$' + annual.toFixed(2);

        baseRateInfo.textContent = '$' + baseRate.toFixed(2) + '/month';
        ageInfo.textContent = age + ' years old';
        yearInfo.textContent = year + ' model year';
        mileageInfo.textContent = mileageLabel;
        coverageInfo.textContent = coverageLabel;

        ageImpact.innerHTML = '<strong>' + getImpactText(ageMultiplier) + '</strong>';
        yearImpact.innerHTML = '<strong>' + getImpactText(yearMultiplier) + '</strong>';
        mileageImpact.innerHTML = '<strong>' + getImpactText(mileageMultiplier) + '</strong>';
        coverageImpact.innerHTML = '<strong>' + getImpactText(coverageMultiplier) + '</strong>';

        setStepState(stepQuote, true);
        quoteResults.classList.remove('d-none');
        quoteResults.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    quoteForm.addEventListener('reset', function () {
        typeButtons.forEach(function (item) {
            item.classList.remove('is-selected');
            item.setAttribute('aria-pressed', 'false');
        });

        quoteForm.classList.remove('was-validated');
        typeInput.value = '';
        setStepState(stepDetails, false);
        setStepState(stepQuote, false);
        quoteResults.classList.add('d-none');
        currentQuote = null;
    });

    if (resetQuoteBtn) {
        resetQuoteBtn.addEventListener('click', function () {
            quoteForm.reset();
            quoteResults.classList.add('d-none');
        });
    }

    if (saveQuoteBtn) {
        saveQuoteBtn.addEventListener('click', function () {
            if (!currentQuote) {
                return;
            }

            var stored = localStorage.getItem('pinnacleSavedQuotes');
            var quotes = stored ? JSON.parse(stored) : [];
            quotes.unshift(currentQuote);
            quotes = quotes.slice(0, 6);
            localStorage.setItem('pinnacleSavedQuotes', JSON.stringify(quotes));
            renderSavedQuotes();
        });
    }

    if (compareQuotesBtn) {
        compareQuotesBtn.addEventListener('click', function () {
            document.getElementById('savedQuotesSection').scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    }

    if (printQuoteBtn) {
        printQuoteBtn.addEventListener('click', function () {
            window.print();
        });
    }

    renderSavedQuotes();
})();
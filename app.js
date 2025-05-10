document.addEventListener('DOMContentLoaded', () => {
    // DOM Elements
    const calculateBtn = document.getElementById('calculate');
    const balanceInput = document.getElementById('balance');
    const aprInput = document.getElementById('apr');
    const paymentInput = document.getElementById('payment');
    const timeToPayoffEl = document.getElementById('timeToPayoff');
    const totalInterestEl = document.getElementById('totalInterest');
    const subscriptionModal = document.getElementById('subscriptionModal');
    const shareModal = document.getElementById('shareModal');
    const overlay = document.getElementById('overlay');
    const trialInfoEl = document.getElementById('trialInfo');
    const closeModalBtn = document.getElementById('closeModal');
    const closeShareModalBtn = document.getElementById('closeShareModal');
    const trialProgressBar = document.getElementById('trialProgressBar');
    const proBadge = document.getElementById('proBadge');
    const upgradeBtn = document.getElementById('upgradeBtn');
    const bannerUpgradeBtn = document.getElementById('bannerUpgradeBtn');
    const subscriptionBanner = document.getElementById('subscriptionBanner');
    const downloadPdfBtn = document.getElementById('downloadPdfBtn');
    const shareBtn = document.getElementById('shareBtn');
    const actionButtons = document.getElementById('actionButtons');
    const pricingToggle = document.getElementById('pricingToggle');
    const monthlyPlan = document.getElementById('monthlyPlan');
    const yearlyPlan = document.getElementById('yearlyPlan');
    const copyLinkBtn = document.getElementById('copyLinkBtn');
    const emailShareBtn = document.getElementById('emailShareBtn');
    const twitterShareBtn = document.getElementById('twitterShareBtn');
    const facebookShareBtn = document.getElementById('facebookShareBtn');
    const shareLinkInput = document.getElementById('shareLink');
    const copyBtn = document.getElementById('copyBtn');
    
    // Constants
    const TRIAL_DURATION_MS = 7 * 24 * 60 * 60 * 1000; // 7 days in milliseconds
    const TRIAL_START_KEY = 'ccCalculator_trialStart';
    const SUBSCRIPTION_STATUS_KEY = 'ccCalculator_subscribed';
    const MONTHLY_PLAN_ID = 'P-6H6239122C6063711NAHE4QY';
    const YEARLY_PLAN_ID = 'P-6H6239122C6063711NAHE4QY'; // Using same ID for demo, would be different in production
    const PAYPAL_HOSTED_BUTTON_ID = '8UUCNXMEQAV28';
    
    // Calculation results storage
    let calculationResults = null;
    
    // Initialize the application
    initApp();
    
    // Main initialization function
    function initApp() {
        // Setup event listeners
        calculateBtn.addEventListener('click', performCalculation);
        closeModalBtn.addEventListener('click', hideSubscriptionModal);
        closeShareModalBtn?.addEventListener('click', hideShareModal);
        overlay.addEventListener('click', hideAllModals);
        upgradeBtn.addEventListener('click', showSubscriptionModal);
        
        if (bannerUpgradeBtn) {
            bannerUpgradeBtn.addEventListener('click', showSubscriptionModal);
        }
        
        if (downloadPdfBtn) {
            downloadPdfBtn.addEventListener('click', generatePDF);
        }
        
        if (shareBtn) {
            shareBtn.addEventListener('click', showShareModal);
        }
        
        if (pricingToggle) {
            pricingToggle.addEventListener('change', togglePricingPlan);
        }
        
        if (copyLinkBtn) {
            copyLinkBtn.addEventListener('click', copyShareLink);
        }
        
        if (emailShareBtn) {
            emailShareBtn.addEventListener('click', shareViaEmail);
        }
        
        if (twitterShareBtn) {
            twitterShareBtn.addEventListener('click', shareViaTwitter);
        }
        
        if (facebookShareBtn) {
            facebookShareBtn.addEventListener('click', shareViaFacebook);
        }
        
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                shareLinkInput.select();
                document.execCommand('copy');
                showSuccessMessage('Link copied to clipboard!');
            });
        }
        
        // Set up input formatting
        setupInputFormatting();
        
        // Check trial/subscription status
        checkTrialStatus();
        
        // Initialize PayPal
        initPayPalButton();
        
        // Add input event listeners for real-time validation
        balanceInput.addEventListener('input', validateInputs);
        aprInput.addEventListener('input', validateInputs);
        paymentInput.addEventListener('input', validateInputs);
        
        // Initial form validation
        validateInputs();
    }
    
    // Set up input formatting
    function setupInputFormatting() {
        // Format balance input with $ sign
        balanceInput.addEventListener('focus', function() {
            if (this.value === '') return;
            this.value = this.value.replace(/[^0-9.]/g, '');
        });
        
        balanceInput.addEventListener('blur', function() {
            if (this.value === '') return;
            this.value = parseFloat(this.value).toFixed(2);
        });
        
        // Format APR input with % sign
        aprInput.addEventListener('focus', function() {
            if (this.value === '') return;
            this.value = this.value.replace(/[^0-9.]/g, '');
        });
        
        aprInput.addEventListener('blur', function() {
            if (this.value === '') return;
            this.value = parseFloat(this.value).toFixed(2);
        });
        
        // Format payment input with $ sign
        paymentInput.addEventListener('focus', function() {
            if (this.value === '') return;
            this.value = this.value.replace(/[^0-9.]/g, '');
        });
        
        paymentInput.addEventListener('blur', function() {
            if (this.value === '') return;
            this.value = parseFloat(this.value).toFixed(2);
        });
    }
    
    // Validate inputs and update calculate button state
    function validateInputs() {
        const balance = parseFloat(balanceInput.value);
        const apr = parseFloat(aprInput.value);
        const payment = parseFloat(paymentInput.value);
        
        const isValid = !isNaN(balance) && !isNaN(apr) && !isNaN(payment) && 
                       balance > 0 && apr >= 0 && payment > 0;
        
        calculateBtn.disabled = !isValid;
        calculateBtn.style.opacity = isValid ? '1' : '0.6';
        
        return isValid;
    }
    
    // Check the trial status
    function checkTrialStatus() {
        // Check if user is already subscribed
        if (localStorage.getItem(SUBSCRIPTION_STATUS_KEY) === 'true') {
            trialInfoEl.innerHTML = 'You have full access to the <strong>Pro Version</strong>';
            trialInfoEl.style.backgroundColor = '#d4edda';
            trialInfoEl.style.color = '#155724';
            trialInfoEl.style.borderLeft = '4px solid #28a745';
            
            // Hide progress bar for Pro users
            if (trialProgressBar) {
                trialProgressBar.parentElement.style.display = 'none';
            }
            
            // Show Pro badge
            proBadge.style.display = 'inline-block';
            
            // Hide upgrade button and subscription banner for Pro users
            upgradeBtn.style.display = 'none';
            if (subscriptionBanner) {
                subscriptionBanner.style.display = 'none';
            }
            
            return;
        }
        
        // Show upgrade button for non-pro users
        upgradeBtn.style.display = 'flex';
        
        // Get trial start time from localStorage or set it now
        let trialStartTime = localStorage.getItem(TRIAL_START_KEY);
        
        // If no trial start time exists, set it now
        if (!trialStartTime) {
            trialStartTime = new Date().getTime().toString();
            localStorage.setItem(TRIAL_START_KEY, trialStartTime);
        }
        
        const trialEndTime = parseInt(trialStartTime) + TRIAL_DURATION_MS;
        const currentTime = new Date().getTime();
        
        // Check if trial has expired
        if (currentTime > trialEndTime) {
            // Trial expired - show subscription modal
            trialInfoEl.innerHTML = '<strong>Your free trial has expired</strong> - Upgrade to continue';
            trialInfoEl.style.backgroundColor = '#f8d7da';
            trialInfoEl.style.color = '#721c24';
            trialInfoEl.style.borderLeft = '4px solid #dc3545';
            
            // Empty progress bar
            if (trialProgressBar) {
                trialProgressBar.style.width = '0%';
            }
            
            // Show subscription banner
            if (subscriptionBanner) {
                subscriptionBanner.style.display = 'block';
            }
            
            // Auto show modal after a delay
            setTimeout(() => {
                showSubscriptionModal();
            }, 1000);
        } else {
            // Trial still active - show days remaining
            const daysLeft = Math.ceil((trialEndTime - currentTime) / (24 * 60 * 60 * 1000));
            const percentLeft = ((trialEndTime - currentTime) / TRIAL_DURATION_MS) * 100;
            
            trialInfoEl.innerHTML = `<strong>Free Trial:</strong> ${daysLeft} day${daysLeft !== 1 ? 's' : ''} remaining`;
            trialInfoEl.style.backgroundColor = '#d1ecf1';
            trialInfoEl.style.color = '#0c5460';
            trialInfoEl.style.borderLeft = '4px solid #17a2b8';
            
            // Update progress bar
            if (trialProgressBar) {
                trialProgressBar.style.width = `${percentLeft}%`;
            }
            
            // Show subscription banner
            if (subscriptionBanner) {
                subscriptionBanner.style.display = 'block';
            }
        }
    }
    
    // Toggle between monthly and yearly pricing plans
    function togglePricingPlan() {
        if (pricingToggle.checked) {
            // Show yearly plan
            yearlyPlan.style.display = 'block';
            monthlyPlan.style.display = 'none';
        } else {
            // Show monthly plan
            monthlyPlan.style.display = 'block';
            yearlyPlan.style.display = 'none';
        }
    }
    
    // Credit card payoff calculation
    function performCalculation() {
        // Check if user can use the calculator
        if (!canUseCalculator()) {
            showSubscriptionModal();
            return;
        }
        
        // Validate inputs
        if (!validateInputs()) {
            showErrorMessage('Please enter valid values for all fields');
            return;
        }
        
        // Get input values
        const balance = parseFloat(balanceInput.value);
        const apr = parseFloat(aprInput.value);
        const payment = parseFloat(paymentInput.value);
        
        // Monthly interest rate
        const monthlyRate = apr / 100 / 12;
        
        // Calculate minimum payment (interest plus 1% of balance)
        const minimumPayment = balance * monthlyRate + balance * 0.01;
        
        if (payment < minimumPayment) {
            showErrorMessage(`Your monthly payment should be at least $${minimumPayment.toFixed(2)} to make progress on this debt.`);
            return;
        }
        
        // Add animation to results section
        document.getElementById('results').classList.add('calculating');
        
        // Use setTimeout to allow for animation to show
        setTimeout(() => {
            // Calculate months to payoff
            let remainingBalance = balance;
            let months = 0;
            let totalInterest = 0;
            let paymentSchedule = [];
            
            while (remainingBalance > 0 && months < 1200) { // Cap at 100 years
                // Calculate interest for this month
                const interestThisMonth = remainingBalance * monthlyRate;
                totalInterest += interestThisMonth;
                
                // Calculate principal for this payment
                const principalThisMonth = Math.min(payment - interestThisMonth, remainingBalance);
                
                // Track payment details for this month
                paymentSchedule.push({
                    month: months + 1,
                    payment: Math.min(payment, remainingBalance + interestThisMonth),
                    principal: principalThisMonth,
                    interest: interestThisMonth,
                    remainingBalance: Math.max(0, remainingBalance - principalThisMonth)
                });
                
                // Apply payment
                remainingBalance = remainingBalance + interestThisMonth - payment;
                
                // If final payment
                if (remainingBalance < 0) {
                    totalInterest += remainingBalance; // Adjust for overpayment
                    remainingBalance = 0;
                }
                
                months++;
            }
            
            // Convert months to years and months format
            const years = Math.floor(months / 12);
            const remainingMonths = months % 12;
            let timeString = '';
            
            if (years > 0) {
                timeString += `${years} year${years !== 1 ? 's' : ''} `;
            }
            if (remainingMonths > 0 || years === 0) {
                timeString += `${remainingMonths} month${remainingMonths !== 1 ? 's' : ''}`;
            }
            
            // Store calculation results for PDF and sharing
            calculationResults = {
                balance,
                apr,
                payment,
                timeToPayoff: timeString,
                totalInterest: totalInterest.toFixed(2),
                months,
                paymentSchedule
            };
            
            // Update the results with animation
            animateValue(timeToPayoffEl, timeString);
            animateValue(totalInterestEl, `$${totalInterest.toFixed(2)}`);
            
            // Remove animation class
            document.getElementById('results').classList.remove('calculating');
            
            // Show action buttons
            actionButtons.style.display = 'flex';
            
            // Update share link
            updateShareLink();
        }, 500);
    }
    
    // Update share link with current calculation parameters
    function updateShareLink() {
        if (!calculationResults) return;
        
        const { balance, apr, payment } = calculationResults;
        const baseUrl = window.location.href.split('?')[0];
        const shareUrl = `${baseUrl}?balance=${balance}&apr=${apr}&payment=${payment}`;
        
        if (shareLinkInput) {
            shareLinkInput.value = shareUrl;
        }
    }
    
    // Animate value change
    function animateValue(element, value) {
        element.style.opacity = 0;
        
        setTimeout(() => {
            element.textContent = value;
            element.style.opacity = 1;
        }, 300);
    }
    
    // Show error message
    function showErrorMessage(message) {
        const errorToast = document.createElement('div');
        errorToast.className = 'error-toast';
        errorToast.innerHTML = `<i class="fas fa-exclamation-circle"></i> ${message}`;
        document.body.appendChild(errorToast);
        
        // Show the error toast
        setTimeout(() => {
            errorToast.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            errorToast.classList.remove('show');
            setTimeout(() => {
                errorToast.remove();
            }, 300);
        }, 3000);
    }
    
    // Show success message
    function showSuccessMessage(message) {
        const successToast = document.createElement('div');
        successToast.className = 'success-toast';
        successToast.innerHTML = `<i class="fas fa-check-circle"></i> ${message}`;
        document.body.appendChild(successToast);
        
        // Show the success toast
        setTimeout(() => {
            successToast.classList.add('show');
        }, 10);
        
        // Remove after 3 seconds
        setTimeout(() => {
            successToast.classList.remove('show');
            setTimeout(() => {
                successToast.remove();
            }, 300);
        }, 3000);
    }
    
    // Generate PDF of calculation results
    function generatePDF() {
        // Check if user can use the feature
        if (!canUseCalculator()) {
            showSubscriptionModal();
            return;
        }
        
        if (!calculationResults) {
            showErrorMessage('Please perform a calculation first');
            return;
        }
        
        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            
            // Add title
            doc.setFontSize(20);
            doc.text('Credit Card Payoff Calculator', 105, 20, { align: 'center' });
            
            // Add calculation summary
            doc.setFontSize(12);
            doc.text('Calculation Summary', 20, 40);
            
            doc.setFontSize(10);
            doc.text(`Credit Card Balance: $${calculationResults.balance.toFixed(2)}`, 20, 50);
            doc.text(`Annual Percentage Rate (APR): ${calculationResults.apr.toFixed(2)}%`, 20, 57);
            doc.text(`Monthly Payment: $${calculationResults.payment.toFixed(2)}`, 20, 64);
            doc.text(`Time to Pay Off: ${calculationResults.timeToPayoff}`, 20, 71);
            doc.text(`Total Interest Paid: $${calculationResults.totalInterest}`, 20, 78);
            
            // Add payment schedule table if available
            if (calculationResults.paymentSchedule && calculationResults.paymentSchedule.length > 0) {
                doc.text('Payment Schedule', 20, 95);
                
                // Create table data
                const headers = [['Month', 'Payment', 'Principal', 'Interest', 'Remaining Balance']];
                
                // Only include first 12 months and last month for readability
                let tableData = [];
                const schedule = calculationResults.paymentSchedule;
                
                // First 12 months
                const firstMonths = Math.min(12, schedule.length);
                for (let i = 0; i < firstMonths; i++) {
                    const payment = schedule[i];
                    tableData.push([
                        payment.month.toString(),
                        `$${payment.payment.toFixed(2)}`,
                        `$${payment.principal.toFixed(2)}`,
                        `$${payment.interest.toFixed(2)}`,
                        `$${payment.remainingBalance.toFixed(2)}`
                    ]);
                }
                
                // Last month if more than 12 months
                if (schedule.length > 12) {
                    tableData.push(['...', '...', '...', '...', '...']);
                    const lastPayment = schedule[schedule.length - 1];
                    tableData.push([
                        lastPayment.month.toString(),
                        `$${lastPayment.payment.toFixed(2)}`,
                        `$${lastPayment.principal.toFixed(2)}`,
                        `$${lastPayment.interest.toFixed(2)}`,
                        `$${lastPayment.remainingBalance.toFixed(2)}`
                    ]);
                }
                
                // Create the table
                doc.autoTable({
                    head: headers,
                    body: tableData,
                    startY: 100,
                    theme: 'grid',
                    styles: { fontSize: 8 },
                    headStyles: { fillColor: [67, 97, 238] }
                });
            }
            
            // Add footer
            const pageCount = doc.internal.getNumberOfPages();
            for (let i = 1; i <= pageCount; i++) {
                doc.setPage(i);
                doc.setFontSize(8);
                doc.text(`Generated on ${new Date().toLocaleDateString()} - Credit Card Payoff Calculator Pro`, 105, 287, { align: 'center' });
            }
            
            // Save the PDF
            doc.save('Credit-Card-Payoff-Calculation.pdf');
            
            showSuccessMessage('PDF downloaded successfully!');
        } catch (error) {
            console.error('Error generating PDF:', error);
            showErrorMessage('Failed to generate PDF. Please try again.');
        }
    }
    
    // Show share modal
    function showShareModal() {
        // Check if user can use the feature
        if (!canUseCalculator()) {
            showSubscriptionModal();
            return;
        }
        
        if (!calculationResults) {
            showErrorMessage('Please perform a calculation first');
            return;
        }
        
        updateShareLink();
        
        shareModal.style.display = 'block';
        overlay.style.display = 'block';
        
        // Add animation class
        setTimeout(() => {
            shareModal.classList.add('show');
            overlay.classList.add('show');
        }, 10);
    }
    
    // Hide share modal
    function hideShareModal() {
        shareModal.classList.remove('show');
        
        setTimeout(() => {
            shareModal.style.display = 'none';
            if (!subscriptionModal.classList.contains('show')) {
                overlay.style.display = 'none';
                overlay.classList.remove('show');
            }
        }, 300);
    }
    
    // Copy share link to clipboard
    function copyShareLink() {
        if (shareLinkInput) {
            shareLinkInput.select();
            document.execCommand('copy');
            showSuccessMessage('Link copied to clipboard!');
        }
    }
    
    // Share via email
    function shareViaEmail() {
        if (!calculationResults) return;
        
        const subject = 'Credit Card Payoff Calculation';
        const body = `Check out my credit card payoff calculation:\n\n` +
                    `Credit Card Balance: $${calculationResults.balance.toFixed(2)}\n` +
                    `APR: ${calculationResults.apr.toFixed(2)}%\n` +
                    `Monthly Payment: $${calculationResults.payment.toFixed(2)}\n` +
                    `Time to Pay Off: ${calculationResults.timeToPayoff}\n` +
                    `Total Interest: $${calculationResults.totalInterest}\n\n` +
                    `Calculate your own payoff time at: ${window.location.href.split('?')[0]}`;
        
        window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    }
    
    // Share via Twitter
    function shareViaTwitter() {
        if (!calculationResults) return;
        
        const text = `I'll pay off my credit card in ${calculationResults.timeToPayoff} with a $${calculationResults.payment.toFixed(2)} monthly payment! Calculate your own payoff time:`;
        const url = window.location.href.split('?')[0];
        
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
    }
    
    // Share via Facebook
    function shareViaFacebook() {
        const url = window.location.href.split('?')[0];
        window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
    }
    
    // Function to check if user can use the calculator
    function canUseCalculator() {
        // If subscribed, they can use it
        if (localStorage.getItem(SUBSCRIPTION_STATUS_KEY) === 'true') {
            return true;
        }
        
        // Check trial status
        const trialStartTime = localStorage.getItem(TRIAL_START_KEY);
        if (!trialStartTime) {
            return true; // New user, can use it
        }
        
        const trialEndTime = parseInt(trialStartTime) + TRIAL_DURATION_MS;
        const currentTime = new Date().getTime();
        
        // Can use if trial is still active
        return currentTime <= trialEndTime;
    }
    
    // Show subscription modal
    function showSubscriptionModal() {
        subscriptionModal.style.display = 'block';
        overlay.style.display = 'block';
        
        // Add animation class
        setTimeout(() => {
            subscriptionModal.classList.add('show');
            overlay.classList.add('show');
        }, 10);
    }
    
    // Hide subscription modal
    function hideSubscriptionModal() {
        subscriptionModal.classList.remove('show');
        
        setTimeout(() => {
            subscriptionModal.style.display = 'none';
            if (!shareModal.classList.contains('show')) {
                overlay.style.display = 'none';
                overlay.classList.remove('show');
            }
        }, 300);
    }
    
    // Hide all modals
    function hideAllModals() {
        hideSubscriptionModal();
        hideShareModal();
        
        overlay.classList.remove('show');
        setTimeout(() => {
            overlay.style.display = 'none';
        }, 300);
    }
    
    // Initialize PayPal buttons
    function initPayPalButton() {
        // Monthly subscription button
        paypal.Buttons({
            style: {
                shape: 'pill',
                color: 'blue',
                layout: 'vertical',
                label: 'subscribe'
            },
            createSubscription: function(data, actions) {
                return actions.subscription.create({
                    'plan_id': MONTHLY_PLAN_ID
                });
            },
            onApprove: function(data, actions) {
                handleSuccessfulSubscription();
            }
        }).render('#paypal-button-monthly');
        
        // Yearly subscription button
        paypal.Buttons({
            style: {
                shape: 'pill',
                color: 'blue',
                layout: 'vertical',
                label: 'subscribe'
            },
            createSubscription: function(data, actions) {
                return actions.subscription.create({
                    'plan_id': YEARLY_PLAN_ID
                });
            },
            onApprove: function(data, actions) {
                handleSuccessfulSubscription();
            }
        }).render('#paypal-button-yearly');
    }
    
    // Handle successful subscription
    function handleSuccessfulSubscription() {
        // User has approved the subscription
        localStorage.setItem(SUBSCRIPTION_STATUS_KEY, 'true');
        
        // Hide the modal with animation
        hideSubscriptionModal();
        
        // Update the trial info text
        trialInfoEl.innerHTML = 'You have full access to the <strong>Pro Version</strong>';
        trialInfoEl.style.backgroundColor = '#d4edda';
        trialInfoEl.style.color = '#155724';
        trialInfoEl.style.borderLeft = '4px solid #28a745';
        
        // Hide progress bar for Pro users
        if (trialProgressBar) {
            trialProgressBar.parentElement.style.display = 'none';
        }
        
        // Show Pro badge
        proBadge.style.display = 'inline-block';
        
        // Hide upgrade button and subscription banner
        upgradeBtn.style.display = 'none';
        if (subscriptionBanner) {
            subscriptionBanner.style.display = 'none';
        }
        
        // Show success message
        showSuccessMessage('Thank you for subscribing! You now have full access to all premium features.');
    }
    
    // Check URL parameters for shared calculations
    function checkUrlParameters() {
        const urlParams = new URLSearchParams(window.location.search);
        const hasBalance = urlParams.has('balance');
        const hasApr = urlParams.has('apr');
        const hasPayment = urlParams.has('payment');
        
        // If all parameters are present, fill the form and calculate
        if (hasBalance && hasApr && hasPayment) {
            balanceInput.value = parseFloat(urlParams.get('balance')).toFixed(2);
            aprInput.value = parseFloat(urlParams.get('apr')).toFixed(2);
            paymentInput.value = parseFloat(urlParams.get('payment')).toFixed(2);
            
            // Trigger calculation after a short delay
            setTimeout(() => {
                performCalculation();
            }, 500);
        }
    }
    
    // Check URL parameters on load
    checkUrlParameters();
});
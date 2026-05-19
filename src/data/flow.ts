import type { FlowStep, StepId, PlanBenefits, PlanTier } from '../types';

export const PLAN_BENEFITS: Record<PlanTier, PlanBenefits> = {
    ruby: {
        dailyAmount: 250,
        pocketMoneyPerMonth: 937.5,
        hospitalCashPerNight: 5000,
        hustleShield: 50000,
    },
    emerald: {
        dailyAmount: 500,
        pocketMoneyPerMonth: 1875,
        hospitalCashPerNight: 10000,
        hustleShield: 100000,
    },
    sapphire: {
        dailyAmount: 1000,
        pocketMoneyPerMonth: 3750,
        hospitalCashPerNight: 20000,
        hustleShield: 200000,
    },
};

export const flowSteps: Record<StepId, FlowStep> = {
    WELCOME: {
        botMessages: [
            'Hey there! 👋 Welcome to Gemynate. We help you build a strong safety net so you always have a BackUp when unexpected emergencies happen. You can start by subscribing to a daily plan to protect your health and your hustle.\n\nReady?',
        ],
        quickReplies: [
            { label: "Yes, let's go! 🚀", action: 'ONBOARDING_CTA' },
            { label: 'Tell me more 💡', action: 'WELCOME_MORE' },
        ],
    },
    WELCOME_MORE: {
        botMessages: [
            "When you subscribe to a daily plan (like ₦250 or ₦500), you are building your BackUp.\n\nHere is what is inside your BackUp:\n\n💸 Pocket Money (15%): A small part is saved for you to withdraw anytime you need quick cash.\n🏥 Hospital Cash: Get a fixed amount for the days you are admitted to a hospital.\n🛡️ Hustle Shield: Get a fixed payment when you can't work due to an accidental injury.\n\nReady to get started?",
        ],
        quickReplies: [
            { label: "Yes, let's go! 🚀", action: 'ONBOARDING_CTA' },
        ],
    },
    CLAIM_ACCIDENTAL_INJURY_FIRST: {
        botMessages: [
            "We are here with you. Please tell us what has happened.",
        ],
        quickReplies: [
            { label: '🩺  I had an accident and need medical support', action: 'CLAIM_ACCIDENTAL_INJURY' },
            { label: '🛑  I have a permanent disability from an accident', action: 'CLAIM_DISABILITY' },
            { label: '💛  I am making a claim for a family member who has passed away', action: 'CLAIM_DEATH' },
        ],
    },
    ONBOARDING_CTA: {
        botMessages: [
            "Awesome! Let's get you set up. Complete your onboarding in 3 minutes.",
        ],
        cta: { label: 'Start Onboarding', action: 'ONBOARDING_FORM' },
    },
    ONBOARDING_FORM: {
        botMessages: [],
        sheet: 'onboarding',
    },
    ONBOARDING_COMPLETE: {
        botMessages: [],
        quickReplies: [
            { label: '🔴 Ruby — ₦250/day', action: 'PLAN_SELECTED_RUBY' },
            { label: '🟢 Emerald — ₦500/day', action: 'PLAN_SELECTED_EMERALD' },
            {
                label: '🔵 Sapphire — ₦1,000/day',
                action: 'PLAN_SELECTED_SAPPHIRE',
            },
        ],
    },
    PLAN_SELECTED_RUBY: {
        botMessages: [],
        cta: { label: 'Link Bank Account 🔒', action: 'PAYMENT_FORM' },
    },
    PLAN_SELECTED_EMERALD: {
        botMessages: [],
        cta: { label: 'Link Bank Account 🔒', action: 'PAYMENT_FORM' },
    },
    PLAN_SELECTED_SAPPHIRE: {
        botMessages: [],
        cta: { label: 'Link Bank Account 🔒', action: 'PAYMENT_FORM' },
    },
    PLAN_SELECTED: {
        botMessages: [],
    },
    PAYMENT_FORM: {
        botMessages: [],
        sheet: 'payment',
    },
    ACCOUNT_LINKED: {
        botMessages: [],
        quickReplies: [{ label: 'Check My BackUp 📊', action: 'DASHBOARD' }],
    },
    DASHBOARD: {
        botMessages: [],
        quickReplies: [{ label: 'Open Menu ☰', action: 'DASHBOARD_MENU' }],
    },
    DASHBOARD_MENU: {
        botMessages: ['Tap the menu below to choose an action:'],
        menuItems: [
            { label: 'Withdraw Pocket Money', action: 'DASHBOARD_WITHDRAW' },
            { label: 'Claim from BackUp', action: 'CLAIM_FLOW' },
            { label: 'My Policy Details', action: 'POLICY_DETAILS' },
            { label: 'Talk to Support', action: 'SUPPORT' },
        ],
    },
    POLICY_DETAILS: {
        botMessages: [],
        quickReplies: [
            { label: 'Download PDF 📄', action: 'POLICY_PDF' },
            { label: 'Back to Menu 🔙', action: 'DASHBOARD_MENU' },
        ],
    },
    POLICY_PDF: {
        botMessages: [
            'Your full legal policy document has been sent to your registered email address as a PDF. 📧\n\nPlease check your inbox (and spam folder, just in case).',
        ],
        quickReplies: [{ label: 'Back to Menu 🔙', action: 'DASHBOARD_MENU' }],
    },
    SUPPORT: {
        botMessages: [
            "Our support team will contact you shortly. 📞\n\nYou can also reach us at support@gemynate.com or call 0800-BACKUP.\n\nWe're here for you!",
        ],
        quickReplies: [{ label: 'Back to Menu 🔙', action: 'DASHBOARD_MENU' }],
    },
    DASHBOARD_WITHDRAW: {
        botMessages: [
            "You can withdraw from your Pocket Money balance anytime. Let's process that for you.",
        ],
        cta: { label: 'Start withdrawal', action: 'WITHDRAW_SHEET' },
    },
    WITHDRAW_SHEET: {
        botMessages: [],
        sheet: 'withdrawal',
    },
    WITHDRAW_SUCCESS: {
        botMessages: [],
        quickReplies: [
            { label: 'Check My BackUp 📊', action: 'DASHBOARD' },
            { label: 'Back to Menu 🔙', action: 'DASHBOARD_MENU' },
        ],
    },
    CLAIM_FLOW: {
        botMessages: [],
        quickReplies: [
            { label: 'Hospital Admission 🏥', action: 'CLAIM_HOSPITAL' },
            {
                label: 'Accidental Injury 🛡️',
                action: 'CLAIM_ACCIDENTAL_INJURY',
            },
        ],
    },
    CLAIM_HOSPITAL: {
        botMessages: [
            "Understood. Let's get your Hospital Cash processed. Are you currently still in the hospital, or have you been discharged?",
        ],
        quickReplies: [
            { label: 'Still Admitted 🛏️', action: 'CLAIM_STILL_ADMITTED' },
            { label: 'Discharged 🚶🏾‍♂️', action: 'CLAIM_DISCHARGED' },
        ],
    },
    CLAIM_ACCIDENTAL_INJURY: {
        botMessages: [
            "We're sorry to hear about your injury. Our Hustle Shield team will review your case.\n\nA support agent will contact you within 24 hours to guide you through the verification process and get your payout started.\n\nStay strong — your BackUp is here for you! 💪",
        ],
        quickReplies: [{ label: 'Check My BackUp 📊', action: 'DASHBOARD' }],
    },
    // --- Still Admitted Path (4 steps + completion) ---
    CLAIM_STILL_ADMITTED: {
        botMessages: [
            "We wish you a quick recovery! You can claim cash for the nights you have spent so far. Let's get this verified quickly.",
            'Step 1 of 5: Proof of Admission 📄\nTap the button below to upload a clear photo of your official Hospital Admission Letter.\n\n🔒 Your documents are encrypted and stored securely.',
        ],
        claimAction: 'upload_photo',
    },
    CLAIM_ADMITTED_STEP2: {
        botMessages: [
            'Received! ✅',
            'Step 2 of 5: Location Check 📍\nTo speed up your claim, please share your current location. This helps us verify you are at a registered hospital.',
        ],
        claimAction: 'share_location',
    },
    CLAIM_ADMITTED_HOSPITAL_CONFIRM: {
        botMessages: [
            'Location logged. ✅',
            'Step 3 of 5: Hospital Check 🏥\nOur system detected you are at: St. Nicholas Hospital. Is this correct?',
        ],
        quickReplies: [
            { label: "Yes, that's correct 👍🏾", action: 'CLAIM_ADMITTED_STEP3' },
            {
                label: 'No, select hospital',
                action: 'CLAIM_ADMITTED_HOSPITAL_SELECT',
            },
        ],
    },
    CLAIM_ADMITTED_HOSPITAL_SELECT: {
        botMessages: [
            'No worries. Please select the correct hospital from the list below:',
        ],
        quickReplies: [
            { label: 'St. Nicholas Hospital', action: 'CLAIM_ADMITTED_STEP3' },
            {
                label: 'Lagos University Teaching Hospital (LUTH)',
                action: 'CLAIM_ADMITTED_STEP3',
            },
            { label: 'Reddington Hospital', action: 'CLAIM_ADMITTED_STEP3' },
            {
                label: 'Evercare Hospital Lekki',
                action: 'CLAIM_ADMITTED_STEP3',
            },
            {
                label: 'First Cardiology Consultants',
                action: 'CLAIM_ADMITTED_STEP3',
            },
            {
                label: 'Lagoon Hospital (Ikeja)',
                action: 'CLAIM_ADMITTED_STEP3',
            },
            { label: 'EKO Hospital', action: 'CLAIM_ADMITTED_STEP3' },
            { label: 'Cedarcrest Hospital', action: 'CLAIM_ADMITTED_STEP3' },
        ],
    },
    CLAIM_ADMITTED_STEP3: {
        botMessages: [
            'Perfect. ✅',
            'Step 4 of 5: Nights Spent So Far 📅\nTap below to enter the number of nights you have spent in the hospital so far.',
        ],
        claimAction: 'nights_input',
    },
    CLAIM_ADMITTED_STEP4: {
        botMessages: [
            'Step 5 of 5: Quick Selfie 📸\nFinally, tap below to take a quick live photo of yourself in the ward or hospital bed.\n\n🔒 Your photo is encrypted, stored securely, and used only for claim verification.',
        ],
        claimAction: 'take_selfie',
    },
    CLAIM_ADMITTED_SUBMITTED: {
        botMessages: [],
        quickReplies: [{ label: 'Check My BackUp 📊', action: 'DASHBOARD' }],
    },
    // --- Discharged Path (4 steps + completion) ---
    CLAIM_DISCHARGED: {
        botMessages: [
            "We are glad you are back home and recovering 🤝 Let's process your full payout.",
            'Step 1 of 4: Proof of Discharge 📄\nTap below to upload a clear photo of your official Hospital Discharge Summary. This must show the dates you were admitted and released.\n\n🔒 Your documents are encrypted and stored securely.',
        ],
        claimAction: 'upload_discharge',
    },
    CLAIM_DISCHARGED_STEP2: {
        botMessages: [
            'Received! ✅ Scanning document... ⏳',
            'Step 2 of 4: Hospital Check 🏥\nOur system read your document. Does this match the hospital you were admitted to: Mainland Clinic?',
        ],
        quickReplies: [
            {
                label: "Yes, that's correct 👍🏾",
                action: 'CLAIM_DISCHARGED_STEP3',
            },
            {
                label: 'No, select hospital',
                action: 'CLAIM_DISCHARGED_HOSPITAL_SELECT',
            },
        ],
    },
    CLAIM_DISCHARGED_HOSPITAL_SELECT: {
        botMessages: [
            'No worries. Please select the correct hospital from the list below:',
        ],
        quickReplies: [
            {
                label: 'St. Nicholas Hospital',
                action: 'CLAIM_DISCHARGED_STEP3',
            },
            {
                label: 'Lagos University Teaching Hospital (LUTH)',
                action: 'CLAIM_DISCHARGED_STEP3',
            },
            { label: 'Reddington Hospital', action: 'CLAIM_DISCHARGED_STEP3' },
            {
                label: 'Evercare Hospital Lekki',
                action: 'CLAIM_DISCHARGED_STEP3',
            },
            {
                label: 'First Cardiology Consultants',
                action: 'CLAIM_DISCHARGED_STEP3',
            },
            {
                label: 'Lagoon Hospital (Ikeja)',
                action: 'CLAIM_DISCHARGED_STEP3',
            },
            { label: 'EKO Hospital', action: 'CLAIM_DISCHARGED_STEP3' },
            { label: 'Cedarcrest Hospital', action: 'CLAIM_DISCHARGED_STEP3' },
        ],
    },
    CLAIM_DISCHARGED_STEP3: {
        botMessages: [
            'Perfect. ✅',
            'Step 3 of 4: Total Nights 📅\nHow many nights did you spend in total? Tap below to enter.',
        ],
        claimAction: 'nights_input',
    },
    CLAIM_DISCHARGED_STEP4: {
        botMessages: [
            'Step 4 of 4: Identity Check 📸\nFinally, take a quick live photo (selfie) to confirm it is you submitting this claim.\n\n🔒 Your photo is encrypted, stored securely, and used only for verification.',
        ],
        claimAction: 'take_selfie',
    },
    CLAIM_DISCHARGED_SUBMITTED: {
        botMessages: [],
        quickReplies: [{ label: 'Check My BackUp 📊', action: 'DASHBOARD' }],
    },
};

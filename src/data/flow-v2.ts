import type {
    FlowStepV2,
    StepIdV2,
    PlanBenefitsV2,
    PlanTier,
} from '../types-v2';

export const PLAN_BENEFITS_V2: Record<PlanTier, PlanBenefitsV2> = {
    ruby: {
        monthlyAmount: 5000,
        weeklyAmount: 1850,
        savingsTarget: 90000,
        hospitalCashPerNight: 10000,
        hustleCover: 50000,
        familySupport: 1000000,
        completionBonus: 5000,
    },
    emerald: {
        monthlyAmount: 10000,
        weeklyAmount: 2500,
        savingsTarget: 120000,
        hospitalCashPerNight: 20000,
        hustleCover: 100000,
        familySupport: 1000000,
        completionBonus: 10000,
    },
    sapphire: {
        monthlyAmount: 20000,
        weeklyAmount: 5000,
        savingsTarget: 240000,
        hospitalCashPerNight: 30000,
        hustleCover: 200000,
        familySupport: 3000000,
        completionBonus: 20000,
    },
};

export const PLAN_COLORS: Record<PlanTier, string> = {
    ruby: '#E53935',
    emerald: '#43A047',
    sapphire: '#1E88E5',
};

export const flowStepsV2: Record<StepIdV2, FlowStepV2> = {
    WELCOME: {
        botMessages: [],
        quickReplies: [{ label: 'Yes ✅', action: 'GOAL_PROMPT' }],
    },

    GOAL_PROMPT: {
        botMessages: ['Tell us what you want to save for:'],
        quickReplies: [
            { label: '🎒 School Fees', action: 'GOAL_SELECT' },
            { label: '🏠 Rent', action: 'GOAL_SELECT' },
            { label: '📦 Business', action: 'GOAL_SELECT' },
            { label: '✍️ Something Else', action: 'GOAL_SELECT' },
        ],
    },

    GOAL_SELECT: {
        botMessages: [],
    },

    PLAN_SELECT: {
        botMessages: [],
    },

    PLAN_DETAILS_RUBY: {
        botMessages: [],
        quickReplies: [
            { label: 'Yes, start my plan! 🚀', action: 'ONBOARDING_FORM' },
            { label: 'Change my plan ↩️', action: 'PLAN_SELECT' },
        ],
    },

    PLAN_DETAILS_EMERALD: {
        botMessages: [],
        quickReplies: [
            { label: 'Yes, start my plan! 🚀', action: 'ONBOARDING_FORM' },
            { label: 'Change my plan ↩️', action: 'PLAN_SELECT' },
        ],
    },

    PLAN_DETAILS_SAPPHIRE: {
        botMessages: [],
        quickReplies: [
            { label: 'Yes, start my plan! 🚀', action: 'ONBOARDING_FORM' },
            { label: 'Change my plan ↩️', action: 'PLAN_SELECT' },
        ],
    },

    ONBOARDING_FORM: {
        botMessages: [],
        sheet: 'onboarding',
    },

    ACTIVATION: {
        botMessages: [],
    },

    PAYMENT_METHOD: {
        botMessages: [],
        quickReplies: [
            { label: '⚡ AutoSave (Recommended)', action: 'AUTO_DEBIT_SETUP' },
            { label: '🏦 Transfer', action: 'MANUAL_TRANSFER' },
        ],
    },

    MANUAL_TRANSFER: {
        botMessages: [
            'Great 👍\n\nHere are your account details.\nSave or screenshot this to pay anytime.',
        ],
        quickReplies: [{ label: 'Continue ✅', action: 'SUCCESS' }],
    },

    AUTO_DEBIT_SETUP: {
        botMessages: [],
    },

    SUCCESS: {
        botMessages: [],
        quickReplies: [{ label: 'Open My Dashboard 📊', action: 'DASHBOARD' }],
    },

    DASHBOARD: {
        botMessages: [],
        quickReplies: [{ label: 'Open Menu ☰', action: 'DASHBOARD_MENU' }],
    },

    DASHBOARD_MENU: {
        botMessages: ['Tap an action below:'],
        menuItems: [
            { label: 'Fund My Account 💳', action: 'FUND_ACCOUNT' },
            { label: 'Claim from BackUp 🏥', action: 'CLAIM_FLOW' },
            { label: 'View BackUp Policy 📋', action: 'POLICY_DETAILS' },
            { label: 'Talk to Support 🎧', action: 'SUPPORT' },
        ],
    },

    FUND_ACCOUNT: {
        botMessages: [],
        quickReplies: [{ label: 'Back to Menu 🔙', action: 'DASHBOARD_MENU' }],
    },

    FUND_ACCOUNT_LINK: {
        botMessages: [],
    },

    FUND_ACCOUNT_MANUAL: {
        botMessages: [],
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

    CLAIM_FLOW: {
        botMessages: [],
        quickReplies: [
            { label: 'Hospital Admission', action: 'CLAIM_HOSPITAL' },
            { label: 'Accidental Injury', action: 'CLAIM_ACCIDENTAL_INJURY_FIRST' },
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

    CLAIM_HOSPITAL: {
        botMessages: [
            "Understood. Let's get your Hospital Cash processed. Are you currently still in the hospital, or have you been discharged?",
        ],
        quickReplies: [
            { label: 'Still Admitted', action: 'CLAIM_STILL_ADMITTED' },
            { label: 'Discharged', action: 'CLAIM_DISCHARGED' },
        ],
    },

    CLAIM_STILL_ADMITTED: {
        botMessages: [
            'We wish you a quick recovery! You can claim cash for the nights you have spent so far.',
            '*Step 1 of 4: Proof of Admission* - Please take a clear photo of your official Hospital Admission Letter and send it here.',
        ],
        claimAction: 'upload_photo',
    },

    CLAIM_ADMITTED_STEP2: {
        botMessages: [
            'Received! ✅',
            '*Step 2 of 4: Location Check* - To speed up your claim, tap the button below to share your live location.',
        ],
        claimAction: 'share_location',
    },

    CLAIM_ADMITTED_STEP3: {
        botMessages: [
            'Location logged. ✅',
            '*Step 3 of 4: Nights Spent* - How many nights have you spent up to today?',
        ],
        claimAction: 'nights_input',
    },

    CLAIM_ADMITTED_STEP4: {
        botMessages: [
            '*Step 4 of 4: Quick Selfie* - Take a quick live photo of yourself right now in the ward or hospital bed.',
        ],
        claimAction: 'take_selfie',
    },

    CLAIM_ADMITTED_CONFIRM: {
        botMessages: [],
    },

    CLAIM_ADMITTED_SUBMITTED: {
        botMessages: [],
        quickReplies: [{ label: 'Open My Dashboard 📊', action: 'DASHBOARD' }],
    },

    CLAIM_DISCHARGED: {
        botMessages: [
            "We are glad you are back home and recovering 🤝 Let's process your full payout.",
            '*Step 1 of 4: Proof of Discharge* - Please send a clear photo of your official Hospital Discharge Summary showing your dates.',
        ],
        claimAction: 'upload_discharge',
    },

    CLAIM_DISCHARGED_STEP2: {
        botMessages: [
            'Received! ✅',
            '*Step 2 of 4: Hospital Check* - Our system read your document. Does this match your hospital: Mainland Clinic?',
        ],
        quickReplies: [
            { label: 'Yes', action: 'CLAIM_DISCHARGED_STEP3' },
            { label: 'No', action: 'CLAIM_DISCHARGED_HOSPITAL_SELECT' },
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
            {
                label: 'My hospital is not listed',
                action: 'CLAIM_DISCHARGED_STEP3',
            },
        ],
    },

    CLAIM_DISCHARGED_STEP3: {
        botMessages: [
            'Perfect. ✅',
            '*Step 3 of 4: Total Nights* - How many nights did you spend in total?',
        ],
        claimAction: 'nights_input',
    },

    CLAIM_DISCHARGED_STEP4: {
        botMessages: [
            '*Step 4 of 4: Identity Check* - Take a quick live photo (selfie) of yourself to confirm it is you submitting this claim.',
        ],
        claimAction: 'take_selfie',
    },

    CLAIM_DISCHARGED_CONFIRM: {
        botMessages: [],
    },

    CLAIM_DISCHARGED_SUBMITTED: {
        botMessages: [],
        quickReplies: [{ label: 'Open My Dashboard 📊', action: 'DASHBOARD' }],
    },

    CLAIM_ACCIDENTAL_INJURY: {
        botMessages: [
            "We are so sorry about the accident. Let us help get this sorted quickly.",
            '*Step 1 of 3: Proof of Treatment* 🧾 Please take a clear photo of the Medical Report or the Clinic/Hospital Receipt showing the treatment for your injury. (Send the photo here).',
        ],
        claimAction: 'upload_photo',
    },

    CLAIM_INJURY_STEP2: {
        botMessages: [
            'Received! ✅',
            '*Step 2 of 3: What Happened?* 🎤 To help us understand, please send a short text or Voice Note (under 1 minute) explaining how the accident happened.',
        ],
        claimAction: 'send_description',
    },

    CLAIM_INJURY_STEP3: {
        botMessages: [
            'Logged safely. ✅',
            '*Step 3 of 3: Identity Check* 🤳\n\nFinally, to protect your account from fraud, please take a quick live photo (selfie) of yourself right now.',
        ],
        claimAction: 'take_selfie',
    },

    CLAIM_INJURY_CONFIRM: {
        botMessages: [],
    },

    CLAIM_INJURY_SUBMITTED: {
        botMessages: [],
        quickReplies: [{ label: 'Open My Dashboard 📊', action: 'DASHBOARD' }],
    },

    CLAIM_DISABILITY: {
        botMessages: [
            "We are so sorry. This is a difficult time, and we want to support you as quickly as we can.",
            "To process your claim, we need three things.",
            "*Step 1 of 3 — Medical confirmation*\n\nPlease send a photo of your medical report or hospital letter confirming the disability caused by the accident.\n\nThis should be from a licensed doctor or hospital.",
        ],
        claimAction: 'upload_photo',
    },

    CLAIM_DISABILITY_STEP2: {
        botMessages: [
            "Received! ✅",
            "*Step 2 of 3 — Tell us what happened*\n\nSend a short voice note or text explaining the accident and how it has affected your ability to work.",
        ],
        claimAction: 'send_description',
    },

    CLAIM_DISABILITY_STEP3: {
        botMessages: [
            "Logged safely. ✅",
            "*Step 3 of 3 — Identity check* 🤳\n\nPlease send a live selfie of yourself.",
        ],
        claimAction: 'take_selfie',
    },

    CLAIM_DISABILITY_CONFIRM: {
        botMessages: [],
    },

    CLAIM_DISABILITY_SUBMITTED: {
        botMessages: [
            "Your claim has been submitted. ✅",
            "We know how much is at stake right now. Our team will review everything carefully and reach you here within 24 hours to confirm next steps.",
        ],
        quickReplies: [{ label: 'Open My Dashboard 📊', action: 'DASHBOARD' }],
    },

    CLAIM_DEATH: {
        botMessages: [
            "We are deeply sorry for your loss.",
            "We want to make this process as simple as possible for you during this time. You will only need to send us three things, and we will take care of the rest.",
            "*Step 1 of 3 — Proof of passing*\n\nPlease send a photo of the death certificate or hospital letter confirming the passing of your family member.",
        ],
        claimAction: 'upload_discharge',
    },

    CLAIM_DEATH_STEP2: {
        botMessages: [
            "Received! ✅",
            "*Step 2 of 3 — Proof of relationship*\n\nTo verify beneficiary identity, please upload a clear photo of your own ID card, like NIN, International Passport, or Driver's License.",
        ],
        claimAction: 'upload_photo',
    },

    CLAIM_DEATH_STEP3: {
        botMessages: [
            "Logged safely. ✅",
            "*Step 3 of 3 — Your identity*\n\nPlease send a live selfie of yourself so we can further confirm your identity.",
        ],
        claimAction: 'take_selfie',
    },

    CLAIM_DEATH_CONFIRM: {
        botMessages: [],
    },

    CLAIM_DEATH_SUBMITTED: {
        botMessages: [
            "Your claim has been submitted. 💛",
            "We are so sorry again for your loss. Our team will review everything and reach you here within 24 hours to process the family support payment of ₦1,000,000 and the amount saved.",
            "We are with you.",
        ],
        quickReplies: [{ label: 'Open My Dashboard 📊', action: 'DASHBOARD' }],
    },

    SUPPORT: {
        botMessages: [
            "Our support team will contact you shortly. 📞\n\nYou can also reach us at [support@gemynate.com](mailto:support@gemynate.com) or call 0800-BACKUP.\n\nWe're here for you!",
        ],
        quickReplies: [{ label: 'Back to Menu 🔙', action: 'DASHBOARD_MENU' }],
    },
};

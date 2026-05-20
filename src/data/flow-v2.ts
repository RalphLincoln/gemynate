import type {
    FlowStepV2,
    StepIdV2,
    PlanBenefitsV2,
    PlanTier,
} from '../types-v2';

export const PLAN_BENEFITS_V2: Record<PlanTier, PlanBenefitsV2> = {
    ruby: {
        monthlyAmount: 7500,
        weeklyAmount: 1850,
        savingsTarget: 90000,
        hospitalCashPerNight: 10000,
        hustleCover: 50000,
        familySupport: 200000,
        completionBonus: 5000,
    },
    emerald: {
        monthlyAmount: 10000,
        weeklyAmount: 2500,
        savingsTarget: 120000,
        hospitalCashPerNight: 20000,
        hustleCover: 100000,
        familySupport: 250000,
        completionBonus: 10000,
    },
    sapphire: {
        monthlyAmount: 20000,
        weeklyAmount: 5000,
        savingsTarget: 240000,
        hospitalCashPerNight: 30000,
        hustleCover: 200000,
        familySupport: 300000,
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
        botMessages: ['What matters most to you right now?'],
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
            { label: 'Start a Claim', action: 'CLAIM_ACCIDENTAL_INJURY_FIRST' },
        ],
    },

    CLAIM_ACCIDENTAL_INJURY_FIRST: {
        botMessages: [
            'We are here with you. Please tell us what has happened.',
        ],
        quickReplies: [
            {
                label: '🩺  I had an accident and need medical support',
                action: 'CLAIM_ACCIDENTAL_INJURY',
            },
            {
                label: '🛑  I have a permanent disability from an accident',
                action: 'CLAIM_DISABILITY',
            },
            {
                label: '💛  I am making a claim for a family member who has passed away',
                action: 'CLAIM_DEATH',
            },
        ],
    },

    CLAIM_ACCIDENTAL_INJURY: {
        botMessages: [
            'We are so sorry about the accident. Let us help get this sorted quickly.',
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
            '*Step 3 of 3: Identity Check* 🤳\nFinally, to protect your account from fraud, please take a quick live photo (selfie) of yourself right now.',
        ],
        claimAction: 'take_selfie',
    },

    CLAIM_INJURY_SUBMITTED: {
        botMessages: [],
        quickReplies: [{ label: 'Open My Dashboard 📊', action: 'DASHBOARD' }],
    },

    CLAIM_DISABILITY: {
        botMessages: [
            'We are so sorry. This is a difficult time, and we want to support you as quickly as we can.',
            'To process your claim, we need three things.',
            '*Step 1 of 3: Medical confirmation*\n\nPlease send a photo of your medical report or hospital letter confirming the disability caused by the accident.\n\nThis should be from a licensed doctor or hospital.',
        ],
        claimAction: 'upload_photo',
    },

    CLAIM_DISABILITY_STEP2: {
        botMessages: [
            'Received! ✅',
            '*Step 2 of 3 — Tell us what happened*\n\nSend a short voice note or text explaining the accident and how it has affected your ability to work.',
        ],
        claimAction: 'send_description',
    },

    CLAIM_DISABILITY_STEP3: {
        botMessages: [
            'Logged safely. ✅',
            '*Step 3 of 3 — Identity check* 🤳\n\nPlease send a live selfie of yourself.',
        ],
        claimAction: 'take_selfie',
    },

    CLAIM_DISABILITY_SUBMITTED: {
        botMessages: [],
        quickReplies: [{ label: 'Open My Dashboard 📊', action: 'DASHBOARD' }],
    },

    CLAIM_DEATH: {
        botMessages: [
            'We are deeply sorry for your loss.',
            'We want to make this process as simple as possible for you during this time. You will only need to send us three things, and we will take care of the rest.',
            '*Step 1 of 3 — Proof of passing*\n\nPlease send a photo of the death certificate or hospital letter confirming the passing of your family member.',
            'If you do not have this yet, you can come back to this step when you do. We will hold the claim open for you.',
        ],
        claimAction: 'upload_discharge',
    },

    CLAIM_DEATH_STEP2: {
        botMessages: [
            'Received! ✅',
            "*Step 2 of 3 — Proof of relationship*\n\nTo verify beneficiary identity, please upload a clear photo of your own ID card, like NIN, International Passport, or Driver's License.",
        ],
        claimAction: 'upload_photo',
    },

    CLAIM_DEATH_STEP3: {
        botMessages: [
            'Logged safely. ✅',
            '*Step 3 of 3 — Your identity*\n\nPlease send a live selfie of yourself so we can further confirm your identity.',
        ],
        claimAction: 'take_selfie',
    },

    CLAIM_DEATH_SUBMITTED: {
        botMessages: [],
        quickReplies: [{ label: 'Open My Dashboard 📊', action: 'DASHBOARD' }],
    },

    SUPPORT: {
        botMessages: [
            "Our support team will contact you shortly. 📞\n\nYou can also reach us at [support@gemynate.com](mailto:support@gemynate.com) or call 0800-BACKUP.\n\nWe're here for you!",
        ],
        quickReplies: [{ label: 'Back to Menu 🔙', action: 'DASHBOARD_MENU' }],
    },
};

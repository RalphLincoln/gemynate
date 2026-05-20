export interface CarouselCard {
    id: string;
    name: string;
    color: string;
    savingsGoal: string;
    medicalCoverage: string;
    nextOfKin: string;
    contribution: string;
    action: string;
}

export interface Message {
    id: string;
    type: 'bot' | 'user' | 'system';
    text: string;
    timestamp: string;
    cta?: { label: string; action: string };
    quickReplies?: QuickReply[];
    menuItems?: { label: string; action: string }[];
    formResponse?: { title: string; sheet: SheetType };
    replyTo?: { text: string };
    image?: string;
    locationCard?: { label: string; lat?: number; lng?: number };
    uploading?: boolean;
    color?: string;
    actionButton?: { label: string; claimAction: string };
    carousel?: CarouselCard[];
    voiceNote?: { duration: number; audioSrc?: string };
    accountCard?: {
        accountName: string;
        accountNumber: string;
        bankName: string;
        planName: string;
        weeklyAmount: string;
        paymentMethods: string[];
        disclaimer?: string;
    };
    dashboardCard?: {
        userName: string;
        planName: string;
        goal: string;
        goalAmount: number;
        savedAmount: number;
        progressPercent: number;
        lockDate: string;
        backupLiveDate: string;
        protectionNote: string;
    };
}

export type PlanTier = 'ruby' | 'emerald' | 'sapphire';

export interface UserData {
    firstName: string;
    lastName: string;
    gender: string;
    nin: string;
    state: string;
    address: string;
    email?: string;
    referralCode?: string;
}

export interface PaymentData {
    bvn: string;
    bankAccount: string;
    consentGiven: boolean;
}

export interface Contributions {
    pocketMoney: number;
    hospitalCash: number;
    hustleShield: number;
    activeDays: number;
    policyActive: boolean;
}

export interface PlanBenefits {
    dailyAmount: number;
    pocketMoneyPerMonth: number;
    hospitalCashPerNight: number;
    hustleShield: number;
}

export interface GemynateState {
    currentStep: StepId;
    chatHistory: Message[];
    user: UserData | null;
    plan: PlanTier | null;
    selectedPlan: PlanTier | null; // ADD THIS LINE
    selectedGoal?: string | null; // ADD THIS LINE (if using v2 features)
    payment: PaymentData | null;
    contributions: Contributions;
    claimNights?: number;
}

export type StepId =
    | 'WELCOME'
    | 'WELCOME_MORE'
    | 'ONBOARDING_CTA'
    | 'ONBOARDING_FORM'
    | 'ONBOARDING_COMPLETE'
    | 'PLAN_SELECTED_RUBY'
    | 'PLAN_SELECTED_EMERALD'
    | 'PLAN_SELECTED_SAPPHIRE'
    | 'PLAN_SELECTED'
    | 'PAYMENT_FORM'
    | 'ACCOUNT_LINKED'
    | 'DASHBOARD'
    | 'DASHBOARD_MENU'
    | 'DASHBOARD_WITHDRAW'
    | 'WITHDRAW_SHEET'
    | 'WITHDRAW_SUCCESS'
    | 'POLICY_DETAILS'
    | 'POLICY_PDF'
    | 'SUPPORT'
    | 'CLAIM_FLOW'
    | 'CLAIM_HOSPITAL'
    | 'CLAIM_ACCIDENTAL_INJURY'
    | 'CLAIM_ACCIDENTAL_INJURY_FIRST'
    | 'CLAIM_STILL_ADMITTED'
    | 'CLAIM_ADMITTED_STEP2'
    | 'CLAIM_ADMITTED_HOSPITAL_CONFIRM'
    | 'CLAIM_ADMITTED_HOSPITAL_SELECT'
    | 'CLAIM_ADMITTED_STEP3'
    | 'CLAIM_ADMITTED_STEP4'
    | 'CLAIM_ADMITTED_SUBMITTED'
    | 'CLAIM_DISCHARGED'
    | 'CLAIM_DISCHARGED_STEP2'
    | 'CLAIM_DISCHARGED_HOSPITAL_SELECT'
    | 'CLAIM_DISCHARGED_STEP3'
    | 'CLAIM_DISCHARGED_STEP4'
    | 'CLAIM_DISCHARGED_SUBMITTED';

export interface QuickReply {
    label: string;
    action: string;
}

export interface FlowStep {
    botMessages: string[];
    cta?: { label: string; action: string };
    quickReplies?: QuickReply[];
    menuItems?: { label: string; action: string }[];
    sheet?: 'onboarding' | 'plan' | 'payment' | 'withdrawal';
    claimAction?:
        | 'upload_photo'
        | 'upload_discharge'
        | 'share_location'
        | 'nights_input'
        | 'take_selfie';
}

export type SheetType =
    | 'onboarding'
    | 'plan'
    | 'payment'
    | 'withdrawal'
    | 'nights'
    | 'bankLink'
    | 'policyDetails'
    | null;

import type { Message, QuickReply, PlanTier, CarouselCard } from './types';

export type { Message, QuickReply, PlanTier, CarouselCard };

export type StepIdV2 =
    | 'WELCOME'
    | 'GOAL_PROMPT'
    | 'GOAL_SELECT'
    | 'PLAN_SELECT'
    | 'PLAN_DETAILS_RUBY'
    | 'PLAN_DETAILS_EMERALD'
    | 'PLAN_DETAILS_SAPPHIRE'
    | 'ONBOARDING_FORM'
    | 'ACTIVATION'
    | 'PAYMENT_METHOD'
    | 'AUTO_DEBIT_SETUP'
    | 'MANUAL_TRANSFER'
    | 'SUCCESS'
    | 'DASHBOARD'
    | 'DASHBOARD_MENU'
    | 'FUND_ACCOUNT'
    | 'FUND_ACCOUNT_LINK'
    | 'FUND_ACCOUNT_MANUAL'
    | 'POLICY_DETAILS'
    | 'POLICY_PDF'
    | 'CLAIM_FLOW'
    | 'CLAIM_ACCIDENTAL_INJURY'
    | 'CLAIM_ACCIDENTAL_INJURY_FIRST'
    | 'CLAIM_INJURY_STEP2'
    | 'CLAIM_INJURY_STEP3'
    | 'CLAIM_INJURY_SUBMITTED'
    | 'CLAIM_DISABILITY'
    | 'CLAIM_DISABILITY_STEP2'
    | 'CLAIM_DISABILITY_STEP3'
    | 'CLAIM_DISABILITY_SUBMITTED'
    | 'CLAIM_DEATH'
    | 'CLAIM_DEATH_STEP2'
    | 'CLAIM_DEATH_STEP3'
    | 'CLAIM_DEATH_SUBMITTED'
    | 'SUPPORT';

export interface PlanBenefitsV2 {
    monthlyAmount: number;
    weeklyAmount: number;
    savingsTarget: number;
    hospitalCashPerNight: number;
    hustleCover: number;
    familySupport: number;
    completionBonus: number;
}

export interface UserDataV2 {
    firstName: string;
    lastName: string;
    gender: string;
    bvn: string;
    referralCode?: string;
}

export interface VirtualAccount {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export interface ContributionsV2 {
    totalSaved: number;
    monthsActive: number;
    policyActive: boolean;
}

export interface GemynateStateV2 {
    currentStep: StepIdV2;
    chatHistory: Message[];
    user: UserDataV2 | null;
    selectedGoal: string | null;
    selectedPlan: PlanTier | null;
    paymentMethod: 'auto-debit' | 'manual' | null;
    contributions: ContributionsV2;
    virtualAccount: VirtualAccount | null;
    bankDetails: BankDetailsV2 | null;
    claimNights?: number;
}

export type SheetTypeV2 =
    | 'onboarding'
    | 'nights'
    | 'bankLink'
    | 'policy'
    | null;

export interface BankDetailsV2 {
    bankName: string;
    accountNumber: string;
    accountName: string;
}

export interface FlowStepV2 {
    botMessages: string[];
    cta?: { label: string; action: string };
    quickReplies?: QuickReply[];
    menuItems?: { label: string; action: string }[];
    sheet?: 'onboarding' | 'bankLink';
    claimAction?:
        | 'upload_photo'
        | 'upload_discharge'
        | 'share_location'
        | 'nights_input'
        | 'take_selfie'
        | 'send_description';
}

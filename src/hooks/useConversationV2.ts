import { useState, useCallback, useRef, useEffect } from 'react';
import type {
    GemynateStateV2,
    Message,
    StepIdV2,
    PlanTier,
    UserDataV2,
    SheetTypeV2,
    VirtualAccount,
    BankDetailsV2,
} from '../types-v2';
import { flowStepsV2, PLAN_BENEFITS_V2, PLAN_COLORS } from '../data/flow-v2';

const STORAGE_KEY = 'gemynate-state-v2';
const STATE_VERSION = 10;

const defaultState: GemynateStateV2 = {
    currentStep: 'WELCOME',
    chatHistory: [],
    user: null,
    selectedGoal: null,
    selectedPlan: null,
    paymentMethod: null,
    contributions: {
        totalSaved: 0,
        monthsActive: 0,
        policyActive: false,
    },
    virtualAccount: null,
    bankDetails: null,
};

function loadState(): GemynateStateV2 {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            if (parsed.version === STATE_VERSION) return parsed.data;
            localStorage.removeItem(STORAGE_KEY);
        }
    } catch {
        /* ignore */
    }
    return defaultState;
}

function saveState(s: GemynateStateV2) {
    localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ version: STATE_VERSION, data: s })
    );
}

let msgCounter = Date.now();
function makeId() {
    return String(msgCounter++);
}

function timeNow() {
    return new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true,
    });
}

const FIXED_BANK_NAME = 'X Microfinance Bank';

function generateVirtualAccount(name: string): VirtualAccount {
    const num = String(Math.floor(Math.random() * 9000000000) + 1000000000);
    return {
        bankName: FIXED_BANK_NAME,
        accountNumber: num,
        accountName: `GEMYNATE/${name.toUpperCase()}`,
    };
}

function computeContributions(plan: PlanTier | null, months: number) {
    if (!plan) return { totalSaved: 0, monthsActive: 0, policyActive: false };
    const benefits = PLAN_BENEFITS_V2[plan];
    return {
        totalSaved: benefits.monthlyAmount * months,
        monthsActive: months,
        policyActive: months >= 2,
    };
}

export const CLAIM_NEXT_STEP: Partial<Record<StepIdV2, StepIdV2>> = {
    CLAIM_ACCIDENTAL_INJURY: 'CLAIM_INJURY_STEP2',
    CLAIM_INJURY_STEP2: 'CLAIM_INJURY_STEP3',
    CLAIM_INJURY_STEP3: 'CLAIM_INJURY_SUBMITTED',
    CLAIM_DISABILITY: 'CLAIM_DISABILITY_STEP2',
    CLAIM_DISABILITY_STEP2: 'CLAIM_DISABILITY_STEP3',
    CLAIM_DISABILITY_STEP3: 'CLAIM_DISABILITY_SUBMITTED',
    CLAIM_DEATH: 'CLAIM_DEATH_STEP2',
    CLAIM_DEATH_STEP2: 'CLAIM_DEATH_STEP3',
    CLAIM_DEATH_STEP3: 'CLAIM_DEATH_SUBMITTED',
};

export const CLAIM_PREV_STEP: Partial<Record<StepIdV2, StepIdV2>> = {
    CLAIM_INJURY_STEP2: 'CLAIM_ACCIDENTAL_INJURY',
    CLAIM_INJURY_STEP3: 'CLAIM_INJURY_STEP2',
    CLAIM_DISABILITY_STEP2: 'CLAIM_DISABILITY',
    CLAIM_DISABILITY_STEP3: 'CLAIM_DISABILITY_STEP2',
    CLAIM_DEATH_STEP2: 'CLAIM_DEATH',
    CLAIM_DEATH_STEP3: 'CLAIM_DEATH_STEP2',
};

const CLAIM_ACTION_LABELS: Record<string, string> = {
    upload_photo: '📎 Upload Photo',
    upload_discharge: '📎 Upload Photo',
    share_location: '📍 Send Current Location',
    nights_input: '🔢 Enter Nights',
    take_selfie: '📸 Take Selfie',
    send_description: '✍️ Send Description',
};

const getPlanColor = (plan: PlanTier | null): string => {
    if (!plan) return '#c74a3a';
    return PLAN_COLORS[plan];
};

export function useConversationV2() {
    const [state, setState] = useState<GemynateStateV2>(loadState);
    const [isTyping, setIsTyping] = useState(false);
    const [activeSheet, setActiveSheet] = useState<SheetTypeV2>(null);
    const stateRef = useRef(state);
    const busyRef = useRef(false);
    const claimNextStepRef = useRef<StepIdV2 | null>(null);
    const nightsButtonMsgIdRef = useRef<string | null>(null);
    const dashboardVisitedRef = useRef(false);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const persist = useCallback((next: GemynateStateV2) => {
        stateRef.current = next;
        setState(next);
        saveState(next);
    }, []);

    const addBotMessages = useCallback(
        async (messages: string[], nextState: GemynateStateV2) => {
            for (let i = 0; i < messages.length; i++) {
                const text = messages[i];
                if (i > 0) {
                    await new Promise((r) =>
                        setTimeout(r, 400 + Math.random() * 300)
                    );
                }
                setIsTyping(true);
                let delay: number;
                if (text.length < 50) {
                    delay = 1000 + Math.random() * 400;
                } else if (text.length < 150) {
                    delay = 1500 + Math.random() * 500;
                } else {
                    delay = 2000 + Math.random() * 600;
                }
                await new Promise((r) => setTimeout(r, delay));
                setIsTyping(false);
                const msg: Message = {
                    id: makeId(),
                    type: 'bot',
                    text,
                    timestamp: timeNow(),
                };
                nextState = {
                    ...nextState,
                    chatHistory: [...nextState.chatHistory, msg],
                };
                persist(nextState);
            }
            setIsTyping(false);
            return nextState;
        },
        [persist]
    );

    function attachButtons(
        state: GemynateStateV2,
        step: {
            cta?: { label: string; action: string };
            quickReplies?: { label: string; action: string }[];
            menuItems?: { label: string; action: string }[];
        }
    ): GemynateStateV2 {
        if (!step.cta && !step.quickReplies && !step.menuItems) return state;
        const history = [...state.chatHistory];
        for (let i = history.length - 1; i >= 0; i--) {
            if (history[i].type === 'bot') {
                history[i] = {
                    ...history[i],
                    ...(step.cta && { cta: step.cta }),
                    ...(step.quickReplies && {
                        quickReplies: step.quickReplies,
                    }),
                    ...(step.menuItems && { menuItems: step.menuItems }),
                };
                break;
            }
        }
        return { ...state, chatHistory: history };
    }

    function addActionButton(
        state: GemynateStateV2,
        claimAction: string
    ): GemynateStateV2 {
        const label = CLAIM_ACTION_LABELS[claimAction] || claimAction;
        const actionMsg: Message = {
            id: makeId(),
            type: 'user',
            text: '',
            timestamp: timeNow(),
            actionButton: { label, claimAction },
        };
        return { ...state, chatHistory: [...state.chatHistory, actionMsg] };
    }

    const goToStep = useCallback(
        async (stepId: StepIdV2, userText?: string) => {
            if (busyRef.current) return;
            busyRef.current = true;
            let next: GemynateStateV2 = { ...stateRef.current };

            const stripped = next.chatHistory.map((m) => {
                if (m.type !== 'bot') return m;
                const { quickReplies, menuItems, cta, carousel, ...rest } = m;
                return quickReplies || menuItems || cta || carousel ? rest : m;
            });
            next = { ...next, chatHistory: stripped };

            if (userText) {
                let replyTo: { text: string } | undefined;
                for (let i = next.chatHistory.length - 1; i >= 0; i--) {
                    if (next.chatHistory[i].type === 'bot') {
                        replyTo = { text: next.chatHistory[i].text };
                        break;
                    }
                }
                const userMsg: Message = {
                    id: makeId(),
                    type: 'user',
                    text: userText,
                    timestamp: timeNow(),
                    replyTo,
                };
                next = { ...next, chatHistory: [...next.chatHistory, userMsg] };
                persist(next);
            }

            next = { ...next, currentStep: stepId };

            const step = flowStepsV2[stepId];
            if (!step) {
                busyRef.current = false;
                return;
            }

            if (step.sheet) {
                setActiveSheet(step.sheet);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: WELCOME ---
            if (stepId === 'WELCOME') {
                const welcomeMsg =
                    'Welcome to Gemynate! 👋\nLife can change suddenly. One accident or emergency can empty savings or affect business and family plans.\n\nGemynate helps you build toward your big goals like school fees, rent, or business, while giving you financial protection when emergencies happen.';

                next = await addBotMessages([welcomeMsg], next);

                await new Promise((r) =>
                    setTimeout(r, 400 + Math.random() * 300)
                );
                setIsTyping(true);
                await new Promise((r) =>
                    setTimeout(r, 800 + Math.random() * 400)
                );
                setIsTyping(false);
                const voiceMsg: Message = {
                    id: makeId(),
                    type: 'bot',
                    text: '',
                    timestamp: timeNow(),
                    voiceNote: {
                        duration: 37,
                        audioSrc: '/audio/welcome-voice.wav',
                    },
                };
                next = {
                    ...next,
                    chatHistory: [...next.chatHistory, voiceMsg],
                };
                persist(next);

                await new Promise<void>((resolve) => {
                    let resolved = false;
                    const done = () => {
                        if (!resolved) {
                            resolved = true;
                            resolve();
                        }
                    };
                    const timer = setTimeout(done, 10000);
                    const handler = () => {
                        clearTimeout(timer);
                        done();
                    };
                    window.addEventListener('gemynate:voicePlayed', handler, {
                        once: true,
                    });
                });

                next = await addBotMessages(['Ready to get started?'], next);

                next = attachButtons(next, {
                    quickReplies: [
                        {
                            label: 'Yes ✅',
                            action: 'GOAL_PROMPT',
                        },
                    ],
                });

                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: GOAL_SELECT ---
            if (stepId === 'GOAL_SELECT') {
                const goal = userText || 'My goal';
                next = { ...next, selectedGoal: goal };

                next = await addBotMessages(
                    [
                        'Choose the protection plan that works best for you. Swipe left or right to see more options. \u{1F447}',
                    ],
                    next
                );

                const carouselMsg: Message = {
                    id: makeId(),
                    type: 'bot',
                    text: '',
                    timestamp: timeNow(),
                    carousel: [
                        {
                            id: 'ruby',
                            name: 'Ruby BackUp Plan',
                            color: '#E53935',
                            savingsGoal: '₦90,000',
                            medicalCoverage:
                                'Medical expenses from an accident covered (once a year)',
                            nextOfKin: '₦200,000',
                            contribution:
                                'Contribute ₦1,850 weekly or pay small daily',
                            action: 'PLAN_DETAILS_RUBY',
                        },
                        {
                            id: 'emerald',
                            name: 'Emerald BackUp Plan',
                            color: '#43A047',
                            savingsGoal: '₦120,000',
                            medicalCoverage:
                                'Medical expenses from an accident covered (once a year)',
                            nextOfKin: '₦250,000',
                            contribution:
                                'Contribute ₦2,500 weekly or pay small daily',
                            action: 'PLAN_DETAILS_EMERALD',
                        },
                        {
                            id: 'sapphire',
                            name: 'Sapphire BackUp Plan',
                            color: '#1E88E5',
                            savingsGoal: '₦240,000',
                            medicalCoverage:
                                'Medical expenses from an accident covered (once a year)',
                            nextOfKin: '₦300,000',
                            contribution:
                                'Contribute ₦5,000 weekly or pay small daily',
                            action: 'PLAN_DETAILS_SAPPHIRE',
                        },
                    ],
                };
                next = {
                    ...next,
                    chatHistory: [...next.chatHistory, carouselMsg],
                };
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: PLAN_SELECT (re-show) ---
            if (stepId === 'PLAN_SELECT') {
                setIsTyping(true);
                await new Promise((r) =>
                    setTimeout(r, 1200 + Math.random() * 400)
                );
                setIsTyping(false);

                const carouselMsg: Message = {
                    id: makeId(),
                    type: 'bot',
                    text: 'Choose the protection plan that works best for you. Swipe left or right to see more options. \u{1F447}',
                    timestamp: timeNow(),
                    carousel: [
                        {
                            id: 'ruby',
                            name: 'Ruby BackUp Plan',
                            color: '#E53935',
                            savingsGoal: '₦90,000',
                            medicalCoverage:
                                'Medical expenses from an accident covered (once a year)',
                            nextOfKin: '₦200,000',
                            contribution:
                                'Contribute ₦1,850 weekly or pay small daily',
                            action: 'PLAN_DETAILS_RUBY',
                        },
                        {
                            id: 'emerald',
                            name: 'Emerald BackUp Plan',
                            color: '#43A047',
                            savingsGoal: '₦120,000',
                            medicalCoverage:
                                'Medical expenses from an accident covered (once a year)',
                            nextOfKin: '₦250,000',
                            contribution:
                                'Contribute ₦2,500 weekly or pay small daily',
                            action: 'PLAN_DETAILS_EMERALD',
                        },
                        {
                            id: 'sapphire',
                            name: 'Sapphire BackUp Plan',
                            color: '#1E88E5',
                            savingsGoal: '₦240,000',
                            medicalCoverage:
                                'Medical expenses from an accident covered (once a year)',
                            nextOfKin: '₦300,000',
                            contribution:
                                'Contribute ₦5,000 weekly or pay small daily',
                            action: 'PLAN_DETAILS_SAPPHIRE',
                        },
                    ],
                };
                next = {
                    ...next,
                    chatHistory: [...next.chatHistory, carouselMsg],
                };
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: PLAN_DETAILS_* ---
            if (
                stepId === 'PLAN_DETAILS_RUBY' ||
                stepId === 'PLAN_DETAILS_EMERALD' ||
                stepId === 'PLAN_DETAILS_SAPPHIRE'
            ) {
                const tierMap: Record<string, PlanTier> = {
                    PLAN_DETAILS_RUBY: 'ruby',
                    PLAN_DETAILS_EMERALD: 'emerald',
                    PLAN_DETAILS_SAPPHIRE: 'sapphire',
                };
                const tier = tierMap[stepId];
                const benefits = PLAN_BENEFITS_V2[tier];
                const planLabel =
                    tier === 'ruby'
                        ? 'Ruby'
                        : tier === 'emerald'
                          ? 'Emerald'
                          : 'Sapphire';

                next = { ...next, selectedPlan: tier };

                const familyStr = `₦${benefits.familySupport.toLocaleString()}`;

                const msgs = [
                    `You selected the ${planLabel} BackUp Plan 👍\n\n₦${benefits.monthlyAmount.toLocaleString()} monthly. Contribute daily or weekly.\n\nYou will receive ₦${benefits.savingsTarget.toLocaleString()} guaranteed after 12 months + a Completion Bonus 🎁\n\nStay protected throughout the year. Accidental medical expenses support is provided once per year. Also, up to ${familyStr} plus the amount you saved is paid to your next of kin if the worst happens.\n\nReady to start?`,
                ];

                next = await addBotMessages(msgs, next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: ACTIVATION ---
            if (stepId === 'ACTIVATION') {
                const va = generateVirtualAccount(
                    next.user?.firstName || 'User'
                );
                next = { ...next, virtualAccount: va };

                const msg1 = `Your plan is almost ready! 🎉 How would you like to save?`;

                next = await addBotMessages([msg1], next);

                const voiceMsg: Message = {
                    id: makeId(),
                    type: 'bot',
                    text: '',
                    timestamp: timeNow(),
                    voiceNote: {
                        duration: 31,
                        audioSrc: '/audio/activation-voice.wav',
                    },
                };
                next = {
                    ...next,
                    chatHistory: [...next.chatHistory, voiceMsg],
                };
                persist(next);

                await new Promise<void>((resolve) => {
                    let resolved = false;
                    const done = () => {
                        if (!resolved) {
                            resolved = true;
                            resolve();
                        }
                    };
                    const timer = setTimeout(done, 10000);
                    const handler = () => {
                        clearTimeout(timer);
                        done();
                    };
                    window.addEventListener('gemynate:voicePlayed', handler, {
                        once: true,
                    });
                });

                const msg2 = `⚡ *AutoSave (Recommended)*\nWe save it for you automatically. Pause anytime.\n\n🏦 *Transfer*\nYou send the money yourself anytime using bank transfer or POS.`;

                next = await addBotMessages([msg2], next);
                next = { ...next, currentStep: 'PAYMENT_METHOD' };
                next = attachButtons(next, {
                    quickReplies: flowStepsV2['PAYMENT_METHOD'].quickReplies,
                });
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: AUTO_DEBIT_SETUP ---
            if (stepId === 'AUTO_DEBIT_SETUP') {
                const msgs = [
                    'Good choice 👍\n\nAutoSave helps you save little by little automatically, so you keep your protection plan active and stay on track with your goal.\n\n👇 Tap below to securely link your bank account.',
                ];
                next = await addBotMessages(msgs, next);
                next = attachButtons(next, {
                    quickReplies: [
                        {
                            label: 'Link My Bank Account 🔗',
                            action: 'OPEN_BANK_LINK',
                        },
                    ],
                });
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: MANUAL_TRANSFER ---
            if (stepId === 'MANUAL_TRANSFER') {
                const va = next.virtualAccount;
                const userName = next.user
                    ? `${next.user.firstName} ${next.user.lastName}`
                    : 'User';

                const acctNum = va?.accountNumber || '0000000000';

                const benefits = next.selectedPlan
                    ? PLAN_BENEFITS_V2[next.selectedPlan]
                    : null;

                const weeklyAmt = benefits
                    ? `₦${benefits.weeklyAmount.toLocaleString()}`
                    : '';

                const introMsg = `Great 👍\nHere is your personal Gemynate account for savings payments:`;
                next = await addBotMessages([introMsg], next);

                const planColor = PLAN_COLORS[next.selectedPlan || 'ruby'];

                const accountCardMsg: Message = {
                    id: makeId(),
                    type: 'bot',
                    text: '',
                    color: planColor,
                    timestamp: timeNow(),
                    accountCard: {
                        accountName: userName,
                        accountNumber: acctNum,
                        bankName: FIXED_BANK_NAME,
                        weeklyAmount: weeklyAmt,
                        planName:
                            next.selectedPlan === 'ruby'
                                ? 'Ruby Plan'
                                : next.selectedPlan === 'emerald'
                                  ? 'Emerald Plan'
                                  : 'Sapphire Plan',
                        paymentMethods: ['Bank transfer', 'USSD', 'POS'],
                        disclaimer: '',
                    },
                };

                next = {
                    ...next,
                    chatHistory: [...next.chatHistory, accountCardMsg],
                };
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: FUND_ACCOUNT ---
            if (stepId === 'FUND_ACCOUNT') {
                const va = next.virtualAccount;
                const userName = next.user
                    ? `${next.user.firstName} ${next.user.lastName}`
                    : 'User';
                const acctNum = va?.accountNumber || '0000000000';
                const isAutoDebit = next.paymentMethod === 'auto-debit';

                let statusLine: string;
                if (isAutoDebit && next.bankDetails) {
                    statusLine = `\n\n✅ *AutoSave Active* — ${next.bankDetails.bankName} (${next.bankDetails.accountNumber})`;
                } else {
                    statusLine = `\n\n📌 *Payment Method:* Manual Transfer`;
                }

                const msg = `Transfer to your virtual account to fund your plan:\n\n👤 Name: *${userName}*\n🏦 Bank: *X Microfinance Bank*\n💳 Account Number: *${acctNum}*\n\nDeposits are held by X Microfinance Bank, a licensed microfinance bank by the Central Bank of Nigeria.${statusLine}`;

                next = await addBotMessages([msg], next);

                const replies: { label: string; action: string }[] = [];
                if (isAutoDebit) {
                    replies.push({
                        label: 'Switch to Manual Transfer 🏦',
                        action: 'FUND_ACCOUNT_MANUAL',
                    });
                } else {
                    replies.push({
                        label: 'Switch to Auto-Debit 🔗',
                        action: 'FUND_ACCOUNT_LINK',
                    });
                }
                replies.push({
                    label: 'Back to Menu 🔙',
                    action: 'DASHBOARD_MENU',
                });
                next = attachButtons(next, { quickReplies: replies });
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: FUND_ACCOUNT_LINK ---
            if (stepId === 'FUND_ACCOUNT_LINK') {
                const linkMsg =
                    'Good choice 👍\n\nAutoSave helps you save little by little automatically, so you keep your protection plan active and stay on track with your goal.\n\n👇 Tap below to securely link your bank account.';
                next = await addBotMessages([linkMsg], next);
                next = { ...next, paymentMethod: 'auto-debit' };
                persist(next);
                setActiveSheet('bankLink');
                busyRef.current = false;
                return;
            }

            // --- Dynamic: FUND_ACCOUNT_MANUAL ---
            if (stepId === 'FUND_ACCOUNT_MANUAL') {
                next = { ...next, paymentMethod: 'manual' };

                const va = next.virtualAccount;
                const acctNum = va?.accountNumber || '0000000000';

                const msg = `AutoSave has been turned off. You can now transfer manually whenever you have cash:\n\n🏦 Bank: *X Microfinance Bank*\n💳 Account Number: *${acctNum}*\n\nYou can switch back to AutoSave anytime from *Fund My Account*.`;

                next = await addBotMessages([msg], next);
                next = attachButtons(next, {
                    quickReplies: [
                        { label: 'Back to Menu 🔙', action: 'DASHBOARD_MENU' },
                    ],
                });
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: SUCCESS ---
            if (stepId === 'SUCCESS') {
                const planLabel =
                    next.selectedPlan === 'ruby'
                        ? 'Ruby'
                        : next.selectedPlan === 'emerald'
                          ? 'Emerald'
                          : next.selectedPlan === 'sapphire'
                            ? 'Sapphire'
                            : '';
                const isAutoDebit = next.paymentMethod === 'auto-debit';

                let msgs: string[];
                if (isAutoDebit) {
                    msgs = [
                        `AutoSave linked! 🎉\nYour ${planLabel} BackUp Plan is live.\n\n✅ Savings run automatically\n🛡️ Your Backup activates 30 days after completing your monthly contribution goal\n📊 Track your savings or make a claim from your Dashboard.`,
                    ];
                } else {
                    msgs = [
                        `Your ${planLabel} BackUp Plan is live! 🎉\n\n✅ Make your first transfer to activate\n🛡️ Your Backup activates 30 days after completing your monthly contribution goal\n📊 Track your savings or make a claim from your Dashboard.`,
                    ];
                }

                next = await addBotMessages(msgs, next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: DASHBOARD ---
            if (stepId === 'DASHBOARD') {
                let months = next.contributions.monthsActive;
                if (!dashboardVisitedRef.current) {
                    months = months === 0 ? 1 : months + 1;
                    dashboardVisitedRef.current = true;
                }
                const contrib = computeContributions(next.selectedPlan, months);
                next = { ...next, contributions: contrib };

                const benefits = next.selectedPlan
                    ? PLAN_BENEFITS_V2[next.selectedPlan]
                    : null;
                const target = benefits?.savingsTarget || 0;
                const userName = next.user
                    ? `${next.user.firstName} ${next.user.lastName}`
                    : 'User';
                const planLabel =
                    next.selectedPlan === 'ruby'
                        ? 'Ruby BackUp Plan'
                        : next.selectedPlan === 'emerald'
                          ? 'Emerald BackUp Plan'
                          : 'Sapphire BackUp Plan';
                const goalLabel =
                    next.selectedGoal?.replace(/^[^\w]*\s*/, '') || 'Your goal';

                const lockDate = new Date();
                lockDate.setMonth(lockDate.getMonth() + 12);
                const lockDateStr = lockDate.toLocaleDateString('en-GB', {
                    month: 'long',
                    year: 'numeric',
                });

                const backupDate = new Date();
                backupDate.setDate(backupDate.getDate() + 30);
                const backupDateStr = backupDate.toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'long',
                });

                const planColor = PLAN_COLORS[next.selectedPlan || 'ruby'];

                const dashboardMsg: Message = {
                    id: makeId(),
                    type: 'bot',
                    text: '',
                    color: planColor,
                    timestamp: timeNow(),
                    dashboardCard: {
                        userName,
                        planName: planLabel,
                        goal: goalLabel,
                        goalAmount: target,
                        savedAmount: contrib.totalSaved,
                        progressPercent:
                            target > 0
                                ? Math.min(
                                      Math.round(
                                          (contrib.totalSaved / target) * 100
                                      ),
                                      100
                                  )
                                : 0,
                        lockDate: lockDateStr,
                        backupLiveDate: backupDateStr,
                        protectionNote:
                            'Accidental injury support and family support',
                    },
                };
                next = {
                    ...next,
                    chatHistory: [...next.chatHistory, dashboardMsg],
                };

                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: CLAIM_FLOW ---
            if (stepId === 'CLAIM_FLOW') {
                const msg =
                    'We are sorry you are dealing with this. Please select the exact event you are claiming for:';
                next = await addBotMessages([msg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: CLAIM_INJURY_SUBMITTED ---
            if (stepId === 'CLAIM_INJURY_SUBMITTED') {
                const msg =
                    'Your claim has been submitted ✅\n\nWe will review your documents and come back to you here within 24 hours to process your payment.\n\nTake care of yourself.';
                next = await addBotMessages([msg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: CLAIM_DISABILITY_SUBMITTED ---
            if (stepId === 'CLAIM_DISABILITY_SUBMITTED') {
                const msg =
                    'Your claim has been submitted. ✅\n\nWe know how much is at stake right now. Our team will review everything carefully and reach you here within 24 hours to confirm next steps.';
                next = await addBotMessages([msg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: CLAIM_DEATH_SUBMITTED ---
            if (stepId === 'CLAIM_DEATH_SUBMITTED') {
                const benefits = next.selectedPlan
                    ? PLAN_BENEFITS_V2[next.selectedPlan]
                    : null;
                const familyStr = benefits
                    ? `₦${benefits.familySupport.toLocaleString()}`
                    : '₦200,000';
                const msg = `Your claim has been submitted. 💛\n\nWe are so sorry again for your loss. Our team will review everything and reach you here within 24 hours to process the family support payment of ${familyStr} and the amount saved.\n\nWe are with you.`;
                next = await addBotMessages([msg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic: POLICY_DETAILS ---
            if (stepId === 'POLICY_DETAILS') {
                persist(next);
                setActiveSheet('policy');
                busyRef.current = false;
                return;
            }

            // --- Default: static messages + claim actions ---
            if (step.botMessages.length > 0) {
                next = await addBotMessages(step.botMessages, next);
            }

            if (step.claimAction) {
                const replies: { label: string; action: string }[] = [];
                const prevStep = CLAIM_PREV_STEP[stepId];
                if (prevStep) {
                    replies.push({ label: 'Go Back ↩️', action: prevStep });
                }
                replies.push({
                    label: 'Cancel Claim 🔙',
                    action: 'DASHBOARD_MENU',
                });
                const stepWithButtons = { ...step, quickReplies: replies };
                next = attachButtons(next, stepWithButtons);
                next = addActionButton(next, step.claimAction);
            } else {
                next = attachButtons(next, step);
            }

            persist(next);
            busyRef.current = false;
        },
        [addBotMessages, persist]
    );

    async function handleClaimActionTap(
        claimAction: string,
        buttonMsgId: string,
        file?: File
    ) {
        if (busyRef.current) return;
        busyRef.current = true;

        const currentStepId = stateRef.current.currentStep;
        const nextStepId = CLAIM_NEXT_STEP[currentStepId];
        if (!nextStepId) {
            busyRef.current = false;
            return;
        }

        let next = { ...stateRef.current };

        switch (claimAction) {
            case 'upload_photo':
            case 'upload_discharge': {
                const imagePath = file
                    ? URL.createObjectURL(file)
                    : claimAction === 'upload_discharge'
                      ? '/claims/discharge-summary.jpg'
                      : '/claims/admission-letter.jpg';
                const msgId = makeId();
                const uploadingMsg: Message = {
                    id: msgId,
                    type: 'user',
                    text: 'Uploading...',
                    timestamp: timeNow(),
                    image: imagePath,
                    uploading: true,
                };
                next = {
                    ...stateRef.current,
                    chatHistory: [
                        ...stateRef.current.chatHistory.filter(
                            (m) => m.id !== buttonMsgId
                        ),
                        uploadingMsg,
                    ],
                };
                persist(next);
                await new Promise((r) => setTimeout(r, 1500));
                next = { ...stateRef.current };
                next = {
                    ...next,
                    chatHistory: next.chatHistory.map((m) =>
                        m.id === msgId
                            ? {
                                  ...m,
                                  text: '📎 Photo uploaded',
                                  uploading: false,
                              }
                            : m
                    ),
                };
                persist(next);
                await new Promise((r) => setTimeout(r, 500));
                busyRef.current = false;
                goToStep(nextStepId);
                break;
            }
            case 'share_location': {
                const liveUntil = new Date(Date.now() + 60 * 60 * 1000);
                const liveTimeStr = liveUntil.toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true,
                });

                let lat: number | undefined;
                let lng: number | undefined;
                try {
                    const pos = await new Promise<GeolocationPosition>(
                        (resolve, reject) => {
                            navigator.geolocation.getCurrentPosition(
                                resolve,
                                reject,
                                { timeout: 10000, enableHighAccuracy: true }
                            );
                        }
                    );
                    lat = pos.coords.latitude;
                    lng = pos.coords.longitude;
                } catch {
                    // Geolocation unavailable
                }

                const locationLabel =
                    lat && lng
                        ? `Live until ${liveTimeStr}`
                        : `📍 Location shared (approximate)`;
                const userMsg: Message = {
                    id: makeId(),
                    type: 'user',
                    text: '',
                    timestamp: timeNow(),
                    locationCard: { label: locationLabel, lat, lng },
                };
                next = {
                    ...stateRef.current,
                    chatHistory: [
                        ...stateRef.current.chatHistory.filter(
                            (m) => m.id !== buttonMsgId
                        ),
                        userMsg,
                    ],
                };
                persist(next);
                await new Promise((r) => setTimeout(r, 800));
                busyRef.current = false;
                goToStep(nextStepId);
                break;
            }
            case 'nights_input': {
                claimNextStepRef.current = nextStepId;
                nightsButtonMsgIdRef.current = buttonMsgId;
                setActiveSheet('nights');
                busyRef.current = false;
                break;
            }
            case 'take_selfie': {
                const isDischargedPath =
                    currentStepId.startsWith('CLAIM_DISCHARGED') ||
                    currentStepId.startsWith('CLAIM_DEATH') ||
                    currentStepId.startsWith('CLAIM_DISABILITY');
                const imagePath = file
                    ? URL.createObjectURL(file)
                    : isDischargedPath
                      ? '/claims/selfie-discharged.jpg'
                      : '/claims/selfie.jpg';
                const msgId = makeId();
                const uploadingMsg: Message = {
                    id: msgId,
                    type: 'user',
                    text: 'Capturing...',
                    timestamp: timeNow(),
                    image: imagePath,
                    uploading: true,
                };
                next = {
                    ...stateRef.current,
                    chatHistory: [
                        ...stateRef.current.chatHistory.filter(
                            (m) => m.id !== buttonMsgId
                        ),
                        uploadingMsg,
                    ],
                };
                persist(next);
                await new Promise((r) => setTimeout(r, 2000));
                next = { ...stateRef.current };
                next = {
                    ...next,
                    chatHistory: next.chatHistory.map((m) =>
                        m.id === msgId
                            ? {
                                  ...m,
                                  text: '📸 Selfie captured',
                                  uploading: false,
                              }
                            : m
                    ),
                };
                persist(next);
                await new Promise((r) => setTimeout(r, 500));
                busyRef.current = false;
                goToStep(nextStepId);
                break;
            }
            case 'send_description': {
                const userMsg: Message = {
                    id: makeId(),
                    type: 'user',
                    text: 'I had an accident at work and injured my leg. I went to the clinic for treatment.',
                    timestamp: timeNow(),
                };
                next = {
                    ...stateRef.current,
                    chatHistory: [
                        ...stateRef.current.chatHistory.filter(
                            (m) => m.id !== buttonMsgId
                        ),
                        userMsg,
                    ],
                };
                persist(next);
                await new Promise((r) => setTimeout(r, 800));
                busyRef.current = false;
                goToStep(nextStepId);
                break;
            }
        }
    }

    const handleQuickReply = useCallback(
        (label: string, action: string) => {
            if (action === 'AUTO_DEBIT_SETUP') {
                const next = {
                    ...stateRef.current,
                    paymentMethod: 'auto-debit' as const,
                };
                persist(next);
            } else if (action === 'MANUAL_TRANSFER') {
                const next = {
                    ...stateRef.current,
                    paymentMethod: 'manual' as const,
                };
                persist(next);
            } else if (action === 'OPEN_BANK_LINK') {
                const stripped = stateRef.current.chatHistory.map((m) => {
                    if (m.type !== 'bot') return m;
                    const { quickReplies, ...rest } = m;
                    return quickReplies ? rest : m;
                });
                persist({ ...stateRef.current, chatHistory: stripped });
                setActiveSheet('bankLink');
                return;
            }
            goToStep(action as StepIdV2, label);
        },
        [goToStep, persist]
    );

    const handleCtaClick = useCallback(
        (action: string) => {
            goToStep(action as StepIdV2);
        },
        [goToStep]
    );

    const submitOnboarding = useCallback(
        async (data: UserDataV2) => {
            if (busyRef.current) return;
            busyRef.current = true;
            setActiveSheet(null);
            let next: GemynateStateV2 = {
                ...stateRef.current,
                user: data,
                currentStep: 'ACTIVATION' as StepIdV2,
            };
            const userMsg: Message = {
                id: makeId(),
                type: 'user',
                text: 'Complete Onboarding',
                timestamp: timeNow(),
                formResponse: {
                    title: 'Complete Onboarding',
                    sheet: 'onboarding',
                },
            };
            next = { ...next, chatHistory: [...next.chatHistory, userMsg] };
            persist(next);

            const va = generateVirtualAccount(data.firstName);
            next = { ...next, virtualAccount: va };

            const msg1 = `Your plan is almost ready! 🎉 How would you like to save?`;

            next = await addBotMessages([msg1], next);

            const voiceMsg: Message = {
                id: makeId(),
                type: 'bot',
                text: '',
                timestamp: timeNow(),
                voiceNote: {
                    duration: 31,
                    audioSrc: '/audio/activation-voice.wav',
                },
            };
            next = { ...next, chatHistory: [...next.chatHistory, voiceMsg] };
            persist(next);

            await new Promise<void>((resolve) => {
                let resolved = false;
                const done = () => {
                    if (!resolved) {
                        resolved = true;
                        resolve();
                    }
                };
                const timer = setTimeout(done, 10000);
                const handler = () => {
                    clearTimeout(timer);
                    done();
                };
                window.addEventListener('gemynate:voicePlayed', handler, {
                    once: true,
                });
            });

            const msg2 = `⚡ *AutoSave (Recommended)*\nWe save it for you automatically. Pause anytime.\n\n🏦 *Transfer*\nYou send the money yourself anytime using bank transfer or POS.`;

            next = await addBotMessages([msg2], next);
            next = { ...next, currentStep: 'PAYMENT_METHOD' };
            next = attachButtons(next, {
                quickReplies: flowStepsV2['PAYMENT_METHOD'].quickReplies,
            });
            persist(next);
            busyRef.current = false;
        },
        [addBotMessages, persist]
    );

    const submitBankLink = useCallback(
        async (data: BankDetailsV2) => {
            if (busyRef.current) return;
            busyRef.current = true;
            setActiveSheet(null);
            let next: GemynateStateV2 = {
                ...stateRef.current,
                bankDetails: data,
                paymentMethod: 'auto-debit',
            };
            const userMsg: Message = {
                id: makeId(),
                type: 'user',
                text: 'Bank Account Linked',
                timestamp: timeNow(),
                formResponse: {
                    title: 'Bank Account Linked',
                    sheet: 'bankLink',
                },
            };
            next = { ...next, chatHistory: [...next.chatHistory, userMsg] };
            persist(next);
            busyRef.current = false;
            const fromDashboard =
                stateRef.current.currentStep === 'FUND_ACCOUNT_LINK';
            goToStep(
                fromDashboard
                    ? ('DASHBOARD' as StepIdV2)
                    : ('SUCCESS' as StepIdV2)
            );
        },
        [persist, goToStep]
    );

    const submitClaimNights = useCallback(
        async (nights: number) => {
            setActiveSheet(null);
            const buttonId = nightsButtonMsgIdRef.current;
            nightsButtonMsgIdRef.current = null;

            let next = { ...stateRef.current, claimNights: nights };
            if (buttonId) {
                next = {
                    ...next,
                    chatHistory: next.chatHistory.filter(
                        (m) => m.id !== buttonId
                    ),
                };
            }
            const userMsg: Message = {
                id: makeId(),
                type: 'user',
                text: `${nights} night${nights > 1 ? 's' : ''}`,
                timestamp: timeNow(),
            };
            next = { ...next, chatHistory: [...next.chatHistory, userMsg] };
            persist(next);
            const nextStepId = claimNextStepRef.current;
            claimNextStepRef.current = null;
            if (nextStepId) {
                goToStep(nextStepId);
            }
        },
        [persist, goToStep]
    );

    const viewResponse = useCallback((sheet: SheetTypeV2) => {
        setActiveSheet(sheet);
    }, []);

    const closeSheet = useCallback(async () => {
        const currentSheet = activeSheet;
        setActiveSheet(null);

        if (currentSheet === 'onboarding' && stateRef.current.user === null) {
            let next = { ...stateRef.current };
            const msg: Message = {
                id: makeId(),
                type: 'bot',
                text: "No worries! Tap below when you're ready to continue.",
                timestamp: timeNow(),
                quickReplies: [
                    { label: 'Continue Setup ✏️', action: 'ONBOARDING_FORM' },
                ],
            };
            next = { ...next, chatHistory: [...next.chatHistory, msg] };
            persist(next);
            return;
        }

        if (currentSheet === 'bankLink') {
            const currentStep = stateRef.current.currentStep;
            if (currentStep === 'FUND_ACCOUNT_LINK') {
                busyRef.current = false;
                goToStep('DASHBOARD_MENU' as StepIdV2);
                return;
            }
            if (
                currentStep === 'AUTO_DEBIT_SETUP' ||
                currentStep === 'PAYMENT_METHOD'
            ) {
                let next = { ...stateRef.current };
                const msg: Message = {
                    id: makeId(),
                    type: 'bot',
                    text: 'No problem! You can link your bank later.',
                    timestamp: timeNow(),
                    quickReplies: [
                        { label: 'Try Again 🔗', action: 'AUTO_DEBIT_SETUP' },
                        {
                            label: 'Transfer Manually 🏦',
                            action: 'MANUAL_TRANSFER',
                        },
                    ],
                };
                next = { ...next, chatHistory: [...next.chatHistory, msg] };
                persist(next);
                return;
            }
        }

        if (currentSheet === 'nights') {
            claimNextStepRef.current = null;
            nightsButtonMsgIdRef.current = null;
        }
    }, [activeSheet, persist, goToStep]);

    const resetAll = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        stateRef.current = defaultState;
        setState(defaultState);
        setActiveSheet(null);
        setIsTyping(false);
    }, []);

    return {
        state,
        isTyping,
        activeSheet,
        goToStep,
        handleQuickReply,
        handleCtaClick,
        handleClaimActionTap,
        submitOnboarding,
        submitBankLink,
        submitClaimNights,
        viewResponse,
        closeSheet,
        resetAll,
    };
}

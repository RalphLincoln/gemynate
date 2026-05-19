import { useState, useCallback, useRef, useEffect } from 'react';
import type {
    GemynateState,
    Message,
    StepId,
    PlanTier,
    UserData,
    PaymentData,
    SheetType,
} from '../types';
import { flowSteps, PLAN_BENEFITS } from '../data/flow';

const STORAGE_KEY = 'gemynate-state';

const defaultState: GemynateState = {
    selectedPlan: null,
    currentStep: 'WELCOME',
    chatHistory: [],
    user: null,
    plan: null,
    payment: null,
    contributions: {
        pocketMoney: 0,
        hospitalCash: 0,
        hustleShield: 0,
        activeDays: 0,
        policyActive: false,
    },
};

function loadState(): GemynateState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw);
            // Migrate old field names
            if (
                parsed.contributions &&
                ('smartSave' in parsed.contributions ||
                    'goalPlan' in parsed.contributions)
            ) {
                parsed.contributions = {
                    pocketMoney:
                        parsed.contributions.smartSave ||
                        parsed.contributions.pocketMoney ||
                        0,
                    hospitalCash:
                        parsed.contributions.protectionPool ||
                        parsed.contributions.hospitalCash ||
                        0,
                    hustleShield:
                        parsed.contributions.goalPlan ||
                        parsed.contributions.hustleShield ||
                        0,
                    activeDays: parsed.contributions.activeDays || 0,
                    policyActive: parsed.contributions.policyActive || false,
                };
            }
            return parsed;
        }
    } catch {
        /* ignore */
    }
    return defaultState;
}

function saveState(s: GemynateState) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
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

function computeContributions(plan: PlanTier | null, days: number) {
    if (!plan)
        return {
            pocketMoney: 0,
            hospitalCash: 0,
            hustleShield: 0,
            activeDays: 0,
            policyActive: false,
        };
    const benefits = PLAN_BENEFITS[plan];
    const daily = benefits.dailyAmount;
    return {
        pocketMoney: Math.round(daily * 0.15 * days),
        hospitalCash: benefits.hospitalCashPerNight,
        hustleShield: benefits.hustleShield,
        activeDays: days,
        policyActive: days >= 30,
    };
}

export function useConversation() {
    const [state, setState] = useState<GemynateState>(loadState);
    const [isTyping, setIsTyping] = useState(false);
    const [activeSheet, setActiveSheet] = useState<SheetType>(null);
    const stateRef = useRef(state);
    const typingRef = useRef(false);
    const busyRef = useRef(false);

    useEffect(() => {
        stateRef.current = state;
    }, [state]);

    const persist = useCallback((next: GemynateState) => {
        stateRef.current = next;
        setState(next);
        saveState(next);
    }, []);

    const addBotMessages = useCallback(
        async (messages: string[], nextState: GemynateState) => {
            for (const text of messages) {
                setIsTyping(true);
                await new Promise((r) =>
                    setTimeout(r, 600 + Math.random() * 400)
                );
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

    const claimNextStepRef = useRef<StepId | null>(null);
    const nightsButtonMsgIdRef = useRef<string | null>(null);

    const CLAIM_NEXT_STEP: Partial<Record<StepId, StepId>> = {
        CLAIM_STILL_ADMITTED: 'CLAIM_ADMITTED_STEP2',
        CLAIM_ADMITTED_STEP2: 'CLAIM_ADMITTED_HOSPITAL_CONFIRM',
        CLAIM_ADMITTED_STEP3: 'CLAIM_ADMITTED_STEP4',
        CLAIM_ADMITTED_STEP4: 'CLAIM_ADMITTED_SUBMITTED',
        CLAIM_DISCHARGED: 'CLAIM_DISCHARGED_STEP2',
        CLAIM_DISCHARGED_STEP3: 'CLAIM_DISCHARGED_STEP4',
        CLAIM_DISCHARGED_STEP4: 'CLAIM_DISCHARGED_SUBMITTED',
    };

    const CLAIM_ACTION_LABELS: Record<string, string> = {
        upload_photo: '📎 Upload Photo',
        upload_discharge: '📎 Upload Photo',
        share_location: '📍 Share Live Location',
        nights_input: '🔢 Enter Nights',
        take_selfie: '📸 Take Selfie',
    };

    function attachButtons(
        state: GemynateState,
        step: {
            cta?: { label: string; action: string };
            quickReplies?: { label: string; action: string }[];
            menuItems?: { label: string; action: string }[];
            claimAction?: string;
        }
    ): GemynateState {
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
        state: GemynateState,
        claimAction: string
    ): GemynateState {
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
        async (stepId: StepId, userText?: string) => {
            if (busyRef.current) return;
            busyRef.current = true;
            let next: GemynateState = { ...stateRef.current };

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

            const step = flowSteps[stepId];
            if (!step) {
                busyRef.current = false;
                return;
            }

            if (step.sheet) {
                setActiveSheet(step.sheet);
                busyRef.current = false;
                return;
            }

            // --- Dynamic step: ONBOARDING_COMPLETE ---
            if (stepId === 'ONBOARDING_COMPLETE') {
                const msg =
                    "You're all set up! Now, it is time to subscribe to a BackUp plan.\n\nTo choose your plan, simply pick the daily amount that feels comfortable for you.";
                next = await addBotMessages([msg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic step: PLAN_SELECTED_RUBY/EMERALD/SAPPHIRE ---
            if (
                stepId === 'PLAN_SELECTED_RUBY' ||
                stepId === 'PLAN_SELECTED_EMERALD' ||
                stepId === 'PLAN_SELECTED_SAPPHIRE'
            ) {
                const tierMap: Record<string, PlanTier> = {
                    PLAN_SELECTED_RUBY: 'ruby',
                    PLAN_SELECTED_EMERALD: 'emerald',
                    PLAN_SELECTED_SAPPHIRE: 'sapphire',
                };
                const tier = tierMap[stepId];
                const benefits = PLAN_BENEFITS[tier];
                const planLabel =
                    tier === 'ruby'
                        ? 'Ruby'
                        : tier === 'emerald'
                          ? 'Emerald'
                          : 'Sapphire';
                const planEmoji =
                    tier === 'ruby' ? '🔴' : tier === 'emerald' ? '🟢' : '🔵';

                next = { ...next, plan: tier };

                const sandwichMsg = `Nice! ${planEmoji} With the ${planLabel} plan (₦${benefits.dailyAmount.toLocaleString()} daily), here is what is inside your BackUp:\n\n💸 Pocket Money: You can withdraw up to ₦${benefits.pocketMoneyPerMonth.toLocaleString()} every month.\n🏥 Hospital Cash: Get up to ₦${benefits.hospitalCashPerNight.toLocaleString()} for every night you spend in the hospital.\n🛡️ Hustle Shield: Get up to ₦${benefits.hustleShield.toLocaleString()} for an accidental injury that stops you from working.\n\nReady to start? Tap below to link your bank and automate your daily payment. It's highly secure and takes just 2 minutes.`;

                next = await addBotMessages([sandwichMsg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic step: ACCOUNT_LINKED ---
            if (stepId === 'ACCOUNT_LINKED') {
                const benefits = next.plan ? PLAN_BENEFITS[next.plan] : null;
                const dailyStr = benefits
                    ? `₦${benefits.dailyAmount.toLocaleString()}`
                    : '₦0';

                const msg = `You're all set! 🎊 Your account is linked.\n\nHere is what happens next:\n\n✅ Your ${dailyStr} payment runs automatically every day.\n✅ You have 5 Free Days available this month.\n✅ Your BackUp fully activates after exactly 30 days of active payments.\n\nYou can open your BackUp anytime to check your balance, withdraw cash, or make a claim.`;

                next = await addBotMessages([msg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic step: DASHBOARD ---
            if (stepId === 'DASHBOARD') {
                const days =
                    next.contributions.activeDays > 0
                        ? next.contributions.activeDays +
                          Math.floor(Math.random() * 3) +
                          1
                        : 31;
                const contrib = computeContributions(next.plan, days);
                next = { ...next, contributions: contrib };

                const coverStatus = contrib.policyActive
                    ? '✅ Cover Status: Active'
                    : '✅ Cover Status: Active soon. Stay consistent!';

                const dashMsg = `Here is what is inside your BackUp:\n\n💸 Pocket Money: ₦${contrib.pocketMoney.toLocaleString()} (Available to withdraw)\n📅 Active Days: ${contrib.activeDays} Days\n${coverStatus}\n\nTap the menu below to choose an action:`;

                next = await addBotMessages([dashMsg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic step: CLAIM_FLOW ---
            if (stepId === 'CLAIM_FLOW') {
                if (!next.contributions.policyActive) {
                    const daysLeft = 30 - next.contributions.activeDays;
                    const msg = `⚠️ Your BackUp cover is not yet active.\n\nYou need ${daysLeft} more active day${daysLeft > 1 ? 's' : ''} before you can make a claim. Your Hospital Cash and Hustle Shield activate after 30 days of payments.\n\nKeep going — you're ${next.contributions.activeDays} day${next.contributions.activeDays !== 1 ? 's' : ''} in!`;
                    next = await addBotMessages([msg], next);
                    next = attachButtons(next, {
                        quickReplies: [
                            {
                                label: 'Check My BackUp 📊',
                                action: 'DASHBOARD',
                            },
                        ],
                    });
                    persist(next);
                    busyRef.current = false;
                    return;
                }
                const msg = `We are sorry you are facing an emergency. That is exactly why your BackUp is here. 🛡️\n\nPlease select the exact event you are claiming for:`;
                next = await addBotMessages([msg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic step: CLAIM_ADMITTED_SUBMITTED ---
            if (stepId === 'CLAIM_ADMITTED_SUBMITTED') {
                const nights = next.claimNights || 2;
                const benefits = next.plan ? PLAN_BENEFITS[next.plan] : null;
                const perNight = benefits?.hospitalCashPerNight || 5000;
                const total = nights * perNight;
                const ref = `GEM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

                const msg = `All steps complete! ✅\n\nYour claim for ${nights} night${nights > 1 ? 's' : ''} has been submitted.\n\n💰 Estimated payout: ${nights} × ₦${perNight.toLocaleString()} = ₦${total.toLocaleString()}\n📋 Reference: ${ref}\n\nOur team will verify and process within 24 hours. Payout goes directly to your linked bank account.\n\nRest well — your BackUp has your back!`;

                next = await addBotMessages([msg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic step: CLAIM_DISCHARGED_SUBMITTED ---
            if (stepId === 'CLAIM_DISCHARGED_SUBMITTED') {
                const nights = next.claimNights || 2;
                const benefits = next.plan ? PLAN_BENEFITS[next.plan] : null;
                const perNight = benefits?.hospitalCashPerNight || 5000;
                const total = nights * perNight;
                const ref = `GEM-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 9000) + 1000)}`;

                const msg = `Verification complete. ✅\n\nYour full claim for ${nights} night${nights > 1 ? 's' : ''} has been submitted.\n\n💰 Estimated payout: ${nights} × ₦${perNight.toLocaleString()} = ₦${total.toLocaleString()}\n📋 Reference: ${ref}\n\nOur team will review your discharge documents and get back to you within 24 hours.\n\nTake time to rest!`;

                next = await addBotMessages([msg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Dynamic step: POLICY_DETAILS ---
            if (stepId === 'POLICY_DETAILS') {
                const benefits = next.plan ? PLAN_BENEFITS[next.plan] : null;
                const planLabel =
                    next.plan === 'ruby'
                        ? 'Ruby'
                        : next.plan === 'emerald'
                          ? 'Emerald'
                          : next.plan === 'sapphire'
                            ? 'Sapphire'
                            : 'None';
                const dailyStr = benefits
                    ? `₦${benefits.dailyAmount.toLocaleString()}`
                    : '₦0';

                const msg = `Here is the official summary of your ${planLabel} Policy (${dailyStr}/day). Please read carefully to understand your coverage. 📋\n\nSECTION 1: YOUR COVER LIMITS\n💸 Pocket Money: 15% of your daily payment is saved for instant withdrawal.\n🏥 Hospital Cash: Pays ₦${(benefits?.hospitalCashPerNight || 0).toLocaleString()} for every night you are officially admitted to a registered hospital.\n🛡️ Hustle Shield: Pays a lump sum up to ₦${(benefits?.hustleShield || 0).toLocaleString()} for accidental injuries that medically prevent you from working.\n\nSECTION 2: POLICY RULES & TIMELINES\n⏳ Waiting Period: Your Hospital Cash and Hustle Shield protections fully activate exactly 30 days after your first successful payment.\n\nSECTION 3: WHAT IS NOT COVERED (EXCLUSIONS)\n❌ Routine clinic check-ups, malaria treatments without admission, or pharmacy visits.\n❌ Injuries from illegal activities or self-inflicted harm.\n\nTo download your full legal policy document as a PDF, tap below.`;

                next = await addBotMessages([msg], next);
                next = attachButtons(next, step);
                persist(next);
                busyRef.current = false;
                return;
            }

            // --- Default: static messages ---
            if (step.botMessages.length > 0) {
                next = await addBotMessages(step.botMessages, next);
            }

            if (step.claimAction) {
                // Attach cancel option to bot message + action button below
                const stepWithCancel = {
                    ...step,
                    quickReplies: [
                        { label: 'Cancel Claim 🔙', action: 'DASHBOARD_MENU' },
                    ],
                };
                next = attachButtons(next, stepWithCancel);
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
                // Use real file if provided, otherwise fall back to placeholder
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

                // Try to get real device location
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
                    // Geolocation denied or unavailable — proceed without coordinates
                }

                const userMsg: Message = {
                    id: makeId(),
                    type: 'user',
                    text: '',
                    timestamp: timeNow(),
                    locationCard: {
                        label: `Live until ${liveTimeStr}`,
                        lat,
                        lng,
                    },
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
                // Use real file if provided, otherwise fall back to placeholder
                const isDischargedPath =
                    currentStepId.startsWith('CLAIM_DISCHARGED');
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
        }
    }

    const handleQuickReply = useCallback(
        (label: string, action: string) => {
            goToStep(action as StepId, label);
        },
        [goToStep]
    );

    const handleCtaClick = useCallback(
        (action: string) => {
            goToStep(action as StepId);
        },
        [goToStep]
    );

    const submitOnboarding = useCallback(
        async (data: UserData) => {
            if (busyRef.current) return;
            busyRef.current = true;
            setActiveSheet(null);
            let next: GemynateState = {
                ...stateRef.current,
                user: data,
                currentStep: 'ONBOARDING_COMPLETE' as StepId,
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

            const msg =
                "You're all set up! Now, it is time to subscribe to a BackUp plan.\n\nTo choose your plan, simply pick the daily amount that feels comfortable for you.";
            next = await addBotMessages([msg], next);
            const step = flowSteps['ONBOARDING_COMPLETE'];
            next = attachButtons(next, step);
            persist(next);
            busyRef.current = false;
        },
        [addBotMessages, persist]
    );

    const submitPayment = useCallback(
        async (data: PaymentData) => {
            setActiveSheet(null);
            let next: GemynateState = {
                ...stateRef.current,
                payment: data,
                currentStep: 'ACCOUNT_LINKED' as StepId,
            };
            const userMsg: Message = {
                id: makeId(),
                type: 'user',
                text: 'Complete Payment',
                timestamp: timeNow(),
                formResponse: { title: 'Complete Payment', sheet: 'payment' },
            };
            next = { ...next, chatHistory: [...next.chatHistory, userMsg] };
            persist(next);

            const benefits = next.plan ? PLAN_BENEFITS[next.plan] : null;
            const dailyStr = benefits
                ? `₦${benefits.dailyAmount.toLocaleString()}`
                : '₦0';
            const msg = `You're all set! 🎊 Your account is linked.\n\nHere is what happens next:\n\n✅ Your ${dailyStr} payment runs automatically every day.\n✅ You have 5 Free Days available this month.\n✅ Your BackUp fully activates after exactly 30 days of active payments.\n\nYou can open your BackUp anytime to check your balance, withdraw cash, or make a claim.`;

            const step = flowSteps['ACCOUNT_LINKED'];
            next = await addBotMessages([msg], next);
            next = attachButtons(next, step);
            persist(next);
        },
        [addBotMessages, persist]
    );

    const submitWithdrawal = useCallback(
        async (amount: number) => {
            setActiveSheet(null);
            let next: GemynateState = {
                ...stateRef.current,
                currentStep: 'WITHDRAW_SUCCESS' as StepId,
            };
            const userMsg: Message = {
                id: makeId(),
                type: 'user',
                text: `Withdraw ₦${amount.toLocaleString()}`,
                timestamp: timeNow(),
            };
            next = { ...next, chatHistory: [...next.chatHistory, userMsg] };
            next = {
                ...next,
                contributions: {
                    ...next.contributions,
                    pocketMoney: next.contributions.pocketMoney - amount,
                },
            };
            persist(next);

            const confirmMsg = `Done! ₦${amount.toLocaleString()} has been withdrawn from your Pocket Money and sent to your linked bank account.\n\n💰 New Pocket Money balance: ₦${next.contributions.pocketMoney.toLocaleString()}\n\nFunds will arrive within 24 hours.`;
            const step = flowSteps['WITHDRAW_SUCCESS'];
            next = await addBotMessages([confirmMsg], next);
            next = attachButtons(next, step);
            persist(next);
        },
        [addBotMessages, persist]
    );

    const submitClaimNights = useCallback(
        async (nights: number) => {
            setActiveSheet(null);
            const buttonId = nightsButtonMsgIdRef.current;
            nightsButtonMsgIdRef.current = null;

            let next = { ...stateRef.current, claimNights: nights };
            // Remove the action button now that user confirmed
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

    const viewResponse = useCallback((sheet: SheetType) => {
        setActiveSheet(sheet);
    }, []);

    const closeSheet = useCallback(() => {
        setActiveSheet(null);
    }, []);

    const resetAll = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
        stateRef.current = defaultState;
        setState(defaultState);
        setActiveSheet(null);
        setIsTyping(false);
    }, []);

    const currentStep = flowSteps[state.currentStep];

    return {
        state,
        isTyping,
        activeSheet,
        currentStep,
        goToStep,
        handleQuickReply,
        handleCtaClick,
        handleClaimActionTap,
        submitOnboarding,
        submitPayment,
        submitWithdrawal,
        submitClaimNights,
        viewResponse,
        closeSheet,
        resetAll,
    };
}

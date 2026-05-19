import { useEffect, useRef, useState } from 'react';
import { useConversationV2 } from './hooks/useConversationV2';
import { StatusBar } from './components/StatusBar';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { InputBar } from './components/InputBar';
import { OnboardingSheetV2 } from './sheets/OnboardingSheetV2';
import { BankLinkingSheet } from './sheets/BankLinkingSheet';
import { ClaimNightsSheet } from './sheets/ClaimNightsSheet';
import { FeedbackSheet } from './sheets/FeedbackSheet';
import type { SheetType } from './types';
import { PolicyDetailsSheet } from './sheets/PolicyDetailsSheet.tsx';

export function ConversationV2() {
    const {
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
    } = useConversationV2();

    const [resetKey, setResetKey] = useState(0);
    const [feedbackOpen, setFeedbackOpen] = useState(false);
    const chatRef = useRef<HTMLDivElement>(null);
    const prevSheetRef = useRef(activeSheet);

    useEffect(() => {
        if (state.chatHistory.length === 0 && state.currentStep === 'WELCOME') {
            goToStep('WELCOME');
        }
    }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

    // Return focus to chat when sheet closes
    useEffect(() => {
        if (prevSheetRef.current && !activeSheet) {
            chatRef.current?.focus();
        }
        prevSheetRef.current = activeSheet;
    }, [activeSheet]);

    const handleReset = () => {
        if (confirm('Reset all data and start over?')) {
            resetAll();
            setResetKey((k) => k + 1);
        }
    };

    const handleViewResponse = (sheet: SheetType) => {
        if (sheet === 'onboarding') {
            viewResponse('onboarding');
        } else if (sheet === 'bankLink') {
            viewResponse('bankLink');
        }
    };

    return (
        <>
            <div className="sm:rounded-[28px] bg-white flex flex-col h-[100vh] h-dvh sm:h-[812px] sm:max-h-full sm:min-h-0 relative overflow-hidden">
                <div className="hidden sm:block">
                    <StatusBar />
                </div>
                <Header
                    onReset={handleReset}
                    onFeedback={() => setFeedbackOpen(true)}
                />
                <ChatView
                    messages={state.chatHistory}
                    isTyping={isTyping}
                    onQuickReply={handleQuickReply}
                    onCtaClick={handleCtaClick}
                    onViewResponse={handleViewResponse}
                    onClaimAction={handleClaimActionTap}
                    blurred={!!activeSheet}
                    containerRef={chatRef}
                />
                <InputBar />

                {activeSheet === 'onboarding' && (
                    <OnboardingSheetV2
                        onSubmit={submitOnboarding}
                        onClose={closeSheet}
                        existingData={state.user}
                    />
                )}
                {activeSheet === 'bankLink' && (
                    <BankLinkingSheet
                        onSubmit={submitBankLink}
                        onClose={closeSheet}
                        userName={
                            state.user
                                ? `${state.user.firstName} ${state.user.lastName}`
                                : 'Account Holder'
                        }
                        existingData={state.bankDetails}
                    />
                )}
                {activeSheet === 'policyDetails' && state.selectedPlan && (
                    <PolicyDetailsSheet
                        selectedPlan={state.selectedPlan}
                        onClose={closeSheet}
                    />
                )}
                {feedbackOpen && (
                    <FeedbackSheet onClose={() => setFeedbackOpen(false)} />
                )}
                {activeSheet === 'nights' && (
                    <ClaimNightsSheet
                        onSubmit={submitClaimNights}
                        onClose={closeSheet}
                        title={
                            state.currentStep.includes('ADMITTED')
                                ? 'Nights So Far'
                                : 'Total Nights'
                        }
                        subtitle={
                            state.currentStep.includes('ADMITTED')
                                ? 'How many nights have you spent so far?'
                                : 'How many nights were you admitted?'
                        }
                    />
                )}
            </div>
        </>
    );
}

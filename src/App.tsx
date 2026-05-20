import { useEffect, useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useConversation } from './hooks/useConversation';
import { PLAN_BENEFITS } from './data/flow';
import { ConversationV2 } from './ConversationV2';

// Components
import { StatusBar } from './components/StatusBar';
import { Header } from './components/Header';
import { ChatView } from './components/ChatView';
import { InputBar } from './components/InputBar';

// Sheets
import { OnboardingSheet } from './sheets/OnboardingSheet';
import { PaymentSheet } from './sheets/PaymentSheet';
import { WithdrawalSheet } from './sheets/WithdrawalSheet';
import { ClaimNightsSheet } from './sheets/ClaimNightsSheet';
import { PolicyDetailsSheet } from './sheets/PolicyDetailsSheet';

/**
 * Main conversation interface
 * Renders the chat UI and manages all sheet overlays
 */
function Conversation() {
    const {
        state,
        isTyping,
        activeSheet,
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
    } = useConversation();

    const [resetKey, setResetKey] = useState(0);

    // Initialize conversation on mount
    useEffect(() => {
        if (state.chatHistory.length === 0 && state.currentStep === 'WELCOME') {
            goToStep('WELCOME');
        }

        console.log(
            'Active sheet:',
            activeSheet,
            'Selected plan:',
            state.selectedPlan
        );
    }, [resetKey]); // eslint-disable-line react-hooks/exhaustive-deps

    const handleReset = () => {
        if (confirm('Reset all data and start over?')) {
            resetAll();
            setResetKey((k) => k + 1);
        }
    };

    // Get daily amount for payment sheet
    const dailyAmount = state.plan
        ? `${PLAN_BENEFITS[state.plan].dailyAmount.toLocaleString()}`
        : '0';

    console.log(
        'Active sheet:',
        activeSheet,
        'Selected plan:',
        state.selectedPlan
    );

    return (
        <div className="sm:rounded-[28px] bg-white flex flex-col h-[100vh] h-dvh sm:h-[812px] sm:max-h-full sm:min-h-0 relative overflow-hidden">
            {/* Status bar - desktop only */}
            <div className="hidden sm:block">
                <StatusBar />
            </div>

            {/* Header */}
            <Header onReset={handleReset} />

            {/* Chat area */}
            <ChatView
                messages={state.chatHistory}
                isTyping={isTyping}
                onQuickReply={handleQuickReply}
                onCtaClick={handleCtaClick}
                onViewResponse={viewResponse}
                onClaimAction={handleClaimActionTap}
                blurred={!!activeSheet}
            />

            {/* Input bar */}
            <InputBar />

            {/* Sheets */}
            {activeSheet === 'onboarding' && (
                <OnboardingSheet
                    onSubmit={submitOnboarding}
                    onClose={closeSheet}
                    existingData={state.user}
                />
            )}

            {activeSheet === 'payment' && (
                <PaymentSheet
                    dailyAmount={dailyAmount}
                    onSubmit={submitPayment}
                    onClose={closeSheet}
                    existingData={state.payment}
                />
            )}

            {activeSheet === 'withdrawal' && (
                <WithdrawalSheet
                    pocketMoneyBalance={state.contributions.pocketMoney}
                    onSubmit={submitWithdrawal}
                    onClose={closeSheet}
                />
            )}

            {activeSheet === 'policyDetails' && state.selectedPlan && (
                <PolicyDetailsSheet
                    selectedPlan={state.selectedPlan}
                    onClose={closeSheet}
                />
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
    );
}

/**
 * Phone frame for desktop preview
 * Centers content and applies phone-like styling
 */
function PhoneFrame({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex items-end sm:items-center justify-center min-h-[100vh] min-h-dvh sm:p-10 min-w-0 overflow-hidden w-full">
            <div className="w-full sm:w-[396px] sm:max-h-[calc(100vh-80px)] sm:max-h-[calc(100dvh-80px)] sm:rounded-[46px] sm:bg-[#1a1a1a] sm:p-[12px] sm:shadow-2xl relative overflow-hidden min-w-0 flex flex-col">
                {children}
            </div>
        </div>
    );
}

/**
 * Main app component
 * Routes between v1 (default) and v2 (second version) conversations
 */
function App() {
    return (
        <Routes>
            <Route
                path="/v2"
                element={
                    <PhoneFrame>
                        <ConversationV2 />
                    </PhoneFrame>
                }
            />
            <Route
                path="*"
                element={
                    <PhoneFrame>
                        <Conversation />
                    </PhoneFrame>
                }
            />
        </Routes>
    );
}

export default App;

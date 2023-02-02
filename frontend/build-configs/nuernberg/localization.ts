import { LocalizationType } from "../types"

const localization: LocalizationType = {
    identification: {
        noCardView: {
            applyTitle: "Beantragen",
            applyDescription:
                "Sie haben noch keinen Nürnberg-Pass? Hier können Sie Ihren Nürnberg-Pass beantragen.",
            activateTitle: "Pass aktivieren",
            activateDescription:
                "Sie haben den Nürnberg-Pass bereits beantragt und einen Aktivierungscode erhalten? Scannen Sie den Code hier ein.",
            verifyTitle: "Gültigkeit prüfen",
            verifyDescription:
                "Sie möchten die Gültigkeit eines Nürnberg-Passes prüfen? Scannen Sie den Code hier ein.",
        },
        activationCodeScanner: {
            title: "Pass aktivieren",
        },
        verificationCodeScanner: {
            title: "Pass verifizieren",
            infoDialogTitle: "So prüfen Sie die Gültigkeit eines Nürnberg-Passes",
            positiveVerificationDialogTitle: "Pass ist gültig",
        },
        moreActions: {
            applyForAnotherCardTitle: "Weiteren Nürnberg-Pass beantragen",
            applyForAnotherCardDescription: "Ihr hinterlegter Pass bleibt erhalten.",
            activateAnotherCardTitle: "Anderen Aktivierungscode einscannen",
            activateAnotherCardDescription: "Dadurch wird der hinterlegte Pass vom Gerät gelöscht.",
            verifyTitle: "Einen Nürnberg-Pass prüfen",
            verifyDescription: "Prüfen Sie die Gültigkeit eines Nürnberg-Passes.",
        },
    },
}

export default localization

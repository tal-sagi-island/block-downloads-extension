const Verdict = {
    Allow: 'allow',
    Block: 'block',
};

const Action = {
    Download: 'download',
};

const defaultRules = [
    {
        action: Action.Download,
        matchCriteria: {
            category: 'Social Networking',
        },
        verdict: Verdict.Block,
    },
    {
        action: Action.Download,
        matchCriteria: {
            riskLevel: {
                gt: 1,
            },
        },
        verdict: Verdict.Block,
    },
];

class PolicyEnforcer {
    constructor(rules) {
        this.rules = rules;
    }

    isCategoryMatch({ rule, classification }) {
        if (!rule.matchCriteria.category) {
            return false;
        }
        return rule.matchCriteria.category === classification.category;
    }

    isRiskLevelMatch({ rule, classification }) {
        if (!rule.matchCriteria.riskLevel) {
            return false;
        }

        if (rule.matchCriteria.riskLevel.eq) {
            return classification.riskLevel === rule.matchCriteria.riskLevel.eq;
        }
        if (rule.matchCriteria.riskLevel.gt) {
            return classification.riskLevel > rule.matchCriteria.riskLevel.gt;
        }
        if (rule.matchCriteria.riskLevel.lt) {
            return classification.riskLevel < rule.matchCriteria.riskLevel.lt;
        }
        return false;
    }

    isMatch({ rule, classification }) {
        if (this.isCategoryMatch({ rule, classification })) {
            return true;
        }
        if (this.isRiskLevelMatch({ rule, classification })) {
            return true;
        }
        return false;
    }

    getVerdict({ action, classification }) {
        for (const rule of this.rules) {
            if (rule.action === action && this.isMatch({ rule, classification })) {
                return rule.verdict;
            }
        }
        return Verdict.Allow;
    }
}

const policyEnforcer = new PolicyEnforcer(defaultRules);

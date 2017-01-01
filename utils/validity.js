const rb = window.rb;
const $ = rb.$;
const rules = {};
const expando = rb.Symbol('validity');

function addRule(rule){
    $.extend(rules, $.extend({}, rule, {isAsync: false}));
}

function getCustomValidityInfo(element){
    let validityInfo = element[expando];

    if(!validityInfo){
        const $element = $(element);

        validityInfo = {
            element,
            $element,
            data: $element.data(),
            rules: [],
            isPending: false,
            isDirty: true,
            errorRule: null,
            asyncIndex: -1,
        };

        element[expando] = validityInfo;
    }

    return validityInfo;
}

function checkRule(){
    // todo
}

function checkAsyncRule(){
    // todo
}

function check(element){
    const validityInfo = getCustomValidityInfo(element);
    const {errorRule} = validityInfo;
    const {validity} = element;
    const {value} = element;

    validityInfo.isDirty = true;

    if(validity.valid || (validity.customError && errorRule)){
        if(!errorRule.isAsync || checkRule(errorRule, validityInfo, value)){
            let asyncRule;

            for(let ruleName in rules){
                const currentRule = rules[ruleName];

                if(ruleName in validity.data && currentRule != errorRule && ( (currentRule.isAsync && (asyncRule = currentRule)) || !checkRule(currentRule, validityInfo, value))){
                    break;
                }
            }

            if(asyncRule && !validityInfo.errorRule){
                checkAsyncRule(asyncRule, validityInfo, value);
            }
        }
    }

    validityInfo.isDirty = false;
}

const validity = {check, addRule};

rb.validity = validity;

export default validity;
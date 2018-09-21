// Lambda Function code for Alexa.
// Paste this into your index.js file.

const Alexa = require("ask-sdk");
const https = require("https");



const invocationName = "calcul mental";

// Session Attributes
//   Alexa will track attributes for you, by default only during the lifespan of your session.
//   The history[] array will track previous request(s), used for contextual Help/Yes/No handling.
//   Set up DynamoDB persistence to have the skill save and reload these attributes between skill sessions.

function getMemoryAttributes() {
    const memoryAttributes = {
        "history": [],


        "launchCount": 0,
        "lastUseTimestamp": 0,

        "lastSpeechOutput": {},
        // "nextIntent":[]

        // "favoriteColor":"",
        // "name":"",
        // "namePronounce":"",
        // "email":"",
        // "mobileNumber":"",
        // "city":"",
        // "state":"",
        // "postcode":"",
        // "birthday":"",
        // "bookmark":0,
        // "wishlist":[],
    };
    return memoryAttributes;
};

const maxHistorySize = 20; // remember only latest 20 intents


// 1. Intent Handlers =============================================

const AMAZON_CancelIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let languageModel = getLanguageModel(states.CLOSESESSION);

        let say = randomElement(languageModel.messages.end)

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_HelpIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'];
        let intents = getCustomIntents();
        let sampleIntent = randomElement(intents);

        let say = helpMsg;

        let previousIntent = getPreviousIntent(sessionAttributes);

        if (previousIntent && !handlerInput.requestEnvelope.session.new) {
            //say += helpLast + previousIntent + '. ';
        }
        // say +=  'I understand  ' + intents.length + ' intents, '

        say += ' ' + helpSample + ' , ' + getSampleUtterance(sampleIntent);

        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StopIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();


        let say = 'Okay, talk to you later! ';

        return responseBuilder
            .speak(say)
            .withShouldEndSession(true)
            .getResponse();
    },
};

const AMAZON_NavigateHomeIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.NavigateHomeIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.NavigateHomeIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};


const AMAZON_PauseIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.PauseIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.PauseIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const AMAZON_StartOverIntent_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'AMAZON.StartOverIntent';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let say = 'Hello from AMAZON.StartOverIntent. ';


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const Resultat_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'Resultat';
    },
    handle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.result;


        let say = '';
        let slotStatus = '';
        let resolvedSlot;

        let slotValues = getSlotValues(request.intent.slots);
        // getSlotValues returns .heardAs, .resolved, and .isValidated for each slot, according to request slot status codes ER_SUCCESS_MATCH, ER_SUCCESS_NO_MATCH, or traditional simple request slot without resolutions

        // console.log('***** slotValues: ' +  JSON.stringify(slotValues, null, 2));
        //   SLOT: nombre
        if (slotValues.nombre.heardAs && slotValues.nombre.heardAs !== '') {
            if (sessionAttributes.result == slotValues.nombre.heardAs) {
                say = 'bravo tu as trouvé le bon résultat.';
            } else {
                say = 'malheureusement je crois que tu as fais une petite erreur. Le résultat est de ' + sessionAttributes.result + ' au lieu de ' + slotValues.nombre.heardAs;
            }
        } else {

            say = 'je n\'ai pas compris le resultat de ton ' + randomElement(['calcul'], ['addition']);
        }
        if (slotValues.nombre.ERstatus === 'ER_SUCCESS_MATCH') {
            slotStatus += 'a valid ';
            if (slotValues.nombre.resolved !== slotValues.nombre.heardAs) {
                slotStatus += 'synonym for ' + slotValues.nombre.resolved + '. ';
            } else {
                slotStatus += 'match. '
            } // else {
            //
        }
        if (slotValues.nombre.ERstatus === 'ER_SUCCESS_NO_MATCH') {
            slotStatus += 'which did not match any slot value. ';
            console.log('***** consider adding "' + slotValues.nombre.heardAs + '" to the custom slot type used by slot nombre! ');
        }

        if ((slotValues.nombre.ERstatus === 'ER_SUCCESS_NO_MATCH') || (!slotValues.nombre.heardAs)) {
            // slotStatus += 'A few valid values are, ' + sayArray(getExampleSlotValues('Resultat','nombre'), 'or');
        }

        say += slotStatus;


        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const Operations_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'Operations';
    },
    handle(handlerInput) {

        console.log("in Operations_Handler");
        const request = handlerInput.requestEnvelope.request;
        const responseBuilder = handlerInput.responseBuilder;
        let say = askLevel(handlerInput);
        console.log("say : "+say);
        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

const Level_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'IntentRequest' && request.intent.name === 'Level';
    },
    handle(handlerInput) {
        console.log("in Niveau_Handler");
        let attributes = handlerInput.attributesManager.getSessionAttributes();
        let slotValues = getSlotValues(request.intent.slots);
        console.log("Niveau : "+slotValues.nombre)
        const responseBuilder = handlerInput.responseBuilder;
        let say = checkState(states.LEVEL, attributes.states);
        if (say == undefined) {
            const request = handlerInput.requestEnvelope.request;
            say = askComputation(handlerInput);
        }
        console.log("SAY: "+say);
        return responseBuilder
            .speak(say)
            .reprompt('try again, ' + say)
            .getResponse();
    },
};

function checkState(current, previous) {
    console.log("CheckState");
    switch (current) {
        case states.LEVEL:  {
            if(previous == states.START) return;
        }
    }
   
    // Anorml Workflow
    if (current == previous) {
        return "Tu as déjà répondu à la question."
    }
    return "Un probleme s'est produit dans la comprehension du niveau.";
}

function getRandom(min, max) {
    return Math.floor((Math.random() * ((max - min) + 1)) + min);
}

function askComputation(handlerInput) {
    console.log("I am in askComutation()");
    //Generating random computation

    //GET SESSION ATTRIBUTES
    const attributes = handlerInput.attributesManager.getSessionAttributes();
    const gauche = getRandom(1, 10);
    const droite = getRandom(1, 10);
    //SET QUESTION DATA TO ATTRIBUTES
    attributes.result = gauche + droite;
    if (typeof attributes.counter === 'undefined')  attributes.counter = 0;

    attributes.counter += 1;
    attributes.gauche += gauche;
    attributes.droite += droite;
    attributes.states = states.ASKCOMPUTATION
    //SAVE ATTRIBUTES
    handlerInput.attributesManager.setSessionAttributes(attributes);

    const question = getQuestion(attributes.counter, gauche, droite);
    //  const question ='ca marche';
    return question;
}
function askLevel(handlerInput) {
    console.log("I am in askLevel()");
    //Generating random computation

    //GET SESSION ATTRIBUTES
    const attributes = handlerInput.attributesManager.getSessionAttributes();



    //SAVE ATTRIBUTES
    handlerInput.attributesManager.setSessionAttributes(attributes);
    const question = 'choisi ton niveau de 1 à 3 ?';

    return question;
}
function getQuestion(counter, gauche, droite) {
    //  let say = 'calcul moi '+randomElement(['l\'addition','la somme'])+' de '++' plus '+;
    return randomElement(['attention voci la ']) + ` questions ${counter}. ` + randomElement(['calcul', 'donne moi']) + ' ' + randomElement(['l\'addition', 'la somme']) + ' de ' + gauche + ' plus ' + droite+ " ?";
}

const LaunchRequest_Handler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        const responseBuilder = handlerInput.responseBuilder;

        let startLanguageModel = getLanguageModel(states.START);

        let say = randomElement(startLanguageModel.messages.welcome) + ' dans ' +
            invocationName + ". " + randomElement(startLanguageModel.messages.ask);
        console.log("say : " + say);
        let skillTitle = capitalize(invocationName);
        //GET SESSION ATTRIBUTES
        console.log("before1");
        const attributes = handlerInput.attributesManager.getSessionAttributes();
        console.log("before2");
        if (attributes.states != null) console.log("already say");
        else console.log("State : " + attributes.states);
        console.log("before3");
        attributes.states = states.START
        console.log("before3");  //SAVE ATTRIBUTES
        handlerInput.attributesManager.setSessionAttributes(attributes);
        if (supportsDisplay(handlerInput)) {
            const myImage1 = new Alexa.ImageHelper()
                .addImageInstance(DisplayImg1.url)
                .getImage();

            const myImage2 = new Alexa.ImageHelper()
                .addImageInstance(DisplayImg2.url)
                .getImage();

            const primaryText = new Alexa.RichTextContentHelper()
                .withPrimaryText('Bienvenue dans cette skill!')
                .getTextContent();

            responseBuilder.addRenderTemplateDirective({
                type: 'BodyTemplate2',
                token: 'string',
                backButton: 'HIDDEN',
                backgroundImage: myImage2,
                image: myImage1,
                title: skillTitle,
                textContent: primaryText,
            });
        }

        return responseBuilder
            .speak(say)
            .reprompt('essaye encore, ' + say)
            .withStandardCard('Bievenue!',
                'Hello!\nThis is a card for your skill, ' + skillTitle,
                welcomeCardImg.smallImageUrl, welcomeCardImg.largeImageUrl)
            .getResponse();
    },
};

const SessionEndedHandler = {
    canHandle(handlerInput) {
        const request = handlerInput.requestEnvelope.request;
        return request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        console.log(`Session ended with reason: ${handlerInput.requestEnvelope.request.reason}`);
        return handlerInput.responseBuilder.getResponse();
    }
};

const ErrorHandler = {
    canHandle() {
        return true;
    },
    handle(handlerInput, error) {
        const request = handlerInput.requestEnvelope.request;

        console.log(`Error handled: ${error.message}`);
        // console.log(`Original Request was: ${JSON.stringify(request, null, 2)}`);

        return handlerInput.responseBuilder
            .speak(`désolé votre skill calcul mental est bugge.  ${error.message} `)
            .reprompt(`désolé votre skill vous donne cette erreur.  ${error.message} `)
            .getResponse();
    }
};


// 2. Constants ===========================================================================

const states = {
    START: `_START`,
    ASKCOMPUTATION: `_ASKCOMPUTATION`,
    WAITFORRESPONSE: `_WAITFORRESPONSE`,
    LEVEL: `_LEVEL`,
    CLOSESESSION: '_CLOSESESSION'
};
const helpLast = 'Votre dernière demande étais.';
const helpSample = 'Voici un exemple de ce que vous pouvez me demander';
const helpMsg = 'Vous avez demandé de l\'aide.';
const APP_ID = undefined;  // TODO replace with your Skill ID (OPTIONAL).

// 3.  Helper Functions ===================================================================

function capitalize(myString) {

    return myString.replace(/(?:^|\s)\S/g, function (a) { return a.toUpperCase(); });
}


function randomElement(myArray) {
    return (myArray[Math.floor(Math.random() * myArray.length)]);
}

function stripSpeak(str) {
    return (str.replace('<speak>', '').replace('</speak>', ''));
}




function getSlotValues(filledSlots) {
    const slotValues = {};

    Object.keys(filledSlots).forEach((item) => {
        const name = filledSlots[item].name;

        if (filledSlots[item] &&
            filledSlots[item].resolutions &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0] &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status &&
            filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
            switch (filledSlots[item].resolutions.resolutionsPerAuthority[0].status.code) {
                case 'ER_SUCCESS_MATCH':
                    slotValues[name] = {
                        heardAs: filledSlots[item].value,
                        resolved: filledSlots[item].resolutions.resolutionsPerAuthority[0].values[0].value.name,
                        ERstatus: 'ER_SUCCESS_MATCH'
                    };
                    break;
                case 'ER_SUCCESS_NO_MATCH':
                    slotValues[name] = {
                        heardAs: filledSlots[item].value,
                        resolved: '',
                        ERstatus: 'ER_SUCCESS_NO_MATCH'
                    };
                    break;
                default:
                    break;
            }
        } else {
            slotValues[name] = {
                heardAs: filledSlots[item].value || '', // may be null
                resolved: '',
                ERstatus: ''
            };
        }
    }, this);

    return slotValues;
}
function getLanguageModel(currentStep) {
    console.log("Lang : " + languageModel);
    let obj = languageModel.find(o => o.state === currentStep);
    return obj;
}

function getExampleSlotValues(intentName, slotName) {

    let examples = [];
    let slotType = '';
    let slotValuesFull = [];

    let intents = model.interactionModel.languageModel.intents;
    for (let i = 0; i < intents.length; i++) {
        if (intents[i].name == intentName) {
            let slots = intents[i].slots;
            for (let j = 0; j < slots.length; j++) {
                if (slots[j].name === slotName) {
                    slotType = slots[j].type;

                }
            }
        }

    }
    let types = model.interactionModel.languageModel.types;
    for (let i = 0; i < types.length; i++) {
        if (types[i].name === slotType) {
            slotValuesFull = types[i].values;
        }
    }

    slotValuesFull = shuffleArray(slotValuesFull);

    examples.push(slotValuesFull[0].name.value);
    examples.push(slotValuesFull[1].name.value);
    if (slotValuesFull.length > 2) {
        examples.push(slotValuesFull[2].name.value);
    }


    return examples;
}

function sayArray(myData, penultimateWord = 'and') {
    let result = '';

    myData.forEach(function (element, index, arr) {

        if (index === 0) {
            result = element;
        } else if (index === myData.length - 1) {
            result += ` ${penultimateWord} ${element}`;
        } else {
            result += `, ${element}`;
        }
    });
    return result;
}
function supportsDisplay(handlerInput) // returns true if the skill is running on a device with a display (Echo Show, Echo Spot, etc.)
{                                      //  Enable your skill for display as shown here: https://alexa.design/enabledisplay
    const hasDisplay =
        handlerInput.requestEnvelope.context &&
        handlerInput.requestEnvelope.context.System &&
        handlerInput.requestEnvelope.context.System.device &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces &&
        handlerInput.requestEnvelope.context.System.device.supportedInterfaces.Display;

    return hasDisplay;
}


const welcomeCardImg = {
    smallImageUrl: "https://raw.githubusercontent.com/lgrateau/calculmental/master/robot(1).png",
    largeImageUrl: "https://s3.amazonaws.com/skill-images-789/cards/card_plane1200_800.png"


};

const DisplayImg1 = {
    title: 'Jet Plane',
    url: 'https://s3.amazonaws.com/skill-images-789/display/plane340_340.png'
};
const DisplayImg2 = {
    title: 'Starry Sky',
    url: 'https://s3.amazonaws.com/skill-images-789/display/background1024_600.png'

};

function getCustomIntents() {
    const modelIntents = model.interactionModel.languageModel.intents;

    let customIntents = [];


    for (let i = 0; i < modelIntents.length; i++) {

        if (modelIntents[i].name.substring(0, 7) != "AMAZON." && modelIntents[i].name !== "LaunchRequest") {
            customIntents.push(modelIntents[i]);
        }
    }
    return customIntents;
}

function getSampleUtterance(intent) {

    return randomElement(intent.samples);

}

function getPreviousIntent(attrs) {

    if (attrs.history && attrs.history.length > 1) {
        return attrs.history[attrs.history.length - 2].IntentRequest;

    } else {
        return false;
    }

}

function getPreviousSpeechOutput(attrs) {

    if (attrs.lastSpeechOutput && attrs.history.length > 1) {
        return attrs.lastSpeechOutput;

    } else {
        return false;
    }

}

function timeDelta(t1, t2) {

    const dt1 = new Date(t1);
    const dt2 = new Date(t2);
    const timeSpanMS = dt2.getTime() - dt1.getTime();
    const span = {
        "timeSpanMIN": Math.floor(timeSpanMS / (1000 * 60)),
        "timeSpanHR": Math.floor(timeSpanMS / (1000 * 60 * 60)),
        "timeSpanDAY": Math.floor(timeSpanMS / (1000 * 60 * 60 * 24)),
        "timeSpanDesc": ""
    };


    if (span.timeSpanHR < 2) {
        span.timeSpanDesc = span.timeSpanMIN + " minutes";
    } else if (span.timeSpanDAY < 2) {
        span.timeSpanDesc = span.timeSpanHR + " hours";
    } else {
        span.timeSpanDesc = span.timeSpanDAY + " days";
    }


    return span;

}


const InitMemoryAttributesInterceptor = {
    process(handlerInput) {
        let sessionAttributes = {};
        if (handlerInput.requestEnvelope.session['new']) {

            sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            let memoryAttributes = getMemoryAttributes();

            if (Object.keys(sessionAttributes).length === 0) {

                Object.keys(memoryAttributes).forEach(function (key) {  // initialize all attributes from global list

                    sessionAttributes[key] = memoryAttributes[key];

                });

            }
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);


        }
    }
};

const RequestHistoryInterceptor = {
    process(handlerInput) {

        const thisRequest = handlerInput.requestEnvelope.request;
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

        let history = sessionAttributes['history'] || [];

        let IntentRequest = {};
        if (thisRequest.type === 'IntentRequest') {

            let slots = [];

            IntentRequest = {
                'IntentRequest': thisRequest.intent.name
            };

            if (thisRequest.intent.slots) {

                for (let slot in thisRequest.intent.slots) {
                    let slotObj = {};
                    slotObj[slot] = thisRequest.intent.slots[slot].value;
                    slots.push(slotObj);
                }

                IntentRequest = {
                    'IntentRequest': thisRequest.intent.name,
                    'slots': slots
                };

            }

        } else {
            IntentRequest = { 'IntentRequest': thisRequest.type };
        }
        if (history.length > maxHistorySize - 1) {
            history.shift();
        }
        history.push(IntentRequest);

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }

};




const RequestPersistenceInterceptor = {
    process(handlerInput) {

        if (handlerInput.requestEnvelope.session['new']) {

            return new Promise((resolve, reject) => {

                handlerInput.attributesManager.getPersistentAttributes()

                    .then((sessionAttributes) => {
                        sessionAttributes = sessionAttributes || {};


                        sessionAttributes['launchCount'] += 1;

                        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

                        handlerInput.attributesManager.savePersistentAttributes()
                            .then(() => {
                                resolve();
                            })
                            .catch((err) => {
                                reject(err);
                            });
                    });

            });

        } // end session['new']
    }
};


const ResponseRecordSpeechOutputInterceptor = {
    process(handlerInput, responseOutput) {

        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        let lastSpeechOutput = {
            "outputSpeech": responseOutput.outputSpeech.ssml,
            "reprompt": responseOutput.reprompt.outputSpeech.ssml
        };

        sessionAttributes['lastSpeechOutput'] = lastSpeechOutput;

        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);

    }
};

const ResponsePersistenceInterceptor = {
    process(handlerInput, responseOutput) {

        const ses = (typeof responseOutput.shouldEndSession == "undefined" ? true : responseOutput.shouldEndSession);

        if (ses || handlerInput.requestEnvelope.request.type == 'SessionEndedRequest') { // skill was stopped or timed out

            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();

            sessionAttributes['lastUseTimestamp'] = new Date(handlerInput.requestEnvelope.request.timestamp).getTime();

            handlerInput.attributesManager.setPersistentAttributes(sessionAttributes);

            return new Promise((resolve, reject) => {
                handlerInput.attributesManager.savePersistentAttributes()
                    .then(() => {
                        resolve();
                    })
                    .catch((err) => {
                        reject(err);
                    });

            });

        }

    }
};

const RequestLog = {

    process(handlerInput) {

        console.log("REQUEST ENVELOPE = " + JSON.stringify(handlerInput.requestEnvelope));

        return;

    }

};

function shuffleArray(array) {  // Fisher Yates shuffle!

    let currentIndex = array.length, temporaryValue, randomIndex;

    while (0 !== currentIndex) {

        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex -= 1;

        temporaryValue = array[currentIndex];
        array[currentIndex] = array[randomIndex];
        array[randomIndex] = temporaryValue;
    }

    return array;
}


// 4. Exports handler function and setup ===================================================
const skillBuilder = Alexa.SkillBuilders.standard();
exports.handler = skillBuilder
    .addRequestHandlers(
        AMAZON_CancelIntent_Handler,
        AMAZON_HelpIntent_Handler,
        AMAZON_StopIntent_Handler,
        AMAZON_NavigateHomeIntent_Handler,
        AMAZON_PauseIntent_Handler,
        AMAZON_StartOverIntent_Handler,
        Resultat_Handler,
        Operations_Handler,
        Level_Handler,
        LaunchRequest_Handler,
        SessionEndedHandler
    )
    .addErrorHandlers(ErrorHandler)
    .addRequestInterceptors(InitMemoryAttributesInterceptor)
    .addRequestInterceptors(RequestLog)
    .addRequestInterceptors(RequestHistoryInterceptor)

    // .addResponseInterceptors(ResponseRecordSpeechOutputInterceptor)

    // .addRequestInterceptors(RequestPersistenceInterceptor)
    // .addResponseInterceptors(ResponsePersistenceInterceptor)

    // .withTableName("askMemorySkillTable")
    // .withAutoCreateTable(true)

    .lambda();


// End of Skill code -------------------------------------------------------------
// Static Language Model for reference

const languageModel =
    [{
        "state": states.START,
        "error": ["bouuuuu", "biii"],
        "messages": {
            "welcome": ['bonjour', 'salut', 'heureux de te voir'],
            "ask": ["Veut tu faire des additions, des multiplications ou des soustractions ?"],
        }
    },
    {
        "state": states.CLOSESESSION,
        "messages": {
            "end": ["A trés bientôt","reviens vite me voir","tchao"]
        }
    }]
    ;

const model = {
    "interactionModel": {
        "languageModel": {
            "invocationName": "calcul mental",
            "intents": [
                {
                    "name": "AMAZON.CancelIntent",
                    "samples": [
                        "ferme calcul mental",
                        "sort de l'application",
                        "sortir du calcul mental"
                    ]
                },
                {
                    "name": "AMAZON.HelpIntent",
                    "samples": [
                        "je ne comprend pas",
                        "aide moi"
                    ]
                },
                {
                    "name": "AMAZON.StopIntent",
                    "samples": [
                        "arrete le jeux"
                    ]
                },
                {
                    "name": "AMAZON.NavigateHomeIntent",
                    "samples": [
                        "retourne au menu principal"
                    ]
                },
                {
                    "name": "AMAZON.PauseIntent",
                    "samples": []
                },
                {
                    "name": "AMAZON.StartOverIntent",
                    "samples": [
                        "repete le calcul",
                        "repete s'il te plais"
                    ]
                },
                {
                    "name": "Resultat",
                    "slots": [
                        {
                            "name": "nombre",
                            "type": "AMAZON.NUMBER"
                        }
                    ],
                    "samples": [
                        "le calcul est {nombre}",
                        "Le resultat est {nombre}"
                    ]
                },
                {
                    "name": "Operations",
                    "slots": [
                        {
                            "name": "OPERATION",
                            "type": "OPERATION"
                        }
                    ],
                    "samples": [
                        "aux tables {OPERATION}",
                        "tables {OPERATION}",
                        "aux {OPERATION}",
                        "des {OPERATION}",
                        "{OPERATION}"
                    ]
                },
                {
                    "name": "Level",
                    "slots": [
                        {
                            "name": "NUMBER",
                            "type": "AMAZON.NUMBER"
                        }
                    ],
                    "samples": [
                        "{NUMBER}",
                        "niveau {NUMBER}"
                    ]
                }
            ],
            "types": [
                {
                    "name": "OPERATION",
                    "values": [
                        {
                            "name": {
                                "value": "soustration"
                            }
                        },
                        {
                            "name": {
                                "value": "multiplication"
                            }
                        },
                        {
                            "name": {
                                "value": "addition",
                                "synonyms": [
                                    "d'addition"
                                ]
                            }
                        }
                    ]
                }
            ]
        }
    }
};

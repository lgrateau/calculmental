/*
Mocha tests for the Alexa skill "Hello World" example for SDK v2
Using the Alexa Skill Test Framework (https://github.com/BrianMacIntosh/alexa-skill-test-framework).
Run with 'mocha examples/skill-sample-nodejs-ask2/helloworld-tests.js'.
*/

// include the testing framework
const alexaTest = require('alexa-skill-test-framework');
//const alexaTest = require('../../index');

// initialize the testing framework
alexaTest.initialize(
	require('../index.js'),
	"amzn1.ask.skill.00000000-0000-0000-0000-000000000000",
	"amzn1.ask.account.VOID");
    alexaTest.setLocale("fr_FR");
describe("Full workflow of the  Calcul mental", function () {
	// tests the behavior of the skill's LaunchRequest
	describe("LaunchRequest", function () {
        const slotOperation = {'OPERATION': 'addition'};
        const requestAdditions = alexaTest.getIntentRequest('Operations', slotOperation);
        const slotNumber = {'NUMBER': '1'};
        const requestLevel = alexaTest.getIntentRequest('Level', slotNumber);
		alexaTest.test([
			{
				request: alexaTest.getLaunchRequest(),
                saysLike: "additions ou des multiplications",
                repromptsLike: "additions ou des multiplications",    
                shouldEndSession: false,
                hasAttributes: {
					state: '_START'
}
            },
            {
				request: requestAdditions,
                saysLike: "niveau", 
                shouldEndSession: false, 
                repromptsNothing: false
            },
            {
				request: requestLevel,
                saysLike: "questions 1", 
                shouldEndSession: false, 
                repromptsNothing: false,
              
            }
		]);
    });
   
	/*
	// tests the behavior of the skill's HelloWorldIntent
	describe("HelloWorldIntent", function () {
		alexaTest.test([
			{
				request: alexaTest.getIntentRequest("HelloWorldIntent"),
				says: "Hello World!", repromptsNothing: true, shouldEndSession: true,
				hasAttributes: {
					foo: 'bar'
				}
			}
		]);
	});
	
	// tests the behavior of the skill's HelloWorldIntent with like operator
	describe("HelloWorldIntent like", function () {
		alexaTest.test([
			{
				request: alexaTest.getIntentRequest("HelloWorldIntent"),
				saysLike: "World", repromptsNothing: true, shouldEndSession: true
			}
		]);
	});*/
});
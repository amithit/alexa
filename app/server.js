let express = require('express'),
  bodyParser = require('body-parser'),
  port = process.env.PORT || 3000,
  app = express();
let alexaVerifier = require('alexa-verifier');
const axios=require('axios');
const checkProduct = require('./checkProductName')
var isFisrtTime = true;
const SKILL_NAME = 'Disney Heroes';
const GET_HERO_MESSAGE = "Here's your hero: ";
const HELP_MESSAGE = 'You can say please fetch me a hero, or, you can say exit... What can I help you with?';
const HELP_REPROMPT = 'What can I help you with?';
const STOP_MESSAGE = 'Enjoy the day...Goodbye!';
const MORE_MESSAGE = 'Do you want more?'
const PAUSE = '<break time="0.3s" />'
const WHISPER = '<amazon:effect name="whispered"/>'

const data = [
  'Aladdin  ',
  'Cindrella ',
  'Bambi',
  'Bella ',
  'Bolt ',
  'Donald Duck',
  'Genie ',
  'Goofy',
  'Mickey Mouse',
];

app.use(bodyParser.json({
  verify: function getRawBody(req, res, buf) {
    req.rawBody = buf.toString();
  }
}));

function requestVerifier(req, res, next) {
  alexaVerifier(
    req.headers.signaturecertchainurl,
    req.headers.signature,
    req.rawBody,
    function verificationCallback(err) {
      if (err) {
        res.status(401).json({
          message: 'Verification Failure',
          error: err
        });
      } else {
        next();
      }
    }
  );
}

function log() {
  if (true) {
    console.log.apply(console, arguments);
  }
}
const checkProductText=async(intentData,sessionId)=>{
  let speechOutput = await checkProduct.checkProduct(intentData,sessionId)
  //console.log(speechOutput);
  speechOutput=`${speechOutput} <break time=\"0.3s\" /><amazon:effect name=\"whispered\"/>`
  //console.log(speechOutput);
  return buildResponse(speechOutput, false, null);

}

const checkProductDescAndType=async(intentData,sessionId)=>{
  let speechOutput = await checkProduct.ask_product(intentData,sessionId)
  //console.log(speechOutput);
  speechOutput=`${speechOutput} <break time=\"0.3s\" /><amazon:effect name=\"whispered\"/>`
  //console.log(speechOutput);
  return buildResponse(speechOutput, false, null);

}

app.post('/janssen', requestVerifier, function(req, res) {
  console.log(JSON.stringify(req.body))
  console.log("\n\n",req.body.session);

  if (req.body.request.type === 'LaunchRequest') {
    res.json(getNewHero());
    isFisrtTime = false
  } else if (req.body.request.type === 'SessionEndedRequest') { /* ... */
    log("Session End")
  } else if (req.body.request.type === 'IntentRequest') {
    switch (req.body.request.intent.name) {
      case 'AMAZON.YesIntent':
        res.json(callRasaApi());
        break;
      case 'AMAZON.NoIntent':
        res.json(stopAndExit());
        break;
      case 'AMAZON.HelpIntent':
        res.json(help());
        break;
      case 'ask_about_product':
        console.log("\n inside ask_about_product");
         checkProductText(req.body.request.intent,req.body.session.sessionId).then(return_data=>{
          console.log("\nreturn_data\n\n",return_data)
          res.json(return_data);
         })
         



        break;

        case 'ask_product_description':
        case 'ask_precaution':
        case 'ask_contraindications':
        case 'ask_warning':
        case 'ask_side_effects':
        case 'ask_senior_citizens':
        case 'ask_gynaec_risk':
          console.log("\n inside ask_about_product");
          checkProductDescAndType(req.body.request.intent,req.body.session.sessionId).then(return_data=>{
            console.log("\nreturn_data\n\n",return_data)
            res.json(return_data);
           })
           break;
      default:
        //res.json(callRasaApi());
    }
  }
});

function handleDataMissing() {
  return buildResponse(MISSING_DETAILS, true, null)
}

function stopAndExit() {

  const speechOutput = STOP_MESSAGE
  var jsonObj = buildResponse(speechOutput, true, "");
  return jsonObj;
}

function help() {

  const speechOutput = HELP_MESSAGE
  const reprompt = HELP_REPROMPT
  var jsonObj = buildResponseWithRepromt(speechOutput, false, "", reprompt);

  return jsonObj;
}

function getNewHero() {

  var welcomeSpeechOutput = `Ciao, sono l'assistente virtuale di Janssen e sono qui per aiutarti.<break time="0.3s" />`
  if (!isFisrtTime) {
    welcomeSpeechOutput = '';
  }

  //const heroArr = data;
  //const heroIndex = Math.floor(Math.random() * heroArr.length);
  //const randomHero = heroArr[heroIndex];
  const tempOutput = WHISPER  + `Io non sono un medico, ma in compenso so leggere i foglietti
  illustrativi dei farmaci Janssen e posso trovare al loro interno le
  
  informazioni di cui hai bisogno.<break time="0.3s" /> `  + PAUSE;
  const speechOutput = welcomeSpeechOutput + tempOutput + `Per quale farmaco Janssen hai bisogno di supporto?`
  const more = MORE_MESSAGE


  return buildResponseWithRepromt(speechOutput, false, '', more);

}

function buildResponse(speechText, shouldEndSession, cardText) {

  const speechOutput = "<speak>" + speechText + "</speak>"
  var jsonObj = {
    "version": "1.0",
    "response": {
      "shouldEndSession": shouldEndSession,
      "outputSpeech": {
        "type": "SSML",
        "ssml": speechOutput
      },
      "card": {
        "type": "Simple",
        "title": SKILL_NAME,
        "content": cardText,
        "text": cardText
      }
    }
  }
  //console.log(JSON.stringify(jsonObj))
  return jsonObj
}


const callRasaApi =async()=> {

let speechOutput=await axios({
  method:"POST",
  url:'http://test-rasa-473991913.eu-west-3.elb.amazonaws.com/model/parse',
  data:{
    "text": "Ho mal di testa",
    "message_id":"weweweewe"
  }
})
console.log(speechOutput.data.response_selector);
speechOutput=speechOutput.data.response_selector.default.response.responses
const more = MORE_MESSAGE

  return buildResponseWithRepromt(speechOutput, false, '', more);

}




function buildResponseWithRepromt(speechText, shouldEndSession, cardText, reprompt) {

  const speechOutput = "<speak>" + speechText + "</speak>"
  var jsonObj = {
     "version": "1.0",
     "response": {
      "shouldEndSession": shouldEndSession,
       "outputSpeech": {
         "type": "SSML",
         "ssml": speechOutput
       },
     "card": {
       "type": "Simple",
       "title": SKILL_NAME,
       "content": cardText,
       "text": cardText
     }
   }
 }
 //console.log(JSON.stringify(jsonObj));
  return jsonObj
}

app.listen(port);

console.log('Alexa list RESTful API server started on: ' + port);


const Alexa = require('alexa-sdk');
const makePlainText = Alexa.utils.TextUtils.makePlainText;
const makeRichText = Alexa.utils.TextUtils.makeRichText;
const makeImage = Alexa.utils.ImageUtils.makeImage;

const assetsBucket = 'https://s3.amazonaws.com/barcamp-evn18-alexa-skill-assets'
const backgroundImage = `${assetsBucket}/background4.jpg`

const data = {
  userName: 'Rob',
  doctors: [
    {
      id: 0,
      name: "Dr. Diana Olivier",
      avatar: `${assetsBucket}/doctor1.jpg`
    },
    {
      id: 1,
      name: "Dr. Ricardo Mckeown",
      avatar: `${assetsBucket}/doctor2.jpg`
    }
  ]
}

const states = {
  DOCTOR_SELECTION: '_DOCTOR_SELECTION',
  TIME_SLOT_SELECTION: '_TIME_SLOT_SELECTION',
  APPOINTMENT_CONFIRMATION: '_APPOINTMENT_CONFIRMATION' 
};

const handlers = {
  'LaunchRequest' : function() {
    const speechText = `Welcome to your hospital ${data.userName}!, how can I help you?`

    const builder = new Alexa.templateBuilders.BodyTemplate1Builder();
 
    const template = builder.setTitle(`Welcome to your hospital ${data.userName}!`)
                            .setBackgroundImage(makeImage(backgroundImage))
                            .setTextContent(makePlainText('How can I help you?'))
                            .build();

    this.response.speak(speechText)
           .renderTemplate(template);

    this.emit(':responseReady');
  },

  'PainIntent' : function() {
    const names = data.doctors.map(doctor => doctor.name).join(' and ')
    const speechText = `Sorry to hear that ${data.userName},
    we have ${names} available today.
    Which one is your preferred physician?`

    const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder();
    const listTemplateBuilder = new Alexa.templateBuilders.ListTemplate2Builder();
    listTemplateBuilder
      .setBackgroundImage(makeImage(backgroundImage))
      .setTitle(`List of available doctors`)

    data.doctors.forEach(doctor => {
      const imageWidth = 60
      const imageHeight = 60
      const itemImage = makeImage(doctor.avatar, imageWidth, imageHeight);
      listItemBuilder.addItem(itemImage, doctor.id, makePlainText(doctor.name));
    });

    const listItems = listItemBuilder.build();
    listTemplateBuilder.setListItems(listItems)
    const listTemplate = listTemplateBuilder.setToken('PainIntentListToken')

    this.handler.state = states.DOCTOR_SELECTION;

    this.response.speak(speechText)
           .listen('Please tell your prefered doctor\'s name')
           .renderTemplate(listTemplate.template);
           
    this.emit(':responseReady');
  }

};

const doctorSelectHandlers = Alexa.CreateStateHandler(states.DOCTOR_SELECTION, {

  'SelectDoctorIntent' : function() {
    const speechText = `Got it, here is ${data.doctors[0].name}'s available time slots for today.
    Please tell your prefered time slot.`

    const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder();
    const listTemplateBuilder = new Alexa.templateBuilders.ListTemplate1Builder();
    listTemplateBuilder
      .setBackgroundImage(makeImage(backgroundImage))
      .setTitle(`${data.doctors[0].name}'s available time slots for today`)
  
    listItemBuilder.addItem(undefined, 'listItemToken1', undefined, makePlainText('From 12:00pm to 1:00pm'));
    listItemBuilder.addItem(undefined, 'listItemToken2', undefined, makePlainText('From 3:30pm to 4:00pm'));
    listItemBuilder.addItem(undefined, 'listItemToken3', undefined, makePlainText('From 5:30pm to 6:00pm'));

    const listItems = listItemBuilder.build();
    listTemplateBuilder.setListItems(listItems);
    const listTemplate = listTemplateBuilder.setToken('SelectDoctorListToken');

    this.handler.state = states.TIME_SLOT_SELECTION;
   
    this.response.speak(speechText)
          .listen('Please tell your prefered time slot')
    			.renderTemplate(listTemplate.template);

    this.emit(':responseReady');
  }

})

const timeSlotSelectHandlers = Alexa.CreateStateHandler(states.TIME_SLOT_SELECTION, {

  'SelectTimeSlotIntent': function() {
    const speechText = `Ok ${data.userName},
    so I'm scheduling appointment with ${data.doctors[0].name} today at 3:30pm,
    is everything correct?`
 
    const builder = new Alexa.templateBuilders.BodyTemplate2Builder();

    const contentText = `<br/><br/>
    <font size="2">Doctor: ${data.doctors[0].name}</font> <br/>
    <font size="2">Appointment time: From 3:30pm to 4:00pm</font> <br/>
    <font size="2">Location: My hospital</font>`
 
    const template = builder.setTitle(`Your appointment details`)
                            .setImage(makeImage(data.doctors[0].avatar))
                            .setBackgroundImage(makeImage(backgroundImage))
                            .setTextContent(makeRichText(contentText))
                            .build();

    this.handler.state = states.APPOINTMENT_CONFIRMATION;

    this.response.speak(speechText)
           .listen('Please confirm the appointment!')
           .renderTemplate(template);

    this.emit(':responseReady');
  },

  'WaitIntent' : function() {
    const speechText = `<say-as interpret-as="interjection">uh-huh</say-as>`

    const listItemBuilder = new Alexa.templateBuilders.ListItemBuilder();
    const listTemplateBuilder = new Alexa.templateBuilders.ListTemplate1Builder();
    listTemplateBuilder
      .setBackgroundImage(makeImage(backgroundImage))
      .setTitle(`${data.doctors[0].name}'s available time slots for today`)
  
    listItemBuilder.addItem(undefined, 'listItemToken1', undefined, makePlainText('From 12:00pm to 1:00pm'));
    listItemBuilder.addItem(undefined, 'listItemToken2', undefined, makePlainText('From 3:30pm to 4:00pm'));
    listItemBuilder.addItem(undefined, 'listItemToken3', undefined, makePlainText('From 5:30pm to 6:00pm'));

    const listItems = listItemBuilder.build();
    listTemplateBuilder.setListItems(listItems)
    const listTemplate = listTemplateBuilder.setToken('SelectDoctorListToken')

    this.response.speak(speechText)
          .listen('Please tell your prefered time slot')
    			.renderTemplate(listTemplate.template);

    this.emit(':responseReady');
  }

})

const appointmentConfirmationHandlers = Alexa.CreateStateHandler(states.APPOINTMENT_CONFIRMATION, {

  'AMAZON.YesIntent': function() {
    const speechText = `Great!, your appointment scheduled with ${data.doctors[0].name}
    at 3:30pm, wish you get better soon!`
 
    const builder = new Alexa.templateBuilders.BodyTemplate2Builder();

    const contentText = `<br/>Appointment details<br/><br/>
    <font size="2">Doctor: ${data.doctors[0].name}</font> <br/>
    <font size="2">Appointment time: From 3:30pm to 4:00pm</font> <br/>
    <font size="2">Location: My hospital</font>`
 
    const template = builder.setTitle(`Your appointment was successfully scheduled!`)
                            .setImage(makeImage(data.doctors[0].avatar))
                            .setBackgroundImage(makeImage(backgroundImage))
                            .setTextContent(makeRichText(contentText))
                            .build();
    
    this.handler.state = ''

    this.response.speak(speechText)
           .renderTemplate(template);

    this.emit(':responseReady');
  }

})

const commonHandlers = {

  'Unhandled': function() {
    this.response.speak("I don't know that one!");
    this.emit(':responseReady');
  },

  'SessionEndedRequest': function() {
    this.response.speak("Goodby!");
    this.emit(':responseReady');
  }
}

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context, callback);

  const allHandlers = [
    handlers,
    doctorSelectHandlers,
    timeSlotSelectHandlers,
    appointmentConfirmationHandlers
  ].map(handlers => Object.assign(handlers, commonHandlers))

  alexa.registerHandlers(...allHandlers);

  alexa.execute();
};
